const { sb, requireAdmin, allowMethods } = require('../_lib/utils');
const { handleTelegramUpdate } = require('../_lib/telegram-bot');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await handleTelegramUpdate(req.body);
    } catch (e) {
      console.error('Webhook error:', e);
    }
    return res.status(200).json({ ok: true });
  }

  if (!allowMethods(req, res, ['GET'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const since40s = new Date(Date.now() - 40000).toISOString();
    const [c, ac, comp, sess] = await Promise.all([
      sb('customers?select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb('access_codes?select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb('access_codes?completed_at=not.is.null&select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb(`sessions?last_ping=gt.${since40s}&select=id`)
    ]);
    return res.status(200).json({
      customers: c ? c.length : 0,
      codes: ac ? ac.length : 0,
      completed: comp ? comp.length : 0,
      sessions: sess ? sess.length : 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
