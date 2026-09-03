const { sb, requireGuide, allowMethods, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const p = requireGuide(req);
  if (!p) return res.status(401).json({ error: 'Unauthorized' });

  const now = new Date().toISOString();
  await Promise.all([
    sb(`access_codes?code=eq.${p.code}`, { method: 'PATCH', body: { completed_at: now, status: 'completed' } }),
    sb(`customers?id=eq.${p.customer_id}`, { method: 'PATCH', body: { service_status: 'active', activated_at: now } })
  ]);

  const cust = await sb(`customers?id=eq.${p.customer_id}&select=name,customer_code,package`);
  const cName = cust && cust[0] ? cust[0].name : '';
  const cCode = cust && cust[0] ? cust[0].customer_code : '';
  const cPkg = cust && cust[0] ? cust[0].package : '';

  notifyTelegram(`🎉 *KHÁCH ĐÃ HOÀN TẤT CÁC BƯỚC*\n───────────────\n👤 Khách: *${escMd(cName)}* (\`${escMd(cCode)}\`)\n🔑 Mã: \`${escMd(p.code)}\`\n📦 Gói: *${escMd(cPkg)}*\n📸 Nhắc khách gửi ảnh màn hình qua Zalo Admin\\!`);

  return res.status(200).json({ ok: true });
};
