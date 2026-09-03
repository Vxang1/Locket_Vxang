'use strict';
// ─── Env vars (set in Vercel Dashboard, never in browser) ───
const SB_URL  = process.env.SUPABASE_URL || 'https://ogchtngdbywmayeluebh.supabase.co';
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY || '';
const JWT_SEC = process.env.JWT_SECRET || 'locket-secret-jwt-key-2026';
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || 'https://xwuan-access-e9d5e-default-rtdb.firebaseio.com';

// ─── Firebase RTDB REST helper (server-side, no SDK needed) ─────────────
async function fbPut(path, data) {
  const url = `${FIREBASE_DB_URL}/${path.replace(/^\//, '')}.json?_t=${Date.now()}`;
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
  const url = `${FIREBASE_DB_URL}/${path.replace(/^\//, '')}.json`;
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

// ─── Gói dịch vụ Locket_Vxang (100% Vĩnh Viễn) ──────────────
const PACKAGES = {
  '30k': { label: 'Gói 30k (5s Vĩnh viễn)', dns_group: '5s' },
  '40k': { label: 'Gói 40k (15s Vĩnh viễn)', dns_group: '15s' },
};
const PACKAGE_KEYS = ['30k', '40k'];

function normalizePackage(pkg) {
  const p = String(pkg || '').trim();
  if (p === '40k' || p === '15s' || p === '180') return '40k';
  return '30k';
}

function isPermPackage() {
  return true;
}

const PRICING = {
  '30k': {
    'perm': { price: 30000, label: '30k - 5s Vĩnh viễn', months: null },
  },
  '40k': {
    'perm': { price: 40000, label: '40k - 15s Vĩnh viễn', months: null },
  },
};

function getPrice(pkg) {
  const p = normalizePackage(pkg);
  return PRICING[p]?.perm?.price || 30000;
}

function getPriceLabel(pkg) {
  const p = normalizePackage(pkg);
  return PRICING[p]?.perm?.label || '30k';
}

function durationMonths() {
  return null;
}

// ─── Telegram thông báo & Tra cứu ───────────────────────────
const TG_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TG_CHAT_ID   = (process.env.TELEGRAM_CHAT_ID || '').trim();

async function notifyTelegram(text, extra = {}) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return false;
  try {
    const bodyPayload = { chat_id: TG_CHAT_ID, text, parse_mode: 'HTML', ...extra };
    let r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });
    if (r.ok) return true;

    if (extra.reply_markup) {
      const { reply_markup, ...restExtra } = extra;
      r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML', ...restExtra }),
      });
      if (r.ok) return true;
    }

    const plainText = text.replace(/<[^>]+>/g, '');
    r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: plainText }),
    });
    return r.ok;
  } catch { return false; }
}

function escTgHtml(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

async function lookupCustomerByCode(code) {
  const empty = { id: null, name: null, customerCode: null, locketUsername: null, duration: 'perm', specialFlow: false };
  try {
    const rows = await sb('GET', 'access_codes', {
      q: `code=eq.${encodeURIComponent(code)}&select=customer_id,customers(id,name,customer_code,locket_username,duration,special_flow)`,
    });
    const cData = rows?.[0]?.customers;
    const customerId = rows?.[0]?.customer_id;
    if (!customerId && !cData) return empty;

    const cust = Array.isArray(cData) ? cData[0] : cData;
    return {
      id: cust?.id || customerId,
      name: cust?.name || null,
      customerCode: cust?.customer_code || null,
      locketUsername: cust?.locket_username || null,
      duration: 'perm',
      specialFlow: !!cust?.special_flow,
    };
  } catch (e) {
    return empty;
  }
}

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

// ─── DNS riêng (TTL 10 phút) ────────────────────────────────
const PRIVATE_DNS_TTL_MS = 10 * 60 * 1000;

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
  if (!patched?.length) return false;
  const cust = await lookupCustomerByDnsCode(row.customer_code);
  const who = cust?.name ? escTgHtml(cust.name) : 'Khách';
  await notifyTelegram(
    `⌛ Link DNS riêng của <b>${who}</b> đã hết hạn (10 phút)\n` +
    `🆔 Mã KH: <code>${escTgHtml(row.customer_code)}</code>`
  );
  return true;
}

function dnsPrivateUrl(row) {
  return row?.nextdns_url || row?.ublockdns_url || '';
}

// ─── Danh sách bước hướng dẫn chuẩn (4 Kịch bản Flow) ───────
// Gói 30k Flow Thường: Shadow -> DNS -> Gold (3 bước)
// Gói 30k Flow Đặc Biệt: Shadow -> IPA -> Gold (3 bước, không DNS)
// Gói 40k Flow Thường: Shadow -> DNS -> VPN -> Gold (4 bước)
// Gói 40k Flow Đặc Biệt: Shadow -> IPA -> VPN -> DNS -> Gold (5 bước)
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

function alignStepFlow(flow, totalSteps) {
  if (!Array.isArray(flow) || typeof totalSteps !== 'number') return null;
  if (totalSteps === flow.length) return flow;
  if (totalSteps === flow.length - 1 && flow[0] === STEP_TYPE_LABELS.username) return flow.slice(1);
  return null;
}

const PKG_EMOJI = { '30k': '💎', '40k': '💎' };
function codeDetailLines(code, pkg, cust) {
  const p = normalizePackage(pkg);
  const uname = cust?.locketUsername;
  const pkgDisplay = PACKAGES[p]?.label || p;
  const lines = [
    '━━━━━━━━━━━━━━━',
    `🆔 Mã KH: <code>${escTgHtml(cust?.customerCode || '—')}</code>`,
    `🔑 Mã truy cập: <code>${escTgHtml(code)}</code>`,
  ];
  if (uname) {
    lines.push(`👤 Username: <code>${escTgHtml(uname)}</code>`);
  }
  lines.push(`${PKG_EMOJI[p] || '💎'} Gói: <b>${escTgHtml(pkgDisplay)}</b>`);
  return lines.join('\n');
}

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
    for (const row of rows || []) if (await expireCodeAndNotify(row)) sent++;
    return sent;
  } catch { return 0; }
}

// ─── Cấu hình chung (app_config & Appstore) ─────────────────
const APPSTORE_DEFAULT = { email: '', password: '', ipa_url: '' };

async function getAppConfig(key) {
  try {
    const rows = await sb('GET', 'app_config', {
      q: `key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
    });
    return rows?.[0]?.value || null;
  } catch { return null; }
}

async function getAppstoreConfig() {
  try {
    const fbData = await fbGet('appstore');
    if (fbData && (fbData.email || fbData.scraper_url || fbData.scraper_url_backup)) return { ...APPSTORE_DEFAULT, ...fbData };
  } catch {}
  const v = await getAppConfig('appstore');
  return { ...APPSTORE_DEFAULT, ...(v || {}) };
}

async function setAppConfig(key, fields) {
  const existing = (await getAppConfig(key)) || {};
  const merged = { ...existing, ...fields };
  await sb('POST', 'app_config', {
    q: 'on_conflict=key',
    body: { key, value: merged },
    prefer: 'resolution=merge-duplicates,return=minimal',
  });
  return merged;
}

function maskAppstoreEmail(email) {
  const e = String(email || '').trim();
  if (!e.includes('@')) return e;
  return e.replace(/@.*$/, '@vxang.com');
}

// ─── Mẫu URL DNS Tự Hiểu (DNS Template Engine) ───────────────
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
  if (/^https?:\/\//i.test(raw)) return raw;

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

// ─── DNS Pool Xoay Vòng (5s vs 15s) ──────────────────────────
function dnsPoolKey(pkg) {
  const p = normalizePackage(pkg);
  return p === '40k' ? '15s' : '5s';
}

const DNS_POOL_FULL_MSG = '⛔ DNS đang được cập nhật, nhắn Vxang để được hỗ trợ';

const _dnsCapCache = new Map();
const DNS_CAP_CACHE_MS = 5000;

async function dnsPoolHasCapacity(pkg, customerCode, specialFlow) {
  const p = normalizePackage(pkg);
  if (p === '30k' && specialFlow) return true;

  const key = dnsPoolKey(p);
  const code = String(customerCode || '').trim();

  if (!code) {
    const cached = _dnsCapCache.get(key);
    if (cached && Date.now() - cached.ts < DNS_CAP_CACHE_MS) return cached.ok;
  }

  try {
    if (code) {
      const privates = await sb('GET', 'private_dns_links', {
        q: `customer_code=eq.${encodeURIComponent(code)}&select=id&limit=1`,
      });
      if (privates && privates.length) return true;
    }

    const rows = await sb('GET', 'dns_pool', {
      q: `package=eq.${encodeURIComponent(key)}&is_active=eq.true&select=used_codes,max_uses`,
    });
    if (!rows || !rows.length) return false;

    if (code && rows.some(r => Array.isArray(r.used_codes) && r.used_codes.includes(code))) {
      return true;
    }

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
    return true;
  }
}

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

  let privatesPromise = Promise.resolve(null);
  if (code) {
    privatesPromise = sb('GET', 'private_dns_links', {
      q: `customer_code=eq.${encodeURIComponent(code)}&order=created_at.desc&limit=1`,
    }).catch(() => null);
  }

  const poolPromise = sb('GET', 'dns_pool', {
    q: `package=eq.${encodeURIComponent(key)}&is_active=eq.true&order=created_at.asc`,
  }).catch(() => null);

  const [privates, rows] = await Promise.all([privatesPromise, poolPromise]);

  if (privates && privates.length) {
    const privUrl = dnsPrivateUrl(privates[0]);
    if (privUrl) {
      return { ok: true, dns_url: privUrl, used: 1, max: 1, is_private: true };
    }
  }

  if (!rows || !rows.length) return { ok: false, reason: 'empty' };

  if (code) {
    const existing = rows.find(r => Array.isArray(r.used_codes) && r.used_codes.includes(code));
    if (existing) {
      const used = Array.isArray(existing.used_codes) ? existing.used_codes : [];
      const max = existing.max_uses || 5;
      return { ok: true, dns_url: existing.dns_url, used: used.length, max, reused: true };
    }
  }

  const targetRow = rows.find(r => {
    const used = Array.isArray(r.used_codes) ? r.used_codes : [];
    const max = r.max_uses || 5;
    return used.length < max;
  });

  if (!targetRow) return { ok: false, reason: 'full' };

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

  const finalUsed = patched?.length
    ? (patched[0].used_codes || next).length
    : used.length + 1;
  return { ok: true, dns_url: targetRow.dns_url, used: finalUsed, max, justClaimed: !!patched?.length };
}

// ─── Phân giải ô nhập liên hệ duy nhất (Smart Single Contact) ─
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

module.exports = {
  sb, signJWT, verifyJWT, getToken, requireAdmin, requireGuide, allowMethods, genCode,
  PACKAGES, PACKAGE_KEYS, normalizePackage, isPermPackage, PRICING, getPrice, getPriceLabel, durationMonths,
  notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, expireCodeAndNotify, sweepExpiredCodes,
  DEFAULT_STEP_FLOW, DEFAULT_STEP_FLOW_SPECIAL, STEP_TYPE_LABELS, stepLabel, buildStepFlow, alignStepFlow,
  lookupCustomerByDnsCode, checkAndNotifyDnsExpiry, PRIVATE_DNS_TTL_MS, dnsPrivateUrl,
  getAppConfig, setAppConfig, getAppstoreConfig, maskAppstoreEmail,
  dnsPoolKey, claimDnsFromPool, releaseCustomerFromDnsPool, dnsPoolHasCapacity, DNS_POOL_FULL_MSG,
  DEFAULT_DNS_TEMPLATE, getDnsTemplate, resolveDnsWithTemplate, fbGet, fbPut, parseContactInput
};
