'use strict';
const { sb, requireAdmin, allowMethods, genCode, dnsPoolHasCapacity, notifyTelegram, escTgHtml, normalizePackage } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;

  const { customer_id, package: reqPkg } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Thiếu customer_id' });

  try {
    const custRows = await sb('GET', 'customers', {
      q: `id=eq.${encodeURIComponent(customer_id)}&select=id,name,customer_code,package,special_flow`
    });
    if (!custRows || !custRows.length) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    const cust = custRows[0];

    const pkg = reqPkg ? normalizePackage(reqPkg) : normalizePackage(cust.package);
    const isSpecial = !!cust.special_flow;

    // Kiểm tra sức chứa DNS Pool nếu luồng yêu cầu DNS
    const needsDns = !(pkg === '30k' && isSpecial);
    if (needsDns && !await dnsPoolHasCapacity(pkg, cust.customer_code, isSpecial)) {
      return res.status(503).json({ error: 'DNS Pool cho gói này hiện đã đầy tất cả slot! Vui lòng vào tab "🌐 DNS mặc định" thêm link mới trước khi cấp mã.' });
    }

    const access_code = genCode('XW-', 6);
    await sb('POST', 'access_codes', {
      body: {
        customer_id: cust.id,
        code: access_code,
        is_active: true
      },
      prefer: 'return=minimal'
    });

    // Nếu đổi gói thì cập nhật vào bảng customers
    if (pkg !== cust.package) {
      await sb('PATCH', 'customers', {
        q: `id=eq.${encodeURIComponent(cust.id)}`,
        body: { package: pkg }
      });
    }

    await notifyTelegram(
      `🎫 <b>MÃ TRUY CẬP MỚI ĐƯỢC CẤP</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `👤 Khách: <b>${escTgHtml(cust.name)}</b>\n` +
      `🏷️ Mã KH: <code>${cust.customer_code}</code>\n` +
      `🔑 Mã mới: <code>${access_code}</code>\n` +
      `💎 Gói: <b>${pkg === '40k' ? 'Gói 40k (15s Vĩnh viễn)' : 'Gói 30k (5s Vĩnh viễn)'}</b>`
    );

    return res.json({ ok: true, access_code, code: access_code, package: pkg });
  } catch (e) {
    console.error('[add-code] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
