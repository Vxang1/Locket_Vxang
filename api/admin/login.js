const { allowMethods, signJWT } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const { password, remember } = req.body || {};
  const expectedPw = process.env.ADMIN_PASSWORD || '19082006';
  if (!password || password !== expectedPw) {
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }
  const token = signJWT({ role: 'admin' }, remember ? '365d' : '24h');
  return res.status(200).json({ ok: true, token });
};
