const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) return;
  const p = requireGuide(req);
  if (!p) return res.status(401).json({ error: 'Unauthorized' });

  const custRows = await sb(`customers?id=eq.${p.customer_id}&select=package,special_flow,locket_username`);
  if (!custRows || !custRows.length) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

  const cust = custRows[0];
  const pkg = (cust.package === '40k' || cust.package === '15s') ? '40k' : '30k';
  const special = !!cust.special_flow;

  // Luồng tĩnh mặc định
  let steps = [];
  if (pkg === '30k') {
    steps = special ? [
      { id: 's0', order_num: 1, type: 'appstore', title: 'Cài Shadowrocket' },
      { id: 's1', order_num: 2, type: 'ipa', title: 'Cài Locket hạ cấp' },
      { id: 's2', order_num: 3, type: 'gold', title: 'Lên Locket Gold' }
    ] : [
      { id: 's0', order_num: 1, type: 'appstore', title: 'Cài Shadowrocket' },
      { id: 's1', order_num: 2, type: 'choice', title: 'Cài đặt DNS giữ Gold' },
      { id: 's2', order_num: 3, type: 'gold', title: 'Lên Locket Gold' }
    ];
  } else {
    steps = special ? [
      { id: 's0', order_num: 1, type: 'appstore', title: 'Cài Shadowrocket' },
      { id: 's1', order_num: 2, type: 'ipa', title: 'Cài Locket hạ cấp' },
      { id: 's2', order_num: 3, type: 'vpn', title: 'Cài đặt VPN (Mỹ)' },
      { id: 's3', order_num: 4, type: 'choice', title: 'Cài đặt DNS giữ Gold' },
      { id: 's4', order_num: 5, type: 'gold', title: 'Lên Locket Gold' }
    ] : [
      { id: 's0', order_num: 1, type: 'appstore', title: 'Cài Shadowrocket' },
      { id: 's1', order_num: 2, type: 'choice', title: 'Cài đặt DNS giữ Gold' },
      { id: 's2', order_num: 3, type: 'vpn', title: 'Cài đặt VPN (Mỹ)' },
      { id: 's3', order_num: 4, type: 'gold', title: 'Lên Locket Gold' }
    ];
  }

  return res.status(200).json({
    ok: true,
    package: pkg,
    special_flow: special,
    locket_username: cust.locket_username || '',
    steps
  });
};
