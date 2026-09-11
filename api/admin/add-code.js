'use strict';
const { sb, requireAdmin, allowMethods, genCode, PRICING, createVpnToken, getOrCreatePrivateDns, recyclePrivateDnsSlot } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;
  const { customer_id, package: reqPkg, deposit_note: reqDepositNote } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Missing customer_id' });
  try {
    const custs = await sb('GET', 'customers', { q: `id=eq.${customer_id}&select=customer_code,package,service_status,special_flow` }) || [];
    const cust = custs[0];
    const currentPkg = cust?.package || '30k';
    const customerCode = cust?.customer_code || null;
    const pkg = (reqPkg && PRICING[reqPkg]) ? reqPkg : currentPkg;
    const cleanPkg = (pkg === '40k' || pkg === '15s' || pkg === '180') ? '40k' : '30k';
    const defaultDepositNote = cleanPkg === '40k' ? 'Chờ thu 40k' : 'Chờ thu 30k';
    const depositNote = reqDepositNote || defaultDepositNote;

    // Cập nhật gói và tự động chuyển trạng thái sang Chờ thu 30k hoặc 40k
    await sb('PATCH', 'customers', {
      q: `id=eq.${customer_id}`,
      body: {
        package: pkg,
        deposit_note: depositNote,
      },
      prefer: 'return=minimal',
    }).catch(() => {});

    // Nếu đổi gói (ví dụ nâng từ 30k lên 40k hoặc hạ từ 40k xuống 30k):
    if (pkg && pkg !== currentPkg) {
      if (customerCode && (currentPkg === '30k' || currentPkg === '5s') && (pkg === '40k' || pkg === '15s' || pkg === '180')) {
        // Thu hồi DNS 5s của gói 30k cũ về kho [AVAILABLE] để cấp cho khách mới
        await recyclePrivateDnsSlot(customerCode, '5s').catch(() => {});

        // Cấp tài khoản NextDNS riêng mới cho gói 40k (15s) - ưu tiên lấy slot trống trong kho
        await getOrCreatePrivateDns(customerCode, '40k').catch(() => {});

        const existingVpn = await sb('GET', 'vpn_tokens', {
          q: `customer_id=eq.${customer_id}&is_active=eq.true&select=token&limit=1`
        }).catch(() => []);
        if (!existingVpn?.length) {
          await createVpnToken(customer_id, customerCode).catch(() => {});
        }
      } else if (customerCode && (currentPkg === '40k' || currentPkg === '15s' || currentPkg === '180') && (pkg === '30k' || pkg === '5s')) {
        // Hạ cấp 40k -> 30k: Thu hồi DNS 15s về kho [AVAILABLE]
        await recyclePrivateDnsSlot(customerCode, '15s').catch(() => {});
        // Cấp DNS 5s riêng (ưu tiên slot trống trong kho)
        await getOrCreatePrivateDns(customerCode, '30k').catch(() => {});
        // Vô hiệu hóa VPN token
        await sb('PATCH', 'vpn_tokens', {
          q: `customer_id=eq.${customer_id}&is_active=eq.true`,
          body: { is_active: false }
        }).catch(() => {});
      } else if (customerCode) {
        await getOrCreatePrivateDns(customerCode, pkg).catch(() => {});
      }
    } else {
      // Đảm bảo khách hàng luôn có sẵn DNS riêng 1:1 trước khi trả về mã
      if (customerCode) {
        await getOrCreatePrivateDns(customerCode, pkg).catch(() => {});
      }
    }

    const code = genCode('VX-', 6);
    await sb('POST', 'access_codes', {
      body: { customer_id, code, is_active: true },
      prefer: 'return=minimal',
    });

    res.json({ code, package: pkg, deposit_note: depositNote });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
