'use strict';
const { sb, requireGuide, allowMethods, expireCodeAndNotify, notifyTelegram, escTgHtml, lookupCustomerByCode, codeDetailLines, buildStepFlow, alignStepFlow, PACKAGES, fbGet, fbPut } = require('../_lib/utils');

const SURPRISE_DELAY_MS  = 5  * 1000; // 5s đầu im lặng — tạo bất ngờ
const DESTRUCT_AFTER_MS  = 20 * 1000; // tổng 20s kể từ lúc phát hiện thì tự huỷ hẳn (5s im lặng + 15s đọc thông báo)

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  // Parse body sớm (nhận currentStep, totalSteps, step3Choice, deviceId).
  let body = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch {}

  // 🚪 Hỗ trợ action 'leave' (Trụ Cột 3 & 4): Khi khách đóng tab / rời trang, beacon giải phóng nhịp tim tức thì (0ms)
  if (body.action === 'leave') {
    const pastIso = new Date(Date.now() - 30 * 1000).toISOString();
    await Promise.all([
      fbPut(`heartbeats/${payload.code}/${payload.sessionToken}`, null).catch(() => {}),
      sb('PATCH', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
        body: { last_ping: pastIso }
      }).catch(() => {})
    ]);
    return res.json({ ok: true });
  }

  try {
    const [sessions, codes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      }),
      sb('GET', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}`,
      }),
    ]);
    let session = sessions?.[0];
    if (!session) {
      try {
        const [newSess] = await sb('POST', 'sessions', {
          body: {
            access_code: payload.code,
            session_token: payload.sessionToken,
            current_step: typeof body.currentStep === 'number' ? body.currentStep : 0,
            last_ping: new Date().toISOString(),
            is_kicked: false,
            is_original: payload.isOriginal !== false,
            device_id: body.deviceId || null,
          },
          prefer: 'return=representation'
        });
        session = newSess || { access_code: payload.code, session_token: payload.sessionToken, is_kicked: false, is_original: payload.isOriginal !== false };
      } catch {
        session = { access_code: payload.code, session_token: payload.sessionToken, is_kicked: false, is_original: payload.isOriginal !== false };
      }
    }
    if (session.is_kicked) return res.json({ kicked: true });

    const codeRow = codes?.[0];
    if (!codeRow || !codeRow.is_active) return res.json({ expired: true });

    // ⌛ Mã quá 30 phút mà khách chưa bấm hoàn thành
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      await expireCodeAndNotify(codeRow);
      await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` });
      return res.json({ expired: true });
    }

    // 🚨 Kiểm tra trạng thái "bẫy" — dùng chung cho mọi thiết bị của mã này (qua Supabase hoặc Firebase)
    let fraudTriggeredAt = codeRow.fraud_triggered_at;
    let fbFraud = null;
    try {
      fbFraud = await fbGet(`fraud/${payload.code}`);
      if (fbFraud?.fraud_triggered_at && !fraudTriggeredAt) {
        fraudTriggeredAt = fbFraud.fraud_triggered_at;
      }
    } catch {}

    if (fraudTriggeredAt) {
      // 🛡️ TRỤ CỘT 4: BỘ ĐỆM CHỐNG BẮT OAN & TỰ PHỤC HỒI NGUYÊN TRẠNG (AUTO-RECOVERY)
      // Kiểm tra xem thiết bị phụ đã tắt / ngừng ping chưa:
      const threshold12s = new Date(Date.now() - 12 * 1000).toISOString();
      const myDev = body.deviceId || session?.device_id || '';
      let activeOtherSessions = [];
      try {
        const rows = await sb('GET', 'sessions', {
          q: `access_code=eq.${encodeURIComponent(payload.code)}&last_ping=gte.${encodeURIComponent(threshold12s)}`,
        });
        activeOtherSessions = (rows || []).filter(s => {
          if (!s || s.session_token === payload.sessionToken || s.is_kicked === true) return false;
          return myDev ? (s.device_id !== myDev) : true;
        });
      } catch {}

      let fbStillConcurrent = false;
      try {
        const hbs = await fbGet(`heartbeats/${payload.code}`);
        if (hbs && typeof hbs === 'object') {
          const nowMs = Date.now();
          for (const [sTok, hb] of Object.entries(hbs)) {
            if (sTok !== payload.sessionToken && hb && hb.last_ping) {
              const diff = nowMs - new Date(hb.last_ping).getTime();
              if (diff < 12000 && (!myDev || !hb.device_id || hb.device_id !== myDev)) {
                fbStillConcurrent = true;
                break;
              }
            }
          }
        }
      } catch {}

      if (!activeOtherSessions.length && !fbStillConcurrent) {
        // ✨ THIẾT BỊ PHỤ ĐÃ TẮT -> TỰ ĐỘNG PHỤC HỒI NGUYÊN TRẠNG!
        await fbPut(`fraud/${payload.code}`, null).catch(() => {});
        try {
          await sb('PATCH', 'access_codes', {
            q: `id=eq.${codeRow.id}`,
            body: { fraud_triggered_at: null },
          });
        } catch {}

        fraudTriggeredAt = null;

        // Báo Admin trên Telegram: Tự phục hồi an toàn
        try {
          const cust = await lookupCustomerByCode(payload.code);
          const who = cust.name ? escTgHtml(cust.name) : 'Khách';
          await notifyTelegram(
            `✅ <b>${who}</b> đã đóng thiết bị phụ — Hệ thống tự động phục hồi an toàn!\n` +
            codeDetailLines(payload.code, payload.package, cust) + '\n' +
            `Mã truy cập tiếp tục hoạt động bình thường.`
          );
        } catch {}
      } else {
        const elapsed = Date.now() - new Date(fraudTriggeredAt).getTime();

        if (elapsed >= DESTRUCT_AFTER_MS) {
          // Hết giờ (20s) — tự huỷ vĩnh viễn, văng TẤT CẢ thiết bị
          await sb('PATCH', 'access_codes', {
            q: `id=eq.${codeRow.id}`,
            body: { is_active: false },
          }).catch(() => {});
          await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` }).catch(() => {});
          await fbPut(`fraud/${payload.code}/destroyed`, true).catch(() => {});
          return res.json({ expired: true, fraud_final: true });
        }

        if (elapsed >= SURPRISE_DELAY_MS) {
          // 5s-20s: đồng loạt cảnh báo, đếm ngược 15 giây để đọc kịp thông báo
          const secondsLeft = Math.max(0, Math.ceil((DESTRUCT_AFTER_MS - elapsed) / 1000));
          const isOriginal = (payload.isOriginal !== false) && (session?.is_original !== false);
          return res.json({
            fraud_warning: true,
            is_original: isOriginal,
            seconds_left: secondsLeft,
          });
        }
        // elapsed < 5s — vẫn trong "vùng yên lặng", ping như thường, không lộ gì cả
      }
    }

    const nowIso = new Date().toISOString();
    const myDeviceId = body.deviceId || session?.device_id || '';
    const updateData = { last_ping: nowIso };
    if (typeof body.currentStep === 'number') updateData.current_step = body.currentStep;
    if (body.step3Choice) updateData.step_choice = body.step3Choice;
    if (typeof body.totalSteps === 'number') updateData.total_steps = body.totalSteps;
    if (myDeviceId) updateData.device_id = myDeviceId;

    try {
      await sb('PATCH', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
        body: updateData,
      });
    } catch (sErr) {
      await sb('PATCH', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
        body: {
          last_ping: nowIso,
          ...(typeof body.currentStep === 'number' ? { current_step: body.currentStep } : {})
        },
      }).catch(() => {});
    }

    // Cập nhật nhịp tim Firebase để theo dõi concurrent realtime
    await fbPut(`heartbeats/${payload.code}/${payload.sessionToken}`, {
      device_id: myDeviceId,
      last_ping: nowIso,
      is_original: payload.isOriginal !== false && session?.is_original !== false,
    }).catch(() => {});

    if (payload.isOriginal !== false && session?.is_original !== false && myDeviceId) {
      await fbPut(`code_ownership/${payload.code}`, {
        device_id: myDeviceId,
        last_ping: nowIso,
      }).catch(() => {});
    }

    // 🚨 BẪY PHÁT HIỆN GIAN LẬN: Kiểm tra xem có thiết bị khác đang cùng PING song song (< 12s)
    if (!fraudTriggeredAt) {
      const threshold12s = new Date(Date.now() - 12 * 1000).toISOString();
      let otherSessions = [];
      try {
        const activeSessions = (await sb('GET', 'sessions', {
          q: `access_code=eq.${encodeURIComponent(payload.code)}&last_ping=gte.${encodeURIComponent(threshold12s)}`,
        })) || [];
        otherSessions = (activeSessions || []).filter(s => {
          if (!s || s.session_token === payload.sessionToken || s.is_kicked === true) return false;
          return (myDeviceId && s.device_id) ? (s.device_id !== myDeviceId) : true;
        });
      } catch {
        otherSessions = [];
      }

      // Kiểm tra thêm qua Firebase heartbeats
      let fbConcurrent = false;
      try {
        const hbs = await fbGet(`heartbeats/${payload.code}`);
        if (hbs && typeof hbs === 'object') {
          const nowMs = Date.now();
          for (const [sTok, hb] of Object.entries(hbs)) {
            if (sTok !== payload.sessionToken && hb && hb.last_ping) {
              const diff = nowMs - new Date(hb.last_ping).getTime();
              if (diff < 12000 && (!myDeviceId || !hb.device_id || hb.device_id !== myDeviceId)) {
                fbConcurrent = true;
                break;
              }
            }
          }
        }
      } catch {}

      if (otherSessions.length > 0 || fbConcurrent) {
        // 🚨 KÍCH HOẠT BẪY GIAN LẬN!
        await fbPut(`fraud/${payload.code}`, {
          fraud_triggered_at: nowIso,
          original_device_id: myDeviceId || 'device-1',
          detected_by: payload.sessionToken,
        }).catch(() => {});

        try {
          await sb('PATCH', 'access_codes', {
            q: `id=eq.${codeRow.id}`,
            body: { fraud_triggered_at: nowIso },
          });
        } catch {}

        const cust = await lookupCustomerByCode(payload.code);
        const who = cust.name ? escTgHtml(cust.name) : 'Khách';
        const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Không xác định').split(',')[0].trim();
        await notifyTelegram(
          `🚨 <b>${who}</b> đang share mã\n` +
          codeDetailLines(payload.code, payload.package, cust) + '\n' +
          `⚠️ IP gian lận: <code>${escTgHtml(clientIp)}</code>\n` +
          `Phát hiện 2 thiết bị khác nhau đang cùng truy cập mã song song — mã sẽ tự khoá sau 20 giây.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔓 Mở khóa ngay (Đặc xá)', callback_data: `unblock_code:${payload.code}` },
                  { text: '🔍 Tra cứu mã', callback_data: `lookup_code:${codeRow.id}` }
                ]
              ]
            }
          }
        );
      }
    }

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

    // 🧹 Dọn session rác (fire-and-forget)
    const cutoff = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    sb('DELETE', 'sessions', {
      q: `last_ping=lt.${encodeURIComponent(cutoff)}&is_kicked=eq.false`,
    }).catch(() => {});

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
