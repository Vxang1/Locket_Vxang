'use strict';
const { sb, requireGuide, allowMethods, normalizePackage, DEFAULT_STEP_FLOW, DEFAULT_STEP_FLOW_SPECIAL } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  try {
    const pkg = normalizePackage(payload.package);

    const [sessions, codes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}&is_kicked=eq.false`,
      }),
      sb('GET', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}&select=customer_id,skip_username_step`,
      }),
    ]);

    if (!sessions?.length) return res.status(403).json({ error: 'Phiên đã bị kết thúc' });

    const codeRow = codes?.[0];
    const customerId = codeRow?.customer_id;
    let locket_username = null;
    let special_flow = !!payload.specialFlow;

    if (customerId) {
      const custs = await sb('GET', 'customers', {
        q: `id=eq.${encodeURIComponent(customerId)}&select=locket_username,customer_code,special_flow`,
      });
      if (custs?.length) {
        locket_username = custs[0].locket_username || null;
        special_flow = !!custs[0].special_flow;
      }
    }

    const flowList = special_flow ? DEFAULT_STEP_FLOW_SPECIAL[pkg] : DEFAULT_STEP_FLOW[pkg];
    const steps = flowList.map((s, idx) => ({
      id: 'step_' + idx,
      order_num: idx + 1,
      type: s.type,
      title: s.title,
    }));

    return res.json({
      ok: true,
      steps,
      package: pkg,
      locket_username,
      special_flow,
    });
  } catch (e) {
    console.error('[guide/steps] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
