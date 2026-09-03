'use strict';
const { sb, requireAdmin, allowMethods, sweepExpiredCodes, getAppConfig } = require('../_lib/utils');
const telegramBotHandler = require('../_lib/telegram-bot');

module.exports = async (req, res) => {
  // Webhook Telegram Bot (POST /api/admin/stats)
  if (req.method === 'POST') {
    return telegramBotHandler(req, res);
  }

  if (!allowMethods(req, res, ['GET'])) return;

  // Cron ping
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (isCron) {
    try {
      await sb('GET', 'customers', { q: 'select=id&limit=1' });
      const expired = await sweepExpiredCodes();
      return res.json({ ok: true, source: 'cron', expired });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!await requireAdmin(req, res)) return;

  try {
    const now40s = new Date(Date.now() - 40000).toISOString();
    const [customers, codes, completed, sessions, devModeCfg] = await Promise.all([
      sb('GET', 'customers',    { q: 'select=id' }),
      sb('GET', 'access_codes', { q: 'select=id' }),
      sb('GET', 'access_codes', { q: 'completed_at=not.is.null&select=id' }),
      sb('GET', 'sessions',     { q: `is_kicked=eq.false&last_ping=gt.${encodeURIComponent(now40s)}&select=id` }),
      getAppConfig('dev_mode'),
    ]);
    return res.json({
      customers: customers?.length ?? 0,
      codes:     codes?.length     ?? 0,
      completed: completed?.length ?? 0,
      sessions:  sessions?.length  ?? 0,
      dev_mode: devModeCfg?.active === true,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
