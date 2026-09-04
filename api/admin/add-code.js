'use strict';
const { sb, requireAdmin, allowMethods, genCode, PRICING, isPermPackage, dnsPoolHasCapacity } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;
  const { customer_id, package: reqPkg, renew, duration: reqDuration, deposit_note: reqDepositNote } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Missing customer_id' });
  const isRenew = renew === true;
  try {
    const custs = await sb('GET', 'customers', { q: `id=eq.${customer_id}&select=customer_code,package,duration,service_status,special_flow` }) || [];
    const cust = custs[0];
    const currentPkg = cust?.package || null;
    const customerCode = cust?.customer_code || null;
    // Chỉ dùng package do admin chọn nếu hợp lệ (có trong PRICING), ngược lại giữ nguyên gói hiện tại của khách
    const pkg = (reqPkg && PRICING[reqPkg]) ? reqPkg : currentPkg;

    // Yêu cầu bắt buộc: Flow đặc biệt của gói 180 PHẢI CÓ link DNS riêng trong private_dns_links trước khi tạo mã
    const isSpecialFlow = !!cust?.special_flow && (pkg === '150' || pkg === '180' || currentPkg === '150' || currentPkg === '180');
    if (isSpecialFlow) {
      const { getAppstoreConfig } = require('../_lib/utils');
      const cfg = await getAppstoreConfig();
      if (!cfg.email || !cfg.password) {
        return res.status(400).json({ error: 'Không thể tạo mã cho Flow Đặc Biệt: Nguồn tài khoản Appstore thủ công đang trống. Vui lòng cập nhật tài khoản và mật khẩu ở tab Appstore trước!' });
      }
    }

    

    // Duration hợp lệ PHỤ THUỘC GÓI: gói vĩnh viễn (150/180) chỉ có 'perm', gói thường
    // chỉ có 6m/1y. Vì phải biết gói mới kiểm được, khâu này nằm sau lúc tra khách —
    // nhưng vẫn TRƯỚC khi INSERT access_codes: bắt lỗi sau lúc insert thì mã đã nằm
    // trong DB rồi mà admin lại nhận 400, thành mã rác không ai dùng.
    const allowedDurations = isPermPackage(pkg) ? ['perm'] : ['6m', '1y'];
    const validDuration = allowedDurations.includes(reqDuration) ? reqDuration : null;
    if (isRenew && !validDuration) {
      return res.status(400).json({ error: `Mua lại gói cần duration là ${allowedDurations.join(' hoặc ')}` });
    }

    // Chặn sinh mã mới khi DNS pool đầy. Nếu khách này đã có slot trong DNS pool hoặc có DNS riêng thì cho qua.
    // 150 special flow không dùng DNS, nên không cần check capacity
      const needsDns = !(pkg === '150' && cust?.special_flow === true);
      if (needsDns && !await dnsPoolHasCapacity(pkg, customerCode)) {
      return res.status(503).json({ error: 'DNS pool đang đầy, vui lòng thêm link DNS trước khi tạo mã mới.' });
    }

    const code = genCode('XW-', 6);
    await sb('POST', 'access_codes', {
      body: { customer_id, code, is_active: true },
      prefer: 'return=minimal',
    });

    // ── Mua lại gói (Làm rõ 2) ──────────────────────────────────────
    // MẶC ĐỊNH (renew khác true): endpoint này KHÔNG BAO GIỜ đụng tới warranty_started_at
    // hay duration. Đây là điều kiện đúng cho phần lớn lần sinh mã — khách đổi máy, cài
    // lại, update DNS trong thời gian bảo hành: mốc bảo hành cũ phải giữ nguyên, không
    // được reset thành đủ 6 tháng/1 năm mới (Làm rõ 1).
    //
    // CHỈ khi admin tự tick "khách mua lại gói" (renew === true) mới tính lại mốc bảo
    // hành từ hôm nay + lưu duration mới. Cố tình yêu cầu cờ tường minh chứ không tự suy
    // ra từ "bảo hành đã hết hạn": khách hết bảo hành vẫn có thể được cài lại miễn phí,
    // suy tự động sẽ âm thầm gia hạn cho khách chưa trả tiền.
    const custPatch = {};
    if (pkg && pkg !== currentPkg) custPatch.package = pkg;
    if (isRenew) {
      custPatch.package = pkg;
      custPatch.duration = validDuration || 'perm';
      custPatch.activated_at = null;
      custPatch.service_status = 'pending_gold';
      custPatch.deposit_note = reqDepositNote !== undefined ? reqDepositNote : 'Cọc 20k';
    }
    if (Object.keys(custPatch).length) {
      try {
        await sb('PATCH', 'customers', {
          q: `id=eq.${customer_id}`,
          body: custPatch,
          prefer: 'return=minimal',
        });
      } catch (patchErr) {
        // Fallback tối thiểu
        await sb('PATCH', 'customers', {
          q: `id=eq.${customer_id}`,
          body: { service_status: 'pending_gold' },
          prefer: 'return=minimal',
        }).catch(() => {});
      }
    }
    res.json({ code, package: pkg, renewed: isRenew, duration: isRenew ? validDuration : undefined });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
