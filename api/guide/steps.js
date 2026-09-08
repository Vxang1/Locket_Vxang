'use strict';
const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) return;
  const payload = await requireGuide(req, res);
  if (!payload) return;

  try {
    const pkg = payload.package || '30k';

    // Kiểm tra phiên bị kick và mã truy cập còn hiệu lực
    const [sessions, codeRows, stepsRes] = await Promise.all([
      sb('GET', 'sessions', {
        q: `session_token=eq.${encodeURIComponent(payload.sessionToken)}&select=id,is_kicked`,
      }),
      sb('GET', 'access_codes', {
        q: `code=eq.${encodeURIComponent(payload.code)}&select=is_active,expires_at`,
      }),
      sb('GET', 'guide_steps', {
        q: `or=(package.eq.${pkg},package.is.null)&order=order_num.asc`,
      }).catch(() => []),
    ]);

    if (sessions?.length && sessions[0].is_kicked) {
      return res.status(403).json({ error: 'Phiên đã bị kết thúc bởi quản trị viên' });
    }

    const codeRow = codeRows?.[0];
    if (codeRow) {
      if (codeRow.is_active === false) {
        return res.status(403).json({ error: 'Mã truy cập đã bị vô hiệu hoá' });
      }
      if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() <= Date.now()) {
        return res.status(403).json({ error: 'Mã truy cập đã hết hạn' });
      }
    }

    // Nếu session chưa có trong DB (khách quay lại sau khi chuyển app), tự động khôi phục
    if (!sessions?.length) {
      sb('POST', 'sessions', {
        body: {
          access_code: payload.code,
          session_token: payload.sessionToken,
          current_step: 0,
          last_ping: new Date().toISOString(),
          is_kicked: false,
          device_id: payload.deviceId || null,
          is_original: true,
        }
      }).catch(() => {});
    }

    const steps = (stepsRes || []).filter(s => s.step_type !== 'username' && s.type !== 'username');

    let vpnSubUrl = null;
    const norm = (pkg === '40k' || pkg === '15s' || pkg === '180') ? '40k' : '30k';
    if (norm === '40k' && payload.customerId) {
      const vpnRows = await sb('GET', 'vpn_tokens', {
        q: `customer_id=eq.${payload.customerId}&is_active=eq.true&select=token&limit=1`
      }).catch(() => []);
      if (vpnRows?.[0]?.token) {
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'locketvxang.vercel.app';
        const base = host ? `${proto}://${host}` : 'https://locketvxang.vercel.app';
        vpnSubUrl = `${base}/s/${vpnRows[0].token}`;
      }
    }

    res.json({
      steps,
      package: pkg,
      special_flow: !!payload.specialFlow,
      vpn_sub_url: vpnSubUrl
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
