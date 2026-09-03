const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogchtngdbywmayeluebh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || 'https://xwuan-access-e9d5e-default-rtdb.firebaseio.com';
const JWT_SECRET = process.env.JWT_SECRET || 'locket-secret-jwt-key-2026';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Bảng giá dịch vụ Locket_Vxang (100% Vĩnh viễn)
const PRICING = {
  '30k': { 'perm': { price: 30000, label: '5s Vĩnh viễn - 30k', months: null, pkg_type: '5s' } },
  '40k': { 'perm': { price: 40000, label: '15s Vĩnh viễn - 40k', months: null, pkg_type: '15s' } }
};

function normalizePackage(pkg) {
  if (pkg === '40k' || pkg === '15s' || pkg === '180') return '40k';
  return '30k';
}

function dnsPoolKey(pkg) {
  return normalizePackage(pkg) === '40k' ? '15s' : '5s';
}

// Gọi Supabase qua REST PostgREST API
async function sb(path, opts = {}) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
    ...opts.headers,
  };
  const ctrl = new AbortController();
  const tId = setTimeout(() => ctrl.abort(), 7000);
  try {
    const fetchOpts = {
      ...opts,
      headers,
      signal: ctrl.signal,
      keepalive: true
    };
    if (fetchOpts.body && typeof fetchOpts.body !== 'string' && !Buffer.isBuffer(fetchOpts.body)) {
      fetchOpts.body = JSON.stringify(fetchOpts.body);
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, fetchOpts);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || res.statusText || `HTTP ${res.status}`);
    return data;
  } finally {
    clearTimeout(tId);
  }
}

// Firebase RTDB Helpers
async function fbGet(node) {
  const res = await fetch(`${FIREBASE_DB_URL}/${node}.json`, { cache: 'no-store' });
  return await res.json().catch(() => null);
}
async function fbPut(node, val) {
  await fetch(`${FIREBASE_DB_URL}/${node}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(val),
  });
}

// JWT Sign / Verify (HMAC-SHA256 thuần)
function b64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signJWT(payload, expiresIn = '24h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  let expSeconds = 86400;
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const num = parseInt(expiresIn);
    if (unit === 'd') expSeconds = num * 86400;
    else if (unit === 'h') expSeconds = num * 3600;
    else if (unit === 'm') expSeconds = num * 60;
  }
  const exp = Math.floor(Date.now() / 1000) + expSeconds;
  const p = { ...payload, exp };
  const h64 = b64url(JSON.stringify(header));
  const p64 = b64url(JSON.stringify(p));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${h64}.${p64}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${h64}.${p64}.${sig}`;
}
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h64, p64, sig] = parts;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h64}.${p64}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(p64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middlewares
function requireAdmin(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const p = verifyJWT(token);
  return p && p.role === 'admin';
}
function requireGuide(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const p = verifyJWT(token);
  return p && p.role === 'guide' ? p : false;
}
function allowMethods(req, res, methods = ['GET', 'POST']) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return false;
  }
  return true;
}

// Động cơ phân giải mẫu URL DNS
function resolveDnsWithTemplate(rawInput, template) {
  if (!rawInput) return '';
  const trimmed = String(rawInput).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const tmpl = template || 'https://apple.dns.nextdns.io/{CODE}';
  let resolved = '';
  if (/\{code\}|\{id\}/i.test(tmpl)) {
    resolved = tmpl.replace(/\{code\}|\{id\}/gi, trimmed);
  } else {
    resolved = tmpl.replace(/\/+$/, '') + '/' + trimmed;
  }
  if (!/^https?:\/\//i.test(resolved)) resolved = 'https://' + resolved;
  return resolved;
}
async function getDnsTemplate() {
  try {
    const res = await sb('app_config?key=eq.dns_template&select=value');
    if (res && res.length && res[0].value && res[0].value.template) {
      return res[0].value.template;
    }
  } catch {}
  return 'https://apple.dns.nextdns.io/{CODE}';
}

// Quản lý DNS Pool & DNS Riêng
async function claimDnsFromPool(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  const [privateRows, poolRows] = await Promise.all([
    customerCode ? sb(`private_dns_links?customer_code=eq.${encodeURIComponent(customerCode)}&select=*`).catch(() => []) : Promise.resolve([]),
    sb(`dns_pool?package=eq.${key}&is_active=eq.true&order=created_at.asc`).catch(() => [])
  ]);

  if (privateRows && privateRows.length) {
    const pRow = privateRows[0];
    const url = pRow.nextdns_url || pRow.ublockdns_url;
    if (url) return { ok: true, dns_url: url, package: pRow.package, customer_code: customerCode, is_private: true };
  }

  if (!poolRows || !poolRows.length) {
    return { ok: false, error: 'Chưa có link DNS khả dụng cho gói này. Vui lòng liên hệ Admin.' };
  }

  if (customerCode) {
    const existing = poolRows.find(r => (r.used_codes || []).includes(customerCode));
    if (existing) {
      return { ok: true, dns_url: existing.dns_url, package: existing.package, customer_code: customerCode };
    }
  }

  const available = poolRows.find(r => !r.is_full && (r.used || 0) < (r.max || 5));
  if (!available) {
    return { ok: false, error: 'DNS Pool đã đầy tất cả các link. Vui lòng liên hệ Admin.' };
  }

  if (customerCode) {
    const nextCodes = [...(available.used_codes || []), customerCode];
    const nextUsed = (available.used || 0) + 1;
    const isFull = nextUsed >= (available.max || 5);
    await sb(`dns_pool?id=eq.${available.id}`, {
      method: 'PATCH',
      body: { used_codes: nextCodes, used: nextUsed, is_full: isFull }
    }).catch(() => {});
  }

  return { ok: true, dns_url: available.dns_url, package: available.package, customer_code: customerCode };
}

async function releaseCustomerFromDnsPool(customerCode) {
  if (!customerCode) return;
  try {
    const poolRows = await sb('dns_pool?select=*');
    if (!poolRows || !poolRows.length) return;
    for (const r of poolRows) {
      const codes = r.used_codes || [];
      if (codes.includes(customerCode)) {
        const nextCodes = codes.filter(c => c !== customerCode);
        const nextUsed = Math.max(0, nextCodes.length);
        await sb(`dns_pool?id=eq.${r.id}`, {
          method: 'PATCH',
          body: { used_codes: nextCodes, used: nextUsed, is_full: false }
        });
      }
    }
  } catch {}
}

async function dnsPoolHasCapacity(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  try {
    const [privateRows, poolRows] = await Promise.all([
      customerCode ? sb(`private_dns_links?customer_code=eq.${encodeURIComponent(customerCode)}&select=id`) : Promise.resolve([]),
      sb(`dns_pool?package=eq.${key}&is_active=eq.true`)
    ]);
    if (privateRows && privateRows.length) return true;
    if (!poolRows || !poolRows.length) return false;
    if (customerCode && poolRows.some(r => (r.used_codes || []).includes(customerCode))) return true;
    return poolRows.some(r => !r.is_full && (r.used || 0) < (r.max || 5));
  } catch {
    return false;
  }
}

// Telegram Notifications
function escMd(str) {
  return String(str ?? '').replace(/[_*[\]()~\>#+\-=|{}.!]/g, '\\$&');
}
async function notifyTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      })
    });
  } catch {}
}

function genCode(prefix = 'XW-') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return prefix + s;
}

module.exports = {
  PRICING, normalizePackage, dnsPoolKey,
  sb, fbGet, fbPut, signJWT, verifyJWT,
  requireAdmin, requireGuide, allowMethods,
  resolveDnsWithTemplate, getDnsTemplate,
  claimDnsFromPool, releaseCustomerFromDnsPool, dnsPoolHasCapacity,
  escMd, notifyTelegram, genCode
};
