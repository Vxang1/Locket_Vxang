'use strict';
const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  try {
    const pkg = payload.package || '30k';

    // Tối ưu: Lấy phiên và guide_steps song song
    const [sessions, stepsRes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}&is_kicked=eq.false`,
      }),
      sb('GET', 'guide_steps', {
        q: `or=(package.eq.${pkg},package.is.null)&order=order_num.asc`,
      }),
    ]);

    if (!sessions?.length) return res.status(403).json({ error: 'Phiên đã bị kết thúc' });

    const steps = (stepsRes || []).filter(s => s.step_type !== 'username' && s.type !== 'username');

    res.json({
      steps,
      package: pkg,
      special_flow: !!payload.specialFlow
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
