'use strict';
const { sb, requireAdmin, allowMethods, genCode, normalizePackage, dnsPoolHasCapacity, parseContactInput, notifyTelegram, escTgHtml } = require('../_lib/utils');

const DUP_WINDOW_MS = 2 * 60 * 1000; // 2 phút

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!await requireAdmin(req, res)) return;

  const { name, contact, phone, social_platform, social_link, notes, package: rawPkg, special_flow } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Thiếu tên khách hàng' });

  // Tự động phân giải ô nhập liên hệ duy nhất
  let parsedContact = {};
  if (contact !== undefined && (!phone || !social_link)) {
    parsedContact = parseContactInput(contact);
  }
  const finalPhone = (phone !== undefined ? phone : (parsedContact.phone || '')).trim();
  const finalLink = (social_link !== undefined ? social_link : (parsedContact.social_link || '')).trim();
  const finalPlatform = social_platform || parsedContact.social_platform || 'zalo';

  const pkg = normalizePackage(rawPkg);
  const isSpecial = !!special_flow;

  // Kiểm tra sức chứa DNS Pool
  if (!await dnsPoolHasCapacity(pkg, null, isSpecial)) {
    return res.status(503).json({ error: 'DNS Pool cho gói này hiện đã đầy tất cả slot! Vui lòng thêm link DNS mới trước khi tạo khách.' });
  }

  try {
    if (finalPhone) {
      const since = new Date(Date.now() - DUP_WINDOW_MS).toISOString();
      const dupes = await sb('GET', 'customers', {
        q: `name=eq.${encodeURIComponent(name.trim())}&phone=eq.${encodeURIComponent(finalPhone)}&created_at=gt.${encodeURIComponent(since)}&select=id,customer_code&limit=1`,
      });
      if (dupes?.length) {
        return res.status(409).json({
          error: `Đã tạo khách "${name}" (${finalPhone}) cách đây chưa đầy 2 phút — mã KH ${dupes[0].customer_code}.`,
        });
      }
    }

    const customer_code = genCode('KH-', 8);
    const access_code   = genCode('XW-', 6);

    const custPayload = {
      name: name.trim(),
      phone: finalPhone || null,
      social_platform: finalPlatform,
      social_link: finalLink || null,
      notes: (notes || '').trim() || null,
      customer_code,
      package: pkg,
      duration: 'perm',
      service_status: 'pending_gold',
      deposit_note: 'Chờ thu tiền',
      special_flow: isSpecial,
    };

    const newCusts = await sb('POST', 'customers', {
      body: custPayload,
      prefer: 'return=representation',
    });

    if (!newCusts || !newCusts.length) {
      return res.status(500).json({ error: 'Không thể tạo hồ sơ khách hàng' });
    }

    const cust = newCusts[0];
    await sb('POST', 'access_codes', {
      body: {
        customer_id: cust.id,
        code: access_code,
        is_active: true,
      },
      prefer: 'return=minimal',
    });

    // Thông báo Telegram khách mới
    await notifyTelegram(
      `🌟 <b>KHÁCH HÀNG MỚI ĐƯỢC TẠO</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `👤 Tên: <b>${escTgHtml(name.trim())}</b>\n` +
      `🏷️ Mã KH: <code>${customer_code}</code>\n` +
      `🔑 Mã truy cập: <code>${access_code}</code>\n` +
      `💎 Gói: <b>${pkg === '40k' ? 'Gói 40k (15s Vĩnh viễn)' : 'Gói 30k (5s Vĩnh viễn)'}</b>${isSpecial ? ' · 🛡️ Flow Đặc Biệt' : ''}\n` +
      (finalLink ? `🔗 Liên hệ: <a href="${finalLink}">Mở link profile</a>` : '')
    );

    return res.json({
      ok: true,
      customer_id: cust.id,
      customer_code,
      access_code,
    });
  } catch (e) {
    console.error('[create-customer] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
