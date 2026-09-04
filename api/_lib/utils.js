'use strict';
// ─── Env vars (set in Vercel Dashboard, never in browser) ───
const SB_URL  = process.env.SUPABASE_URL || 'https://ogchtngdbywmayeluebh.supabase.co';
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY || Buffer.from('c2Jfc2VjcmV0X3VVUTNTMFlOMkIwQTJGNzdyNmNGU3dfdG1Mc2dES2I=', 'base64').toString('utf8');
const JWT_SEC = process.env.JWT_SECRET || 'locket-secret-jwt-key-2026';
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
async function sb(method, table, { body, q = '', prefer } = {}) {
  const h = {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
  };
  if (prefer) h.Prefer = prefer;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}${q ? '?' + q : ''}`, {
      method,
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
    if (r.status === 204) return null;
    return r.json().catch(() => null);
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error(`Supabase timeout: ${method} ${table}`);
    }
    throw e;
  }
}

// ─── JWT (HMAC-SHA256, Node crypto) ──────────────────────────
const { createHmac } = require('crypto');
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
  const expected = createHmac('sha256', JWT_SEC).update(`${h}.${b}`).digest('base64url');
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// ─── HTTP helpers ────────────────────────────────────────────
function getToken(req) {
  const a = req.headers.authorization || '';
  if (a.startsWith('Bearer ')) return a.slice(7);
  // Fallback: query param ?t=<jwt>. CHỈ dùng cho request mà client KHÔNG THỂ set
  // header (ví dụ iOS mở itms-services://?...&url=<manifest> — hệ điều hành tự GET
  // thẳng URL đó, không có cách nào gắn Authorization). Không ảnh hưởng các endpoint
  // khác vì luôn ưu tiên header trước, query param chỉ là lối thoát hiếm khi cần.
  const t = req.query?.t;
  return typeof t === 'string' && t ? t : null;
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
const TG_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TG_CHAT_ID   = (process.env.TELEGRAM_CHAT_ID || '').trim();
async function notifyTelegram(text, extra = {}) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return false; // chưa cấu hình — im lặng bỏ qua
  try {
    const bodyPayload = { chat_id: TG_CHAT_ID, text, parse_mode: 'HTML', ...extra };
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
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML', ...restExtra }),
      });
      if (r.ok) return true;
    }

    // Retry 2: Lỗi parse HTML -> gỡ thẻ HTML và gửi plain text
    const plainText = text.replace(/<[^>]+>/g, '');
    r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: plainText }),
    });
    return r.ok;
  } catch { return false; }
}

// parse_mode 'HTML' coi <, >, & là ký tự đặc biệt — tên khách do admin nhập tự do
// nên phải escape trước khi nhét vào tin nhắn, giống nguyên tắc esc() trước khi
// nhét vào template HTML ở admin.html.
function escTgHtml(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Lấy id + tên + loại khách + mã KH + username Locket + duration từ mã truy cập, để thông
// báo Telegram gọi được tên khách, cho admin tra cứu tiếp bằng mã KH, luôn kèm username
// copy được, và hiển thị đúng giá theo thời hạn (duration).
// Trả { id, name, type, customerCode, locketUsername, duration } — luôn trả object, mọi lỗi
// bị nuốt (thiếu tên vẫn phải gửi được thông báo, không được chặn luồng khách hàng).
async function lookupCustomerByCode(code) {
  const empty = { id: null, name: null, type: 'moi', customerCode: null, locketUsername: null, duration: 'perm', package: '30k', specialFlow: false };
  try {
    const rows = await sb('GET', 'access_codes', {
      q: `code=eq.${encodeURIComponent(code)}&select=customer_id`,
    });
    const customerId = rows?.[0]?.customer_id;
    if (!customerId) return empty;

    const custs = await sb('GET', 'customers', {
      q: `id=eq.${customerId}&select=id,name,customer_code,package,locket_username,duration,special_flow`,
    });
    const cust = custs?.[0];
    if (!cust) return { ...empty, id: customerId };

    return {
      id: cust.id,
      name: cust.name || null,
      type: 'moi',
      package: cust.package || '30k',
      customerCode: cust.customer_code || null,
      locketUsername: cust.locket_username || null,
      duration: cust.duration || 'perm',
      specialFlow: !!cust.special_flow,
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
    `⌛ Link DNS riêng của <b>${who}</b> đã hết hạn (10 phút)\n` +
    `🆔 Mã KH: <code>${escTgHtml(row.customer_code)}</code>`
  );
  return true;
}

// Link DNS thật của 1 row private_dns_links. Chuyển sang NextDNS (2026-08-09) nhưng
// CỐ TÌNH không drop cột ublockdns_url: link cũ đang còn hạn trong tay khách vẫn phải
// dùng được. Row mới ghi nextdns_url, row cũ chỉ có ublockdns_url → đọc theo thứ tự này.
function dnsPrivateUrl(row) {
  return row?.nextdns_url || row?.ublockdns_url || '';
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
// Gói vĩnh viễn (2026-08-09): '150'/'180' KHÔNG có bước username — khách tự cài IPA
// hạ cấp nên không cần tác động server Locket. Hai bước mới:
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
  username: 'Nhập Username',
  vpn:      'Cài đặt VPN',
  choice:   'Cài đặt DNS',
  appstore: 'Cài Shadowrocket',
  ipa:      'Cài Locket IPA',
  gold:     'Lên Gold',
};
function stepLabel(step, index) {
  const fixed = STEP_TYPE_LABELS[step?.type];
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
    .filter(s => s.type !== 'widget');
  const list = rows.length ? rows : DEFAULT_STEP_FLOW[p];
  return list.map((s, i) => stepLabel(s, i));
}

// Đối chiếu flow đầy đủ với total_steps mà chính phiên đó báo lên.
// Vì sao dùng total_steps chứ không dùng "khách đã có locket_username":
// khách vừa nhập username xong là ping lưu ngay locket_username, nhưng phiên ĐANG
// CHẠY vẫn còn bước username trong danh sách → suy từ locket_username sẽ cắt nhãn
// đầu và làm lệch toàn bộ tên bước ngay giữa lúc khách đang làm. total_steps là số
// bước thật của phiên đó, không đổi giữa phiên.
// Trả null khi không khớp (admin tự thêm/bớt bước trong DB giữa lúc khách đang làm)
// để client fallback về "Bước n" thay vì hiện tên sai.
function alignStepFlow(flow, totalSteps) {
  if (!Array.isArray(flow) || typeof totalSteps !== 'number') return null;
  if (totalSteps === flow.length) return flow;
  // Khách bảo hành đã có username sẵn → guide lọc bỏ bước đầu, phiên còn ít hơn 1 bước.
  if (totalSteps === flow.length - 1 && flow[0] === STEP_TYPE_LABELS.username) return flow.slice(1);
  return null;
}

// Khối chi tiết dùng chung cho mọi tin nhắn nói về 1 mã truy cập. Cố tình dùng cùng
// bố cục (dải phân cách + emoji + <code>) với phần tra cứu của bot trong
// telegram-bot.js để chủ dự án đọc quen mắt; mã KH để trong <code> cho bấm-copy
// nhanh rồi gõ lại vào bot khi cần xem chi tiết.
// Emoji theo gói: gói vĩnh viễn dùng 💎 để phân biệt ngay trên Telegram, khỏi phải
// nhớ '150'/'180' là tiền hay là số giây.
// Dòng "Gói" hiển thị label thời hạn cụ thể (ví dụ "6 tháng - 50k") thay vì giá
// phẳng cũ — lấy từ PRICING theo duration của khách. Gói vĩnh viễn thêm tag "· vĩnh viễn".

function codeDetailLines(code, pkg, cust) {
  const p = normalizePackage(pkg);
  const uname = cust?.locketUsername;
  const duration = cust?.duration || null;
  const priceLbl = duration ? getPriceLabel(p, duration) : null;
  const permTag = isPermPackage(p) ? ' · vĩnh viễn' : '';
  // Fallback: nếu không có duration hoặc PRICING không khớp, hiện tên gói đơn thuần.
  const pkgDisplay = priceLbl && priceLbl !== '—' ? priceLbl : (PACKAGES[p]?.label || p);
  const lines = [
    '━━━━━━━━━━━━━━━',
    `🆔 Mã KH: <code>${escTgHtml(cust?.customerCode || '—')}</code>`,
    `🔑 Mã truy cập: <code>${escTgHtml(code)}</code>`,
  ];
  // Gói vĩnh viễn không đi qua bước Username → không hiện dòng rỗng gây tưởng lỗi.
  if (!isPermPackage(p)) {
    lines.push(`👤 Username: ${uname ? `<code>${escTgHtml(uname)}</code>` : '(chưa có)'}`);
  }
  lines.push(`${PKG_EMOJI[p] || '⭐'} Gói: <b>${escTgHtml(pkgDisplay)}</b>${permTag}`);
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
  await notifyTelegram(
    `⌛ <b>${who}</b> hết hạn mã mà chưa bấm hoàn thành\n` +
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
  // 1. Thu doc tu app_config (neu co table)
  try {
    const rows = await sb('GET', 'app_config', {
      q: `key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
    });
    if (rows?.[0]?.value !== undefined && rows?.[0]?.value !== null) {
      return rows[0].value;
    }
  } catch {}

  // 2. Fallback sang tokens table (luon san sang trong Supabase)
  try {
    const rows = await sb('GET', 'tokens', {
      q: `device_id=eq.CONFIG:${encodeURIComponent(key)}&limit=1`,
    });
    if (rows?.[0]?.app_transaction) {
      return JSON.parse(rows[0].app_transaction);
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

// Ghi (upsert) 1 key vào app_config & fallback tokens table.
async function setAppConfig(key, fields) {
  const existing = (await getAppConfig(key)) || {};
  const merged = { ...existing, ...fields };

  // 1. Thu ghi app_config neu table ton tai
  try {
    await sb('POST', 'app_config', {
      q: 'on_conflict=key',
      body: { key, value: merged },
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
  } catch {}

  // 2. Ghi vao tokens table dam bao 100% persist ke ca khi thieu app_config
  try {
    const tokenRows = await sb('GET', 'tokens', {
      q: `device_id=eq.CONFIG:${encodeURIComponent(key)}&limit=1`,
    }).catch(() => []);

    if (tokenRows && tokenRows.length > 0) {
      await sb('PATCH', 'tokens', {
        q: `device_id=eq.CONFIG:${encodeURIComponent(key)}`,
        body: {
          app_transaction: JSON.stringify(merged),
          nonce: String(merged.active ?? ''),
        },
      });
    } else {
      await sb('POST', 'tokens', {
        body: {
          fetch_token: 'CONFIG_' + key.toUpperCase(),
          device_id: 'CONFIG:' + key,
          nonce: String(merged.active ?? ''),
          app_transaction: JSON.stringify(merged),
        },
      });
    }
  } catch (err) {
    console.warn('[setAppConfig tokens fallback warning]:', err.message);
  }

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

// ─── Pool DNS NextDNS luân phiên ─────────────────────────────────
// Mỗi link DNS chỉ phục vụ tối đa max_uses (5) MÃ KHÁCH khác nhau, rồi phải tạo link
// mới. Đếm theo mã khách (used_codes text[]) chứ không phải số lần bấm: khách cài lại
// 3 lần vẫn chỉ tính 1 suất.
// Gói '180' DÙNG CHUNG pool với '15s' (chốt với chủ dự án) → counter tính gộp cả hai.
// Gói '150' không có bước DNS nên không bao giờ gọi tới đây.
function dnsPoolKey(pkg) {
  const p = normalizePackage(pkg);
  return p === '40k' ? '15s' : '5s';
}

const DNS_POOL_FULL_MSG = '⛔ DNS đang được cập nhật, nhắn Vxang để được hỗ trợ';

// Kiểm tra pool DNS của 1 nhóm gói còn chỗ trống hay không. Dùng trước khi tạo khách
// mới hoặc sinh mã mới — nếu pool đầy thì chặn sớm, tránh tạo khách xong rồi mới phát
// hiện khách không vào được guide vì không có DNS slot.
// Cache ngắn trong-memory (5s) để admin thao tác nhanh nhiều lần không spam query.
// Vercel serverless function giữ ấm instance trong vài phút nên cache này có tác dụng.
const _dnsCapCache = new Map();
const DNS_CAP_CACHE_MS = 5000;
async function dnsPoolHasCapacity(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  const code = String(customerCode || '').trim();

  // Nếu là kiểm tra chung (tạo khách mới không có customerCode), dùng cache 5s
  if (!code) {
    const cached = _dnsCapCache.get(key);
    if (cached && Date.now() - cached.ts < DNS_CAP_CACHE_MS) return cached.ok;
  }

  try {
    // 1. Nếu có customerCode, kiểm tra xem khách có link DNS riêng không
    if (code) {
      const privates = await sb('GET', 'private_dns_links', {
        q: `customer_code=eq.${encodeURIComponent(code)}&select=id&limit=1`,
      });
      if (privates && privates.length) return true;
    }

    // 2. Fetch các link DNS pool active
    const rows = await sb('GET', 'dns_pool', {
      q: `package=eq.${encodeURIComponent(key)}&is_active=eq.true&select=used_codes,max_uses`,
    });
    if (!rows || !rows.length) return false;

    // 3. Nếu khách đã có slot trong bất kỳ link active nào (kể cả link đã 5/5) -> cho phép tái sử dụng
    if (code && rows.some(r => Array.isArray(r.used_codes) && r.used_codes.includes(code))) {
      return true;
    }

    // 4. Nếu là khách mới hoặc chưa có slot -> kiểm tra có link nào còn chỗ (used < max)
    const hasSlot = rows.some(r => {
      const used = Array.isArray(r.used_codes) ? r.used_codes.length : 0;
      const max = r.max_uses || 5;
      return used < max;
    });

    if (!code) {
      _dnsCapCache.set(key, { ok: hasSlot, ts: Date.now() });
    }
    return hasSlot;
  } catch {
    // Lỗi DB → giả sử còn chỗ để không block oan; claimDnsFromPool sẽ trả 503 thật nếu hết.
    return true;
  }
}

// Lấy link DNS đang hoạt động của 1 nhóm gói + ghi nhận mã khách vào suất.
// Tự động luân chuyển sang link tiếp theo trong pool khi link trước đó đã đủ max_uses (5 khách).
// Trả { ok:true, dns_url, used, max } hoặc { ok:false, reason:'empty'|'full' }.
//
// Vì sao không dùng cột used_count + phép cộng: hai request của cùng 1 khách (mở 2 tab,
// bấm lại) sẽ cộng 2 lần và đốt oan suất. Mảng used_codes cho phép idempotent theo mã.
// Race: dùng PATCH có điều kiện `used_codes=not.cs.{mã}` + return=representation — chỉ
// request nào THỰC SỰ đổi được row mới coi là chiếm suất, request thua đọc lại row.

// Giả phóng slot của khách khỏi tất cả các DNS pool hiện tại (khi chuyển gói hoặc tạo DNS riêng)
async function releaseCustomerFromDnsPool(customerCode) {
  if (!customerCode) return;
  try {
    const code = String(customerCode).trim();
    const rows = await sb('GET', 'dns_pool', {
      q: `used_codes=cs.%7B%22${encodeURIComponent(code)}%22%7D`,
    });
    if (!rows || !rows.length) return;
    
    for (const row of rows) {
      if (!Array.isArray(row.used_codes)) continue;
      const next = row.used_codes.filter(c => c !== code);
      await sb('PATCH', 'dns_pool', {
        q: `id=eq.${row.id}`,
        body: { used_codes: next }
      });
    }
  } catch (e) {
    console.error('Lỗi khi releaseCustomerFromDnsPool:', e.message);
  }
}

async function claimDnsFromPool(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  const code = String(customerCode || '').trim();

  // Chạy song song cả query private dns và pool dns
  let privatesPromise = Promise.resolve(null);
  if (code) {
    privatesPromise = sb('GET', 'private_dns_links', {
      q: `customer_code=eq.${encodeURIComponent(code)}&order=created_at.desc&limit=1`,
    }).catch(e => {
      console.warn('Lỗi tra private_dns_links trong claimDnsFromPool:', e.message);
      return null;
    });
  }

  const poolPromise = sb('GET', 'dns_pool', {
    q: `package=eq.${encodeURIComponent(key)}&is_active=eq.true&order=created_at.asc`,
  }).catch(() => null);

  const [privates, rows] = await Promise.all([privatesPromise, poolPromise]);

  // 0. Ưu tiên hàng đầu: Nếu khách này đã có link DNS riêng trong private_dns_links,
  // cấp chính link DNS riêng đó cho khách (không đụng vào dns_pool, không chiếm slot chung).
  if (privates && privates.length) {
    const privUrl = dnsPrivateUrl(privates[0]);
    if (privUrl) {
      return { ok: true, dns_url: privUrl, used: 1, max: 1, is_private: true };
    }
  }

  if (!rows || !rows.length) return { ok: false, reason: 'empty' };

  // 1. Mã này đã chiếm suất ở một link active trước đó → cho qua, dùng lại đúng link cũ (idempotent).
  if (code) {
    const existing = rows.find(r => Array.isArray(r.used_codes) && r.used_codes.includes(code));
    if (existing) {
      const used = Array.isArray(existing.used_codes) ? existing.used_codes : [];
      const max = existing.max_uses || 5;
      return { ok: true, dns_url: existing.dns_url, used: used.length, max, reused: true };
    }
  }

  // 2. Tìm link đầu tiên còn chỗ trống (used < max)
  const targetRow = rows.find(r => {
    const used = Array.isArray(r.used_codes) ? r.used_codes : [];
    const max = r.max_uses || 5;
    return used.length < max;
  });

  // Nếu tất cả các link active đều đã đầy
  if (!targetRow) {
    return { ok: false, reason: 'full' };
  }

  const used = Array.isArray(targetRow.used_codes) ? targetRow.used_codes : [];
  const max = targetRow.max_uses || 5;

  if (!code) return { ok: true, dns_url: targetRow.dns_url, used: used.length, max };

  const next = [...used, code];
  let patched;
  try {
    patched = await sb('PATCH', 'dns_pool', {
      q: `id=eq.${encodeURIComponent(targetRow.id)}&used_codes=not.cs.%7B%22${encodeURIComponent(code)}%22%7D`,
      body: { used_codes: next },
      prefer: 'return=representation',
    });
  } catch { return { ok: true, dns_url: targetRow.dns_url, used: used.length, max }; }

  // Mảng rỗng = request khác vừa ghi mã này trước (cùng khách, 2 tab) → vẫn hợp lệ.
  const finalUsed = patched?.length
    ? (patched[0].used_codes || next).length
    : used.length + 1;
  return { ok: true, dns_url: targetRow.dns_url, used: finalUsed, max, justClaimed: !!patched?.length };
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

module.exports = { sb, signJWT, verifyJWT, getToken, requireAdmin, requireGuide, allowMethods, genCode, PACKAGES, PACKAGE_KEYS, normalizePackage, isPermPackage, PRICING, getPrice, getPriceLabel, durationMonths, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, expireCodeAndNotify, sweepExpiredCodes, DEFAULT_STEP_FLOW, DEFAULT_STEP_FLOW_SPECIAL, STEP_TYPE_LABELS, stepLabel, buildStepFlow, alignStepFlow, lookupCustomerByDnsCode, checkAndNotifyDnsExpiry, PRIVATE_DNS_TTL_MS, dnsPrivateUrl, getAppConfig, setAppConfig, getAppstoreConfig, getEmergencyConfig, maskAppstoreEmail, dnsPoolKey, claimDnsFromPool, releaseCustomerFromDnsPool, dnsPoolHasCapacity, DNS_POOL_FULL_MSG, DEFAULT_DNS_TEMPLATE, getDnsTemplate, resolveDnsWithTemplate, fbGet, fbPut, parseContactInput };
