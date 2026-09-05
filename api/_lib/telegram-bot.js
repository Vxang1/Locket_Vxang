'use strict';
/**
 * 🤖 LOCKET VXANG TELEGRAM BOT
 * Bot Thông Báo + Tra Cứu CRM
 */
const { sb, lookupCustomerByCode, TG_CHAT_IDS, TG_CHAT_ID, isTgAdmin } = require('./utils');

const TG_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const DIVIDER = '───────────────';

function escHtml(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function formatVnDateTime(isoStr) {
  if (!isoStr) return null;
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return null;
    const time = d.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false });
    const date = d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  } catch {
    return null;
  }
}

async function warmupDnsFn(req) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!host) return;
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    try {
      await fetch(`${proto}://${host}/api/guide/validate?action=dns_warmup`, { signal: ctl.signal });
    } finally { clearTimeout(t); }
  } catch {}
}

async function tgApi(endpoint, body) {
  if (!TG_BOT_TOKEN) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    return null;
  }
}

async function replyTelegram(chatId, text, extra = {}) {
  let r = await tgApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
  if (r?.ok) return r;

  // 1. Nếu lỗi parse HTML -> retry plain text
  if (r?.description && r.description.toLowerCase().includes('parse')) {
    const plainText = text.replace(/<[^>]+>/g, '');
    r = await tgApi('sendMessage', {
      chat_id: chatId,
      text: plainText,
      ...extra,
    });
    if (r?.ok) return r;
  }

  // 2. Nếu lỗi BUTTON_DATA_INVALID hoặc lỗi do inline keyboard -> retry không có reply_markup
  if (extra.reply_markup) {
    const { reply_markup, ...restExtra } = extra;
    r = await tgApi('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...restExtra,
    });
    if (r?.ok) return r;

    // 3. Fallback tối thượng: Plain text không markup
    const plainText = text.replace(/<[^>]+>/g, '');
    r = await tgApi('sendMessage', {
      chat_id: chatId,
      text: plainText,
      ...restExtra,
    });
  }

  return r;
}

async function answerCallbackQuery(callbackQueryId, text, showAlert = false) {
  return await tgApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

async function editMessageText(chatId, messageId, text, extra = {}) {
  let r = await tgApi('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
  if (r?.ok) return r;

  if (r?.description && r.description.toLowerCase().includes('parse')) {
    const plainText = text.replace(/<[^>]+>/g, '');
    r = await tgApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: plainText,
      ...extra,
    });
  }
  return r;
}

// ══════════════════════════════════════════════════════
// ⚡ XỬ LÝ WEBHOOK TỔNG HỢP
// ══════════════════════════════════════════════════════
async function handleTelegramWebhook(req, res) {
  try {
    const update = req.body || {};

    // ──────────────────────────────────────────────────
    // 🔍 DIAGNOSTIC & WEBHOOK REGISTRATION
    // ──────────────────────────────────────────────────
    if (req.query?.diag === '1' || update?.diag === true) {
      let botInfo = null;
      let hookInfo = null;
      let testSend = null;
      if (TG_BOT_TOKEN) {
        try {
          const r1 = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getMe`);
          botInfo = await r1.json();
          const r2 = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getWebhookInfo`);
          hookInfo = await r2.json();
          testSend = await Promise.all(TG_CHAT_IDS.map(async (cid) => {
            try {
              const r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: cid, text: `🔔 Test kết nối Admin ${cid} từ Locket_Vxang!` })
              });
              return { chat_id: cid, res: await r.json() };
            } catch (e) {
              return { chat_id: cid, error: e.message };
            }
          }));
        } catch (e) {
          testSend = { error: e.message };
        }
      }
      return res.status(200).json({
        has_token: !!TG_BOT_TOKEN,
        token_prefix: TG_BOT_TOKEN ? TG_BOT_TOKEN.slice(0, 10) + '...' : null,
        admin_ids: TG_CHAT_IDS,
        botInfo,
        hookInfo,
        testSend
      });
    }

    if (req.query?.set_webhook === '1') {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'locketvxang.vercel.app';
      const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
      const webhookUrl = `${proto}://${host}/api/admin/stats`;
      let result = null;
      if (TG_BOT_TOKEN) {
        const r = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`);
        result = await r.json();
      }
      return res.status(200).json({ webhookUrl, result });
    }

    // ──────────────────────────────────────────────────
    // 🔘 1. XỬ LÝ NÚT BẤM INLINE (CALLBACK QUERY)
    // ──────────────────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const data = String(cb.data || '');
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const fromId = cb.from?.id;

      // Kiểm tra quyền Admin
      if (TG_CHAT_IDS.length > 0 && !isTgAdmin(fromId)) {
        await answerCallbackQuery(callbackId, '⛔ Bạn không có quyền thực hiện thao tác này.', true);
        return res.status(200).json({ ok: true });
      }

      // Xử lý nút noop (đã hoàn thành)
      if (data === 'noop') {
        await answerCallbackQuery(callbackId, '✨ Tài khoản này đã được kích hoạt Gold thành công rồi!');
        return res.status(200).json({ ok: true });
      }

      // Xử lý nút tra cứu mã truy cập
      if (data.startsWith('lookup_code:')) {
        const codeId = data.split(':')[1];
        if (!codeId) return res.status(200).json({ ok: true });
        
        await answerCallbackQuery(callbackId, '⏳ Đang tra cứu thông tin...');
        
        try {
          let codeRows = [];
          if (/^[0-9a-f-]{36}$/i.test(codeId) || /^\d+$/.test(codeId)) {
            codeRows = await sb('GET', 'access_codes', { q: `id=eq.${encodeURIComponent(codeId)}` });
            if (!codeRows || !codeRows.length) {
              codeRows = await sb('GET', 'access_codes', { q: `code=eq.${encodeURIComponent(codeId)}` });
            }
          } else {
            codeRows = await sb('GET', 'access_codes', { q: `code=eq.${encodeURIComponent(codeId)}` });
            if (!codeRows || !codeRows.length) {
              codeRows = await sb('GET', 'access_codes', { q: `id=eq.${encodeURIComponent(codeId)}` });
            }
          }
          const codeData = codeRows?.[0];
          
          if (!codeData) {
            await replyTelegram(chatId, `❌ Không tìm thấy mã này.`);
            return res.status(200).json({ ok: true });
          }
          
          const custRows = await sb('GET', 'customers', { q: `id=eq.${encodeURIComponent(codeData.customer_id)}` });
          const customer = custRows?.[0] || {};
          
          const pkg = customer.package || codeData.package || '30k';
          const lines = [
            `🎯 <b>THÔNG TIN TỪ MÃ TRUY CẬP</b>`,
            DIVIDER,
            `🔑 <b>Mã:</b> <code>${escHtml(codeData.code)}</code>`,
            `📦 <b>Gói:</b> <code>${escHtml(pkg)}</code>`,
            `👤 <b>Khách hàng:</b> <code>${escHtml(customer.customer_code || '-')}</code> (${escHtml(customer.name || 'Chưa có tên')})`,
            `📞 <b>SĐT:</b> <code>${escHtml(customer.phone || '-')}</code>`,
            `📊 <b>Trạng thái:</b> <b>${escHtml(customer.service_status || '-')}</b>`
          ];
          if (pkg === '30k' || pkg === '5s') {
            const startTime = customer.activated_at || customer.created_at;
            if (startTime) {
              const diffDays = Math.floor((Date.now() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24));
              const isWithin7Days = diffDays <= 7;
              const remDays = Math.max(0, 7 - diffDays);
              lines.push(`⚡ <b>Lên 40k:</b> ${isWithin7Days ? `Còn ${remDays} ngày đổi bù (+10k)` : `Quá 7 ngày (${diffDays} ngày) - Thu full 40k`}`);
            }
          }
          
          await replyTelegram(chatId, lines.join('\n'));
        } catch (err) {
          await replyTelegram(chatId, `❌ Lỗi tra cứu: ${err.message}`);
        }
        return res.status(200).json({ ok: true });
      }

      // Xử lý nút mở khóa (Đã bãi bỏ: Khóa là khóa, không có đặc xá)
      if (data.startsWith('unblock_code:')) {
        await answerCallbackQuery(callbackId, '⛔ Không hỗ trợ mở khóa! Gian lận share mã đã bị khóa vĩnh viễn và phạt không hoàn cọc.', true);
        return res.status(200).json({ ok: true });
      }

      return res.status(200).json({ ok: true });
    }

    // ──────────────────────────────────────────────────
    // 💬 2. XỬ LÝ TIN NHẮN VĂN BẢN & FILE (TEXT / DOC)
    // ──────────────────────────────────────────────────
    const msg = update.message || update.edited_message;
    const chatId = msg?.chat?.id;
    const fromId = msg?.from?.id;

    if (!chatId) return res.status(200).json({ ok: true });

    // Chỉ Chat ID / User ID Admin mới được điều khiển
    if (TG_CHAT_IDS.length > 0 && !isTgAdmin(fromId) && !isTgAdmin(chatId)) {
      return res.status(200).json({ ok: true });
    }

    let text = (msg?.text || '').trim();
    if (!text) return res.status(200).json({ ok: true });

    // Lệnh trợ giúp /start, help, menu
    if (/^\/(start|help|menu)(\s|@|$)/i.test(text) || text.toLowerCase() === 'help' || text.toLowerCase() === 'menu') {
      const helpLines = [
        '👋 <b>Chào Admin Vxang (Locket Vxang Bot)!</b>',
        DIVIDER,
        '⚡ <b>Hệ thống Quản lý Khách hàng:</b>\n',
        '1️⃣ <b>Tra cứu thông tin CRM:</b>',
        '👉 Gõ mã khách hàng <code>KH-xxxxxxx</code>, mã truy cập <code>VX-xxxxxx</code> hoặc SĐT để xem thông tin.\n',
        '2️⃣ <b>Thống kê hệ thống:</b>',
        '👉 Gõ <code>/stats</code> để xem thống kê tổng quan về khách hàng và gói dịch vụ.'
      ];
      await replyTelegram(chatId, helpLines.join('\n'));
      return res.status(200).json({ ok: true });
    }

    // Lệnh thống kê /stats
    if (/^\/stats(\s|@|$)/i.test(text) || text.toLowerCase() === 'stats') {
      try {
        const [totalCust, pkg30k, pkg40k, completedCust, activeCodes] = await Promise.all([
          sb('GET', 'customers', { q: 'select=id', count: 'exact', head: true }),
          sb('GET', 'customers', { q: 'package=eq.30k&select=id', count: 'exact', head: true }),
          sb('GET', 'customers', { q: 'package=eq.40k&select=id', count: 'exact', head: true }),
          sb('GET', 'customers', { q: 'service_status=eq.active&select=id', count: 'exact', head: true }),
          sb('GET', 'access_codes', { q: 'is_active=eq.true&select=id', count: 'exact', head: true })
        ]);
        
        const lines = [
          '📊 <b>THỐNG KÊ LOCKET VXANG</b>',
          DIVIDER,
          `👥 <b>Tổng khách hàng:</b> <code>${totalCust?.count || 0}</code>`,
          `✅ <b>Đã hoàn thành (active):</b> <code>${completedCust?.count || 0}</code>`,
          DIVIDER,
          `📦 <b>Khách gói 30k (5s):</b> <code>${pkg30k?.count || 0}</code>`,
          `📦 <b>Khách gói 40k (15s):</b> <code>${pkg40k?.count || 0}</code>`,
          DIVIDER,
          `🔑 <b>Mã truy cập đang active:</b> <code>${activeCodes?.count || 0}</code>`
        ];
        
        await replyTelegram(chatId, lines.join('\n'));
      } catch (err) {
        await replyTelegram(chatId, `❌ Lỗi lấy thống kê: ${err.message}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ──────────────────────────────────────────────────
    // 🔍 2.2 TRA CỨU THEO MÃ KH HOẶC MÃ TRUY CẬP HOẶC SĐT (FIND CUSTOMER CRM)
    // ──────────────────────────────────────────────────
    const customer = await findCustomerInCrm(text);

    if (!customer) {
      await replyTelegram(chatId,
        '❌ <b>Không tìm thấy thông tin</b>\n' +
        DIVIDER + '\n' +
        `Không tìm thấy dữ liệu cho <code>${escHtml(text)}</code>.\n\n` +
        '👉 <i>Vui lòng nhập đúng mã KH (vd: <code>KH-GE2Y4CX8</code>), mã truy cập (<code>VX-123456</code>) hoặc SĐT.</i>'
      );
      return res.status(200).json({ ok: true });
    }

    // Lấy danh sách mã & hâm nóng DNS function
    const [codesRaw, dnsRowsRaw] = await Promise.all([
      sb('GET', 'access_codes', { q: `customer_id=eq.${encodeURIComponent(customer.id)}&order=created_at.desc` }).catch(() => []),
      sb('GET', 'private_dns_links', { q: `customer_code=eq.${encodeURIComponent(customer.customer_code)}&select=created_at,first_accessed_at&order=created_at.desc` }).catch(() => []),
      warmupDnsFn(req),
    ]);
    const codes = codesRaw || [];
    const dnsRows = dnsRowsRaw || [];
    const latestCode = codes[0];

    function codeStatus(c) {
      if (c.completed_at) return '✅ đã hoàn thành';
      if (!c.is_active && c.fraud_triggered_at) return '🔒 khoá do share mã';
      if (!c.is_active) return '🚫 admin khoá';
      if (c.expires_at && new Date(c.expires_at) < new Date()) return '⏰ hết hạn';
      if (!c.activated_at && !c.first_used_at) return '⏳ chưa dùng';
      return '🟢 đang còn hiệu lực';
    }

    const statusEmoji = { pending_gold: '⏳', active: '✅', expired: '⏰' }[customer.service_status] || '❓';
    const pkg = escHtml(customer.package || latestCode?.package || '30k');
    const pkgEmoji = (pkg === '40k') ? '⚡' : '✨';
    
    const searchedCode = customer._searchedCode;
    const targetCodeObj = searchedCode ? codes.find(c => (c.code || '').toUpperCase() === searchedCode.toUpperCase()) : null;

    const lines = [];

    // Nếu admin tra cứu đích danh 1 mã truy cập -> hiện thẻ tiêu điểm mã lên đầu
    if (targetCodeObj) {
      const actTime = formatVnDateTime(targetCodeObj.activated_at || targetCodeObj.first_used_at);
      const compTime = formatVnDateTime(targetCodeObj.completed_at);
      const expTime = formatVnDateTime(targetCodeObj.expires_at);
      const createTime = formatVnDateTime(targetCodeObj.created_at);

      lines.push('🎯 <b>THÔNG TIN MÃ TRUY CẬP</b>');
      lines.push(DIVIDER);
      lines.push(`🔑 <b>Mã truy cập:</b> <code>${escHtml(targetCodeObj.code)}</code>`);
      lines.push(`📊 <b>Trạng thái:</b> <b>${codeStatus(targetCodeObj)}</b>`);
      lines.push(`📦 <b>Gói dịch vụ:</b> <code>${escHtml(targetCodeObj.package || pkg)}</code>`);
      lines.push(`📅 <b>Ngày tạo mã:</b> <code>${createTime || '-'}</code>`);
      lines.push(`⚡ <b>Kích hoạt lúc:</b> <b>${actTime ? `<code>${actTime}</code>` : '<i>(Chưa kích hoạt / Chưa dùng)</i>'}</b>`);
      if (compTime) {
        lines.push(`✅ <b>Hoàn tất lúc:</b> <code>${compTime}</code>`);
      } else if (expTime) {
        lines.push(`⌛ <b>Hết hạn lúc:</b> <code>${expTime}</code>`);
      }
      lines.push(DIVIDER);
      lines.push('👤 <b>CHỦ SỞ HỮU (KHÁCH HÀNG):</b>');
    }

    if (!targetCodeObj) {
      lines.push(
        `👤 <b>${escHtml(customer.name || '(chưa có tên)')}</b>`,
        DIVIDER,
        `🆔 Mã KH: <code>${escHtml(customer.customer_code)}</code>`,
        `📞 SĐT: <code>${escHtml(customer.phone || '-')}</code>`,
        `🔗 Profile: <code>${escHtml(customer.social_link || '-')}</code>`,
        `${pkgEmoji} Gói: <b>${pkg}</b>`,
        `${statusEmoji} Trạng thái: <b>${escHtml(customer.service_status || '-')}</b>`
      );
    } else {
      lines.push(
        `👤 <b>${escHtml(customer.name || '(chưa có tên)')}</b>`,
        `🆔 Mã KH: <code>${escHtml(customer.customer_code)}</code>`,
        `📞 SĐT: <code>${escHtml(customer.phone || '-')}</code>`,
        `🔗 Profile: <code>${escHtml(customer.social_link || '-')}</code>`,
        `${pkgEmoji} Gói: <b>${pkg}</b>`,
        `${statusEmoji} Trạng thái: <b>${escHtml(customer.service_status || '-')}</b>`
      );
    }

    if (customer.package === '30k' || customer.package === '5s') {
      const startTime = customer.activated_at || customer.created_at;
      if (startTime) {
        const diffDays = Math.floor((Date.now() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24));
        const isWithin7Days = diffDays <= 7;
        const remDays = Math.max(0, 7 - diffDays);
        lines.push(isWithin7Days 
          ? `⚡ <b>Lên 40k:</b> Còn ${remDays} ngày đổi bù (+10k)` 
          : `⚡ <b>Lên 40k:</b> Quá 7 ngày (${diffDays} ngày) - Thu full 40k`
        );
      }
    }

    if (codes.length) {
      lines.push(DIVIDER);
      lines.push(`🔑 <b>Mã truy cập (${codes.length})</b>`);
      for (const c of codes) {
        lines.push(`<code>${escHtml(c.code)}</code> - ${codeStatus(c)}`);
      }
    }

    if (dnsRows.length) {
      const opened = dnsRows.filter(r => r.first_accessed_at).length;
      lines.push(DIVIDER);
      lines.push(`🌐 <b>Khách làm DNS riêng</b> - ${dnsRows.length} link${opened ? `, đã mở ${opened}` : ', chưa mở link nào'}`);
    }
    if (customer.notes) {
      lines.push(DIVIDER);
      lines.push(`📝 <i>${escHtml(customer.notes)}</i>`);
    }

    await replyTelegram(chatId, lines.join('\n'));
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
}

// ──────────────────────────────────────────────────
// 🔎 HÀM TÌM KIẾM KHÁCH HÀNG CRM TOÀN DIỆN (4-LAYER SEARCH)
// ──────────────────────────────────────────────────
async function findCustomerInCrm(queryText) {
  if (!queryText) return null;
  const raw = String(queryText).trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  const cleanCode = upper.replace(/^(KH-|VX-|XW-)/i, '').trim();
  const esc = encodeURIComponent(raw);
  const escClean = encodeURIComponent(cleanCode);

  let searchedCode = null;
  if (/^(VX-|XW-)[A-Z0-9]+$/i.test(raw) || (raw.length === 6 && /^[A-Z0-9]+$/i.test(raw))) {
    searchedCode = (upper.startsWith('VX-') || upper.startsWith('XW-')) ? upper : `VX-${upper}`;
  }

  // Layer 1: Query trực tiếp Supabase bảng customers bằng PostgREST OR & ilike
  const orParts = [
    `customer_code.ilike.*${esc}*`,
    `customer_code.ilike.*${escClean}*`,
    `name.ilike.*${esc}*`,
    `phone.ilike.*${esc}*`
  ];
  const cleanPhone = raw.replace(/[^0-9]/g, '');
  if (cleanPhone && cleanPhone.length >= 6) {
    orParts.push(`phone.ilike.*${encodeURIComponent(cleanPhone)}*`);
  }

  let custs = await sb('GET', 'customers', {
    q: `or=(${orParts.join(',')})&limit=10`,
  }).catch(() => []);

  if (Array.isArray(custs) && custs.length) {
    // Ưu tiên bản ghi khớp chính xác customer_code nhất
    const exactMatch = custs.find(c => {
      const cc = (c.customer_code || '').toUpperCase().trim();
      return cc === upper || cc === `KH-${cleanCode}` || cc.includes(upper) || cc.includes(cleanCode);
    });
    const c = exactMatch || custs[0];
    if (searchedCode) c._searchedCode = searchedCode;
    return c;
  }

  // Layer 2: Tìm qua bảng access_codes (Mã truy cập XW-...)
  const codeRows = await sb('GET', 'access_codes', {
    q: `or=(code.ilike.*${esc}*,code.ilike.*${escClean}*)&select=code,customer_id&limit=5`,
  }).catch(() => []);

  if (Array.isArray(codeRows) && codeRows.length) {
    for (const cr of codeRows) {
      if (cr.customer_id) {
        const matched = await sb('GET', 'customers', {
          q: `id=eq.${encodeURIComponent(cr.customer_id)}&limit=1`,
        }).catch(() => []);
        if (matched?.[0]) {
          const c = matched[0];
          c._searchedCode = cr.code || searchedCode;
          return c;
        }
      }
    }
  }

  // Layer 3: Tìm qua bảng private_dns_links (Token DNS riêng / Mã KH)
  const dnsLinks = await sb('GET', 'private_dns_links', {
    q: `or=(token.ilike.*${esc}*,customer_code.ilike.*${esc}*,customer_code.ilike.*${escClean}*)&select=customer_code&limit=5`,
  }).catch(() => []);

  if (Array.isArray(dnsLinks) && dnsLinks.length) {
    for (const dl of dnsLinks) {
      if (dl.customer_code) {
        const matched = await sb('GET', 'customers', {
          q: `customer_code=ilike.*${encodeURIComponent(dl.customer_code.trim())}*&limit=1`,
        }).catch(() => []);
        if (matched?.[0]) return matched[0];
      }
    }
  }

  // Layer 4: Fallback In-Memory Scan (khớp 100% cơ chế load của Admin Web)
  // Tải danh sách khách hàng mới nhất và quét Javascript substring (includes)
  try {
    const allCusts = await sb('GET', 'customers', {
      q: 'order=created_at.desc&limit=500',
    }).catch(() => []);
    if (Array.isArray(allCusts) && allCusts.length) {
      const qLower = raw.toLowerCase();
      const qClean = cleanCode.toLowerCase();
      const memMatch = allCusts.find(c => {
        const cc = (c.customer_code || '').toLowerCase();
        const nm = (c.name || '').toLowerCase();
        const ph = (c.phone || '').replace(/[^0-9]/g, '');
        return cc.includes(qLower) ||
               (qClean.length >= 3 && cc.includes(qClean)) ||
               nm.includes(qLower) ||
               (cleanPhone.length >= 6 && ph.includes(cleanPhone));
      });
      if (memMatch) {
        if (searchedCode) memMatch._searchedCode = searchedCode;
        return memMatch;
      }
    }
  } catch (err) {
    console.warn('Lỗi memory scan CRM fallback:', err.message);
  }

  return null;
}

module.exports = { handleTelegramWebhook, replyTelegram, answerCallbackQuery, editMessageText, findCustomerInCrm };