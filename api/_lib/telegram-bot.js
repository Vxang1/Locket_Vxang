'use strict';
/**
 * 🤖 LOCKET_VXANG TELEGRAM BOT
 * Thông Báo & Tra Cứu CRM Tức Thì (Không có hệ thống nâng Username tự động)
 */
const { sb, lookupCustomerByCode, normalizePackage } = require('./utils');

const TG_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').trim();
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

  // Retry plain text nếu lỗi parse HTML
  const plainText = text.replace(/<[^>]+>/g, '');
  return await tgApi('sendMessage', {
    chat_id: chatId,
    text: plainText,
    ...extra,
  });
}

// ─── Format thẻ tra cứu Mã Truy Cập (XW-...) ─────────────────
function formatCodeDetail(codeRow, cust) {
  const p = normalizePackage(codeRow.package);
  const isSpecial = !!cust?.special_flow;
  const isDone = !!codeRow.completed_at;
  const isExp = codeRow.expires_at && new Date(codeRow.expires_at) < new Date();
  let statusBadge = '⏳ Đang chờ cài đặt';
  if (isDone) statusBadge = '✅ Đã hoàn tất cài đặt';
  else if (isExp) statusBadge = '❌ Đã hết hạn (quá giờ)';
  else if (codeRow.is_active) statusBadge = '🟢 Đang trong thời hạn làm';

  const lines = [
    '🎫 <b>THÔNG TIN MÃ TRUY CẬP</b>',
    DIVIDER,
    `🔑 <b>Mã:</b> <code>${escHtml(codeRow.code)}</code>`,
    `🚦 <b>Trạng thái:</b> ${statusBadge}`,
    `💎 <b>Gói:</b> <b>${p === '40k' ? 'Gói 40k (15s Vĩnh viễn)' : 'Gói 30k (5s Vĩnh viễn)'}</b>${isSpecial ? ' · 🛡️ Flow Đặc Biệt' : ''}`,
  ];

  if (cust) {
    lines.push(
      `👤 <b>Khách hàng:</b> ${escHtml(cust.name || '—')}`,
      `🏷️ <b>Mã KH:</b> <code>${escHtml(cust.customer_code || '—')}</code>`
    );
    if (cust.phone) lines.push(`📞 <b>SĐT:</b> <code>${escHtml(cust.phone)}</code>`);
    if (cust.social_link) lines.push(`🔗 <b>Liên hệ:</b> <a href="${cust.social_link}">Mở link profile</a>`);
  }

  const createdTime = formatVnDateTime(codeRow.created_at);
  const actTime = formatVnDateTime(codeRow.activated_at);
  const expTime = formatVnDateTime(codeRow.expires_at);
  const doneTime = formatVnDateTime(codeRow.completed_at);

  lines.push(DIVIDER);
  if (createdTime) lines.push(`🕒 Tạo lúc: <code>${createdTime}</code>`);
  if (actTime) lines.push(`⚡ Kích hoạt: <code>${actTime}</code>`);
  if (expTime) lines.push(`⏳ Hết hạn: <code>${expTime}</code>`);
  if (doneTime) lines.push(`🎉 Hoàn thành: <code>${doneTime}</code>`);

  return lines.join('\n');
}

// ─── Format thẻ tra cứu Khách Hàng (KH-...) ──────────────────
function formatCustomerDetail(cust, codes = []) {
  const p = normalizePackage(cust.package);
  const isSpecial = !!cust.special_flow;
  const isDone = cust.service_status === 'active' || cust.service_status === 'completed';

  const lines = [
    '👥 <b>HỒ SƠ KHÁCH HÀNG CRM</b>',
    DIVIDER,
    `👤 <b>Tên:</b> <b>${escHtml(cust.name || '—')}</b>`,
    `🏷️ <b>Mã KH:</b> <code>${escHtml(cust.customer_code || '—')}</code>`,
    `💎 <b>Gói:</b> <b>${p === '40k' ? 'Gói 40k (15s Vĩnh viễn)' : 'Gói 30k (5s Vĩnh viễn)'}</b>${isSpecial ? ' · 🛡️ Flow Đặc Biệt' : ''}`,
    `💰 <b>Thanh toán:</b> <code>${escHtml(cust.deposit_note || 'Chờ thu tiền')}</code>`,
    `🚦 <b>Trạng thái:</b> ${isDone ? '✅ Đã hoàn tất' : '⏳ Đang chờ'}`,
  ];

  if (cust.phone) lines.push(`📞 <b>SĐT:</b> <code>${escHtml(cust.phone)}</code>`);
  if (cust.social_link) lines.push(`🔗 <b>Liên hệ:</b> <a href="${cust.social_link}">Mở link profile</a>`);
  if (cust.notes) lines.push(`📝 <b>Ghi chú:</b> <i>${escHtml(cust.notes)}</i>`);

  lines.push(DIVIDER);
  lines.push(`🎫 <b>Danh sách mã truy cập (${codes.length}):</b>`);
  if (codes.length) {
    for (const c of codes.slice(0, 5)) {
      const isCExp = c.expires_at && new Date(c.expires_at) < new Date();
      const mark = c.completed_at ? '✅' : (isCExp ? '❌' : (c.is_active ? '🟢' : '⚪'));
      lines.push(`• ${mark} <code>${escHtml(c.code)}</code> (${c.status || 'pending'})`);
    }
  } else {
    lines.push('• <i>Chưa có mã nào được cấp</i>');
  }

  return lines.join('\n');
}

// ─── Webhook Router chính của Bot ───────────────────────────
module.exports = async (req, res) => {
  try {
    const update = req.body;
    if (!update) return res.status(200).send('OK');

    const msg = update.message;
    const callbackQuery = update.callback_query;

    if (callbackQuery) {
      const cbData = callbackQuery.data || '';
      const cbChatId = callbackQuery.message?.chat?.id;

      if (cbData.startsWith('lookup_code:')) {
        const targetCode = cbData.split(':')[1];
        const codeRows = await sb('GET', 'access_codes', { q: `code=eq.${encodeURIComponent(targetCode)}&limit=1` });
        if (codeRows?.length) {
          const cust = await lookupCustomerByCode(targetCode);
          await replyTelegram(cbChatId, formatCodeDetail(codeRows[0], cust));
        }
      }

      await tgApi('answerCallbackQuery', { callback_query_id: callbackQuery.id });
      return res.status(200).json({ ok: true });
    }

    if (!msg) return res.status(200).send('OK');

    const chatId = String(msg.chat?.id || '');
    // Bảo mật: chỉ chat của Admin mới được phép thao tác
    if (TG_CHAT_ID && chatId !== TG_CHAT_ID) {
      await replyTelegram(chatId, '⛔ <b>Từ chối truy cập:</b> Bạn không có quyền tương tác với Bot quản trị này.');
      return res.status(200).json({ ok: true });
    }

    const text = (msg.text || '').trim();
    if (!text) return res.status(200).json({ ok: true });

    // Lệnh /start, help, menu
    if (text === '/start' || text.toLowerCase() === 'help' || text.toLowerCase() === 'menu') {
      const helpLines = [
        '👋 <b>Chào Admin Vxang (Locket_Vxang Bot)!</b>',
        DIVIDER,
        '⚡ <b>Hệ thống Thông Báo & Tra Cứu CRM Tức Thì:</b>\n',
        '1️⃣ <b>Nhận thông báo tự động:</b>',
        '• Khách mới tạo, khách bắt đầu cài đặt, khách hoàn thành (kèm link Zalo).',
        '• Cảnh báo gian lận chia sẻ mã đa thiết bị.\n',
        '2️⃣ <b>Tra cứu thông tin:</b>',
        '• Gõ mã truy cập (VD: <code>XW-A1B2C3</code>) để xem hạn mã và tiến độ.',
        '• Gõ mã khách hàng (VD: <code>KH-12345678</code>) để xem hồ sơ CRM.',
        '• Gõ SĐT hoặc Tên khách để tìm kiếm nhanh.\n',
        '3️⃣ <b>Thống kê:</b>',
        '• Gõ <code>/stats</code> để xem tổng quan khách hàng và các gói.'
      ];
      await replyTelegram(chatId, helpLines.join('\n'));
      return res.status(200).json({ ok: true });
    }

    // Lệnh /stats
    if (text === '/stats' || text.toLowerCase() === 'stats') {
      const customers = await sb('GET', 'customers', { q: 'select=id,package,service_status' });
      const codes = await sb('GET', 'access_codes', { q: 'is_active=eq.true&select=id' });
      const sessions = await sb('GET', 'sessions', { q: 'select=id' });

      const totalCust = customers?.length || 0;
      const count30k = customers?.filter(c => normalizePackage(c.package) === '30k').length || 0;
      const count40k = customers?.filter(c => normalizePackage(c.package) === '40k').length || 0;
      const countCompleted = customers?.filter(c => c.service_status === 'active' || c.service_status === 'completed').length || 0;

      const statLines = [
        '📊 <b>THỐNG KÊ HỆ THỐNG LOCKET_VXANG</b>',
        DIVIDER,
        `👥 <b>Tổng khách hàng:</b> <code>${totalCust}</code>`,
        `💎 <b>Gói 30k (5s Vĩnh viễn):</b> <code>${count30k}</code>`,
        `💎 <b>Gói 40k (15s Vĩnh viễn):</b> <code>${count40k}</code>`,
        `✅ <b>Đã hoàn thành cài đặt:</b> <code>${countCompleted}</code>`,
        `🔑 <b>Mã đang hoạt động:</b> <code>${codes?.length || 0}</code>`,
        `🟢 <b>Phiên đang live:</b> <code>${sessions?.length || 0}</code>`,
        DIVIDER,
        `🕒 Thời gian: <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>`
      ];
      await replyTelegram(chatId, statLines.join('\n'));
      return res.status(200).json({ ok: true });
    }

    // ── TRA CỨU MÃ TRUY CẬP (XW-...) ──
    if (/^XW-[A-Z0-9]{4,10}$/i.test(text)) {
      const upper = text.toUpperCase();
      const codeRows = await sb('GET', 'access_codes', { q: `code=eq.${encodeURIComponent(upper)}&limit=1` });
      if (!codeRows?.length) {
        await replyTelegram(chatId, `❌ Không tìm thấy mã truy cập <code>${escHtml(upper)}</code> trong hệ thống.`);
        return res.status(200).json({ ok: true });
      }
      const cust = await lookupCustomerByCode(upper);
      await replyTelegram(chatId, formatCodeDetail(codeRows[0], cust));
      return res.status(200).json({ ok: true });
    }

    // ── TRA CỨU MÃ KHÁCH HÀNG (KH-...) ──
    if (/^KH-[0-9A-Z]{4,12}$/i.test(text)) {
      const upper = text.toUpperCase();
      const custRows = await sb('GET', 'customers', { q: `customer_code=eq.${encodeURIComponent(upper)}&limit=1` });
      if (!custRows?.length) {
        await replyTelegram(chatId, `❌ Không tìm thấy mã khách hàng <code>${escHtml(upper)}</code> trong CRM.`);
        return res.status(200).json({ ok: true });
      }
      const cust = custRows[0];
      const codes = await sb('GET', 'access_codes', { q: `customer_id=eq.${encodeURIComponent(cust.id)}&order=created_at.desc&limit=10` });
      await replyTelegram(chatId, formatCustomerDetail(cust, codes || []));
      return res.status(200).json({ ok: true });
    }

    // ── TRA CỨU THEO SĐT HOẶC TÊN ──
    const cleanDigits = text.replace(/[^0-9]/g, '');
    let searchQ = '';
    if (cleanDigits.length >= 8) {
      searchQ = `phone=ilike.*\${cleanDigits}*&limit=5`;
    } else if (text.length >= 2) {
      searchQ = `name=ilike.*\${encodeURIComponent(text)}*&limit=5`;
    }

    if (searchQ) {
      const custRows = await sb('GET', 'customers', { q: searchQ });
      if (custRows?.length) {
        if (custRows.length === 1) {
          const cust = custRows[0];
          const codes = await sb('GET', 'access_codes', { q: `customer_id=eq.${encodeURIComponent(cust.id)}&order=created_at.desc&limit=5` });
          await replyTelegram(chatId, formatCustomerDetail(cust, codes || []));
        } else {
          const resultLines = [
            `🔍 <b>TÌM THẤY ${custRows.length} KHÁCH HÀNG:</b>`,
            DIVIDER,
          ];
          for (const c of custRows) {
            resultLines.push(
              `• <b>${escHtml(c.name)}</b> (<code>${escHtml(c.customer_code)}</code>)` +
              (c.phone ? ` - 📞 <code>${escHtml(c.phone)}</code>` : '') +
              ` - Gói: ${normalizePackage(c.package)}`
            );
          }
          resultLines.push(DIVIDER);
          resultLines.push('💡 <i>Gõ mã KH cụ thể ở trên để xem đầy đủ chi tiết mã truy cập.</i>');
          await replyTelegram(chatId, resultLines.join('\n'));
        }
        return res.status(200).json({ ok: true });
      }
    }

    // Phản hồi mặc định nếu không khớp
    await replyTelegram(chatId, `❓ Không tìm thấy dữ liệu phù hợp với "<b>${escHtml(text)}</b>".\n\n💡 Bạn có thể gửi: Mã <code>XW-xxxxxx</code>, Mã <code>KH-xxxxxxxx</code>, Số điện thoại hoặc Tên khách hàng.`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[telegram-bot] error:', err.message);
    return res.status(200).json({ ok: false, error: err.message });
  }
};
