const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const p = requireGuide(req);
  if (!p) return res.status(401).json({ error: 'Unauthorized' });

  const { currentStep, username } = req.body || {};

  if (username && String(username).trim()) {
    sb(`customers?id=eq.${p.customer_id}`, { method: 'PATCH', body: { locket_username: String(username).trim() } }).catch(() => {});
  }

  if (p.session_id) {
    await sb(`sessions?id=eq.${p.session_id}`, {
      method: 'PATCH',
      body: { last_ping: new Date().toISOString(), current_step: currentStep || 0 }
    });
  }

  const [sRows, cRows, otherSess] = await Promise.all([
    p.session_id ? sb(`sessions?id=eq.${p.session_id}&select=is_kicked,fraud_triggered_at,device_id`) : Promise.resolve([]),
    sb(`access_codes?code=eq.${p.code}&select=status,expires_at,is_active`),
    p.session_id ? sb(`sessions?access_code=eq.${p.code}&id=neq.${p.session_id}&last_ping=gt.${new Date(Date.now() - 12000).toISOString()}&select=id,device_id`) : Promise.resolve([])
  ]);

  if (sRows && sRows.length && sRows[0].is_kicked) return res.status(200).json({ kicked: true });
  if (!cRows || !cRows.length || !cRows[0].is_active || cRows[0].status === 'fraud') return res.status(200).json({ expired: true, fraud_final: true });
  if (new Date(cRows[0].expires_at) < new Date()) return res.status(200).json({ expired: true });

  const curSess = sRows && sRows[0];

  // Phát hiện thiết bị kép cùng ping trong vòng 12s
  if (otherSess && otherSess.length) {
    const isDifferentDevice = otherSess.some(os => os.device_id && curSess?.device_id && os.device_id !== curSess.device_id);
    if (isDifferentDevice && curSess && !curSess.fraud_triggered_at) {
      const nowIso = new Date().toISOString();
      await sb(`sessions?access_code=eq.${p.code}`, { method: 'PATCH', body: { fraud_triggered_at: nowIso } });
      curSess.fraud_triggered_at = nowIso;
    }
  }

  if (curSess && curSess.fraud_triggered_at) {
    const elapsed = (Date.now() - new Date(curSess.fraud_triggered_at).getTime()) / 1000;
    if (elapsed > 5) {
      const left = Math.max(0, 20 - elapsed);
      if (left <= 0) {
        await sb(`access_codes?code=eq.${p.code}`, { method: 'PATCH', body: { status: 'fraud', is_active: false } });
        return res.status(200).json({ expired: true, fraud_final: true });
      }
      return res.status(200).json({ fraud_warning: true, seconds_left: Math.round(left) });
    }
  }

  return res.status(200).json({ ok: true });
};
