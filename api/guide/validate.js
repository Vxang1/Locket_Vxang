'use strict';
const { sb, signJWT, verifyJWT, getToken, allowMethods, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, expireCodeAndNotify, lookupCustomerByDnsCode, checkAndNotifyDnsExpiry, PRIVATE_DNS_TTL_MS, dnsPrivateUrl, normalizePackage, isPermPackage, getAppConfig, setAppConfig, getAppstoreConfig, getEmergencyConfig, maskAppstoreEmail, claimDnsFromPool, DNS_POOL_FULL_MSG } = require('../_lib/utils');
const { resolveUid, injectGold } = require('../_lib/locket-gold');
const { randomUUID } = require('crypto');

// Mã có hiệu lực bao lâu kể từ lúc khách kích hoạt. Gói vĩnh viễn (150/180) được
// 45 phút thay vì 30: flow dài hơn (cài Shadowrocket bằng tài khoản Appstore chung
// → đăng xuất/đăng nhập App Store → cài IPA qua OTA), 30 phút không đủ.
const CODE_VALID_MS      = 30 * 60 * 1000;
const CODE_VALID_MS_PERM = 45 * 60 * 1000;
function codeValidMs(pkg) {
  return isPermPackage(normalizePackage(pkg)) ? CODE_VALID_MS_PERM : CODE_VALID_MS;
}
function codeValidLabel(pkg) {
  return isPermPackage(normalizePackage(pkg)) ? '45 phút' : '30 phút';
}

// ── GET ?action=appstore — trả tài khoản Appstore chung cho khách gói vĩnh viễn ──
// BẮT BUỘC có JWT guide hợp lệ (mã còn hiệu lực). Đây là chỗ DUY NHẤT mật khẩu
// Appstore rời khỏi server, nên không được nới lỏng thành public: dự án tham khảo
// (locketvxang) để account trong Firebase RTDB đọc được từ client, ai mở trang cũng
// lấy được pass qua DevTools — cố tình KHÔNG làm theo.
// Rủi ro còn lại (khách có mã tự copy pass rồi share ra ngoài) là rủi ro cố hữu của
// việc share account, không xử được bằng code.
async function scrapeHtmlSource(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*'
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const rawText = await res.text();

    // 1. Thử phân tích nếu nguồn là JSON API (Ví dụ: từ dự án AppleID-Shadowrocket)
    try {
      const json = JSON.parse(rawText);
      if (json && json.data && json.data.length > 0) {
        const first = json.data.find(a => a.username && a.password && (a.status === 'Hoạt động' || a.status === 'Ho\u1ea1t \u0111\u1ed9ng')) || json.data[0];
        if (first && first.username && first.password) {
          return { email: first.username, password: first.password };
        }
      }
    } catch (e) {
      // Không phải JSON, tiếp tục cào bằng Regex (HTML thô)
    }

    // 2. Cào mã HTML thô (phù hợp các trang như jiesuo.one)
    const titleRegex = /(?:title|data-clipboard-text)="([^"]+)"/g;
    let match;
    let email = '';
    let password = '';

    while ((match = titleRegex.exec(rawText)) !== null) {
      const val = match[1].trim();
      if (!email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
        email = val;
      } else if (email && !password) {
        if (val.length > 0 && val !== '#' && !val.toLowerCase().includes('copy')) {
          password = val;
          break;
        }
      }
    }
    if (email && password) return { email, password };
    return null;
  } catch (e) {
    return null;
  }
}


async function handleAppstore(req, res) {
  const payload = verifyJWT(getToken(req));
  if (!payload || payload.role !== 'guide') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const cfg = await getAppstoreConfig();
    let email = String(cfg.email || '').trim();
    let password = String(cfg.password || '').trim();
    const scraper_url = String(cfg.scraper_url || '').trim();
    const scraper_url_backup = String(cfg.scraper_url_backup || '').trim();
    const special_flow = !!payload.specialFlow;
      const s1_active = cfg.scraper_url_active !== false;
      const s2_active = cfg.scraper_url_backup_active !== false;

      // Chỉ dùng nguồn cào tự động cho Flow thường (nếu có cấu hình)
      if (!special_flow) {
        let scraped = null;
        if (scraper_url && s1_active) {
          scraped = await scrapeHtmlSource(scraper_url);
        }
        if (!scraped && scraper_url_backup && s2_active) {
          scraped = await scrapeHtmlSource(scraper_url_backup);
        }
        
        if (scraped && scraped.email && scraped.password) {
        email = scraped.email;
        password = scraped.password;
      }
    }

    const ipa_url = String(cfg.ipa_url || '').trim();
      const has_ipa = !!ipa_url;
      if (!email || !password) {
        return res.json({
          ok: true,
          is_updating: true,
            email_masked: "Đợi Vxang cập nhật",
            email_real: "Đợi Vxang cập nhật",
            password: "Đợi Vxang cập nhật",
          ipa_url,
          has_ipa,
          special_flow
        });
      }
    return res.json({
      ok: true,
      email_masked: maskAppstoreEmail(email),
      email_real: email,
      password,
      ipa_url,
      has_ipa,
      special_flow,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ── GET ?action=ipa_plist — sinh manifest plist OTA động cho iOS itms-services ──
// Phục vụ trực tiếp từ server Vercel (HTTPS, đúng MIME application/xml, phản hồi 50ms),
// inject thẳng link download trực tiếp (Dropbox dl=1, Catbox, Archive.org...) vào XML.
// Giúp iOS hiện popup "Muốn cài đặt Locket_Vxang" ngay lập tức mà không bị lỗi mạng,
// không bị GitHub raw rate limit 429, và tải trực tiếp tốc độ cao về iPhone.
async function handleIpaPlist(req, res) {
  try {
    const cfg = await getAppstoreConfig();
    let ipaUrl = String(cfg.ipa_url || '').trim();
    if (!ipaUrl) return res.status(503).send('IPA chưa được cấu hình');

    // Chuẩn hoá link Dropbox để luôn là direct download dl=1
    if (ipaUrl.includes('dropbox.com') && !ipaUrl.includes('dl=1')) {
      ipaUrl = ipaUrl.replace(/([?&])dl=0/, '$1dl=1');
      if (!ipaUrl.includes('dl=1')) {
        ipaUrl += (ipaUrl.includes('?') ? '&' : '?') + 'dl=1';
      }
    }

    // Escape ký tự đặc biệt cho XML (& -> &amp;, v.v.)
    const safeIpaUrl = String(ipaUrl).replace(/[&<>'"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;'
    }[c]));

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
          <string>${safeIpaUrl}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>display-image</string>
          <key>needs-shine</key>
          <true/>
          <key>url</key>
          <string>https://raw.githubusercontent.com/Vxang19/Locket-IPA/refs/heads/main/Locket%20Icon.png</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>full-size-image</string>
          <key>needs-shine</key>
          <true/>
          <key>url</key>
          <string>https://raw.githubusercontent.com/Vxang19/Locket-IPA/refs/heads/main/Locket%20Icon.png</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>com.locket.Locket</string>
        <key>bundle-version</key>
        <string>2.8.0</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>Locket_Vxang</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(xml);
  } catch (e) { res.status(500).send('Lỗi sinh plist'); }
}

// ── GET ?action=ipa — proxy file IPA từ nguồn (Dropbox/catbox/...) về cho iOS ──
// Giữ lại làm fallback nếu client gọi trực tiếp file IPA.
async function handleIpa(req, res) {
  try {
    const cfg = await getAppstoreConfig();
    const ipaUrl = String(cfg.ipa_url || '').trim();
    if (!ipaUrl) return res.status(503).send('IPA chưa được cấu hình');
    const resp = await fetch(ipaUrl, { redirect: 'follow' });
    if (!resp.ok) return res.status(502).send('Không tải được IPA từ nguồn');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="Locket.ipa"');
    const cl = resp.headers.get('content-length');
    if (cl) res.setHeader('Content-Length', cl);
    for await (const chunk of resp.body) { res.write(chunk); }
    return res.end();
  } catch (e) { res.status(500).send('Lỗi server'); }
}

// ── GET ?action=dns_check&t=<token> — public, gọi từ dns.html lúc trang load ──
// Vừa trả thông tin (dns_url/package/customer_code) vừa ghi nhận "lần đầu
// truy cập" (first_accessed_at) trong CÙNG 1 request — không tách fetch riêng để
// tránh race giữa 2 request độc lập. TTL 10 phút tính từ first_accessed_at, không lưu
// expires_at cứng trong DB (tương tự nguyên tắc access_codes nhưng đơn giản hơn:
// chỉ cần 1 mốc + hằng số PRIVATE_DNS_TTL_MS) — nhờ vậy nút "Kích hoạt lại" của admin
// chỉ cần xoá first_accessed_at là link sống lại, không phải tính toán mốc mới.
async function handleDnsCheck(req, res) {
  const token = (req.query?.t || '').trim();
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const rows = await sb('GET', 'private_dns_links', { q: `token=eq.${encodeURIComponent(token)}` });
    if (!rows?.length) return res.status(404).json({ error: 'Link không hợp lệ hoặc đã hết hạn' });
    const row = rows[0];

    let firstAccessedAt = row.first_accessed_at;
    let isFreshAccess = false;
    if (!firstAccessedAt) {
      // PATCH có điều kiện WHERE first_accessed_at=is.null + return=representation:
      // chỉ request nào THỰC SỰ set được cột này mới coi là "chính request này vừa
      // mở lần đầu" — chống race khi khách mở 2 tab cùng lúc (giống expireCodeAndNotify).
      const now = new Date().toISOString();
      let patched;
      try {
        patched = await sb('PATCH', 'private_dns_links', {
          q: `id=eq.${encodeURIComponent(row.id)}&first_accessed_at=is.null`,
          body: { first_accessed_at: now },
          prefer: 'return=representation',
        });
      } catch { patched = null; }
      if (patched?.length) {
        firstAccessedAt = now;
        isFreshAccess = true;
      } else {
        const reread = await sb('GET', 'private_dns_links', { q: `id=eq.${encodeURIComponent(row.id)}` });
        firstAccessedAt = reread?.[0]?.first_accessed_at || firstAccessedAt;
      }
    }

    if (isFreshAccess) {
      // Báo Telegram "khách vừa bấm vào link" — CHỈ khi fresh access thật (đã lock
      // ở PATCH trên), không báo lại khi khách reload/mở lại link cũ.
      const cust = await lookupCustomerByDnsCode(row.customer_code);
      const who = cust?.name ? escTgHtml(cust.name) : 'Khách';
      await notifyTelegram(
        `🔒 <b>${who}</b> vừa bấm vào link DNS riêng\n` +
        `🆔 Mã KH: <code>${escTgHtml(row.customer_code)}</code>\n` +
        `${row.package === '15s' ? '🌟' : '⭐'} Gói: <b>${escTgHtml(row.package || '5s')}</b>`
      );
      // Fresh access → chắc chắn chưa hết hạn, khỏi cần check thêm.
      return res.json({ ok: true, expired: false, dns_url: dnsPrivateUrl(row), ublockdns_url: dnsPrivateUrl(row), package: row.package, customer_code: row.customer_code });
    }

    // Check-lười: request này chạm vào row đã có first_accessed_at từ trước — kiểm
    // luôn xem đã quá 10 phút chưa, báo Telegram đúng 1 lần nếu vừa phát hiện.
    await checkAndNotifyDnsExpiry({ ...row, first_accessed_at: firstAccessedAt });
    const isExpired = firstAccessedAt && (Date.now() - new Date(firstAccessedAt).getTime() > PRIVATE_DNS_TTL_MS);
    if (isExpired) return res.json({ ok: true, expired: true });
    return res.json({ ok: true, expired: false, dns_url: dnsPrivateUrl(row), ublockdns_url: dnsPrivateUrl(row), package: row.package, customer_code: row.customer_code });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ── GET ?action=dns_pool_claim — lấy link DNS pool (NextDNS) đang active cho gói của khách ──
// Thay cho file .mobileconfig tĩnh /dns5s.mobileconfig, /dns15s.mobileconfig cũ: mỗi link
// pool chỉ phục vụ tối đa 5 MÃ KHÁCH khác nhau (max_uses, xem claimDnsFromPool trong utils.js)
// rồi admin phải tạo link mới — tự động rotate, không cần thay file thủ công.
// Cần JWT guide hợp lệ để biết chắc gói (payload.package) + lấy đúng customer_code (khách
// gói vĩnh viễn không có access_codes.customer_id kiểu 1-1 rõ, nên tra qua lookupCustomerByCode).
async function handleDnsPoolClaim(req, res) {
  const payload = verifyJWT(getToken(req));
  if (!payload || payload.role !== 'guide') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const pkg = normalizePackage(payload.package || '5s');
    const cust = await lookupCustomerByCode(payload.code);
    const customerCode = cust?.customerCode || payload.code || '';
    const claim = await claimDnsFromPool(pkg, customerCode);
    if (!claim.ok) {
      return res.status(503).json({ error: DNS_POOL_FULL_MSG, reason: claim.reason || 'empty' });
    }
    return res.json({ ok: true, dns_url: claim.dns_url, package: pkg, customer_code: customerCode });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = async (req, res) => {
  // ── GET ?action=warmup — đánh thức function này TRƯỚC khi khách bấm link DNS ──
  // Trước đây function chỉ được gọi lúc dns.html load, nên khách là người phải chịu
  // cold start của lambda (chờ vài giây mới thấy nút). Giờ admin mở trang admin, hoặc
  // bot Telegram xử lý 1 mã KH, đều gọi endpoint này trước để lambda đã nóng sẵn.
  // Cố tình KHÔNG chạm DB và KHÔNG cần auth: không trả về dữ liệu gì, chỉ 1 {ok:true}.
  if (req.method === 'GET' && req.query?.action === 'dev_mode') {
      res.setHeader('Cache-Control', 'no-store');
      const { getAppConfig } = require('../_lib/utils');
      const cfg = await getAppConfig('dev_mode');
      return res.json({ dev_mode: cfg?.active === true });
    }
    if (req.method === 'GET' && req.query?.action === 'warmup') {
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, warm: true });
  }
  if (req.method === 'GET' && req.query?.action === 'dns_check') {
    res.setHeader('Cache-Control', 'no-store');
    return handleDnsCheck(req, res);
  }
  // Tài khoản Appstore — cần JWT guide, xem comment ở handleAppstore.
  if (req.method === 'GET' && req.query?.action === 'appstore') {
    res.setHeader('Cache-Control', 'no-store');
    return handleAppstore(req, res);
  }
  // Sinh manifest plist OTA cho iOS itms-services — không cần auth (iOS tự gọi).
  if (req.method === 'GET' && req.query?.action === 'ipa_plist') {
    return handleIpaPlist(req, res);
  }
  // Proxy file IPA từ Dropbox/catbox/... về cho iOS — fallback nếu cần.
  if (req.method === 'GET' && req.query?.action === 'ipa') {
    return handleIpa(req, res);
  }
  // Claim link DNS pool (NextDNS, rotate mỗi 5 khách) — cần JWT guide, xem handleDnsPoolClaim.
  if (req.method === 'GET' && req.query?.action === 'dns_pool_claim') {
    res.setHeader('Cache-Control', 'no-store');
    return handleDnsPoolClaim(req, res);
  }
  // Kích hoạt Locket Gold bằng Username qua RevenueCat
  
  if (!allowMethods(req, res, ['POST'])) return;
  const { code, device_id } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Missing code' });
  const upperCode = code.trim().toUpperCase();
  const deviceId = (device_id || '').trim();
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || '';

  try {
    // 1. Validate code
    const codes = await sb('GET', 'access_codes', {
      q: `code=eq.${encodeURIComponent(upperCode)}&is_active=eq.true`,
    });
    if (!codes?.length) return res.status(403).json({ error: 'Mã không hợp lệ hoặc đã vô hiệu hóa' });
    const codeRow = codes[0];

    if (codeRow.completed_at) return res.status(403).json({ error: 'Mã này đã được sử dụng xong' });
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      // Khách quay lại nhập mã đã quá hạn: khoá mã + báo Telegram đúng 1 lần.
      // Trước đây chỉ trả lỗi cho khách, mã vẫn is_active=true nên admin không biết
      // khách bị mắc kẹt. expireCodeAndNotify tự chống báo trùng nên gọi ở đây an toàn
      // dù ping hoặc cron có thể đã báo trước.
      // Nhãn thời gian lấy theo gói (gói vĩnh viễn 45 phút, còn lại 30) để câu báo lỗi
      // khớp đúng cái mã đó thực sự được cấp.
      await expireCodeAndNotify(codeRow);
      return res.status(403).json({ error: `Mã đã hết hiệu lực (${codeValidLabel(codeRow.package)})` });
    }

    // 2. Xác định "chủ thiết bị" & Chống Share Mã Thông Minh:
    //    - Trình duyệt In-App (Zalo, Messenger, Facebook...) không bị khoá cứng quyền sở hữu.
    //    - Kiểm tra thiết bị chạy SONG SONG: Chỉ báo share mã khi có 2 thiết bị KHÁC NHAU đang cùng PING đồng thời (< 35s).
    //    - Nếu khách đổi từ Zalo sang Safari (máy cũ không còn ping), tự động chuyển giao quyền sở hữu mượt mà 100%.
    const userAgent = req.headers['user-agent'] || '';
    const inApp = /zalo|zalomessenger|fbav|fban|messenger|instagram|tiktok|telegram/i.test(userAgent);

    let isOriginal = true;

    if (inApp || !deviceId) {
      // In-app webview hoặc không có deviceId -> Không gán sở hữu cứng, tránh khoá nhầm khi chuyển Safari
      isOriginal = true;
    } else if (!codeRow.original_device_id) {
      // Thiết bị Safari đầu tiên -> Gán quyền sở hữu
      try {
        await sb('PATCH', 'access_codes', {
          q: `id=eq.${codeRow.id}&original_device_id=is.null`,
          body: { original_device_id: deviceId },
        });
      } catch {}
      isOriginal = true;
    } else if (codeRow.original_device_id === deviceId) {
      // Cùng thiết bị vào lại
      isOriginal = true;
    } else {
      // Device ID khác: Kiểm tra xem có thiết bị khác ĐANG HOẠT ĐỘNG SONG SONG hay không
      let activeSessions = [];
      try {
        const threshold = new Date(Date.now() - 12 * 1000).toISOString();
        activeSessions = (await sb('GET', 'sessions', {
          q: `access_code=eq.${encodeURIComponent(upperCode)}&device_id=neq.${encodeURIComponent(deviceId)}&last_ping=gte.${encodeURIComponent(threshold)}&select=id,device_id,last_ping`,
        })) || [];
      } catch (e) {
        activeSessions = [];
      }

      if (!activeSessions || !activeSessions.length) {
        // Không có thiết bị nào khác đang ping song song -> Khách chuyển từ Zalo/mạng khác sang Safari -> Chuyển giao sở hữu
        try {
          await sb('PATCH', 'access_codes', {
            q: `id=eq.${codeRow.id}`,
            body: { original_device_id: deviceId },
          });
        } catch {}
        isOriginal = true;
      } else {
        // 🚨 THỰC SỰ CÓ 2 THIẾT BỊ ĐANG CÙNG DÙNG SONG SONG CÙNG LÚC
        isOriginal = false;
        if (!codeRow.fraud_triggered_at) {
          const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Không xác định';
          await sb('PATCH', 'access_codes', {
            q: `id=eq.${codeRow.id}`,
            body: { fraud_triggered_at: new Date().toISOString() },
          });
          const cust = await lookupCustomerByCode(upperCode);
          const who = cust.name ? escTgHtml(cust.name) : 'Khách';
          await notifyTelegram(
            `🚨 <b>${who}</b> đang share mã\n` +
            codeDetailLines(upperCode, codeRow.package, cust) + '\n' +
            `⚠️ IP gian lận: <code>${clientIp}</code>\n` +
            `Phát hiện 2 thiết bị khác nhau đang cùng truy cập mã song song — mã sẽ tự khoá sau 20 giây.`
          );
        }
      }
    }

    // 3. Dọn session cũ — CHỈ xoá session của CHÍNH device này (nếu có), KHÔNG đụng tới thiết bị khác
    //    (để không vô tình xoá session của "chủ" khi kẻ xâm nhập vào, hoặc ngược lại)
    if (deviceId) {
      await sb('DELETE', 'sessions', {
        q: `access_code=eq.${encodeURIComponent(upperCode)}&device_id=eq.${encodeURIComponent(deviceId)}`,
      });
    } else {
      // Không có device_id (hiếm, lỗi client) — chỉ dọn session cũ KHÔNG có device_id, không đụng session đã định danh
      await sb('DELETE', 'sessions', {
        q: `access_code=eq.${encodeURIComponent(upperCode)}&device_id=is.null`,
      });
    }

    // 4. Tăng entry_count
    const newCount = (codeRow.entry_count || 0) + 1;
    const patchBody = { entry_count: newCount };

    // 5. Kích hoạt lần đầu
    let expiresAt = codeRow.expires_at;
    const isFirstActivation = !codeRow.activated_at;
    if (isFirstActivation) {
      const activated_at = new Date().toISOString();
      // Thời hạn theo GÓI: 45 phút cho gói vĩnh viễn, 30 phút cho gói còn lại.
      // Mốc expires_at chốt đúng 1 lần ở đây nên phải biết gói ngay — codeRow.package
      // đã có sẵn trong cùng query ở bước 1, không cần thêm request.
      expiresAt = new Date(Date.now() + codeValidMs(codeRow.package)).toISOString();
      patchBody.activated_at = activated_at;
      patchBody.expires_at = expiresAt;
    }
    await sb('PATCH', 'access_codes', { q: `id=eq.${codeRow.id}`, body: patchBody });

    // Helper lấy thông tin khách hàng (chỉ query 1 lần duy nhất trong request)
    let cachedCustomer = null;
    async function getCustomerInfo() {
      if (!cachedCustomer) cachedCustomer = await lookupCustomerByCode(upperCode);
      return cachedCustomer;
    }

    // Báo khách bắt đầu làm hướng dẫn — CHỈ lần kích hoạt đầu tiên (không báo lại
    // mỗi lần khách refresh/mở lại tab, vì validate chạy lại mỗi lần vào guide).
    // PHẢI await, xem lý do ở comment notifyTelegram trong utils.js.
    if (isFirstActivation) {
      const cust = await getCustomerInfo();
      const who = cust.name ? escTgHtml(cust.name) : 'Khách';
      await notifyTelegram(
        `🚀 <b>${who}</b> bắt đầu làm hướng dẫn\n` +
        codeDetailLines(upperCode, codeRow.package, cust)
      );
    }

    // 6. Tạo session mới
    const sessionToken = randomUUID();
    await sb('POST', 'sessions', {
      body: {
        access_code: upperCode,
        session_token: sessionToken,
        device_id: deviceId || null,
        device_ip: ip || null,
        device_ua: ua || null,
        is_original: isOriginal,
      },
      prefer: 'return=minimal',
    });

    const exp = Math.floor(new Date(expiresAt).getTime() / 1000);
    const pkg = normalizePackage(codeRow.package);
    // Quyết định "có bước username hay không" — CHỐT MỘT LẦN DUY NHẤT cho cả đời mã,
    // lưu vào access_codes.skip_username_step, KHÔNG suy lại từ customers.locket_username.
    let skipUsernameStep;
    let specialFlow = false;
    if (codeRow.skip_username_step === true || codeRow.skip_username_step === false) {
      skipUsernameStep = codeRow.skip_username_step;
    } else {
      const custForFlag = await getCustomerInfo();
      skipUsernameStep = !!custForFlag.locketUsername;
      specialFlow = !!custForFlag.specialFlow;
      try {
        const locked = await sb('PATCH', 'access_codes', {
          q: `id=eq.${codeRow.id}&skip_username_step=is.null`,
          body: { skip_username_step: skipUsernameStep },
          prefer: 'return=representation',
        });
        if (!locked?.length) {
          const reread = await sb('GET', 'access_codes', { q: `id=eq.${codeRow.id}&select=skip_username_step` });
          const locked2 = reread?.[0]?.skip_username_step;
          if (locked2 === true || locked2 === false) skipUsernameStep = locked2;
        }
      } catch { /* cột chưa tồn tại (chưa chạy migration) — giữ hành vi cũ, không chặn khách */ }
    }
    if (!specialFlow) {
      const custForSpecial = await getCustomerInfo();
      specialFlow = !!custForSpecial.specialFlow;
    }
    const guideToken = signJWT({ role: 'guide', code: upperCode, sessionToken, package: pkg, skipUsernameStep, specialFlow, exp });

    res.json({ token: guideToken, expires_at: expiresAt, package: pkg });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
