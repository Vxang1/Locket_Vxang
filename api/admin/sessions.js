const { sb, requireAdmin, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Thiếu session_id' });
    await sb(`sessions?id=eq.${session_id}`, { method: 'PATCH', body: { is_kicked: true } });
    return res.status(200).json({ ok: true });
  }

  if (!allowMethods(req, res, ['GET'])) return;

  const since40s = new Date(Date.now() - 40000).toISOString();
  const sessions = await sb(`sessions?last_ping=gt.${since40s}&order=last_ping.desc&select=*,access_codes(code,customer_id,customers(name,customer_code,package,locket_username))`);

  return res.status(200).json(sessions || []);
};
