# 📋 NHẬT KÝ BÀN GIAO & TRẠNG THÁI HỆ THỐNG: LOCKET_VXANG

> **Dự án:** Locket_Vxang (Cyber Tech Ultra Edition)  
> **Cập nhật lần cuối:** 2026-09-03 23:25  
> **Trạng thái:** ✅ Đã hoàn thành 100% đối soát, bổ sung và đồng bộ toàn bộ tính năng từ `locket-unified` sang `Locket_Vxang`.

---

## 📌 CURRENT STATE (TRẠNG THÁI HIỆN TẠI)
Sau quá trình rà soát và so sánh chuyên sâu (Deep Comparative Audit) giữa `locket-unified` và `Locket_Vxang`, toàn bộ các thành phần thiếu sót đã được lập trình, bổ sung và chuẩn hóa đồng bộ 100%:

1. **Bộ Ảnh & Assets Hoàn Chỉnh (`images/`):**
   - Đã sao chép và đồng bộ đầy đủ **18 file ảnh** (avatar, locket, icon, mockup, guide steps, wall) vào thư mục `images/` của `Locket_Vxang`.

2. **Chuẩn Hóa & Nâng Cấp Toàn Bộ 11 Serverless Functions Vercel:**
   - `api/_lib/utils.js`:
     - Đồng bộ toàn bộ 35 hàm tiện ích cốt lõi từ `locket-unified`.
     - Chuẩn hóa đúng 2 gói vĩnh viễn: `30k` (5s Vĩnh viễn) và `40k` (15s Vĩnh viễn).
     - Triển khai đúng 4 luồng kịch bản: 30k thường (3 bước: Shadow -> DNS -> Gold), 30k đặc biệt (3 bước: Shadow -> IPA -> Gold, bypass check capacity DNS), 40k thường (4 bước: Shadow -> DNS -> VPN -> Gold), 40k đặc biệt (5 bước: Shadow -> IPA -> VPN -> DNS -> Gold).
     - Phân giải ô nhập liên hệ duy nhất (`parseContactInput`) hỗ trợ cả SĐT và Link profile MXH (Zalo/FB/Telegram/TikTok/Instagram).
     - Quản lý DNS Pool xoay vòng thông minh, DNS riêng với TTL 10 phút, bộ nhớ đệm cache sức chứa DNS, template URL DNS tự hiểu.
   - `api/admin/customers.js`:
     - Bổ sung đầy đủ các action quản trị: `appstore_get`, `appstore_update`, `dns_update_creds`, `dns_reactivate`, `dns_delete`, `dns_pool_list`, `dns_pool_add`, `dns_pool_toggle`, `dns_pool_delete`, `dns_pool_remove_customer`, `expire`, `toggle_status`, `update` (với `parseContactInput`), và `codes`.
   - `api/admin/create-customer.js`:
     - Chuẩn hóa chữ ký hàm `sb` PostgREST, kiểm tra trùng lặp 2 phút chống double-submit, kiểm tra sức chứa DNS pool trước khi tạo khách.
   - `api/admin/add-code.js`:
     - Cấp mã truy cập mới (45 phút) cho khách cần cài đặt lại, hỗ trợ kiểm tra sức chứa DNS pool và tự động nhận diện luồng đặc biệt.
   - `api/admin/sessions.js`:
     - Bổ sung logic làm giàu dữ liệu phiên live song song (Enrichment), liên kết tên bước và hỗ trợ đóng phiên (kick).
   - `api/admin/stats.js`:
     - Router webhook chuyển tiếp trực tiếp vào Telegram Bot, hỗ trợ Cron job định kỳ giữ Supabase không bị auto-pause.
   - `api/admin/guide-steps.js`:
     - CRUD bước hướng dẫn, hỗ trợ bật/tắt Dev Mode và sắp xếp thứ tự bước.
   - `api/admin/login.js`:
     - Hỗ trợ xác thực mật khẩu qua biến môi trường `ADMIN_PASSWORD` hoặc `ADMIN_PASSWORD_HASH`, cấp JWT 24h hoặc 365 ngày (remember me).
   - `api/guide/validate.js`:
     - Tích hợp Scraper Apple ID on-demand đa nguồn với cache-buster `no-store`.
     - Sinh manifest plist OTA động (`ipa_plist`) cho iOS itms-services tải IPA trực tiếp tốc độ cao.
     - Phát hiện chia sẻ mã đa thiết bị thông minh và kích hoạt bẫy gian lận.
     - Sinh phiên với thời hạn chuẩn 45 phút cho gói vĩnh viễn.
   - `api/guide/steps.js`:
     - Trả về danh sách bước động chính xác theo gói (`30k`/`40k`) và cờ luồng (`special_flow`).
   - `api/guide/ping.js`:
     - Live heartbeat 4s, tự động kích hoạt bẫy gian lận (đếm ngược 15s) khi phát hiện 2 máy ping cùng lúc, thông báo Telegram khi khách chuyển bước.
   - `api/guide/complete.js`:
     - Đánh dấu hoàn tất cài đặt, tự động cập nhật CRM sang trạng thái active và gửi thông báo Telegram tức thì.
   - `api/_lib/telegram-bot.js`:
     - Bot Telegram chuyên dụng cho thông báo & tra cứu CRM: lệnh `/start`, `/help`, `/stats`, tra cứu tức thì mã `XW-xxxxxx`, mã `KH-xxxxxxxx`, SĐT hoặc Tên khách. Hoàn toàn tuân thủ quy tắc không tích hợp hệ thống StoreKit 2 token injection.

3. **Hoàn Thiện Giao Diện Người Dùng (`admin.html` & `guide.html`):**
   - `admin.html`:
     - Đồng bộ đầy đủ 10 tab theo bản thiết kế khóa bố cục: Dashboard, Tạo khách (form trực tiếp), Khách hàng (CRM bảng 4 cột + thẻ Mobile `.m-card`), Phiên live, Mã truy cập, DNS riêng, DNS mặc định, Appstore, Khách đặc biệt, Referral.
     - Bổ sung đầy đủ 5 modal: Chi tiết khách hàng, Chỉnh sửa thông tin, Mẫu tin nhắn Zalo Safari chuẩn, Mẫu tin nhắn DNS riêng, Hướng dẫn cài PWA.
     - Bấm vào bất kỳ mã truy cập nào trong chi tiết khách hàng để bật lại mẫu tin nhắn Zalo kèm nút copy 1-chạm.
     - Kết nối chính xác các API backend: `appstore_get`, `appstore_update`, `sessions` kick.
   - `guide.html`:
     - Tích hợp đầy đủ các kịch bản bước: Shadowrocket (có nút làm mới tài khoản shop), Locket IPA hạ cấp (kèm video Cloudinary), VPN Hoa Kỳ (kèm video Cloudinary), Cài đặt DNS (tải trực tiếp profile `.mobileconfig` sinh từ Blob), Lên Locket Gold (sao chép module Shadowrocket).
     - Màn hình hoàn tất (`#completeScreen`) chuẩn 3 thẻ hành động xác nhận kèm thanh tiến trình 0/3 bước: Chụp màn hình gửi Zalo Vxang, Kết bạn Locket @vxang, Vào nhóm thông báo Zalo.
     - Modal chào mừng (`#welcomeOverlay`), modal bẫy gian lận đếm ngược 15 giây (`#fraudOverlay`), modal xác nhận hoàn tất (`#confirmOverlay`), và modal chặn in-app browser ép mở Safari (`#inappBlockModal`).

4. **Kiểm Tra Kỹ Thuật:**
   - Đã chạy cú pháp `node --check` trên toàn bộ tất cả file JavaScript: **100% đạt chuẩn, không có bất kỳ lỗi cú pháp nào.**

---

## 🎯 NEXT STEPS (CÁC BƯỚC TIẾP THEO)
1. Commit toàn bộ thay đổi với thông tin Git Author: `Vxang1 <tika68844@gmail.com>`.
2. Push mã nguồn lên GitHub repository `https://github.com/Vxang1/Locket_Vxang` nhánh `main`.
3. Kiểm tra triển khai trên Vercel và cấu hình biến môi trường tương ứng.
