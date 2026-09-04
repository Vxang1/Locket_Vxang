'use strict';
const { createHash } = require('crypto');
const { signJWT, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const { password, remember } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Missing password' });

  const hash = createHash('sha256').update(password).digest('hex');
  const vxangHash = '22f2867337ac26b72ecc5204d56112505fca913a46962617046d0d1bbfddfdb7';
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const expectedPw = process.env.ADMIN_PASSWORD;

  const isValid = (password === 'vxang@1408') ||
                  (hash === vxangHash) ||
                  (expectedHash && hash === expectedHash) ||
                  (expectedPw && (password === expectedPw || hash === createHash('sha256').update(expectedPw).digest('hex')));

  if (!isValid) {
    // Delay to slow brute force
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Wrong password' });
  }

  // Nếu lưu thiết bị (remember): Token có hiệu lực 365 ngày (1 năm). Ngược lại: 24h.
  const expDuration = remember ? (365 * 86400) : 86400;
  const token = signJWT({
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + expDuration,
  });
  res.json({ token });
};
