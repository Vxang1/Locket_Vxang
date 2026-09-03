const { sb, requireAdmin, allowMethods, genCode, dnsPoolHasCapacity, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { customer_id } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Thiếu customer_id' });

  const custRows = await sb(`customers?id=eq.${customer_id}&select=*`);
  if (!custRows || !custRows.length) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
  const cust = custRows[0];

  const cleanPkg = cust.package;
  const needsDns = !(cleanPkg === '30k' && cust.special_flow === true);

  if (needsDns && !await dnsPoolHasCapacity(cleanPkg, cust.customer_code)) {
    return res.status(503).json({ error: 'DNS pool đã đầy, vui lòng thêm link DNS mới!' });
  }

  const accCode = genCode('XW-');
  await sb('access_codes', {
    method: 'POST',
    body: {
      customer_id,
      code: accCode,
      is_active: true,
      status: 'pending'
    }
  });

  notifyTelegram(`🎫 *MÃ TRUY CẬP MỚI ĐƯỢC CẤP*\n───────────────\n👤 Khách: *${escMd(cust.name)}* (\`${escMd(cust.customer_code)}\`)\n🔑 Mã mới: \`${escMd(accCode)}\`\n📦 Gói: *${escMd(cleanPkg)}*`);

  return res.status(200).json({ ok: true, access_code: accCode });
};
