'use strict';
// ─── Env vars (set in Vercel Dashboard, never in browser) ───
const SB_URL  = process.env.SUPABASE_URL || 'https://ogchtngdbywmayeluebh.supabase.co';
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const JWT_SEC = process.env.JWT_SECRET;
if (!SB_KEY)  throw new Error('[utils] SUPABASE_SERVICE_KEY env var chưa được set trong Vercel Dashboard');
if (!JWT_SEC) throw new Error('[utils] JWT_SECRET env var chưa được set trong Vercel Dashboard');
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || 'https://xwuan-access-e9d5e-default-rtdb.firebaseio.com';

// ─── Firebase RTDB REST helper (server-side, no SDK needed) ─────────────
// Đọc 1 node từ Firebase RTDB qua REST API. Không cần auth vì RTDB rules hiện tại
// cho phép public read (giống dự án tham khảo locketxwuan-main). Nếu sau này bật
// auth rules, thêm ?auth=<token> vào URL.
async function fbPut(path, data) {
    const url = `${FIREBASE_DB_URL}/${path.replace(/^\//, '')}.json?_t=${Date.now()}`; // Bypass cache
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!r.ok) throw new Error('fbPut failed');
      return true;
    } catch(e) {
      clearTimeout(timer);
      return false;
    }
  }

  async function fbGet(path) {
    const url = `${FIREBASE_DB_URL}/${path.replace(/^\//, '')}.json?_t=${Date.now()}`;
  // Timeout 4s để không treo serverless function khi Firebase chậm/hang.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
    clearTimeout(timer);
    if (!r.ok) return null;
    return r.json();
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') console.warn('[fbGet] timeout:', path);
    else console.warn('[fbGet] error:', e.message);
    return null;
  }
}

// ─── Supabase REST helper ────────────────────────────────────
async function sb(method, table, { body, q = '', prefer, count, head } = {}) {
  const h = {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
  };
  const prefParts = prefer ? [prefer] : [];
  if (count) prefParts.push(`count=${count}`);
  if (prefParts.length) h.Prefer = prefParts.join(', ');

  const reqMethod = head ? 'HEAD' : method;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}${q ? '?' + q : ''}`, {
      method: reqMethod,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
      keepalive: true,
      signal: ctrl.signal,
      cache: 'no-store'
    });
    clearTimeout(timer);
    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      throw new Error(`Supabase ${r.status}: ${errText}`);
    }
    if (head) {
      const cr = r.headers.get('content-range');
      let totalCount = 0;
      if (cr) {
        const parts = cr.split('/');
        if (parts[1] && parts[1] !== '*') totalCount = parseInt(parts[1], 10) || 0;
      }
      return { count: totalCount };
    }
    if (r.status === 204) return null;
    const data = await r.json().catch(() => null);
    if (count && Array.isArray(data)) {
      const cr = r.headers.get('content-range');
      let totalCount = data.length;
      if (cr) {
        const parts = cr.split('/');
        if (parts[1] && parts[1] !== '*') totalCount = parseInt(parts[1], 10) || 0;
      }
      data.count = totalCount;
    }
    return data;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error(`Supabase timeout: ${reqMethod} ${table}`);
    }
    throw e;
  }
}

// ─── JWT (HMAC-SHA256, Node crypto) ──────────────────────────
const { createHmac, timingSafeEqual, randomBytes } = require('crypto');
function b64url(str) { return Buffer.from(str).toString('base64url'); }
function signJWT(payload) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const b = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', JWT_SEC).update(`${h}.${b}`).digest('base64url');
  return `${h}.${b}.${sig}`;
}
function verifyJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const [h, b, sig] = token.split('.');
  if (!h || !b || !sig) return null;
  try {
    const expected = createHmac('sha256', JWT_SEC).update(`${h}.${b}`).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// ─── HTTP helpers ────────────────────────────────────────────
function getToken(req) {
  const a = req.headers.authorization || '';
  if (a.startsWith('Bearer ')) return a.slice(7);
  return null;
}
async function requireAdmin(req, res) {
  const p = verifyJWT(getToken(req));
  if (!p || p.role !== 'admin') { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return p;
}
async function requireGuide(req, res) {
  const p = verifyJWT(getToken(req));
  if (!p || p.role !== 'guide') { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return p;
}
function allowMethods(req, res, methods) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Server-Time', Date.now().toString());
  res.setHeader('Access-Control-Expose-Headers', 'Date, X-Server-Time');
  if (req.method === 'OPTIONS') { res.status(200).end(); return false; }
  if (!methods.includes(req.method)) { res.status(405).json({ error: 'Method not allowed' }); return false; }
  return true;
}

// ─── Code generator ─────────────────────────────────────────
function genCode(prefix, len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = prefix;
  for (let i = 0; i < len; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function genVpnToken() {
  return genCode('vx-15s-', 6);
}

async function createVpnToken(customerId, customerCode) {
  const token = genVpnToken();
  await sb('POST', 'vpn_tokens', {
    body: { customer_id: customerId, customer_code: customerCode, token },
    prefer: 'return=minimal',
  });
  return token;
}

// ─── Gói dịch vụ ─────────────────────────────────────────────
// Tên gói '150'/'180' là GIÁ TIỀN (150k/180k), không phải số giây quay.
// '150' = quay 5s vĩnh viễn, '180' = quay 15s vĩnh viễn.
// PACKAGES giờ chỉ là VIEW MỎNG từ PRICING — giữ key để tương thích DB/JWT, nhưng
// label/price lấy động theo duration khi cần hiển thị. KHÔNG hardcode giá cũ ở đây.
const PACKAGES = {
  '30k': { label: 'Gói 30k (5s Vĩnh viễn)' },
  '40k': { label: 'Gói 40k (15s Vĩnh viễn)' },
};
const PACKAGE_KEYS = ['30k', '40k'];
const PKG_EMOJI = { '30k': '⭐', '40k': '🌟' };

// Whitelist gói — NGUỒN SỰ THẬT DUY NHẤT. Trước đây 3 chỗ tự viết
// `pkg === '15s' ? '15s' : '5s'`, nên thêm gói mới là bị âm thầm hạ cấp về 5s
// (không lỗi, không log, chỉ sai dữ liệu). Mọi chỗ nhận package từ input phải
// đi qua đây.
function normalizePackage(pkg) {
  if (PACKAGE_KEYS.includes(pkg)) return pkg;
  if (pkg === '15s' || pkg === '180' || pkg === '40k') return '40k';
  return '30k';
}

// Gói vĩnh viễn: không có ngày hết hạn, không đếm ngày bảo hành.
function isPermPackage(pkg) { return true; }

// ─── Bảng giá theo gói + thời hạn ────────────────────────────
// Gói vĩnh viễn dùng duration 'perm' với months: null — KHÔNG phải 0, để phân biệt
// "vĩnh viễn" với "duration lạ không tra được" (cả hai đều falsy nếu dùng 0).
const PRICING = {
  '30k': {
    'perm': { price: 30000, label: 'Vĩnh viễn - 30k', months: null },
  },
  '40k': {
    'perm': { price: 40000, label: 'Vĩnh viễn - 40k', months: null },
  },
};

function getPrice(pkg, duration) {
  const p = normalizePackage(pkg);
  const d = duration || 'perm';
  return PRICING[p]?.[d]?.price || 0;
}

function getPriceLabel(pkg, duration) {
  const p = normalizePackage(pkg);
  const d = duration || 'perm';
  return PRICING[p]?.[d]?.label || '';
}

// Tra số tháng của 1 duration, quét MỌI gói thay vì chỉ 5s/15s như trước.
// Trả null nếu duration đó là vĩnh viễn ('perm'), undefined nếu không tra được.
// Phân biệt 2 ca này quan trọng: 'perm' phải trả về "còn hạn mãi", còn duration
// lạ phải trả về "chưa xác định" — trước đây cả hai đều thành 0 tháng.
function durationMonths(duration) {
  if (duration === '3m') return 3;
  if (duration === 'perm') return null;
  for (const pkg of PACKAGE_KEYS) {
    const m = PRICING[pkg]?.[duration]?.months;
    if (m !== undefined) return m;
  }
  return undefined;
}


// ─── Telegram thông báo ──────────────────────────────────────
// PHẢI await ở nơi gọi. Vercel đóng băng instance ngay khi handler trả response,
// nên fire-and-forget làm tin nhắn bị treo giữa đường: chỉ gửi đi khi instance đó
// tình cờ được tái sử dụng (báo chậm hàng chục phút, mang dữ liệu của lần cũ,
// hoặc mất hẳn). Hàm tự nuốt mọi lỗi nên await cũng không bao giờ throw.
// Hỗ trợ cấu hình nhiều Admin ID qua TELEGRAM_CHAT_ID hoặc TELEGRAM_ADMIN_IDS (phân cách bằng dấu phẩy, khoảng trắng, chấm phẩy)
// Mặc định hỗ trợ 2 Admin chính thức: 8676266893 và 8374108763
const TG_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const RAW_TG_CHAT_ID = `${process.env.TELEGRAM_CHAT_ID || ''},${process.env.TELEGRAM_ADMIN_IDS || ''}`.trim();
const TG_CHAT_IDS = Array.from(new Set(
  RAW_TG_CHAT_ID.split(/[\s,;]+/)
    .map(s => String(s).trim())
    .filter(Boolean)
));
const TG_CHAT_ID = TG_CHAT_IDS[0] || '';

function isTgAdmin(id) {
  if (!id) return false;
  return TG_CHAT_IDS.includes(String(id).trim());
}

// Bộ nhớ đệm chống gửi trùng lặp tin nhắn Telegram (trong vòng 10 giây)
const recentTgMessages = new Map();

async function notifyTelegram(text, extra = {}) {
  if (!TG_BOT_TOKEN || !TG_CHAT_IDS.length) return false; // chưa cấu hình bot token hoặc admin id — im lặng bỏ qua

  const now = Date.now();
  const msgKey = String(text || '').trim();
  const lastSent = recentTgMessages.get(msgKey);
  if (lastSent && (now - lastSent) < 10000) {
    return true; // Đã gửi tin nhắn này cách đây chưa đầy 10s -> chặn gửi trùng lặp
  }
  recentTgMessages.set(msgKey, now);

  if (recentTgMessages.size > 50) {
    for (const [k, t] of recentTgMessages.entries()) {
      if (now - t > 60000) recentTgMessages.delete(k);
    }
  }

  const sendToChat = async (chatId) => {
    try {
      const bodyPayload = { chat_id: chatId, text, parse_mode: 'HTML', ...extra };
      let r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      if (r.ok) return true;

      // Retry 1: Nếu lỗi BUTTON_DATA_INVALID hoặc lỗi do markup -> thử gửi không có reply_markup
      if (extra.reply_markup) {
        const { reply_markup, ...restExtra } = extra;
        r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...restExtra }),
        });
        if (r.ok) return true;
      }

      // Retry 2: Lỗi parse HTML -> gỡ thẻ HTML và gửi plain text
      const plainText = text.replace(/<[^>]+>/g, '');
      r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: plainText }),
      });
      return r.ok;
    } catch {
      return false;
    }
  };

  const results = await Promise.allSettled(TG_CHAT_IDS.map(sendToChat));
  return results.some(r => r.status === 'fulfilled' && r.value === true);
}

const TG_DIVIDER = '━━━━━━━━━━━━━━━';

// parse_mode 'HTML' coi <, >, & là ký tự đặc biệt — tên khách do admin nhập tự do
// nên phải escape trước khi nhét vào tin nhắn, giống nguyên tắc esc() trước khi
// nhét vào template HTML ở admin.html.
function escTgHtml(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Lấy id + tên + mã KH + duration từ mã truy cập, để thông
// báo Telegram gọi được tên khách, cho admin tra cứu tiếp bằng mã KH,
// và hiển thị đúng giá theo thời hạn (duration).
// Trả { id, name, type, customerCode, duration, package, specialFlow } — luôn trả object, mọi lỗi
// bị nuốt (thiếu tên vẫn phải gửi được thông báo, không được chặn luồng khách hàng).
async function lookupCustomerByCode(code) {
  const empty = { id: null, name: null, type: 'moi', customerCode: null, duration: 'perm', package: '30k', specialFlow: false };
  try {
    const rows = await sb('GET', 'access_codes', {
      q: `code=eq.${encodeURIComponent(code)}&select=customer_id`,
    });
    const customerId = rows?.[0]?.customer_id;
    if (!customerId) return empty;

    const custs = await sb('GET', 'customers', {
      q: `id=eq.${customerId}&select=id,name,customer_code,package,duration,special_flow,phone,social_link`,
    });
    const cust = custs?.[0];
    if (!cust) return { ...empty, id: customerId };

    return {
      id: cust.id,
      name: cust.name || null,
      type: 'moi',
      package: cust.package || '30k',
      customerCode: cust.customer_code || null,
      duration: cust.duration || 'perm',
      specialFlow: !!cust.special_flow,
      phone: cust.phone || null,
      socialLink: cust.social_link || null,
    };
  } catch {
    return empty;
  }
}

// Tra tên khách CHỈ qua customers.customer_code (KH-xxxxxxxx) — khác lookupCustomerByCode()
// vốn nhận access_codes.code (VX-xxxxxx) và JOIN qua customer_id. Dùng cho tính năng DNS
// riêng, nơi row chỉ lưu customer_code, không có access_code nào liên quan. Tự nuốt lỗi,
// luôn trả object — không chặn luồng khách/admin.
async function lookupCustomerByDnsCode(customerCode) {
  const empty = { name: null, customerCode: customerCode || null };
  if (!customerCode) return empty;
  try {
    const rows = await sb('GET', 'customers', {
      q: `customer_code=eq.${encodeURIComponent(customerCode)}&select=name`,
    });
    return { name: rows?.[0]?.name || null, customerCode };
  } catch { return empty; }
}

// ─── DNS riêng (link NextDNS cấp riêng từng khách, TTL 10 phút) ─────
// TTL rút từ 2 giờ → 10 phút (2026-08-09). 10 phút khá sát thao tác thật của khách
// (tải mobileconfig → Cài đặt → Đã tải profile → Cài → nhập passcode), nên bù lại
// có nút "Kích hoạt lại" ở tab DNS riêng (dns_reactivate) để hồi sinh chính link cũ
// thêm 10 phút, không phải tạo link mới. HAI THỨ NÀY ĐI KÈM NHAU — đừng rút TTL mà
// bỏ nút kích hoạt lại.
const PRIVATE_DNS_TTL_MS = 10 * 60 * 1000; // 10 phút kể từ first_accessed_at

// Check-lười: gọi từ MỌI nơi có request chạm tới 1 row private_dns_links (khách mở lại
// trang, hoặc admin mở tab danh sách) để bắt "đã quá hạn" mà chưa từng báo Telegram, vì
// không có cron chạy đủ dày để tự phát hiện đúng lúc (cron hiện tại 1 lần/ngày — xem
// sweepExpiredCodes). Dùng đúng pattern PATCH-có-điều-kiện + return=representation như
// expireCodeAndNotify: chỉ request nào thực sự đổi được cột expired_notified_at (từ null)
// mới được gửi tin, chống báo trùng khi nhiều nguồn cùng chạm vào row gần như đồng thời.
// Trả true nếu vừa phát hiện + báo hết hạn trong lần gọi này.
async function checkAndNotifyDnsExpiry(row) {
  if (!row?.id || !row.first_accessed_at || row.expired_notified_at) return false;
  const isExpired = Date.now() - new Date(row.first_accessed_at).getTime() > PRIVATE_DNS_TTL_MS;
  if (!isExpired) return false;
  let patched;
  try {
    patched = await sb('PATCH', 'private_dns_links', {
      q: `id=eq.${encodeURIComponent(row.id)}&expired_notified_at=is.null`,
      body: { expired_notified_at: new Date().toISOString() },
      prefer: 'return=representation',
    });
  } catch { return false; }
  if (!patched?.length) return false; // request khác đã báo trước
  const cust = await lookupCustomerByDnsCode(row.customer_code);
  const who = cust?.name ? escTgHtml(cust.name) : 'Khách';
  await notifyTelegram(
    `⏰ <b>LINK DNS RIÊNG HẾT HẠN (10 PHÚT)</b>\n` +
    `${TG_DIVIDER}\n` +
    `👤 <b>Khách:</b> <b>${who}</b>\n` +
    `🆔 <b>Mã KH:</b> <code>${escTgHtml(row.customer_code)}</code>\n` +
    `<i>Link DNS cá nhân đã tự động khóa sau 10 phút kích hoạt.</i>`
  );
  return true;
}

// Link DNS thật của 1 row private_dns_links. Nguồn duy nhất là nextdns_url.
// Hệ thống DNS động: admin có thể đổi template (NextDNS/AdGuard/ControlD) qua
// tab DNS pool / DNS riêng mà không cần đổi code.
function dnsPrivateUrl(row) {
  return row?.nextdns_url || '';
}

// ─── Danh sách bước của guide (dùng chung guide + admin) ─────────
// Nguồn sự thật duy nhất cho "khách gói này đi qua những bước nào". Trước đây
// admin.html tự hardcode mảng tên bước rồi đoán theo total_steps, nên mỗi lần đổi
// flow (bỏ bước widget, thêm bước mới trong guide_steps) là admin hiện sai tên bước.
// Giờ server dựng danh sách từ chính guide_steps mà khách đang thấy.
// Bước 'widget' đã bỏ khỏi cả 2 gói, bước 'gold' (wizard lên Gold) cũng đã bỏ
// (2026-07-28) — lọc y như guide.html để bản ghi cũ còn sót trong DB không làm
// lệch danh sách. DNS ('choice') là bước cuối của gói 5s/15s/180.
//
// Gói vĩnh viễn: Hai bước cấu hình:
//   'appstore' = cài Shadowrocket bằng tài khoản Appstore chung
//   'ipa'      = cài Locket hạ cấp qua OTA (itms-services + plist sinh động)
// MẢNG NÀY PHẢI KHỚP TỪNG PHẦN TỬ với DEFAULT_STEPS_* trong guide.html — hai bên là
// 2 bản sao chép tay độc lập. Lệch số bước là alignStepFlow trả null và thẻ phiên
// live của admin tụt xuống "Bước n" thay vì tên bước.
//
// Gói vĩnh viễn (2026-08-16): flow mặc định 150/180 KHÔNG có bước 'ipa' — chỉ khách
// được bật special_flow mới đi flow đặc biệt (có IPA). Thứ tự DNS/VPN:
//   - 180 mặc định: DNS trước VPN
//   - 180 đặc biệt: VPN trước DNS (khách đặc biệt cần VPN sẵn trước khi cài IPA)
const DEFAULT_STEP_FLOW = {
  '30k': [
    { type: 'appstore', title: 'Cài Shadowrocket' },
    { type: 'choice',   title: 'Cài đặt DNS giữ Gold' },
    { type: 'gold',     title: 'Lên Locket Gold' },
  ],
  '40k': [
    { type: 'appstore', title: 'Cài Shadowrocket' },
    { type: 'choice',   title: 'Cài đặt DNS giữ Gold' },
    { type: 'vpn',      title: 'Cài đặt VPN (Mỹ)' },
    { type: 'gold',     title: 'Lên Locket Gold' },
  ],
};

// Flow đặc biệt — chỉ dùng khi customers.special_flow=true. PHẢI KHỚP TỪNG PHẦN TỬ
// với DEFAULT_STEPS_150_SPECIAL / DEFAULT_STEPS_180_SPECIAL trong guide.html (2 bản
// sao chép tay thứ 3+4, cùng cảnh báo lệch như bản mặc định ở trên). Bảng guide_steps
// không có cột special_flow nên flow đặc biệt LUÔN dùng fallback này (bỏ qua DB rows).
const DEFAULT_STEP_FLOW_SPECIAL = {
  '30k': [
    { type: 'appstore', title: 'Cài Shadowrocket' },
    { type: 'ipa',      title: 'Cài Locket hạ cấp' },
    { type: 'gold',     title: 'Lên Locket Gold' },
  ],
  '40k': [
    { type: 'appstore', title: 'Cài Shadowrocket' },
    { type: 'ipa',      title: 'Cài Locket hạ cấp' },
    { type: 'vpn',      title: 'Cài đặt VPN (Mỹ)' },
    { type: 'choice',   title: 'Cài đặt DNS giữ Gold' },
    { type: 'gold',     title: 'Lên Locket Gold' },
  ],
};

// Nhãn ngắn để hiện trên thẻ phiên live. Các type có ý nghĩa cố định thì dùng nhãn
// cố định (ngắn, admin quen mắt); type nội dung tự do thì lấy title admin đã đặt.
const STEP_TYPE_LABELS = {
  vpn:      'Cài đặt VPN',
  choice:   'Cài đặt DNS',
  appstore: 'Cài Shadowrocket',
  ipa:      'Cài Locket IPA',
  gold:     'Lên Gold',
};
function stepLabel(step, index) {
  const fixed = STEP_TYPE_LABELS[step?.step_type || step?.type];
  if (fixed) return fixed;
  const t = String(step?.title || '').trim();
  if (t) return t.length > 28 ? t.slice(0, 27) + '…' : t;
  return 'Bước ' + (index + 1);
}

// Dựng flow đầy đủ của 1 gói từ guide_steps (đã sort theo order_num), fallback về
// DEFAULT_STEP_FLOW khi bảng chưa có row nào khớp — khớp đúng hành vi guide.html.
// Khi specialFlow=true: LUÔN dùng DEFAULT_STEP_FLOW_SPECIAL (bỏ qua DB rows) vì bảng
// guide_steps không có cột phân biệt flow đặc biệt, đảm bảo cấu trúc đúng tuyệt đối.
function buildStepFlow(pkg, dbSteps, specialFlow) {
  const p = normalizePackage(pkg);
  if (specialFlow && DEFAULT_STEP_FLOW_SPECIAL[p]) {
    return DEFAULT_STEP_FLOW_SPECIAL[p].map((s, i) => stepLabel(s, i));
  }
  const rows = (dbSteps || [])
    .filter(s => s.package === p || s.package === null || s.package === undefined)
    .filter(s => (s.step_type || s.type) !== 'widget');
  const list = rows.length ? rows : DEFAULT_STEP_FLOW[p];
  return list.map((s, i) => stepLabel(s, i));
}

// Đối chiếu flow đầy đủ với total_steps mà chính phiên đó báo lên.
function alignStepFlow(flow, totalSteps) {
  if (!Array.isArray(flow) || typeof totalSteps !== 'number') return null;
  if (totalSteps === flow.length) return flow;
  return null;
}

// Khối chi tiết dùng chung cho mọi tin nhắn nói về 1 mã truy cập.
function codeDetailLines(code, pkg, cust) {
  const p = normalizePackage(pkg || cust?.package || '30k');
  const pkgEmoji = p === '40k' ? '⚡' : '✨';
  const pkgDisplay = p === '40k' ? '15s Vĩnh viễn' : '5s Vĩnh viễn';
  const lines = [
    TG_DIVIDER,
    `👤 <b>Khách:</b> <b>${escTgHtml(cust?.name || 'Chưa đặt tên')}</b> | <code>${escTgHtml(cust?.customerCode || '—')}</code>`,
    `🔑 <b>Mã:</b> <code>${escTgHtml(code)}</code>`,
    `📦 <b>Gói:</b> ${pkgEmoji} <b>${p}</b> <i>(${pkgDisplay})</i>`,
  ];
  if (cust?.phone) lines.push(`📞 <b>SĐT:</b> <code>${escTgHtml(cust.phone)}</code>`);
  if (cust?.socialLink && cust.socialLink !== '-') lines.push(`🔗 <b>Liên hệ:</b> <i>${escTgHtml(cust.socialLink)}</i>`);
  return lines.join('\n');
}

// Mã hết hiệu lực 30 phút mà khách không bấm hoàn thành: khoá mã và báo Telegram
// ĐÚNG MỘT LẦN. Không cần thêm cột DB để chống báo trùng: PATCH mang luôn điều kiện
// `is_active=eq.true&completed_at=is.null` và đọc số dòng thật sự bị đổi qua
// `return=representation`. Nhiều request cùng lúc (nhiều tab ping, cron chạy chèn)
// thì chỉ request đổi được dòng mới gửi tin, các request sau nhận mảng rỗng và im lặng.
// Trả true nếu vừa khoá + vừa báo trong lần gọi này.
async function expireCodeAndNotify(codeRow) {
  if (!codeRow?.id || codeRow.completed_at || !codeRow.is_active) return false;
  if (!codeRow.expires_at || new Date(codeRow.expires_at) >= new Date()) return false;

  let updated;
  try {
    updated = await sb('PATCH', 'access_codes', {
      q: `id=eq.${encodeURIComponent(codeRow.id)}&is_active=eq.true&completed_at=is.null`,
      body: { is_active: false },
      prefer: 'return=representation',
    });
  } catch { return false; }
  if (!updated?.length) return false;

  const cust = await lookupCustomerByCode(codeRow.code);
  const who = cust.name ? escTgHtml(cust.name) : 'Khách';
  const validLabel = normalizePackage(codeRow.package) === '40k' ? '45 PHÚT' : '30 PHÚT';
  await notifyTelegram(
    `⌛ <b>HẾT HẠN PHIÊN CÀI ĐẶT (${validLabel})</b>\n` +
    `👤 <b>${who}</b> <i>chưa hoàn thành sau ${validLabel.toLowerCase()}</i>\n` +
    codeDetailLines(codeRow.code, codeRow.package, cust)
  );
  return true;
}

// Quét các mã đã hết hạn mà chưa ai kịp phát hiện (khách tắt máy giữa guide nên
// không còn ping nào chạy expireCodeAndNotify). Gọi từ nhánh cron của
// api/admin/stats.js — Vercel Hobby chỉ cho cron 1 lần/ngày nên đây là lưới hứng
// chậm, đường nhanh vẫn là ping/validate.
// CHỈ báo mã hết hạn trong 25 giờ gần nhất: quét không giới hạn thời gian sẽ bung
// một loạt tin về mã cũ tồn từ trước khi có tính năng này.
async function sweepExpiredCodes(limit = 50) {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 25 * 3600 * 1000).toISOString();
    const rows = await sb('GET', 'access_codes', {
      q: `is_active=eq.true&completed_at=is.null` +
         `&expires_at=lt.${encodeURIComponent(now.toISOString())}` +
         `&expires_at=gt.${encodeURIComponent(since)}` +
         `&order=expires_at.asc&limit=${limit}`,
    });
    let sent = 0;
    // Tuần tự, không Promise.all: giữ thứ tự tin nhắn theo thời gian hết hạn và
    // không dội Telegram khi có nhiều mã cùng lúc.
    for (const row of rows || []) if (await expireCodeAndNotify(row)) sent++;
    return sent;
  } catch { return 0; }
}

// ─── Cấu hình dùng chung (app_config) ────────────────────────────
// Bảng app_config chỉ có vài row, mỗi row 1 key + 1 cột jsonb. Cố tình dùng jsonb
// thay vì thêm cột cho từng field: mấy field này (tài khoản Appstore, link IPA, link
// video) là dữ liệu cấu hình thuần, thêm/bớt field không cần migration.
const APPSTORE_DEFAULT = {
  email: '', password: '', ipa_url: '',
};

async function getAppConfig(key) {
  try {
    const rows = await sb('GET', 'app_config', {
      q: `key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
    });
    if (rows?.[0]?.value !== undefined && rows?.[0]?.value !== null) {
      return rows[0].value;
    }
  } catch {}
  return null;
}

async function getAppstoreConfig() {
  // MIGRATE sang Firebase RTDB (2026-08-15): đọc từ Firebase trước, fallback Supabase.
  // Đọc từ primary Firebase (FIREBASE_DB_URL). Nếu thiếu scraper URLs hoặc tài khoản trống,
  // đọc bổ sung từ fallback Firebase (xwuan-access-e9d5e) để đảm bảo 100% đồng bộ giữa frontend & backend.
  try {
    const fbData = await fbGet('appstore');
    const hasValidData = fbData && (fbData.scraper_url || fbData.scraper_url_backup || (fbData.email && !fbData.email.startsWith('appleid.shop')));
    if (hasValidData) return { ...APPSTORE_DEFAULT, ...fbData };

    // Fallback sang database thứ 2 nếu database chính chưa có thông tin scraper
    const altFirebase = 'https://xwuan-access-e9d5e-default-rtdb.firebaseio.com/appstore.json';
    try {
      const altRes = await fetch(`${altFirebase}?_t=${Date.now()}`, { cache: 'no-store' });
      if (altRes.ok) {
        const altData = await altRes.json();
        if (altData && (altData.scraper_url || altData.scraper_url_backup || altData.email)) {
          return { ...APPSTORE_DEFAULT, ...(fbData || {}), ...altData };
        }
      }
    } catch {}

    if (fbData && (fbData.email || fbData.scraper_url || fbData.scraper_url_backup)) return { ...APPSTORE_DEFAULT, ...fbData };
  } catch { /* Firebase lỗi → fallback Supabase */ }
  const v = await getAppConfig('appstore');
  return { ...APPSTORE_DEFAULT, ...(v || {}) };
}

// Link IPA — nguồn duy nhất là field ipa_url trong Firebase node
// 'appstore' ({email, password, ipa_url}). Node 'emergency' đã được xoá hoàn toàn.
// getEmergencyConfig giữ lại như một alias an toàn đọc từ appstore.
const EMERGENCY_DEFAULT = { ipa_url: '' };
async function getEmergencyConfig() {
  try {
    const fbData = await fbGet('appstore');
    if (fbData && fbData.ipa_url) return { ...EMERGENCY_DEFAULT, ipa_url: fbData.ipa_url };
  } catch {}
  return { ...EMERGENCY_DEFAULT };
}

// Ghi (upsert) 1 key vào app_config.
async function setAppConfig(key, fields) {
  const existing = (await getAppConfig(key)) || {};
  const merged = { ...existing, ...fields };

  try {
    await sb('POST', 'app_config', {
      q: 'on_conflict=key',
      body: { key, value: merged },
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
  } catch {}

  return merged;
}

// Che email theo yêu cầu chủ dự án: GIỮ nguyên phần trước @, THAY domain thành
// @xwuan.com. Cố ý làm ngược với dự án tham khảo (nó che phần trước @ và giữ domain
// thật) — ở đây mục tiêu là khách nhìn thấy đúng tài khoản mình đang dùng nhưng
// không đọc được domain thật để tự đăng nhập ngoài luồng.
function maskAppstoreEmail(email) {
  const e = String(email || '').trim();
  if (!e.includes('@')) return e;
  return e.replace(/@.*$/, '@vxang.com');
}

// ─── Mẫu URL DNS Tự Hiểu (DNS Template Engine) ────────────────────
// Cho phép admin tùy chỉnh template (NextDNS, AdGuard, ControlD, v.v.)
// Khi admin nhập mã ngắn (vd: 48f12a), hệ thống tự ghép mã vào {CODE} trong template.
const DEFAULT_DNS_TEMPLATE = 'https://apple.dns.nextdns.io/{CODE}';

async function getDnsTemplate() {
  try {
    const val = await getAppConfig('dns_template');
    if (val && typeof val === 'object' && val.template) return String(val.template).trim();
    if (typeof val === 'string' && val.trim()) return val.trim();
  } catch {}
  return DEFAULT_DNS_TEMPLATE;
}

function resolveDnsWithTemplate(rawInput, template) {
  const raw = String(rawInput || '').trim();
  if (!raw) return '';
  // Nếu đã là URL đầy đủ (có http/https), giữ nguyên
  if (/^https?:\/\//i.test(raw)) return raw;

  // Nếu là mã ngắn (chữ cái, chữ số, gạch ngang, gạch dưới)
  if (/^[A-Za-z0-9_-]{2,50}$/.test(raw)) {
    const tmpl = String(template || DEFAULT_DNS_TEMPLATE).trim();
    if (/\{code\}|\{id\}/i.test(tmpl)) {
      let resolved = tmpl.replace(/\{code\}|\{id\}/gi, raw);
      if (!/^https?:\/\//i.test(resolved)) resolved = 'https://' + resolved;
      return resolved;
    }
    const base = tmpl.replace(/\/+$/, '');
    let resolved = `${base}/${raw}`;
    if (!/^https?:\/\//i.test(resolved)) resolved = 'https://' + resolved;
    return resolved;
  }
  return '';
}

// ─── DNS Riêng 1:1 Cá Nhân Hóa (1 Khách = 1 DNS Riêng Biệt) ────────
// Hệ thống chuyển đổi toàn diện sang DNS riêng 1:1, không còn dùng chung pool.
function dnsPoolKey(pkg) {
  const p = normalizePackage(pkg);
  return p === '40k' ? '15s' : '5s';
}

const DNS_POOL_FULL_MSG = '⛔ DNS đang được cập nhật, nhắn Vxang để được hỗ trợ';

// Khách hàng luôn có DNS riêng, không bao giờ bị nghẽn pool
async function dnsPoolHasCapacity(pkg, customerCode) {
  return true;
}

// Giữ hàm để tương thích các chỗ gọi cũ — không còn pool để giải phóng
async function releaseCustomerFromDnsPool(customerCode) {
  return;
}

// ─── Kiểm tra slot DNS riêng có đang trống / sẵn sàng tái sử dụng không ──────
function isDnsSlotAvailable(r) {
  if (!r || !r.nextdns_url) return false;
  const code = String(r.customer_code || '').trim();
  if (!code) return true;
  const upper = code.toUpperCase();
  return upper === '[AVAILABLE]' ||
         upper.startsWith('[AVAILABLE]') ||
         upper.startsWith('[SẴN SÀNG]') ||
         upper.startsWith('[THU HỒI]') ||
         upper.startsWith('[FREE]') ||
         upper.startsWith('[RECYCLED]');
}

// ─── Tự Động Lấy Hoặc Tạo Mới DNS Riêng 1:1 Cho Khách Hàng ────────
// Bất biến: Mỗi khách hàng chỉ có duy nhất 1 DNS tại mọi thời điểm.
// Ưu tiên tuyệt đối: Tái sử dụng slot trống có sẵn trong kho trước khi tạo mới.
async function getOrCreatePrivateDns(customerCode, packageType, options = {}) {
  const code = String(customerCode || '').trim();
  if (!code) return { ok: false, error: 'Thiếu mã khách hàng' };

  const normPkg = normalizePackage(packageType || '30k');
  const dnsType = (normPkg === '40k' || normPkg === '15s' || normPkg === '180') ? '15s' : '5s';

  // 1. Kiểm tra các slot hiện có của chính khách hàng này (Strict 1:1 Invariant & Prune Duplicates)
  try {
    const privates = await sb('GET', 'private_dns_links', {
      q: `customer_code=eq.${encodeURIComponent(code)}&order=created_at.desc&limit=10`,
    });
    if (privates && privates.length) {
      // Tìm dòng khớp với dnsType yêu cầu
      const matchedIdx = privates.findIndex(r => {
        const p = normalizePackage(r.package || '30k');
        const rDnsType = (p === '40k' || p === '15s' || p === '180') ? '15s' : '5s';
        return rDnsType === dnsType && r.nextdns_url;
      });

      if (matchedIdx !== -1) {
        const matched = privates[matchedIdx];

        // Nếu khách có nhiều hơn 1 dòng (bị trùng lặp từ trước):
        // Giữ lại dòng matched, tự động thu hồi tất cả các dòng thừa còn lại về kho [AVAILABLE]!
        if (privates.length > 1) {
          for (let i = 0; i < privates.length; i++) {
            if (i !== matchedIdx) {
              const extra = privates[i];
              const p = normalizePackage(extra.package || '30k');
              const extraType = (p === '40k' || p === '15s' || p === '180') ? '15s' : '5s';
              await sb('PATCH', 'private_dns_links', {
                q: `id=eq.${encodeURIComponent(extra.id)}`,
                body: {
                  customer_code: '[AVAILABLE]',
                  package: extraType,
                  first_accessed_at: null,
                  expired_notified_at: null,
                  status: 'unopened'
                }
              }).catch(() => {});
            }
          }
        }

        // Reset thời hạn (TTL) để khách vào máy mới cài đặt bình thường
        await sb('PATCH', 'private_dns_links', {
          q: `id=eq.${encodeURIComponent(matched.id)}`,
          body: { first_accessed_at: null, expired_notified_at: null, status: 'unopened' }
        }).catch(() => {});

        return {
          ok: true,
          dns_url: matched.nextdns_url,
          token: matched.token,
          email: matched.nextdns_email || '',
          password: matched.nextdns_password || '',
          package: matched.package || normPkg,
          row: matched,
          is_private: true,
        };
      } else {
        // Khách đã có slot nhưng KHÁC nhóm gói (ví dụ khách đang có 5s nhưng yêu cầu 15s, hoặc ngược lại):
        // Tự động thu hồi slot cũ đó về kho [AVAILABLE] để nhường cho khách khác!
        for (const oldRow of privates) {
          const p = normalizePackage(oldRow.package || '30k');
          const oldType = (p === '40k' || p === '15s' || p === '180') ? '15s' : '5s';
          await sb('PATCH', 'private_dns_links', {
            q: `id=eq.${encodeURIComponent(oldRow.id)}`,
            body: {
              customer_code: '[AVAILABLE]',
              package: oldType,
              first_accessed_at: null,
              expired_notified_at: null,
              status: 'unopened'
            }
          }).catch(() => {});
        }
      }
    }
  } catch (e) {
    console.warn('[getOrCreatePrivateDns] Lỗi truy vấn private_dns_links:', e.message);
  }

  // 2. Nếu khách đổi máy mua lại từ đầu: kiểm tra mã khách cũ (options.existingCustCode)
  if (options.existingCustCode) {
    try {
      const oldDns = await sb('GET', 'private_dns_links', {
        q: `customer_code=eq.${encodeURIComponent(options.existingCustCode)}&order=created_at.desc&limit=1`,
      });
      if (oldDns && oldDns.length && oldDns[0].nextdns_url) {
        const oldRow = oldDns[0];
        const oldPkg = normalizePackage(oldRow.package || '30k');
        const oldDnsType = (oldPkg === '40k' || oldPkg === '15s' || oldPkg === '180') ? '15s' : '5s';
        if (oldDnsType === dnsType) {
          // Gán tài khoản NextDNS cũ này sang mã khách hàng mới (vẫn dùng tài khoản DNS cũ)
          await sb('PATCH', 'private_dns_links', {
            q: `id=eq.${encodeURIComponent(oldRow.id)}`,
            body: {
              customer_code: code,
              first_accessed_at: null,
              expired_notified_at: null,
              status: 'unopened'
            }
          }).catch(() => {});

          return {
            ok: true,
            dns_url: oldRow.nextdns_url,
            token: oldRow.token,
            email: oldRow.nextdns_email || '',
            password: oldRow.nextdns_password || '',
            package: oldRow.package || normPkg,
            row: oldRow,
            is_private: true,
          };
        }
      }
    } catch (e) {
      console.warn('[getOrCreatePrivateDns] Lỗi tái sử dụng DNS khách cũ:', e.message);
    }
  }

  // 3. TÁI SỬ DỤNG SLOT TRỐNG TRONG KHO (100% ƯU TIÊN):
  // Truy vấn danh sách slot hiện có để tìm slot [AVAILABLE] / [SẴN SÀNG] / [THU HỒI] / rỗng khớp dnsType
  try {
    const slots = await sb('GET', 'private_dns_links', {
      q: 'order=created_at.desc&limit=100'
    });
    if (slots && slots.length) {
      const available = slots.find(r => {
        if (!isDnsSlotAvailable(r)) return false;
        const p = normalizePackage(r.package || '30k');
        const rDnsType = (p === '40k' || p === '15s' || p === '180') ? '15s' : '5s';
        return rDnsType === dnsType && r.nextdns_url;
      });

      if (available) {
        // Gán ngay slot 1:1 này cho khách mới (không cần gọi API NextDNS đăng ký tài khoản mới)
        await sb('PATCH', 'private_dns_links', {
          q: `id=eq.${encodeURIComponent(available.id)}`,
          body: {
            customer_code: code,
            package: normPkg,
            first_accessed_at: null,
            expired_notified_at: null,
            status: 'unopened'
          }
        });

        return {
          ok: true,
          dns_url: available.nextdns_url,
          token: available.token,
          email: available.nextdns_email || '',
          password: available.nextdns_password || '',
          package: normPkg,
          row: available,
          is_private: true,
        };
      }
    }
  } catch (e) {
    console.warn('[getOrCreatePrivateDns] Lỗi tìm slot trống trong kho:', e.message);
  }

  // 4. Nếu không có slot trống sẵn, gọi NextDNS Automation Helper đăng ký tài khoản mới ngay lúc này
  try {
    const nextAccount = await createNextDnsAccountHelper({
      type: dnsType,
      initialUsed: true,
    });
    const token = genCode('DNS', 8);
    const newRow = {
      token,
      customer_code: code,
      nextdns_url: nextAccount.dns_url,
      dashboard_key: '',
      nextdns_email: nextAccount.email,
      nextdns_password: nextAccount.password,
      package: normPkg,
      status: 'unopened',
    };

    await sb('POST', 'private_dns_links', {
      body: newRow,
      prefer: 'return=minimal',
    });

    return {
      ok: true,
      dns_url: nextAccount.dns_url,
      token,
      email: nextAccount.email,
      password: nextAccount.password,
      package: normPkg,
      row: newRow,
      is_private: true,
    };
  } catch (err) {
    console.error('[getOrCreatePrivateDns] Lỗi tạo tài khoản NextDNS:', err.message);
    // Fallback nếu API NextDNS tạm thời bị gián đoạn: sinh URL theo template
    const activeTemplate = await getDnsTemplate();
    const fallbackUrl = resolveDnsWithTemplate(code.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8), activeTemplate) || `https://apple.dns.nextdns.io/${code.toLowerCase()}`;
    const token = genCode('DNS', 8);
    const fallbackRow = {
      token,
      customer_code: code,
      nextdns_url: fallbackUrl,
      dashboard_key: '',
      nextdns_email: '',
      nextdns_password: '',
      package: normPkg,
      status: 'unopened',
    };
    try {
      await sb('POST', 'private_dns_links', {
        body: fallbackRow,
        prefer: 'return=minimal',
      });
    } catch {}
    return {
      ok: true,
      dns_url: fallbackUrl,
      token,
      email: '',
      password: '',
      package: normPkg,
      row: fallbackRow,
      is_private: true,
    };
  }
}

// ─── Thu Hồi Slot DNS Riêng Về Kho [AVAILABLE] (Sẵn Sàng Cấp Cho Khách Mới) ───
// Khi khách đổi gói, xóa khách hoặc admin thu hồi, slot được ngắt hoàn toàn khỏi mã khách
async function recyclePrivateDnsSlot(customerCode, packageToRecycle = null) {
  const code = String(customerCode || '').trim();
  if (!code) return;
  try {
    const privates = await sb('GET', 'private_dns_links', {
      q: `customer_code=eq.${encodeURIComponent(code)}&order=created_at.desc&limit=10`
    });
    if (!privates || !privates.length) return;

    for (const row of privates) {
      const p = normalizePackage(row.package || '30k');
      const dnsType = (p === '40k' || p === '15s' || p === '180') ? '15s' : '5s';
      if (!packageToRecycle || dnsType === packageToRecycle) {
        await sb('PATCH', 'private_dns_links', {
          q: `id=eq.${encodeURIComponent(row.id)}`,
          body: {
            customer_code: '[AVAILABLE]',
            package: dnsType,
            first_accessed_at: null,
            expired_notified_at: null,
            status: 'unopened'
          }
        });
      }
    }
  } catch (e) {
    console.warn('[recyclePrivateDnsSlot] Lỗi thu hồi slot DNS:', e.message);
  }
}

// Wrapper chuyển tiếp để tương thích với action dns_pool_claim ở guide.html
async function claimDnsFromPool(pkg, customerCode) {
  const code = String(customerCode || '').trim();
  const res = await getOrCreatePrivateDns(code, pkg);
  if (!res.ok) return { ok: false, reason: res.error || 'error' };
  return { ok: true, dns_url: res.dns_url, used: 1, max: 1, is_private: true, customer_code: code };
}

// Phân giải ô nhập liên hệ duy nhất (SĐT hoặc Link Profile)
function parseContactInput(input) {
  const str = String(input || '').trim();
  if (!str) return { phone: '', social_link: '', social_platform: 'zalo' };

  if (/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(str) || /facebook\.com|fb\.com|zalo\.me|t\.me|tiktok\.com|instagram\.com|\//i.test(str)) {
    let platform = 'zalo';
    if (/facebook\.com|fb\.com/i.test(str)) platform = 'facebook';
    else if (/t\.me|telegram/i.test(str)) platform = 'other';
    else if (/tiktok\.com/i.test(str)) platform = 'tiktok';
    else if (/instagram\.com/i.test(str)) platform = 'instagram';
    else if (/zalo\.me/i.test(str)) platform = 'zalo';

    let link = str;
    if (!/^https?:\/\//i.test(link)) link = 'https://' + link;

    const phoneMatch = str.match(/zalo\.me\/(0[0-9]{9}|\+84[0-9]{9})/);
    const phone = phoneMatch ? phoneMatch[1].replace(/^\+84/, '0') : '';
    return { phone, social_link: link, social_platform: platform };
  }

  const cleanDigits = str.replace(/[^0-9+]/g, '');
  if (cleanDigits.length >= 8) {
    const standardPhone = cleanDigits.replace(/^\+84/, '0');
    return {
      phone: standardPhone,
      social_link: `https://zalo.me/${standardPhone}`,
      social_platform: 'zalo'
    };
  }

  return { phone: '', social_link: str, social_platform: 'zalo' };
}

// ─── NextDNS Automation Helpers ──────────────────────────────
const DENYLISTS_NEXTDNS = {
  '5s': [
    'revenuecat.com',
    'api.revenuecat.com'
  ],
  '15s': [
    'api.revenuecat.com',
    'revenuecat.com',
    'firebaseremoteconfig.googleapis.com',
    'firebaseappcheck.googleapis.com'
  ]
};

function genNextDnsPassword() {
  const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const charsLower = 'abcdefghijkmnpqrstuvwxyz';
  const charsDigits = '23456789';
  const charsSymbols = '!@#$%^&*';
  
  let pwd = '';
  pwd += charsUpper[Math.floor(Math.random() * charsUpper.length)];
  pwd += charsLower[Math.floor(Math.random() * charsLower.length)];
  pwd += charsDigits[Math.floor(Math.random() * charsDigits.length)];
  pwd += charsSymbols[Math.floor(Math.random() * charsSymbols.length)];
  
  const allChars = charsUpper + charsLower + charsDigits + charsSymbols;
  for (let i = 0; i < 10; i++) {
    pwd += allChars[Math.floor(Math.random() * allChars.length)];
  }
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

async function getTempEmailHelper() {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const domainsRes = await fetch('https://api.mail.tm/domains', { signal: ctl.signal });
    clearTimeout(timer);
    
    if (domainsRes.ok) {
      const domains = await domainsRes.json();
      const domainList = domains['hydra:member'] || [];
      if (domainList.length > 0) {
        const domain = domainList[0].domain;
        const username = 'vx_' + randomBytes(4).toString('hex');
        const email = `${username}@${domain}`;
        const pwd = genNextDnsPassword();
        
        const regRes = await fetch('https://api.mail.tm/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: email, password: pwd })
        });
        
        if (regRes.ok || regRes.status === 201) {
          return email;
        }
      }
    }
  } catch (err) {
    // Fallback nếu mail.tm chậm hoặc lỗi mạng
  }
  
  const randomStr = randomBytes(4).toString('hex');
  return `vxang_dns_${randomStr}@uberip.com`;
}

async function createNextDnsAccountHelper({ type = '5s', customEmail = null, initialUsed = false } = {}) {
  const normType = (type === '15s' || type === '40k') ? '15s' : '5s';
  const denylist = DENYLISTS_NEXTDNS[normType] || DENYLISTS_NEXTDNS['5s'];
  
  let email = customEmail ? String(customEmail).trim() : '';
  if (!email) {
    email = await getTempEmailHelper();
  }
  
  const password = genNextDnsPassword();
  
  // 1. Đăng ký tài khoản NextDNS
  const signupRes = await fetch('https://api.nextdns.io/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://my.nextdns.io',
      'Referer': 'https://my.nextdns.io/signup'
    },
    body: JSON.stringify({
      email,
      password,
      profile: {
        name: `Locket_${normType.toUpperCase()}`,
        security: { threatIntelligenceFeeds: true, googleSafeBrowsing: true, cryptojacking: true, idnHomographs: true, typosquatting: true, dga: true, csam: true },
        privacy: { blocklists: [{ id: 'nextdns-recommended' }], disguisedTrackers: true },
        settings: { logs: { enabled: true }, performance: { ecs: true } }
      }
    })
  });
  
  if (!signupRes.ok) {
    const errText = await signupRes.text().catch(() => '');
    throw new Error(`Đăng ký NextDNS thất bại (${signupRes.status}): ${errText}`);
  }
  
  const setCookie = signupRes.headers.get('set-cookie');
  const sid = setCookie ? setCookie.split(';')[0] : '';
  if (!sid) throw new Error('Không nhận được session cookie từ NextDNS');
  
  // 2. Lấy Profile ID
  const meRes = await fetch('https://api.nextdns.io/accounts/@me?withProfiles=true', {
    headers: { 'Cookie': sid, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Origin': 'https://my.nextdns.io' }
  });
  if (!meRes.ok) throw new Error(`Không lấy được profile (${meRes.status})`);
  
  const meData = await meRes.json();
  const profile = meData?.profiles?.[0];
  if (!profile || !profile.id) throw new Error('Không tìm thấy Profile ID trong tài khoản vừa tạo');
  
  const profileId = profile.id;
  const dnsUrl = `https://apple.dns.nextdns.io/${profileId}`;
  
  // 3. Đẩy Denylist
  const blockedDomains = [];
  for (const domain of denylist) {
    try {
      const dRes = await fetch(`https://api.nextdns.io/profiles/${profileId}/denylist`, {
        method: 'POST',
        headers: { 'Cookie': sid, 'Content-Type': 'application/json', 'Origin': 'https://my.nextdns.io' },
        body: JSON.stringify({ id: domain, active: true })
      });
      if (dRes.ok || dRes.status === 204) blockedDomains.push(domain);
    } catch {}
  }
  
  // 4. Lưu vào Supabase bảng nextdns_accounts
  const now = new Date();
  const accountRow = {
    id: profileId,
    package: normType,
    email,
    password,
    dns_url: dnsUrl,
    denylist: blockedDomains,
    is_used: !!initialUsed,
    used_at: initialUsed ? now.toISOString() : null,
    created_at: now.toISOString()
  };
  
  await sb('POST', 'nextdns_accounts', {
    body: accountRow,
    prefer: 'return=representation'
  });
  
  return accountRow;
}

async function deleteNextDnsAccountHelper({ email, password } = {}) {
  const em = String(email || '').trim();
  const pwd = String(password || '').trim();
  if (!em || !pwd) {
    return { ok: false, error: 'Thiếu email hoặc mật khẩu NextDNS' };
  }

  try {
    // 1. Đăng nhập NextDNS để lấy session cookie
    const loginRes = await fetch('https://api.nextdns.io/accounts/@login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://my.nextdns.io',
        'Referer': 'https://my.nextdns.io/login'
      },
      body: JSON.stringify({ email: em, password: pwd })
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text().catch(() => '');
      console.warn(`[deleteNextDnsAccountHelper] Login NextDNS thất bại (${loginRes.status}):`, errText);
      return { ok: false, status: loginRes.status, error: errText };
    }

    const setCookie = loginRes.headers.get('set-cookie');
    const sid = setCookie ? setCookie.split(';')[0] : '';
    if (!sid) {
      console.warn('[deleteNextDnsAccountHelper] Không nhận được session cookie từ NextDNS');
      return { ok: false, error: 'Không nhận được session cookie' };
    }

    // 2. Gọi DELETE /accounts/@me để xóa vĩnh viễn toàn bộ tài khoản & profile trên NextDNS
    const delRes = await fetch('https://api.nextdns.io/accounts/@me', {
      method: 'DELETE',
      headers: {
        'Cookie': sid,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://my.nextdns.io'
      },
      body: JSON.stringify({ password: pwd })
    });

    if (!delRes.ok && delRes.status !== 404) {
      const delText = await delRes.text().catch(() => '');
      console.warn(`[deleteNextDnsAccountHelper] Xóa tài khoản NextDNS thất bại (${delRes.status}):`, delText);
      return { ok: false, status: delRes.status, error: delText };
    }

    return { ok: true };
  } catch (err) {
    console.warn('[deleteNextDnsAccountHelper] Ngoại lệ khi xóa NextDNS:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sb, signJWT, verifyJWT, getToken, requireAdmin, requireGuide, allowMethods, genCode, PACKAGES, PACKAGE_KEYS, normalizePackage, isPermPackage, PRICING, getPrice, getPriceLabel, durationMonths, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, expireCodeAndNotify, sweepExpiredCodes, DEFAULT_STEP_FLOW, DEFAULT_STEP_FLOW_SPECIAL, STEP_TYPE_LABELS, stepLabel, buildStepFlow, alignStepFlow, lookupCustomerByDnsCode, checkAndNotifyDnsExpiry, PRIVATE_DNS_TTL_MS, dnsPrivateUrl, getAppConfig, setAppConfig, getAppstoreConfig, getEmergencyConfig, maskAppstoreEmail, dnsPoolKey, claimDnsFromPool, releaseCustomerFromDnsPool, dnsPoolHasCapacity, DNS_POOL_FULL_MSG, DEFAULT_DNS_TEMPLATE, getDnsTemplate, resolveDnsWithTemplate, fbGet, fbPut, parseContactInput, TG_CHAT_IDS, TG_CHAT_ID, isTgAdmin, genVpnToken, createVpnToken, TG_DIVIDER, DENYLISTS_NEXTDNS, createNextDnsAccountHelper, deleteNextDnsAccountHelper, getOrCreatePrivateDns, recyclePrivateDnsSlot, isDnsSlotAvailable };
