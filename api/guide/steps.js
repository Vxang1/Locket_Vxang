'use strict';
const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  try {
    const pkg = payload.package || '5s';

    // Tối ưu: Thực thi 3 truy vấn độc lập song song bằng Promise.all
    const [sessions, stepsRes, codes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}&is_kicked=eq.false`,
      }),
      sb('GET', 'guide_steps', {
        q: `or=(package.eq.${pkg},package.is.null)&order=order_num.asc`,
      }),
      sb('GET', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}&select=customer_id,skip_username_step`,
      }),
    ]);

    if (!sessions?.length) return res.status(403).json({ error: 'Phiên đã bị kết thúc' });

    let steps = stepsRes || [];
    const codeRow = codes?.[0];
    const customerId = codeRow?.customer_id;
    let locket_username = null;

    if (customerId) {
      const custs = await sb('GET', 'customers', {
        q: `id=eq.${customerId}&select=locket_username,type,customer_code`,
      });
      locket_username = custs?.[0]?.locket_username || null;
    }

    const shouldSkipUsername = !!(payload.skipUsernameStep || codeRow?.skip_username_step || locket_username);

    if (shouldSkipUsername) {
      steps = steps.filter(s => s.step_type !== 'username' && s.type !== 'username');
    }

    res.json({
      steps,
      package: pkg,
      locket_username,
      skip_username_step: shouldSkipUsername,
      special_flow: !!payload.specialFlow
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
