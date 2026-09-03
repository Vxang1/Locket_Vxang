const { sb, fbGet, signJWT, allowMethods, claimDnsFromPool, notifyTelegram, escMd } = require('../_lib/utils');
const crypto = require('crypto');

module.exports = async (req, res) => {
  const action = req.query.action;

  // Cào Apple ID on-demand
  if (action === 'appstore') {
    try {
      const appstore = await fbGet('appstore') || {};
      let email = appstore.email || '';
      let password = appstore.password || '';

      if (appstore.scraper_url) {
        try {
          const sRes = await fetch(appstore.scraper_url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
          const html = await sRes.text();
          const em = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const pw = html.match(/(?:pass|pwd|password|mật khẩu)[\s:=]+([A-Za-z0-9!@#$%^&*()_+=-]{6,30})/i);
          if (em) email = em[1];
          if (pw) password = pw[1];
        } catch {}
      }

      // Nếu nguồn 1 lỗi/trống, thử scraper_url_backup
      if ((!email || !password) && appstore.scraper_url_backup) {
        try {
          const sRes2 = await fetch(appstore.scraper_url_backup, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
          const html2 = await sRes2.text();
          const em2 = html2.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const pw2 = html2.match(/(?:pass|pwd|password|mật khẩu)[\s:=]+([A-Za-z0-9!@#$%^&*()_+=-]{6,30})/i);
          if (em2) email = em2[1];
          if (pw2) password = pw2[1];
        } catch {}
      }

      const masked = email ? email.replace(/^(.{3}).*(@.*)$/, '$1***$2') : '';
      return res.status(200).json({ ok: true, email_real: email, email_masked: masked, password, has_ipa: !!appstore.ipa_url });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // Tải Plist Manifest IPA OTA
  if (action === 'ipa_plist') {
    const appstore = await fbGet('appstore') || {};
    const ipaUrl = appstore.ipa_url || 'https://example.com/locket.ipa';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${ipaUrl}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>com.locket.Locket</string>
        <key>bundle-version</key>
        <string>1.0.0</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>Locket Gold Hạ Cấp</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }

  // Claim DNS Pool
  if (action === 'dns_pool_claim') {
    const token = (req.headers['authorization'] || '').slice(7);
    const { verifyJWT } = require('../_lib/utils');
    const p = verifyJWT(token);
    if (!p) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const custRows = await sb(`customers?id=eq.${p.customer_id}&select=package,customer_code`);
    if (!custRows || !custRows.length) return res.status(404).json({ ok: false, error: 'Không tìm thấy khách' });

    const c = custRows[0];
    const dnsData = await claimDnsFromPool(c.package, c.customer_code);
    return res.status(dnsData.ok ? 200 : 503).json(dnsData);
  }

  // Kiểm tra Link DNS Riêng kèm TTL 10 phút
  if (action === 'dns_check') {
    const t = req.query.t;
    if (!t) return res.status(400).json({ error: 'Thiếu token' });
    const rows = await sb(`private_dns_links?token=eq.${encodeURIComponent(t)}`);
    if (!rows || !rows.length) return res.status(404).json({ error: 'Link không hợp lệ' });
    const row = rows[0];

    // Lần đầu mở link
    if (row.status === 'unopened' || !row.first_accessed_at) {
      const now = new Date();
      const expires = new Date(now.getTime() + 600000);
      await sb(`private_dns_links?id=eq.${row.id}`, {
        method: 'PATCH',
        body: { status: 'active', first_accessed_at: now.toISOString(), expires_at: expires.toISOString() }
      });
      notifyTelegram(`🔒 *KHÁCH BẮT ĐẦU CÀI DNS RIÊNG*\n───────────────\n👤 Mã KH: \`${escMd(row.customer_code)}\`\n⏱ Link hết hạn sau: 10 phút`);
      return res.status(200).json({ ok: true, ublockdns_url: row.nextdns_url || row.ublockdns_url, package: row.package, customer_code: row.customer_code });
    }

    // Đã mở, kiểm tra hết hạn
    if (new Date(row.expires_at) < new Date()) {
      if (row.status !== 'expired') {
        await sb(`private_dns_links?id=eq.${row.id}`, { method: 'PATCH', body: { status: 'expired' } });
      }
      return res.status(200).json({ expired: true });
    }

    return res.status(200).json({ ok: true, ublockdns_url: row.nextdns_url || row.ublockdns_url, package: row.package, customer_code: row.customer_code });
  }

  // Đánh thức serverless
  if (action === 'warmup') return res.status(200).json({ ok: true });

  // Xác thực mã truy cập POST
  if (!allowMethods(req, res, ['POST'])) return;
  const { code, device_id } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã truy cập' });

  const cleanCode = code.trim().toUpperCase();
  const codes = await sb(`access_codes?code=eq.${cleanCode}&select=*,customers(*)`);
  if (!codes || !codes.length) return res.status(404).json({ error: 'Mã truy cập không đúng' });

  const c = codes[0];
  if (!c.is_active || c.status === 'fraud') return res.status(403).json({ error: 'Mã truy cập đã bị vô hiệu hóa' });

  let expiresAt = c.expires_at;
  // Lần đầu vào: Tính 30 phút
  if (!c.first_used_at) {
    const now = new Date();
    expiresAt = new Date(now.getTime() + 1800000).toISOString();
    await sb(`access_codes?id=eq.${c.id}`, {
      method: 'PATCH',
      body: { first_used_at: now.toISOString(), expires_at: expiresAt, status: 'active' }
    });
    notifyTelegram(`⚡ *KHÁCH BẮT ĐẦU VÀO WEB*\n───────────────\n👤 Khách: *${escMd(c.customers?.name || '')}* (\`${escMd(c.customers?.customer_code || '')}\`)\n🔑 Mã: \`${escMd(cleanCode)}\`\n⏱ Hết hạn lúc: ${escMd(new Date(expiresAt).toLocaleTimeString('vi-VN'))}`);
  } else if (new Date(c.expires_at) < new Date()) {
    return res.status(403).json({ error: 'Mã truy cập đã hết thời gian sử dụng' });
  }

  // Tạo phiên live
  const sessToken = crypto.randomBytes(16).toString('hex');
  const sess = await sb('sessions', {
    method: 'POST',
    body: { access_code: cleanCode, session_token: sessToken, device_id: device_id || '', current_step: 0 },
    headers: { 'Prefer': 'return=representation' }
  });

  const guideJwt = signJWT({
    code: cleanCode,
    customer_id: c.customer_id,
    session_id: sess ? sess[0].id : null,
    role: 'guide'
  }, '45m');

  return res.status(200).json({ ok: true, token: guideJwt, expires_at: expiresAt });
};
