const { sb, requireAdmin, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const steps = await sb('guide_steps?order=order_num.asc');
    return res.status(200).json(steps || []);
  }

  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const created = await sb('guide_steps', { method: 'POST', body: req.body, headers: { 'Prefer': 'return=representation' } });
    return res.status(200).json(created ? created[0] : {});
  }
  if (req.method === 'PATCH') {
    const id = req.query.id;
    await sb(`guide_steps?id=eq.${id}`, { method: 'PATCH', body: req.body });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    await sb(`guide_steps?id=eq.${id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
