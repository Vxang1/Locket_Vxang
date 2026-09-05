'use strict';
const { sb, requireAdmin, allowMethods, genCode, PRICING, dnsPoolHasCapacity } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;
  const { customer_id, package: reqPkg } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Missing customer_id' });
  try {
    const custs = await sb('GET', 'customers', { q: `id=eq.${customer_id}&select=customer_code,package,service_status,special_flow` }) || [];
    const cust = custs[0];
    const currentPkg = cust?.package || '30k';
    const customerCode = cust?.customer_code || null;
    const pkg = (reqPkg && PRICING[reqPkg]) ? reqPkg : currentPkg;

    // Chặn sinh mã mới khi DNS pool đầy nếu khách chưa có DNS riêng
    const [existingDns] = (customerCode
      ? await sb('GET', 'private_dns_links', { q: `customer_code=eq.${encodeURIComponent(customerCode)}&select=id&limit=1` })
      : []) || [];
    if (!existingDns && !await dnsPoolHasCapacity(pkg, customerCode)) {
      return res.status(503).json({ error: 'DNS pool đang đầy, vui lòng thêm link DNS trước khi tạo mã mới.' });
    }

    const code = genCode('VX-', 6);
    await sb('POST', 'access_codes', {
      body: { customer_id, code, is_active: true },
      prefer: 'return=minimal',
    });

    if (pkg && pkg !== currentPkg) {
      await sb('PATCH', 'customers', {
        q: `id=eq.${customer_id}`,
        body: { package: pkg },
        prefer: 'return=minimal',
      }).catch(() => {});
    }

    res.json({ code, package: pkg });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
