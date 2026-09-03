const { sb, escMd } = require('./utils');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function replyTelegram(chatId, text, extra = {}) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
        ...extra
      })
    });
  } catch (err) {
    console.error('replyTelegram error:', err);
  }
}

async function handleTelegramUpdate(body) {
  if (!body) return;
  const msg = body.message;
  if (!msg || !msg.text) return;

  const chatId = String(msg.chat.id);
  if (TELEGRAM_CHAT_ID && chatId !== String(TELEGRAM_CHAT_ID)) {
    await replyTelegram(chatId, '⛔ *Truy cập bị từ chối\\.* Bạn không có quyền điều khiển bot này\\.');
    return;
  }

  const text = msg.text.trim();

  // Lệnh /start hoặc /help
  if (text === '/start' || text === '/help') {
    const welcome = 
`⚡ *LOCKET\\_VXANG TELEGRAM BOT* ⚡
───────────────
Bot phục vụ thông báo và tra cứu CRM hệ thống Locket\\_Vxang\\.

🔍 *Cú pháp tra cứu nhanh:*
• Gõ mã truy cập: \`XW-ABC123\`
• Gõ mã khách hàng: \`KH-1234567\`
• Gõ số điện thoại hoặc tên khách hàng\\.

📊 *Lệnh thống kê:*
• \`/stats\` : Xem thống kê phiên live và số liệu tổng quan\\.`;
    await replyTelegram(chatId, welcome);
    return;
  }

  // Lệnh /stats
  if (text === '/stats') {
    try {
      const since40s = new Date(Date.now() - 40000).toISOString();
      const [customers, codes, completedCodes, activeSessions] = await Promise.all([
        sb('customers?select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb('access_codes?select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb('access_codes?completed_at=not.is.null&select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb(`sessions?last_ping=gt.${since40s}&select=id`)
      ]);
      const rep = 
`📊 *THỐNG KÊ HỆ THỐNG LOCKET\\_VXANG*
───────────────
👥 Tổng số khách: *${customers ? customers.length : 0}*
🎫 Tổng mã đã cấp: *${codes ? codes.length : 0}*
✅ Mã đã hoàn thành: *${completedCodes ? completedCodes.length : 0}*
🟢 Thiết bị đang online: *${activeSessions ? activeSessions.length : 0}*`;
      await replyTelegram(chatId, rep);
    } catch (e) {
      await replyTelegram(chatId, `❌ Lỗi tải thống kê: ${escMd(e.message)}`);
    }
    return;
  }

  // Tra cứu mã truy cập XW-xxxxxx
  if (/^XW-[A-Z0-9]{6}$/i.test(text)) {
    const codeVal = text.toUpperCase();
    try {
      const rows = await sb(`access_codes?code=eq.${codeVal}&select=*,customers(*)`);
      if (!rows || !rows.length) {
        await replyTelegram(chatId, `❌ Không tìm thấy mã truy cập *${escMd(codeVal)}*`);
        return;
      }
      const c = rows[0];
      const cust = c.customers || {};
      const statusMap = {
        'completed': '🟢 Đã hoàn thành',
        'active': '🔵 Đang cài đặt',
        'pending': '⚪ Chưa kích hoạt',
        'expired': '⚫ Đã hết hạn',
        'fraud': '🔴 Khóa do chia sẻ mã'
      };
      const statusTxt = statusMap[c.status] || c.status;
      const rep = 
`🎫 *THÔNG TIN MÃ TRUY CẬP*
───────────────
🔑 Mã: \`${escMd(c.code)}\`
📌 Trạng thái: *${escMd(statusTxt)}*
👤 Khách hàng: *${escMd(cust.name || '—')}* (\`${escMd(cust.customer_code || '—')}\`)
📦 Gói: *${escMd(cust.package === '40k' ? '15s Vĩnh viễn (40k)' : '5s Vĩnh viễn (30k)')}*
🕒 Tạo lúc: ${escMd(new Date(c.created_at).toLocaleString('vi-VN'))}
⚡ Kích hoạt: ${c.first_used_at ? escMd(new Date(c.first_used_at).toLocaleString('vi-VN')) : 'Chưa mở web'}
✅ Hoàn thành: ${c.completed_at ? escMd(new Date(c.completed_at).toLocaleString('vi-VN')) : 'Chưa xong'}`;
      await replyTelegram(chatId, rep);
    } catch (e) {
      await replyTelegram(chatId, `❌ Lỗi tra cứu: ${escMd(e.message)}`);
    }
    return;
  }

  // Tra cứu theo Mã KH (KH-xxxxxxx), SĐT hoặc Tên
  try {
    let custRows = [];
    if (/^KH-[A-Z0-9]+$/i.test(text)) {
      custRows = await sb(`customers?customer_code=eq.${text.toUpperCase()}&select=*`);
    } else if (/^[0-9+]{8,15}$/.test(text)) {
      custRows = await sb(`customers?phone=eq.${text}&select=*`);
    } else {
      custRows = await sb(`customers?name=ilike.*${encodeURIComponent(text)}*&select=*`);
    }

    if (!custRows || !custRows.length) {
      await replyTelegram(chatId, `🔍 Không tìm thấy hồ sơ nào khớp với: *${escMd(text)}*`);
      return;
    }

    const cust = custRows[0];
    const codes = await sb(`access_codes?customer_id=eq.${cust.id}&order=created_at.desc&select=*`);
    const codeLines = (codes || []).map(cd => {
      return `• \`${escMd(cd.code)}\` [${escMd(cd.status)}] (${escMd(new Date(cd.created_at).toLocaleDateString('vi-VN'))})`;
    }).join('\n') || 'Chưa cấp mã nào';

    const rep = 
`👤 *HỒ SƠ KHÁCH HÀNG*
───────────────
🏷️ Mã KH: \`${escMd(cust.customer_code)}\`
👤 Họ tên: *${escMd(cust.name)}*
📞 SĐT: ${escMd(cust.phone || '—')}
📦 Gói: *${escMd(cust.package === '40k' ? '15s Vĩnh viễn (40k)' : '5s Vĩnh viễn (30k)')}*
💰 Thanh toán: *${escMd(cust.deposit_note || 'Chờ thu tiền')}*
🛡️ Luồng: *${cust.special_flow ? 'Flow Đặc Biệt (IPA)' : 'Flow Thường (DNS)'}*
📱 Locket: ${cust.locket_username ? escMd(cust.locket_username) : 'Chưa có'}

🎫 *Lịch sử mã truy cập:*
${codeLines}`;

    await replyTelegram(chatId, rep);
  } catch (e) {
    await replyTelegram(chatId, `❌ Lỗi tra cứu: ${escMd(e.message)}`);
  }
}

module.exports = { replyTelegram, handleTelegramUpdate };
