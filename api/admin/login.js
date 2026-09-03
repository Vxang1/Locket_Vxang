'use strict';
const { createHash } = require('crypto');
const { signJWT, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const { password, remember } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Missing password' });

  const hash = createHash('sha256').update(password).digest('hex');
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const expectedPw = process.env.ADMIN_PASSWORD || '19082006';

  const isValid = (expectedHash && hash === expectedHash) ||
                  (password === expectedPw) ||
                  (hash === createHash('sha256').update(expectedPw).digest('hex'));

  if (!isValid) {
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }

  const expDuration = remember ? (365 * 86400) : 86400;
  const token = signJWT({
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + expDuration,
  });
  return res.json({ ok: true, token });
};
