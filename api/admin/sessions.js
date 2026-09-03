'use strict';
const { sb, requireAdmin, allowMethods, buildStepFlow, alignStepFlow, normalizePackage } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  if (!await requireAdmin(req, res)) return;

  if (req.method === 'POST') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
    try {
      const sessions = await sb('GET', 'sessions', { q: `id=eq.${encodeURIComponent(session_id)}&select=access_code` });
      const accessCode = sessions?.[0]?.access_code;
      await sb('PATCH', 'sessions', {
        q: `id=eq.${encodeURIComponent(session_id)}`,
        body: { is_kicked: true },
      });
      if (accessCode) {
        await sb('PATCH', 'access_codes', {
          q: `code=eq.${encodeURIComponent(accessCode)}`,
          body: { is_active: false, expires_at: new Date().toISOString() },
        });
      }
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  try {
    const now40s = new Date(Date.now() - 40000).toISOString();
    const sessions = await sb('GET', 'sessions', {
      q: `is_kicked=eq.false&last_ping=gt.${encodeURIComponent(now40s)}&order=started_at.desc`,
    }) || [];
    if (!sessions.length) return res.json([]);

    const codes = sessions.map(s => `"${s.access_code}"`).join(',');
    const acodes = await sb('GET', 'access_codes', {
      q: `code=in.(${codes})&select=code,expires_at,customer_id,package`,
    }) || [];

    const custIds = [...new Set(acodes.map(a => a.customer_id).filter(Boolean))];
    let custs = [];
    if (custIds.length) {
      custs = await sb('GET', 'customers', {
        q: `id=in.(${custIds.map(c => `"${c}"`).join(',')})&select=id,name,phone,customer_code,locket_username,special_flow`,
      }) || [];
    }

    const flowCache = {};
    const flowFor = (pkg, specialFlow) => {
      const key = `${pkg}:${specialFlow ? 1 : 0}`;
      return flowCache[key] ??= buildStepFlow(pkg, null, specialFlow);
    };

    const enriched = sessions.map(s => {
      const ac   = acodes.find(a => a.code === s.access_code);
      const cust = ac ? custs.find(c => c.id === ac.customer_id) : null;
      const pkg  = normalizePackage(ac?.package);
      return {
        id:             s.id,
        access_code:    s.access_code,
        started_at:     s.started_at,
        last_ping:      s.last_ping,
        expires_at:     ac?.expires_at || null,
        package:        pkg,
        customer_name:  cust?.name || 'Khách chưa rõ',
        customer_phone: cust?.phone || '-',
        customer_code:  cust?.customer_code || '-',
        locket_username: cust?.locket_username || null,
        current_step:   s.current_step ?? null,
        total_steps:    s.total_steps ?? null,
        step_choice:    s.step_choice ?? null,
        step_flow:      flowFor(pkg, !!cust?.special_flow),
        aligned_flow:   alignStepFlow(flowFor(pkg, !!cust?.special_flow), s.total_steps),
        is_original:    s.is_original !== false,
      };
    });

    return res.json(enriched);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
