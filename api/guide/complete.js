'use strict';
const { sb, requireGuide, allowMethods, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, setAppConfig, normalizePackage, isPermPackage } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  const { choice } = req.body || {};

  try {
    const updateBody = { completed_at: new Date().toISOString(), is_active: false };
    if (choice) updateBody.locket_choice = choice;

    // PATCH có điều kiện + return=representation: chỉ request nào THỰC SỰ đổi được
    // dòng (mã đang is_active và chưa completed_at) mới coi là "mình là người hoàn
    // thành". Khách bấm "✓ Xác nhận" 2 lần liên tiếp (mạng chậm/double-tap) trước khi
    // nút bị khoá thì 2 request complete chạy song song — nếu PATCH không điều kiện,
    // cả 2 đều "thành công" và Telegram bị báo trùng 2 lần. Cùng pattern với
    // expireCodeAndNotify ở utils.js.
    let updated;
    try {
      updated = await sb('PATCH', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}&is_active=eq.true&completed_at=is.null`,
        body: updateBody,
        prefer: 'return=representation',
      });
    } catch (e1) {
      updated = await sb('PATCH', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}&is_active=eq.true&completed_at=is.null`,
        body: { completed_at: new Date().toISOString(), is_active: false },
        prefer: 'return=representation',
      });
    }

    if (!updated?.length) {
      // Request trùng/đua — dòng đã bị request khác PATCH trước rồi. Vẫn dọn session
      // (idempotent, không lỗi nếu đã bị xoá) và trả ok cho khách, KHÔNG gửi Telegram.
      await sb('DELETE', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      });
      return res.json({ ok: true });
    }

    await sb('DELETE', 'sessions', {
      q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
    });


    // Thông báo hoàn thành kèm nút bấm Inline tra cứu
    const cust = await lookupCustomerByCode(payload.code);
    const who = cust.name ? escTgHtml(cust.name) : 'Khách';
    const what = 'đã hoàn thành các bước cài đặt';
    const pkg = normalizePackage(payload.package || cust?.package || '30k');

    // Cập nhật CRM: service_status = 'active'
    if (cust?.id) {
      try {
        await sb('PATCH', 'customers', {
          q: `id=eq.${encodeURIComponent(cust.id)}`,
          body: { service_status: 'active', activated_at: new Date().toISOString() }
        });
      } catch (crmErr) {
        try {
          await sb('PATCH', 'customers', {
            q: `id=eq.${encodeURIComponent(cust.id)}`,
            body: { service_status: 'active' }
          });
        } catch {}
      }
    }

    const extra = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 TRA CỨU KHÁCH NÀY', callback_data: `lookup_code:${payload.code}` }]
        ]
      }
    };

    await notifyTelegram(
      `✅ <b>${who}</b> ${what}\n` +
      codeDetailLines(payload.code, payload.package, cust),
      extra
    );

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
