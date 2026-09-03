const { sb, requireAdmin, allowMethods, resolveDnsWithTemplate, getDnsTemplate, releaseCustomerFromDnsPool } = require('../_lib/utils');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const action = req.query.action;

  // Lấy mẫu DNS Template
  if (action === 'dns_template_get') {
    const tmpl = await getDnsTemplate();
    return res.status(200).json({ template: tmpl });
  }
  // Lưu mẫu DNS Template
  if (action === 'dns_template_set') {
    const { template } = req.body || {};
    await sb('app_config', { method: 'POST', body: { key: 'dns_template', value: { template }, updated_at: new Date().toISOString() }, headers: { 'Prefer': 'resolution=merge-duplicates' } });
    return res.status(200).json({ ok: true });
  }

  // Danh sách Link DNS Riêng
  if (action === 'dns_list') {
    const list = await sb('private_dns_links?order=created_at.desc');
    return res.status(200).json(list || []);
  }

  // Tạo Link DNS Riêng
  if (action === 'dns_create') {
    const { customer_code, nextdns_url, package: pkg, nextdns_email, nextdns_password } = req.body || {};
    if (!customer_code || !nextdns_url) return res.status(400).json({ error: 'Thiếu thông tin' });

    const tmpl = await getDnsTemplate();
    const resolvedUrl = resolveDnsWithTemplate(nextdns_url, tmpl);
    const token = crypto.randomBytes(16).toString('hex');

    await sb('private_dns_links', {
      method: 'POST',
      body: {
        token,
        customer_code,
        package: pkg || '5s',
        nextdns_url: resolvedUrl,
        ublockdns_url: resolvedUrl,
        dashboard_key: '',
        nextdns_email: nextdns_email || '',
        nextdns_password: nextdns_password || '',
        status: 'unopened'
      }
    });

    await releaseCustomerFromDnsPool(customer_code);
    return res.status(200).json({ ok: true, token });
  }

  // Hồi sinh TTL DNS Riêng
  if (action === 'dns_reactivate') {
    const id = req.query.id;
    await sb(`private_dns_links?id=eq.${id}`, { method: 'PATCH', body: { status: 'unopened', first_accessed_at: null, expires_at: null } });
    return res.status(200).json({ ok: true });
  }

  // Xóa Link DNS Riêng
  if (action === 'dns_delete') {
    const id = req.query.id;
    await sb(`private_dns_links?id=eq.${id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  // DNS Pool Actions
  if (action === 'dns_pool_list') {
    const rows = await sb('dns_pool?order=created_at.asc');
    return res.status(200).json(rows || []);
  }
  if (action === 'dns_pool_add') {
    const { urls, package: pkg, max_uses } = req.body || {};
    const tmpl = await getDnsTemplate();
    let added = 0;
    for (const u of (urls || [])) {
      const resolved = resolveDnsWithTemplate(u, tmpl);
      await sb('dns_pool', {
        method: 'POST',
        body: { package: pkg || '5s', dns_url: resolved, max: max_uses || 5, used: 0, used_codes: [], is_active: true }
      });
      added++;
    }
    return res.status(200).json({ ok: true, added });
  }
  if (action === 'dns_pool_toggle') {
    const id = req.query.id;
    await sb(`dns_pool?id=eq.${id}`, { method: 'PATCH', body: { is_active: req.body.is_active } });
    return res.status(200).json({ ok: true });
  }
  if (action === 'dns_pool_delete') {
    const id = req.query.id;
    await sb(`dns_pool?id=eq.${id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }
  if (action === 'dns_pool_remove_customer') {
    const id = req.query.id;
    const { customer_code } = req.body || {};
    const pRows = await sb(`dns_pool?id=eq.${id}`);
    if (pRows && pRows.length) {
      const r = pRows[0];
      const nextCodes = (r.used_codes || []).filter(c => c !== customer_code);
      await sb(`dns_pool?id=eq.${id}`, { method: 'PATCH', body: { used_codes: nextCodes, used: nextCodes.length, is_full: false } });
    }
    return res.status(200).json({ ok: true });
  }

  // Khách hàng CRUD (Không có trường type)
  if (req.method === 'GET') {
    const id = req.query.id;
    if (id) {
      const custs = await sb(`customers?id=eq.${id}&select=*,access_codes(*)`);
      return res.status(200).json(custs && custs[0] ? custs[0] : null);
    }
    const [custs, privates] = await Promise.all([
      sb('customers?order=created_at.desc'),
      sb('private_dns_links?select=customer_code')
    ]);
    const privateSet = new Set((privates || []).map(p => p.customer_code));
    const result = (custs || []).map(c => ({ ...c, has_private_dns: privateSet.has(c.customer_code) }));
    return res.status(200).json(result);
  }

  if (req.method === 'PATCH') {
    const id = req.query.id || req.body.id;
    const allowed = ['name', 'phone', 'social_platform', 'social_link', 'notes', 'package', 'special_flow', 'deposit_note', 'locket_username'];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await sb(`customers?id=eq.${id}`, { method: 'PATCH', body: patch });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body.id;
    const cRows = await sb(`customers?id=eq.${id}&select=customer_code`);
    if (cRows && cRows.length) {
      const cc = cRows[0].customer_code;
      await releaseCustomerFromDnsPool(cc);
      await sb(`private_dns_links?customer_code=eq.${encodeURIComponent(cc)}`, { method: 'PATCH', body: { customer_code: `[THU HỒI] - ${cc}` } });
    }
    await sb(`customers?id=eq.${id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
