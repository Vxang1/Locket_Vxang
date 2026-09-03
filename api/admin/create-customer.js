const { sb, requireAdmin, allowMethods, genCode, dnsPoolHasCapacity, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { name, contact, phone, social_platform, social_link, notes, package: pkg, special_flow } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Thiếu tên khách hàng' });

  // Tự động phân giải contact input (ô duy nhất) nếu gửi lên
  let finalPhone = (phone || '').trim();
  let finalLink = (social_link || '').trim();
  let finalPlatform = social_platform || 'zalo';

  if (contact && !phone && !social_link) {
    const rawContact = String(contact).trim();
    if (/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(rawContact) || /facebook|fb\.com|zalo\.me|t\.me/i.test(rawContact)) {
      finalLink = /^https?:\/\//i.test(rawContact) ? rawContact : 'https://' + rawContact;
      if (/facebook|fb\.com/i.test(rawContact)) finalPlatform = 'facebook';
      else if (/t\.me|telegram/i.test(rawContact)) finalPlatform = 'telegram';
      else finalPlatform = 'zalo';
      const m = rawContact.match(/zalo\.me\/(0[0-9]{9})/);
      if (m) finalPhone = m[1];
    } else {
      const cleanDigits = rawContact.replace(/[^0-9+]/g, '');
      if (cleanDigits.length >= 8) {
        finalPhone = cleanDigits.replace(/^\+84/, '0');
        finalLink = `https://zalo.me/${finalPhone}`;
        finalPlatform = 'zalo';
      }
    }
  }

  const cleanPkg = (pkg === '40k' || pkg === '15s') ? '40k' : '30k';

  // Chống double submit trong 120s
  const twoMinsAgo = new Date(Date.now() - 120000).toISOString();
  const dup = await sb(`customers?name=eq.${encodeURIComponent(name.trim())}&created_at=gt.${twoMinsAgo}&select=id`);
  if (dup && dup.length) return res.status(429).json({ error: 'Khách hàng này vừa được tạo, vui lòng đợi giây lát' });

  // Kiểm tra sức chứa DNS Pool nếu luồng cần DNS (Flow 30k đặc biệt không cần DNS)
  const needsDns = !(cleanPkg === '30k' && special_flow === true);
  if (needsDns && !await dnsPoolHasCapacity(cleanPkg)) {
    return res.status(503).json({ error: `DNS pool cho gói ${cleanPkg} đã đầy! Vui lòng thêm link mới.` });
  }

  const custCode = 'KH-' + Math.floor(1000000 + Math.random() * 9000000);
  const accCode = genCode('XW-');

  const custPayload = {
    customer_code: custCode,
    name: name.trim(),
    phone: finalPhone,
    social_platform: finalPlatform,
    social_link: finalLink,
    notes: (notes || '').trim(),
    package: cleanPkg,
    duration: 'perm',
    service_status: 'pending_gold',
    deposit_note: cleanPkg === '40k' ? 'Chờ thu 40k' : 'Chờ thu 30k',
    special_flow: !!special_flow
  };

  const newCust = await sb('customers', { method: 'POST', body: custPayload, headers: { 'Prefer': 'return=representation' } });
  if (!newCust || !newCust.length) return res.status(500).json({ error: 'Không thể tạo khách hàng' });

  const custId = newCust[0].id;
  await sb('access_codes', {
    method: 'POST',
    body: {
      customer_id: custId,
      code: accCode,
      is_active: true,
      status: 'pending'
    }
  });

  notifyTelegram(`🌟 *KHÁCH HÀNG MỚI ĐƯỢC TẠO*\n───────────────\n👤 Tên: *${escMd(name.trim())}*\n🏷️ Mã KH: \`${escMd(custCode)}\`\n🔑 Mã truy cập: \`${escMd(accCode)}\`\n📦 Gói: *${escMd(cleanPkg)}*`);

  return res.status(200).json({ ok: true, customer_id: custId, customer_code: custCode, access_code: accCode });
};
