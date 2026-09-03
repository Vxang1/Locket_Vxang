'use strict';
const { sb, requireGuide, allowMethods, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, normalizePackage } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  const { choice } = req.body || {};

  try {
    const updateBody = { completed_at: new Date().toISOString(), is_active: false };
    if (choice) updateBody.locket_choice = choice;

    const updated = await sb('PATCH', 'access_codes', {
      q: `code=eq.${encodeURIComponent(payload.code)}&is_active=eq.true&completed_at=is.null`,
      body: updateBody,
      prefer: 'return=representation',
    });

    if (!updated?.length) {
      await sb('DELETE', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      });
      return res.json({ ok: true });
    }

    await sb('DELETE', 'sessions', {
      q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
    });

    const cust = await lookupCustomerByCode(payload.code);
    const who = cust.name ? escTgHtml(cust.name) : 'Khách';
    const pkg = normalizePackage(payload.package || '30k');

    // Cập nhật CRM khách hàng thành active
    if (cust?.id) {
      try {
        await sb('PATCH', 'customers', {
          q: `id=eq.${encodeURIComponent(cust.id)}`,
          body: { service_status: 'active' },
        });
      } catch (crmErr) {
        console.warn('Lỗi cập nhật CRM khách hàng active:', crmErr.message);
      }
    }

    let extra = {};
    if (cust.customerCode) {
      extra.reply_markup = {
        inline_keyboard: [
          [{ text: '🔍 TRA CỨU KHÁCH NÀY', callback_data: `lookup_code:${payload.code}` }]
        ]
      };
    }

    await notifyTelegram(
      `🎉 <b>${who}</b> đã hoàn tất các bước cài đặt!\n` +
      codeDetailLines(payload.code, payload.package, cust) +
      (cust.phone ? `\n📞 SĐT: <code>${cust.phone}</code>` : ''),
      extra
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error('[guide/complete] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
