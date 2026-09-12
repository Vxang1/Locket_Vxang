'use strict';
const { sb, requireAdmin, allowMethods, genCode, PRICING, isPermPackage, parseContactInput, createVpnToken, getOrCreatePrivateDns } = require('../_lib/utils');

// Chống double-submit: admin bấm nút "Tạo" 2 lần liên tiếp (double-click, mạng
// chậm chưa kịp disable nút) tạo ra 2 khách hàng trùng dữ liệu. Chặn khi có khách
// cùng tên + cùng SĐT được tạo trong DUP_WINDOW_MS gần nhất. Chỉ áp dụng khi có
// SĐT — nếu để trống thì không so trùng (nhiều khách không có SĐT sẽ đụng nhau oan).
const DUP_WINDOW_MS = 2 * 60 * 1000; // 2 phút

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;
  const { name, contact, phone, social_platform, social_link, notes, package: pkg, duration } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Missing name' });

  // Tự động phân giải contact input (ô duy nhất) nếu được truyền lên
  let parsedContact = {};
  if (contact !== undefined && (!phone || !social_link)) {
    parsedContact = parseContactInput(contact);
  }
  const finalPhone = (phone !== undefined ? phone : (parsedContact.phone || '')).trim();
  const finalLink = (social_link !== undefined ? social_link : (parsedContact.social_link || '')).trim();
  const finalPlatform = social_platform || parsedContact.social_platform || 'zalo';
  if (!PRICING[pkg]) return res.status(400).json({ error: 'Missing or invalid package (30k|40k)' });
  const validDurations = ['perm'];
  if (!validDurations.includes(duration)) return res.status(400).json({ error: `Missing or invalid duration (${validDurations.join('|')})` });

  try {
    const phoneTrim = finalPhone;
    if (phoneTrim) {
      const since = new Date(Date.now() - DUP_WINDOW_MS).toISOString();
      const dupes = await sb('GET', 'customers', {
        q: `name=eq.${encodeURIComponent(name)}&phone=eq.${encodeURIComponent(phoneTrim)}` +
           `&created_at=gt.${encodeURIComponent(since)}&select=id,customer_code&limit=1`,
      });
      if (dupes?.length) {
        return res.status(409).json({
          error: `Đã tạo khách "${name}" (${phoneTrim}) cách đây chưa đầy 2 phút — mã KH ${dupes[0].customer_code}. Có thể do bấm nhầm 2 lần.`,
        });
      }
    }
    const customer_code = genCode('KH-', 8);
    const access_code   = genCode('VX-', 6);

    const cleanPkg = (pkg === '40k' || pkg === '15s' || pkg === '180') ? '40k' : '30k';
    const depositNote = cleanPkg === '40k' ? 'Chờ thu 40k' : 'Chờ thu 30k';
    const [cust] = await sb('POST', 'customers', {
      body: {
        name,
        phone: finalPhone || null,
        social_platform: finalPlatform,
        social_link: finalLink || null,
        notes: notes || null,
        customer_code,
        package: pkg,
        duration,
        service_status: 'pending_gold',
        deposit_note: depositNote,
      },
      prefer: 'return=representation',
    });
    await sb('POST', 'access_codes', {
      body: { customer_id: cust.id, code: access_code, is_active: true },
      prefer: 'return=minimal',
    });

    let vpn_token = null;
    if (cleanPkg === '40k') {
      vpn_token = await createVpnToken(cust.id, customer_code).catch(() => null);
    }

    // Kiểm tra khách cũ (theo SĐT hoặc Social Link) nếu khách đổi máy mua lại từ đầu
    let existingCustCode = null;
    if (finalPhone || finalLink) {
      const orFilter = [];
      if (finalPhone) orFilter.push(`phone.eq.${encodeURIComponent(finalPhone)}`);
      if (finalLink) orFilter.push(`social_link.eq.${encodeURIComponent(finalLink)}`);
      const existingCusts = await sb('GET', 'customers', {
        q: `id=neq.${cust.id}&or=(${orFilter.join(',')})&order=created_at.desc&limit=1&select=customer_code,package`
      }).catch(() => []);
      if (existingCusts && existingCusts.length) {
        existingCustCode = existingCusts[0].customer_code;
      }
    }

    // Tự động khởi tạo xong NextDNS riêng 1:1 trước khi trả về (không để delay khi vào guide)
    let dns_token = null;
    let dns_url = null;
    try {
      const dnsRes = await getOrCreatePrivateDns(customer_code, pkg, { existingCustCode });
      if (dnsRes && dnsRes.ok) {
        dns_token = dnsRes.token;
        dns_url = dnsRes.dns_url;
      }
    } catch (dnsErr) {
      console.error('[create-customer] DNS generation error:', dnsErr.message);
    }

    res.json({ customer_code, access_code, customer_id: cust.id, vpn_token, dns_token, dns_url });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
