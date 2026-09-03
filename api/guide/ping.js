'use strict';
const { sb, requireGuide, allowMethods, expireCodeAndNotify, notifyTelegram, escTgHtml, lookupCustomerByCode, buildStepFlow, alignStepFlow, PACKAGES } = require('../_lib/utils');

const SURPRISE_DELAY_MS  = 5  * 1000; // 5s đầu im lặng
const DESTRUCT_AFTER_MS  = 20 * 1000; // 20s tổng tự hủy nếu share mã

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

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

    // Mã hết hạn
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      await expireCodeAndNotify(codeRow);
      await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` });
      return res.json({ expired: true });
    }

    // Kiểm tra bẫy chống share mã
    if (codeRow.fraud_triggered_at) {
      const elapsed = Date.now() - new Date(codeRow.fraud_triggered_at).getTime();

      if (elapsed >= DESTRUCT_AFTER_MS) {
        await sb('PATCH', 'access_codes', {
          q: `id=eq.${codeRow.id}`,
          body: { is_active: false },
        });
        await sb('DELETE', 'sessions', { q: `access_code=eq.${encodeURIComponent(payload.code)}` });
        return res.json({ expired: true, fraud_final: true });
      }

      if (elapsed >= SURPRISE_DELAY_MS) {
        const secondsLeft = Math.max(0, Math.ceil((DESTRUCT_AFTER_MS - elapsed) / 1000));
        return res.json({
          fraud_warning: true,
          is_original: session.is_original !== false,
          seconds_left: secondsLeft,
        });
      }
    }

    const updateData = { last_ping: new Date().toISOString() };
    if (typeof body.currentStep === 'number') updateData.current_step = body.currentStep;
    if (body.step3Choice) updateData.step_choice = body.step3Choice;
    if (typeof body.totalSteps === 'number') updateData.total_steps = body.totalSteps;

    await sb('PATCH', 'sessions', {
      q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}`,
      body: updateData,
    });

    // Thông báo chuyển bước
    if (typeof body.currentStep === 'number' && typeof body.totalSteps === 'number') {
      const prevStep = session?.current_step;
      const newStep  = body.currentStep;
      if (prevStep !== null && prevStep !== undefined && prevStep !== newStep) {
        try {
          const pkg = payload.package || '30k';
          const cust = await lookupCustomerByCode(payload.code);
          const flow = buildStepFlow(pkg, null, !!cust?.specialFlow);
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

    return res.json({ ok: true });
  } catch (e) {
    console.error('[guide/ping] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
