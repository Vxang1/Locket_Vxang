'use strict';
const { sb, requireAdmin, allowMethods, sweepExpiredCodes } = require('../_lib/utils');
const { handleTelegramWebhook } = require('../_lib/telegram-bot');

module.exports = async (req, res) => {
  // Webhook Telegram Bot Hợp Nhất (POST /api/admin/stats)
  if (req.method === 'POST') {
    return handleTelegramWebhook(req, res);
  }

  if (!allowMethods(req, res, ['GET'])) return;

  // 🤖 Vercel Cron bypass — chỉ cần ping Supabase để tránh auto-pause
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (isCron) {
    // Chỉ cần 1 query nhẹ để giữ Supabase tỉnh
    try {
      await sb('GET', 'customers', { q: 'select=id&limit=1' });
      // Lưới hứng chậm cho mã hết hạn mà khách đã tắt máy (không còn ping nào chạy
      // expireCodeAndNotify). Tự nuốt lỗi bên trong nên không làm hỏng nhiệm vụ
      // chính của cron là giữ Supabase khỏi auto-pause.
      const expired = await sweepExpiredCodes();
      return res.json({ ok: true, source: 'cron', expired });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Normal admin request ──────────────────────────────────────
  if (!await requireAdmin(req, res)) return;
  try {
    const now25s = new Date(Date.now() - 25000).toISOString();
    const { getAppConfig } = require('../_lib/utils');
    const [customers, codes, completed, sessions, devModeCfg] = await Promise.all([
      sb('GET', 'customers',    { q: 'select=id' }).catch(() => []),
      sb('GET', 'access_codes', { q: 'select=id' }).catch(() => []),
      sb('GET', 'access_codes', { q: 'completed_at=not.is.null&select=id' }).catch(() => []),
      sb('GET', 'sessions',     { q: `is_kicked=eq.false&last_ping=gt.${encodeURIComponent(now25s)}&select=id` }).catch(() => []),
      getAppConfig('dev_mode').catch(() => null),
    ]);
    res.json({
      customers: customers?.length ?? 0,
      codes:     codes?.length     ?? 0,
      completed: completed?.length ?? 0,
      sessions:  sessions?.length  ?? 0,
      dev_mode: devModeCfg?.active === true,
    });
  } catch (e) {
    console.error('[stats error]', e);
    res.json({ customers: 0, codes: 0, completed: 0, sessions: 0, dev_mode: false });
  }
};
