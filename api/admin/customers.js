'use strict';
const { sb, requireAdmin, allowMethods, genCode, checkAndNotifyDnsExpiry, PRIVATE_DNS_TTL_MS, normalizePackage, isPermPackage, getAppstoreConfig, setAppConfig, DEFAULT_DNS_TEMPLATE, getDnsTemplate, resolveDnsWithTemplate, parseContactInput } = require('../_lib/utils');


module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET', 'POST', 'DELETE', 'PATCH'])) return;
  if (!await requireAdmin(req, res)) return;

  const { id, q, action, code_id } = req.query || {};

  try {
    // ── GET ?action=dns_template_get — Lấy mẫu URL DNS tự hiểu hiện tại ──
    if (req.method === 'GET' && action === 'dns_template_get') {
      const tmpl = await getDnsTemplate();
      return res.json({ ok: true, template: tmpl, default_template: DEFAULT_DNS_TEMPLATE });
    }

    // ── POST ?action=dns_template_set — Cập nhật mẫu URL DNS tự hiểu ──
    if (req.method === 'POST' && action === 'dns_template_set') {
      const { template } = req.body || {};
      const t = String(template || '').trim();
      if (!t) return res.status(400).json({ error: 'Mẫu DNS không được để trống' });
      await setAppConfig('dns_template', { template: t });
      return res.json({ ok: true, template: t, message: '✓ Đã lưu cấu hình mẫu DNS tự hiểu' });
    }


    // ── GET ?action=appstore_get — đọc cấu hình tài khoản Appstore ─────
    // Trả password THẬT cho admin (khác với guide/validate?action=appstore, chỗ đó
    // trả cho khách nên không cần che — nhưng vẫn không log/hiện ra chỗ khác).
    if (req.method === 'GET' && action === 'appstore_get') {
      const cfg = await getAppstoreConfig();
      return res.json(cfg);
    }

    // ── POST ?action=appstore_update — sửa tài khoản Appstore / IPA / video ─
    // Merge từng field có gửi lên, field không gửi giữ nguyên giá trị cũ (setAppConfig
    // tự merge). Cho phép sửa từng phần (ví dụ chỉ đổi password) mà không cần gửi lại
    // toàn bộ form.
    if (req.method === 'POST' && action === 'appstore_update') {
      const body = req.body || {};
      const fields = {};
      for (const k of ['email', 'password', 'ipa_url', 'video_shadowrocket', 'video_locket']) {
        if (body[k] !== undefined) fields[k] = String(body[k] || '').trim();
      }
      const merged = await setAppConfig('appstore', fields);
      return res.json({ ok: true, config: merged });
    }

    // ── POST ?action=dns_create — tạo link DNS riêng cho 1 khách hàng ──
    // Gói 180 giờ được chấp nhận (map về '15s' theo dnsPoolKey) vì gói 180 cũng
    // có bước DNS. ublockdns_url vẫn giữ nguyên '' (default cột) — code dnsPrivateUrl
    // ưu tiên nextdns_url nên không cần xoá cột cũ, link cũ đang trong tay khách vẫn hoạt động.
    // 2026-08-25: Tự động hiểu mã ngắn theo Mẫu DNS (dns_template) hoặc giữ nguyên URL đầy đủ.
    if (req.method === 'POST' && action === 'dns_create') {
      const { customer_code, nextdns_url, nextdns_email, nextdns_password, package: pkg } = req.body || {};
      if (!customer_code || !nextdns_url) return res.status(400).json({ error: 'Thiếu mã KH hoặc link DNS' });

      // Chấp nhận URL đầy đủ (bất kỳ host nào) HOẶC shorthand theo mẫu DNS tự hiểu
      const { releaseCustomerFromDnsPool } = require('../_lib/utils');
          await releaseCustomerFromDnsPool(customer_code);
          const rawUrl = String(nextdns_url).trim();
      const activeTemplate = await getDnsTemplate();
      const resolvedUrl = resolveDnsWithTemplate(rawUrl, activeTemplate);
      if (!resolvedUrl) {
        return res.status(400).json({ error: 'Link DNS không đúng định dạng — dán URL đầy đủ hoặc mã ngắn hợp lệ' });
      }

      // Gói: '30k', '40k'
      const p = normalizePackage(pkg || '30k');

      // BẮT BUỘC mã KH phải tồn tại thật trong customers (theo yêu cầu chốt trước).
      const custs = await sb('GET', 'customers', { q: `customer_code=eq.${encodeURIComponent(customer_code)}&select=id,name` });
      if (!custs?.length) return res.status(404).json({ error: 'Không tìm thấy mã khách hàng này' });

      const token = genCode('DNS', 8);
      await sb('POST', 'private_dns_links', {
        body: {
          token,
          customer_code,
          ublockdns_url: resolvedUrl,
          dashboard_key: '',
          nextdns_url: resolvedUrl,
          nextdns_email: String(nextdns_email || '').trim(),
          nextdns_password: String(nextdns_password || '').trim(),
          package: p,
        },
        prefer: 'return=minimal',
      });

      // Tự động giải phóng slot trong dns_pool của khách này để chừa chỗ cho người khác
      try {
        const custCodes = (await sb('GET', 'access_codes', { q: `customer_id=eq.${encodeURIComponent(custs[0].id)}&select=code` })) || [];
        const allCodesToRemove = new Set([customer_code, ...custCodes.map(c => c.code)].filter(Boolean));
        const poolRows = (await sb('GET', 'dns_pool', { q: 'select=id,used_codes' })) || [];
        for (const row of poolRows) {
          if (Array.isArray(row.used_codes) && row.used_codes.some(c => allCodesToRemove.has(c))) {
            const updatedUsed = row.used_codes.filter(c => !allCodesToRemove.has(c));
            await sb('PATCH', 'dns_pool', {
              q: `id=eq.${encodeURIComponent(row.id)}`,
              body: { used_codes: updatedUsed },
            });
          }
        }
      } catch (poolErr) {
        console.warn('Lỗi dọn dns_pool khi tạo DNS riêng:', poolErr.message);
      }

      return res.json({ ok: true, token });
    }

    // ── PATCH ?action=dns_update_creds&id=... — sửa lại thông tin DNS của link ─
    // Đổi tên từ dns_update_key (ublockdns) sang dns_update_creds (NextDNS).
    // Cho phép sửa từng phần: chỉ gửi field nào muốn thay, field không gửi giữ nguyên.
    // 2026-08-25: Tự động hiểu mã ngắn theo Mẫu DNS (dns_template) hoặc giữ nguyên URL đầy đủ.
    if (req.method === 'PATCH' && action === 'dns_update_creds') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = req.body || {};
      const patch = {};
      if (body.nextdns_url !== undefined) {
        const rawUrl = String(body.nextdns_url).trim();
        const activeTemplate = await getDnsTemplate();
        const resolvedUrl = resolveDnsWithTemplate(rawUrl, activeTemplate);
        if (!resolvedUrl) {
          return res.status(400).json({ error: 'Link DNS không đúng định dạng — dán URL đầy đủ hoặc mã ngắn hợp lệ' });
        }
        patch.nextdns_url = resolvedUrl;
        patch.ublockdns_url = resolvedUrl;
      }
      if (body.nextdns_email !== undefined) patch.nextdns_email = String(body.nextdns_email).trim();
      if (body.nextdns_password !== undefined) patch.nextdns_password = String(body.nextdns_password).trim();
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'Không có field nào để cập nhật' });
      await sb('PATCH', 'private_dns_links', { q: `id=eq.${encodeURIComponent(id)}`, body: patch });
      return res.json({ ok: true });
    }

    // ── PATCH ?action=dns_reactivate&id=... — hồi sinh 1 link đã hết hạn ─
    // TTL chỉ 10 phút (PRIVATE_DNS_TTL_MS) nên khách thao tác chậm là mất link.
    // Thay vì bắt admin tạo link MỚI (khách phải nhận link khác qua Zalo, dễ nhầm
    // link cũ/mới), action này reset chính link đang có: xoá first_accessed_at về
    // null → status quay lại 'unopened', TTL 10 phút đếm lại từ lần khách mở kế
    // tiếp (không phải từ bây giờ — khách có thể mở sau vài phút vẫn đủ 10 phút).
    // Xoá luôn expired_notified_at để lần hết hạn sau vẫn báo Telegram được
    // (checkAndNotifyDnsExpiry bỏ qua row đã có expired_notified_at).
    // CỐ Ý chỉ nhận đúng 1 `id` — không làm hàng loạt, tránh admin bấm 1 nút reset
    // sạch TTL của mọi khách. Token/ublockdns_url/dashboard_key giữ nguyên 100%.
    if (req.method === 'PATCH' && action === 'dns_reactivate') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const rows = await sb('PATCH', 'private_dns_links', {
        q: `id=eq.${encodeURIComponent(id)}`,
        body: { first_accessed_at: null, expired_notified_at: null },
        prefer: 'return=representation',
      });
      if (!rows?.length) return res.status(404).json({ error: 'Không tìm thấy link DNS này' });
      return res.json({ ok: true, token: rows[0].token, customer_code: rows[0].customer_code });
    }

    // ── DELETE ?action=dns_delete&id=... — xoá vĩnh viễn 1 link DNS riêng ─
    // Dùng để dọn các link cũ/hết hạn không còn dùng. Hành động không hoàn tác:
    // token mất vĩnh viễn, khách không truy cập được nữa qua link đó.
    if (req.method === 'DELETE' && action === 'dns_delete') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sb('DELETE', 'private_dns_links', { q: `id=eq.${encodeURIComponent(id)}` });
      return res.json({ ok: true });
    }

    // ── GET ?action=dns_list — danh sách link DNS riêng đã tạo ────────
    if (req.method === 'GET' && action === 'dns_list') {
      const rows = await sb('GET', 'private_dns_links', { q: `order=created_at.desc&limit=100` }) || [];
      // Check-lười: admin mở tab này cũng là 1 nguồn "chạm vào row" để bắt hết hạn
      // kịp báo Telegram, phòng trường hợp khách tắt máy không bao giờ mở lại link.
      await Promise.all(rows.map(checkAndNotifyDnsExpiry));
      const now = Date.now();
      const withStatus = rows.map(r => {
        let status = 'unopened';
        if (r.first_accessed_at) {
          const elapsed = now - new Date(r.first_accessed_at).getTime();
          status = elapsed > PRIVATE_DNS_TTL_MS ? 'expired' : 'active';
        }
        return { ...r, status };
      });
      return res.json(withStatus);
    }

    // ── GET ?action=dns_pool_list — pool link DNS MẶC ĐỊNH (dùng chung) ─
    // Khác hẳn dns_list ở trên: dns_list là link RIÊNG từng khách (private_dns_links,
    // TTL 10 phút), còn đây là link dùng chung hiện ở bước DNS mặc định của guide.html,
    // mỗi link phục vụ tối đa max_uses (5) MÃ KHÁCH rồi admin phải thêm link mới.
    // Trả kèm used = số mã đã dùng để admin biết còn bao nhiêu suất trước khi cạn.
    if (req.method === 'GET' && action === 'dns_pool_list') {
      const rows = await sb('GET', 'dns_pool', { q: `order=created_at.desc&limit=100` }) || [];
      const withUse = rows.map(r => {
        const used = Array.isArray(r.used_codes) ? r.used_codes : [];
        const max = r.max_uses || 5;
        return { ...r, used: used.length, max, is_full: used.length >= max };
      });
      return res.json(withUse);
    }

    // ── POST ?action=dns_pool_add — thêm link vào pool DNS mặc định ──
    // Thêm link mới KHÔNG tự tắt link cũ: claimDnsFromPool luôn lấy row mới nhất
    // (order=created_at.desc&limit=1) nên link vừa thêm tự động thành link đang dùng,
    // còn link cũ giữ lại để tra lịch sử "khách nào đã nhận link nào" khi cần hỗ trợ.
    // 2026-08-25: Tự động hiểu mã ngắn theo Mẫu DNS (dns_template) hoặc giữ nguyên URL đầy đủ.
    // Yêu cầu #5: hỗ trợ bulk add — body.urls[] (mảng nhiều link) hoặc body.dns_url (1 link, backward compat).
    if (req.method === 'POST' && action === 'dns_pool_add') {
      const { dns_url, urls, package: pkg, max_uses } = req.body || {};

      // Chuẩn hoá danh sách URL: ưu tiên mảng urls[], fallback singular dns_url cho tương thích
      const rawList = Array.isArray(urls) ? urls.map(s => String(s || '').trim()).filter(Boolean)
        : dns_url ? [String(dns_url).trim()] : [];
      if (!rawList.length) return res.status(400).json({ error: 'Thiếu link DNS' });

      // Chỉ có 2 nhóm pool: '5s' và '15s' (gói 40k dùng chung nhóm '15s' — xem dnsPoolKey).
      const p = (String(pkg || '').trim() === '40k' || String(pkg || '').trim() === '15s') ? '15s' : '5s';
      const maxU = Math.max(1, Math.min(50, parseInt(max_uses, 10) || 5));

      const activeTemplate = await getDnsTemplate();
      const resolved = [];
      const failed = [];
      for (const raw of rawList) {
        const r = resolveDnsWithTemplate(raw, activeTemplate);
        if (r) {
          resolved.push(r);
        } else {
          failed.push({ url: raw, reason: 'định dạng sai' });
        }
      }

      // Insert tuần tự (pool nhỏ, không đáng để batch phức tạp). Supabase REST POST
      // với prefer:return=representation trả về row vừa insert.
      let added = 0;
      for (const url of resolved) {
        try {
          await sb('POST', 'dns_pool', {
            body: { package: p, dns_url: url, max_uses: maxU },
            prefer: 'return=minimal',
          });
          added++;
        } catch (e) {
          failed.push({ url, reason: e.message || 'lỗi DB' });
        }
      }

      // Backward compat: nếu gọi kiểu cũ (singular dns_url), trả shape cũ {ok, row}.
      // Gọi kiểu mới (urls[]) trả {added, failed}.
      if (!Array.isArray(urls) && dns_url) {
        if (failed.length) return res.status(400).json({ error: failed[0].reason });
        return res.json({ ok: true, row: null });
      }
      return res.json({ added, failed });
    }

    // ── PATCH ?action=dns_pool_toggle&id=... — bật/tắt 1 link trong pool ─
    // Tắt (is_active=false) để loại link hỏng/bị chặn khỏi vòng luân phiên mà không
    // xoá dữ liệu used_codes (còn tra được khách nào đã nhận link đó). Bật lại được.
    if (req.method === 'PATCH' && action === 'dns_pool_toggle') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const isActive = !!(req.body || {}).is_active;
      const rows = await sb('PATCH', 'dns_pool', {
        q: `id=eq.${encodeURIComponent(id)}`,
        body: { is_active: isActive },
        prefer: 'return=representation',
      });
      if (!rows?.length) return res.status(404).json({ error: 'Không tìm thấy link pool này' });
      return res.json({ ok: true, is_active: rows[0].is_active });
    }

    // ── DELETE ?action=dns_pool_delete&id=... — xoá hẳn 1 link khỏi pool ─
    if (req.method === 'DELETE' && action === 'dns_pool_delete') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sb('DELETE', 'dns_pool', { q: `id=eq.${encodeURIComponent(id)}` });
      return res.json({ ok: true });
    }

    // ── PATCH ?action=dns_pool_remove_customer&id=... — gỡ 1 mã KH khỏi pool link ─
    // Dùng khi khách cũ dùng ublockdns bị lỗi → admin gỡ mã họ khỏi link ublockdns cũ
    // → lần sau mở guide.html, claimDnsFromPool không thấy mã ở link cũ nữa → gán
    // vào link NextDNS mới đang active trong pool (tính +1 khách). Nếu link NextDNS đó
    // đã đủ 5 khách thì hệ thống tự chặn tạo mã mới (pool full check).
    // Supabase REST hỗ trợ filter mảng bằng `not.used_codes.cs.{value}` nhưng chỉ cho
    // query SELECT, không cho UPDATE. Nên phải GET trước rồi PATCH với mảng mới.
    if (req.method === 'PATCH' && action === 'dns_pool_remove_customer') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { customer_code } = req.body || {};
      if (!customer_code) return res.status(400).json({ error: 'Thiếu mã khách hàng' });
      const cc = String(customer_code).trim();

      // Lấy row hiện tại để có used_codes chính xác
      const rows = await sb('GET', 'dns_pool', { q: `id=eq.${encodeURIComponent(id)}&select=id,used_codes` }) || [];
      if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy link pool này' });
      const currentCodes = Array.isArray(rows[0].used_codes) ? rows[0].used_codes : [];
      if (!currentCodes.includes(cc)) return res.status(404).json({ error: `Mã "${cc}" không nằm trong link pool này` });

      const newCodes = currentCodes.filter(c => c !== cc);
      await sb('PATCH', 'dns_pool', {
        q: `id=eq.${encodeURIComponent(id)}`,
        body: { used_codes: newCodes },
      });
      return res.json({ ok: true, removed: cc, remaining: newCodes.length });
    }

    // ── PATCH ?action=expire ───────────────────────────────────────
    if (req.method === 'PATCH' && action === 'expire') {
      if (!code_id) return res.status(400).json({ error: 'Missing code_id' });
      const codes = await sb('GET', 'access_codes', { q: `id=eq.${code_id}&select=code` }) || [];
      const code = codes[0]?.code;
      if (code) {
        await sb('PATCH', 'sessions', { q: `access_code=eq.${code}`, body: { is_kicked: true } });
      }
      await sb('PATCH', 'access_codes', {
        q: `id=eq.${code_id}`,
        body: { is_active: false, expires_at: new Date().toISOString() },
      });
      return res.json({ ok: true });
    }

    // ── PATCH ?action=update&id=... ────────────────────────────────
    if (req.method === 'PATCH' && (action === 'update' || !action)) {
      const targetId = id || req.body?.id;
      if (!targetId) return res.status(400).json({ error: 'Missing id' });
      const { name, contact, phone, social_platform, social_link, notes, type, service_status, locket_username, package: pkg, duration, special_flow, deposit_note } = req.body || {};
      let finalPhone = phone;
      let finalPlatform = social_platform;
      let finalLink = social_link;
      if (contact !== undefined && phone === undefined && social_link === undefined) {
        const parsed = parseContactInput(contact);
        finalPhone = parsed.phone;
        finalPlatform = parsed.social_platform;
        finalLink = parsed.social_link;
      }

      // Kiểm tra nếu chuyển từ pending_gold → active, cần set warranty_started_at
      const [current] = await sb('GET', 'customers', { q: `id=eq.${targetId}&select=*` }) || [];
        if (!current) return res.status(404).json({ error: 'Customer not found' });
        let needSetWarrantyStart = false;
        let warrantyStartVal = null;
        if (service_status === 'active') {
          if (current && current.service_status === 'pending_gold' && !current.warranty_started_at) {
          needSetWarrantyStart = true;
          const finalType = type !== undefined ? type : current.type;
          const finalPkg = pkg !== undefined ? normalizePackage(pkg) : current.package;
          const finalDur = duration !== undefined ? duration : current.duration;
          warrantyStartVal = new Date().toISOString();
        }
      }

      if (special_flow === true) {
        const finalPkg = pkg !== undefined ? normalizePackage(pkg) : current.package;
        const { getAppstoreConfig } = require('../_lib/utils');
        const cfg = await getAppstoreConfig();
        if (!cfg.email || !cfg.password) {
          return res.status(400).json({ error: 'Không thể bật Flow Đặc Biệt: Nguồn tài khoản Appstore thủ công đang trống. Vui lòng cập nhật tài khoản và mật khẩu ở tab Appstore trước!' });
        }
      }
        
      const finalPkg2 = pkg !== undefined ? normalizePackage(pkg) : current.package;
      const finalSf2 = special_flow !== undefined ? special_flow : current.special_flow;
      const oldConfig = (current.package === '30k' && current.special_flow) ? null : ((current.package === '40k' || current.package === '15s' || current.package === '180') ? '15s' : '5s');
      const newConfig = (finalPkg2 === '30k' && finalSf2) ? null : ((finalPkg2 === '40k' || finalPkg2 === '15s' || finalPkg2 === '180') ? '15s' : '5s');
          
          if (current && oldConfig !== newConfig) {
          const { releaseCustomerFromDnsPool } = require('../_lib/utils');
          await releaseCustomerFromDnsPool(current.customer_code);
          // NEW: Đổi tên customer_code để THU HỒI Private DNS thay vì xóa. 
          // Việc này giúp khách cũ rớt về Pool 15s (vì không còn khớp mã), nhưng Admin vẫn giữ được thông tin tài khoản DNS Riêng để tái sử dụng cho khách khác.
          await sb('PATCH', 'private_dns_links', { 
            q: `customer_code=eq.${encodeURIComponent(current.customer_code)}`,
            body: { customer_code: `[THU HỒI] ${current.customer_code}` }
          }).catch(()=>{});
        }
        
        const updateBody = {};
      if (name !== undefined)            updateBody.name = name;
      if (finalPhone !== undefined)           updateBody.phone = finalPhone || null;
      if (finalPlatform !== undefined)        updateBody.social_platform = finalPlatform;
      if (finalLink !== undefined)            updateBody.social_link = finalLink || null;
      if (notes !== undefined)           updateBody.notes = notes || null;
      if (type !== undefined)            updateBody.type = type;
      if (service_status !== undefined)  updateBody.service_status = service_status;
      if (locket_username !== undefined) updateBody.locket_username = locket_username || null;
      if (pkg !== undefined)             updateBody.package = normalizePackage(pkg);
      if (duration !== undefined && ['3m', '6m', '1y', 'perm'].includes(duration)) updateBody.duration = duration;
      if (special_flow !== undefined)    updateBody.special_flow = !!special_flow;
      if (deposit_note !== undefined)    updateBody.deposit_note = deposit_note || null;
      if (needSetWarrantyStart && warrantyStartVal) updateBody.warranty_started_at = warrantyStartVal;

      await sb('PATCH', 'customers', { q: `id=eq.${targetId}`, body: updateBody });

      // Cập nhật hoặc cấp mới tài khoản DNS riêng (1 người 1 tài khoản cho gói 180 / flow đặc biệt)
      const { nextdns_url, nextdns_email, nextdns_password } = req.body || {};
      if (nextdns_url !== undefined && String(nextdns_url).trim()) {
        const [cust] = (await sb('GET', 'customers', { q: `id=eq.${id}&select=customer_code,package` })) || [];
        if (cust) {
          const rawUrl = String(nextdns_url).trim();
          const activeTemplate = await getDnsTemplate();
          const resolvedUrl = resolveDnsWithTemplate(rawUrl, activeTemplate);
          if (resolvedUrl) {
            const existingDns = await sb('GET', 'private_dns_links', { q: `customer_code=eq.${encodeURIComponent(cust.customer_code)}&order=created_at.desc&limit=1` });
            if (existingDns && existingDns.length) {
              const dnsPatch = { nextdns_url: resolvedUrl, ublockdns_url: resolvedUrl };
              if (nextdns_email !== undefined) dnsPatch.nextdns_email = String(nextdns_email).trim();
              if (nextdns_password !== undefined) dnsPatch.nextdns_password = String(nextdns_password).trim();
              await sb('PATCH', 'private_dns_links', { q: `id=eq.${encodeURIComponent(existingDns[0].id)}`, body: dnsPatch });
            } else {
              const token = genCode('DNS', 8);
              await sb('POST', 'private_dns_links', {
                body: {
                  token,
                  customer_code: cust.customer_code,
                  ublockdns_url: resolvedUrl,
                  dashboard_key: '',
                  nextdns_url: resolvedUrl,
                  nextdns_email: String(nextdns_email || '').trim(),
                  nextdns_password: String(nextdns_password || '').trim(),
                  package: cust.package || '40k',
                },
                prefer: 'return=minimal',
              });
            }
          }
        }
      }

      return res.json({ ok: true });
    }

    // ── DELETE ?id=... ─────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing id' });
      
      // 1. Lấy customer_code và các access_codes của khách này
      const [cust] = (await sb('GET', 'customers', { q: `id=eq.${id}&select=customer_code` })) || [];
      const custCode = cust?.customer_code;
      const codes = (await sb('GET', 'access_codes', { q: `customer_id=eq.${id}&select=code` })) || [];
      const codeStrings = codes.map(c => c.code).filter(Boolean);
      const allCodesToRemove = new Set([custCode, ...codeStrings].filter(Boolean));

      // Giải phóng DNS Riêng thành [THU HỒI] để tái sử dụng
        if (custCode) {
          await sb('PATCH', 'private_dns_links', { 
            q: `customer_code=eq.${encodeURIComponent(custCode)}`,
            body: { customer_code: `[THU HỒI] ${custCode}` }
          }).catch(()=>{});
        }
        
        // 2. Tự động xoá khách khỏi tất cả các link trong dns_pool để nhả slot cho khách khác
      if (allCodesToRemove.size > 0) {
        try {
          const poolRows = (await sb('GET', 'dns_pool', { q: 'select=id,used_codes' })) || [];
          for (const row of poolRows) {
            if (Array.isArray(row.used_codes) && row.used_codes.some(c => allCodesToRemove.has(c))) {
              const updatedUsed = row.used_codes.filter(c => !allCodesToRemove.has(c));
              await sb('PATCH', 'dns_pool', {
                q: `id=eq.${encodeURIComponent(row.id)}`,
                body: { used_codes: updatedUsed },
              });
            }
          }
        } catch (poolErr) {
          console.warn('Lỗi dọn dns_pool khi xoá customer:', poolErr.message);
        }
      }

      // 3. Dọn sessions, access_codes và customers
      if (codes.length) {
        const codeList = codes.map(c => `"${c.code}"`).join(',');
        await sb('DELETE', 'sessions', { q: `access_code=in.(${codeList})` });
      }
      await sb('DELETE', 'access_codes', { q: `customer_id=eq.${id}` });
      await sb('DELETE', 'customers', { q: `id=eq.${id}` });
      return res.json({ ok: true });
    }

    // ── GET ?action=codes → tất cả mã + thông tin khách ───────────
    if (req.method === 'GET' && action === 'codes') {
      const [allCodes, allCustomers] = await Promise.all([
        sb('GET', 'access_codes', { q: `order=created_at.desc` }),
        sb('GET', 'customers',    { q: `select=id,name,phone,customer_code,type,service_status,special_flow` }),
      ]);
      const custMap = {};
      (allCustomers || []).forEach(c => { custMap[c.id] = c; });
      let result = (allCodes || []).map(c => ({ ...c, customer: custMap[c.customer_id] || null }));
      if (q) {
        const ql = q.toLowerCase();
        result = result.filter(c =>
          c.code?.toLowerCase().includes(ql) ||
          c.customer?.name?.toLowerCase().includes(ql) ||
          c.customer?.customer_code?.toLowerCase().includes(ql) ||
          c.customer?.phone?.includes(q)
        );
      }
      return res.json(result);
    }

    // ── GET ?id=... → chi tiết 1 khách ────────────────────────────
    if (req.method === 'GET' && id) {
      const custRows = await sb('GET', 'customers', { q: `id=eq.${id}` });
      if (!custRows?.length) return res.status(404).json({ error: 'Not found' });
      let customer = custRows[0];
      const [codes, privateDns] = await Promise.all([
        sb('GET', 'access_codes', { q: `customer_id=eq.${id}&order=created_at.desc` }),
        sb('GET', 'private_dns_links', { q: `customer_code=eq.${encodeURIComponent(customer.customer_code)}&order=created_at.desc&limit=1` }),
      ]);

      // Lấy thời gian hoàn thành mã đầu tiên của khách (order by created_at.asc có completed_at)
      const completedCodes = (codes || []).filter(c => c.completed_at).sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      customer.first_code_completed_at = completedCodes[0]?.completed_at || null;

      // Tự động đồng bộ: Khách gói 150/180 đã có mã completed_at thì tự động chuyển sang 'active'
      const hasCompletedCode = completedCodes.length > 0;
      if (hasCompletedCode && customer.service_status === 'pending_gold' && isPermPackage(customer.package)) {
        customer.service_status = 'active';
        if (!customer.warranty_started_at) {
          customer.warranty_started_at = new Date().toISOString();
        }
        sb('PATCH', 'customers', {
          q: `id=eq.${id}`,
          body: { service_status: 'active', warranty_started_at: customer.warranty_started_at }
        }).catch(() => {});
      }

      return res.json({ customer, codes: codes || [], private_dns: privateDns?.[0] || null });
    }

    // ── GET → danh sách khách ──────────────────────────────────────
    let query = 'order=created_at.desc';
    if (q) {
      const esc = encodeURIComponent(q);
      query += `&or=(name.ilike.*${esc}*,phone.ilike.*${esc}*,customer_code.ilike.*${esc}*)`;
    }

    // Tối ưu hóa: Fetch đồng thời customers, private_dns_links và completed access_codes song song bằng Promise.all
    const [customersRes, dnsRowsRes, completedCodesRes] = await Promise.all([
      sb('GET', 'customers', { q: query }),
      sb('GET', 'private_dns_links', { q: 'select=customer_code,first_accessed_at' }).catch(() => []),
      sb('GET', 'access_codes', { q: 'completed_at=not.is.null&select=customer_id,completed_at,created_at&order=created_at.asc' }).catch(() => []),
    ]);
    const customers = customersRes || [];
    const dnsRows = dnsRowsRes || [];
    const completedSet = new Set((completedCodesRes || []).map(r => r.customer_id));

    // Map thời gian hoàn thành mã truy cập đầu tiên của mỗi khách
    const firstCompletedMap = {};
    (completedCodesRes || []).forEach(r => {
      if (!r.customer_id || !r.completed_at) return;
      if (!firstCompletedMap[r.customer_id]) {
        firstCompletedMap[r.customer_id] = r.completed_at;
      }
    });

    const dnsCount = {};
    dnsRows.forEach(r => {
      if (!r.customer_code) return;
      const k = r.customer_code;
      if (!dnsCount[k]) dnsCount[k] = { total: 0, opened: 0 };
      dnsCount[k].total++;
      if (r.first_accessed_at) dnsCount[k].opened++;
    });

    const resultList = customers.map(c => {
      const d = dnsCount[c.customer_code];
      const hasCompleted = completedSet.has(c.id);
      let status = c.service_status;
      if (hasCompleted && status === 'pending_gold' && isPermPackage(c.package)) {
        status = 'active';
        const startVal = c.warranty_started_at || new Date().toISOString();
        sb('PATCH', 'customers', {
          q: `id=eq.${c.id}`,
          body: { service_status: 'active', warranty_started_at: startVal }
        }).catch(() => {});
      }
      return { 
        ...c, 
        service_status: status,
        first_code_completed_at: firstCompletedMap[c.id] || null,
        has_private_dns: !!d, 
        private_dns_count: d?.total || 0, 
        private_dns_opened: d?.opened || 0 
      };
    });

    res.json(resultList);

  } catch (e) { res.status(500).json({ error: e.message }); }
};
