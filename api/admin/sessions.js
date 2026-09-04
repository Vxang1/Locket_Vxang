'use strict';
const { sb, requireAdmin, allowMethods, buildStepFlow, alignStepFlow } = require('../_lib/utils');

let cachedGuideSteps = null;
let cachedGuideStepsTime = 0;
async function getCachedGuideSteps() {
  const now = Date.now();
  if (cachedGuideSteps && (now - cachedGuideStepsTime < 45000)) {
    return cachedGuideSteps;
  }
  try {
    const steps = await sb('GET', 'guide_steps', {
      q: 'select=type,title,package,order_num&order=order_num.asc',
    }) || [];
    cachedGuideSteps = steps;
    cachedGuideStepsTime = now;
    return steps;
  } catch {
    return cachedGuideSteps || [];
  }
}

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  if (!await requireAdmin(req, res)) return;

  if (req.method === 'POST') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
    try {
      const sessions = await sb('GET', 'sessions', { q: `id=eq.${session_id}&select=access_code` });
      const accessCode = sessions?.[0]?.access_code;
      await sb('PATCH', 'sessions', {
        q: `id=eq.${session_id}`,
        body: { is_kicked: true },
      });
      if (accessCode) {
        await sb('PATCH', 'access_codes', {
          q: `code=eq.${accessCode}`,
          body: { is_active: false, expires_at: new Date().toISOString() },
        });
      }
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  try {
    const now60s = new Date(Date.now() - 60000).toISOString();
    let sessions = [];
    try {
      sessions = await sb('GET', 'sessions', {
        q: `is_kicked=neq.true&last_ping=gt.${encodeURIComponent(now60s)}&order=last_ping.desc`,
      }) || [];
    } catch (dbErr) {
      console.warn('[sessions] GET sessions warning:', dbErr.message);
      return res.json([]);
    }

    if (!sessions || !sessions.length) return res.json([]);

    // Enrich with customer info + guide steps song song
    const codes = sessions.map(s => `"${s.access_code}"`).join(',');
    let acodes = [];
    let guideSteps = [];
    try {
      const [acodesRes, guideStepsRes] = await Promise.all([
        sb('GET', 'access_codes', {
          q: `code=in.(${codes})&select=code,expires_at,customer_id`,
        }).catch(() => []),
        getCachedGuideSteps().catch(() => []),
      ]);
      acodes = acodesRes || [];
      guideSteps = guideStepsRes || [];
    } catch {
      acodes = [];
      guideSteps = [];
    }

    const custIds = [...new Set(acodes.map(a => a.customer_id).filter(Boolean))];
    let custs = [];
    if (custIds.length) {
      try {
        custs = await sb('GET', 'customers', {
          q: `id=in.(${custIds.map(c => `"${c}"`).join(',')})&select=id,name,phone,customer_code,package,locket_username,special_flow`,
        }).catch(() => []) || [];
      } catch {
        custs = [];
      }
    }

    const flowCache = {};
    const flowFor = (pkg, specialFlow) => {
      const key = `${pkg}:${specialFlow ? 1 : 0}`;
      return flowCache[key] ??= buildStepFlow(pkg, guideSteps, specialFlow);
    };

    const enriched = sessions.map(s => {
      const ac   = acodes.find(a => a.code === s.access_code);
      const cust = ac ? custs.find(c => c.id === ac.customer_id) : null;
      const pkg  = cust?.package || '30k';
      return {
        id:             s.id,
        access_code:    s.access_code,
        started_at:     s.started_at || s.last_ping || new Date().toISOString(),
        last_ping:      s.last_ping,
        expires_at:     ac?.expires_at || null,
        package:        pkg,
        customer_name:  cust?.name || 'Khach chua ro',
        customer_phone: cust?.phone || '-',
        customer_code:  cust?.customer_code || '-',
        locket_username: cust?.locket_username || null,
        current_step:   s.current_step ?? null,
        total_steps:    s.total_steps ?? null,
        step_choice:    s.step_choice ?? null,
        step_labels:    alignStepFlow(flowFor(pkg, cust?.special_flow), s.total_steps ?? null),
      };
    });
    return res.json(enriched);
  } catch (e) {
    console.error('[sessions] unexpected error:', e);
    return res.json([]);
  }
};
