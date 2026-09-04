'use strict';
const { sb, requireGuide, allowMethods, expireCodeAndNotify, notifyTelegram, escTgHtml, lookupCustomerByCode, buildStepFlow, alignStepFlow, PACKAGES } = require('../_lib/utils');

const SURPRISE_DELAY_MS  = 5  * 1000; // 5s đầu im lặng — tạo bất ngờ
const DESTRUCT_AFTER_MS  = 20 * 1000; // tổng 20s kể từ lúc phát hiện thì tự huỷ hẳn (5s im lặng + 15s đọc thông báo)

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  // Parse body sớm (giữ pattern cũ dù hiện chỉ còn dùng currentStep/step3Choice/username).
  let body = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch {}

  try {
    const [sessions, codes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      }),
      sb('GET', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}`,
      }),
    ]);
    const session = sessions?.[0];
    if (!session || session.is_kicked) return res.json({ kicked: true });

    const codeRow = codes?.[0];
    if (!codeRow || !codeRow.is_active) return res.json({ expired: true });

    // ⌛ Mã quá 30 phút mà khách chưa bấm hoàn thành. Trước đây ping bỏ qua trường hợp
    // này (chỉ xét is_active) nên mã hết hạn vẫn ping tiếp; giờ khoá mã + báo Telegram
    // đúng 1 lần rồi văng khách, khớp với validate.js (đã chặn mã hết hạn từ đầu).
    // Đây là đường nhanh: đa số mã hết hạn được phát hiện ngay ở ping kế tiếp.
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      await expireCodeAndNotify(codeRow);
      await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` });
      return res.json({ expired: true });
    }

    // 🚨 Kiểm tra trạng thái "bẫy" — dùng chung cho mọi thiết bị của mã này
    if (codeRow.fraud_triggered_at) {
      const elapsed = Date.now() - new Date(codeRow.fraud_triggered_at).getTime();

      if (elapsed >= DESTRUCT_AFTER_MS) {
        // Hết giờ — tự huỷ vĩnh viễn, văng TẤT CẢ thiết bị
        await sb('PATCH', 'access_codes', {
          q: `id=eq.${codeRow.id}`,
          body: { is_active: false },
        });
        await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` });
        return res.json({ expired: true, fraud_final: true });
      }

      if (elapsed >= SURPRISE_DELAY_MS) {
        // 5s-20s: đồng loạt cảnh báo, đếm ngược 15 giây để đọc kịp thông báo
        const secondsLeft = Math.max(0, Math.ceil((DESTRUCT_AFTER_MS - elapsed) / 1000));
        return res.json({
          fraud_warning: true,
          is_original: session.is_original !== false,
          seconds_left: secondsLeft,
        });
      }
      // elapsed < 5s — vẫn trong "vùng yên lặng", ping như thường, không lộ gì cả
    }

    const updateData = { last_ping: new Date().toISOString() };
    if (typeof body.currentStep === 'number') updateData.current_step = body.currentStep;
    if (body.step3Choice) updateData.step_choice = body.step3Choice;
    if (typeof body.totalSteps === 'number') updateData.total_steps = body.totalSteps;

    await sb('PATCH', 'sessions', {
      q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      body: updateData,
    });

    // 👣 Thông báo Telegram khi khách CHUYỂN BƯỚC — ví dụ "khách đang làm bước 2 (cài Locket
    // IPA) cho gói 180k". Chỉ bắn khi currentStep thật sự đổi so với lần ping trước
    // (tránh spam mỗi 4s), và bỏ qua chuyển null→0 vì đó là lần kích hoạt đầu — validate.js
    // đã bắn tin 🚀 riêng rồi. Bọc try/catch để lỗi Telegram không phá luồng ping của khách;
    // notifyTelegram tự nuốt lỗi mạng nên await an toàn (Vercel đóng băng instance nếu không
    // await — xem CLAUDE.md §3.8).
    if (typeof body.currentStep === 'number' && typeof body.totalSteps === 'number') {
      const prevStep = session?.current_step;
      const newStep  = body.currentStep;
      if (prevStep !== null && prevStep !== undefined && prevStep !== newStep) {
        try {
          const pkg = payload.package || '30k';
          const cust = await lookupCustomerByCode(payload.code);
          const stepsRows = await sb('GET', 'guide_steps', {
            q: `or=(package.eq.${encodeURIComponent(pkg)},package.is.null)&order=order_num.asc`,
          });
          const flow = buildStepFlow(pkg, stepsRows, !!cust?.specialFlow);
          const aligned = alignStepFlow(flow, body.totalSteps);
          const label = (aligned && aligned[newStep]) || `Bước ${newStep + 1}`;
          const name = escTgHtml(cust?.name || 'Khách');
          const pkgLabel = PACKAGES[pkg]?.label || pkg;
          await notifyTelegram(
            `👣 <b>${name}</b> đang làm bước ${newStep + 1}/${body.totalSteps} (${escTgHtml(label)}) — ${escTgHtml(pkgLabel)}`
          );
        } catch {}
      }
    }

    // 💾 Lưu username (chỉ lưu khi chưa có)
    if (body.username && typeof body.username === 'string') {
      const username = body.username.trim();
      if (username) {
        const codeRows = await sb('GET', 'access_codes', {
          q: `code=eq.${encodeURIComponent(payload.code)}&select=customer_id`,
        });
        const customerId = codeRows?.[0]?.customer_id;
        if (customerId) {
          const custs = await sb('GET', 'customers', {
            q: `id=eq.${customerId}&select=locket_username`,
          });
          if (!custs?.[0]?.locket_username) {
            await sb('PATCH', 'customers', {
              q: `id=eq.${customerId}`,
              body: { locket_username: username },
            });
          }
        }
      }
    }

    // 🧹 Dọn session rác (fire-and-forget)
    const cutoff = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    sb('DELETE', 'sessions', {
      q: `last_ping=lt.${encodeURIComponent(cutoff)}&is_kicked=eq.false`,
    }).catch(() => {});

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
