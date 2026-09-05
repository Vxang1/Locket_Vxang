# ⚡ BẢN THIẾT KẾ KỸ THUẬT BẤT BIẾN: LOCKET_VXANG
### CODED VERSION: LOCKET_VXANG (RETRO NOTEBOOK / NEO-BRUTALIST EDITION)

> **Thư mục làm việc của dự án:** `C:\Users\ADMIN\Downloads\Locket_Vxang`  
> **Tên hệ thống & Thương hiệu:** `Locket_Vxang`  
> **Kiến trúc:** Static HTML5/ES Modules + 11 Vercel Serverless Functions (Node.js CommonJS) + Supabase PostgreSQL (PostgREST REST API) + Firebase Realtime Database.  
> **Môi trường & Ngôn ngữ:** Node.js 24.x, Vanilla JS (ES2024), PostgREST REST API, HTML5 Canvas/PWA, CSS3 Custom Properties.  
> **Phong cách:** Retro Notebook / Neo-Brutalist (Paper Cream #FDF6E3, Paper Warm #F5ECD7, Ink Black #1A1A1A, Highlight Gold #F5C842, Alert Coral #FF6B6B, Matrix Forest #2E7D32, Hard Shadow 4px 4px 0 #1A1A1A, 20px Grid Paper Lines).  
> **Thiết bị mục tiêu:** 100% Mobile iPhone (iOS) qua trình duyệt Safari thuần.  
> **Đặc trưng khách hàng:** CHỈ CÓ KHÁCH MỚI — KHÔNG PHÂN LOẠI KHÁCH BẢO HÀNH.

---

## 1. 5 NGUYÊN TẮC BẤT BIẾN (IMMUTABLE CORE RULES)

1. **Zero-Build & Zero-Dependency Tầng Frontend:**
   - Tuyệt đối không dùng Webpack, Vite, Babel, Next.js, React, Vue hay Tailwind CLI.
   - Toàn bộ giao diện người dùng viết bằng HTML5 tĩnh, CSS3 thuần (kết hợp CSS Variables) và Vanilla JavaScript.
   - Thư viện CDN duy nhất được phép dùng: `xlsx.full.min.js` (trong `admin.html`) để xuất báo cáo Excel cho Admin.
2. **Hạn Mức Tuyệt Đối 11 Serverless Functions (Vercel Hobby Quota):**
   - Dự án giữ đúng chính xác 11 Serverless Functions (7 endpoint `api/admin/*` và 4 endpoint `api/guide/*`).
   - Mọi module dùng chung, router webhook Telegram, helper tính toán đặt trong thư mục `api/_lib/`.
3. **Database PostgREST Không Dùng SDK Nặng:**
   - Supabase PostgreSQL truy cập hoàn toàn qua PostgREST REST API bằng `fetch` tích hợp sẵn trong Node.js.
   - Bật HTTP Connection Keep-Alive (`keepalive: true`) và timeout 7000ms qua AbortController.
4. **Loại Bỏ Remote Token Injection (Không Dùng RevenueCat / StoreKit 2):**
   - Loại bỏ module `locket-gold.js`, không có nạp token StoreKit 2 từ xa hay lệnh `/gold`, `/token`.
   - Khách hoàn thành sẽ được dẫn tới màn hình hoàn thành, kèm hướng dẫn chụp màn hình và nút 1-chạm gửi Zalo Admin.
5. **Loại Bỏ Trang Shadowrocket Độc Lập:**
   - Không tạo trang `shadowrocket.html`. Cài đặt Shadowrocket được tích hợp trực tiếp vào Bước 1 của `guide.html`.

---

## 2. QUY TẮC QUẢN LÝ KHÁCH HÀNG: CHỈ CÓ KHÁCH MỚI

1. **Không Phân Loại Khách Hàng:**
   - Loại bỏ hoàn toàn trường `type` (`'moi'` / `'bh'` / `'renew'`).
   - Form Tạo Khách Mới không có dropdown hay radio chọn loại khách.
   - Bảng CRM không có bộ lọc Khách mới / Bảo hành; chỉ lọc theo gói và trạng thái hoàn thành.
2. **Không Có Khái Niệm Hạn Bảo Hành:**
   - Không có hàm `calculateWarrantyEnd()` hay `getWarrantyStatus()`.
   - Bảng `customers` dùng `activated_at` thay cho `warranty_started_at`.
3. **Cấp Mã Cho Khách Cũ Cần Cài Lại:**
   - Bấm nút "➕ Cấp mã mới" trong Modal Khách Hàng sinh mã `VX-xxxxxx` thời hạn 30 phút, không gắn cờ bảo hành.
4. **Duy Nhất 1 Mẫu Tin Nhắn Zalo Chuẩn Gửi Khách:**
   - Chỉ dùng duy nhất 1 mẫu tin nhắn Zalo chuẩn Safari cho mọi trường hợp cấp mã.
5. **Ô Nhập Liệu Liên Hệ Duy Nhất (`parseContactInput`):**
   - Tự động nhận diện SĐT và link Profile Zalo/Facebook/Telegram/TikTok.

---

## 3. BẢNG GIÁ & 4 KỊCH BẢN STEP FLOWS

### Bảng Giá (100% Vĩnh Viễn):
- Gói `30k`: 5s Vĩnh viễn (30.000 VNĐ)
- Gói `40k`: 15s Vĩnh viễn (40.000 VNĐ)

### Chính Sách Đổi Gói / Nâng Cấp (30k -> 40k) & Cơ Chế DNS:
- **Trong vòng 7 ngày (1 tuần):** Khách chỉ cần thanh toán bù chênh lệch **+10.000 VNĐ**.
- **Sau 7 ngày:** Khách phải thanh toán **full 40.000 VNĐ** từ đầu.
- Giao diện CRM Admin tính toán tự động thời gian dựa trên ngày kích hoạt (`activated_at`) hoặc ngày tạo (`created_at`), tự hiển thị nút đổi gói, tự cộng ghi chú lịch sử và sinh tin nhắn Zalo tương ứng.
- **Chuyển sang DNS Pool 15s & Giải phóng Slot DNS Riêng:**
  - Khách đang dùng gói 30k (5s) có link DNS riêng khi nâng cấp lên 40k (15s) sẽ **chuyển sang dùng DNS Pool 15s**.
  - Link DNS riêng cũ của khách được **giải phóng thành slot trống** (`[THU HỒI] ...`) để dành cho khách tiếp theo có nhu cầu cài đặt DNS riêng.
  - Link DNS riêng đó được **tự động TÁI KÍCH HOẠT lại** (`first_accessed_at: null`, `expired_notified_at: null`) để khách tiếp theo có thể truy cập link cài đặt bình thường (TTL 10 phút đếm lại từ đầu), và Admin có thể cập nhật thông tin tài khoản DNS hoặc gán mã khách hàng mới cho slot này.


### 4 Kịch Bản Flows:
1. **Gói 30k Thường (`special_flow = false` - 3 bước):**
   - Bước 1: Cài Shadowrocket (Tài khoản Apple ID shop on-demand)
   - Bước 2: Cài đặt DNS 5s (Tải `.mobileconfig` từ DNS Pool 5s)
   - Bước 3: Lên Locket Gold (Sao chép module cấu hình Shadowrocket)
2. **Gói 30k Đặc Biệt (`special_flow = true` - 3 bước):**
   - Bước 1: Cài Shadowrocket (Giữ đăng nhập tài khoản shop)
   - Bước 2: Cài Locket IPA Hạ Cấp (OTA qua itms-services manifest, cảnh báo không xóa Locket)
   - Bước 3: Lên Locket Gold (Sao chép cấu hình Shadowrocket)
3. **Gói 40k Thường (`special_flow = false` - 4 bước):**
   - Bước 1: Cài Shadowrocket
   - Bước 2: Cài đặt DNS 15s (Tải profile từ DNS Pool 15s)
   - Bước 3: Cài đặt VPN USA (Giữ app VPN trên máy)
   - Bước 4: Lên Locket Gold
4. **Gói 40k Đặc Biệt (`special_flow = true` - 5 bước):**
   - Bước 1: Cài Shadowrocket (Giữ đăng nhập tài khoản shop)
   - Bước 2: Cài Locket IPA Hạ Cấp
   - Bước 3: Cài đặt VPN USA (Bỏ qua bước xóa cài lại trong video)
   - Bước 4: Cài đặt DNS 15s
   - Bước 5: Lên Locket Gold

*Lưu ý:* Hệ thống kích hoạt 100% trên thiết bị qua Shadowrocket/DNS/VPN/IPA, không có và không yêu cầu hệ thống Username Locket.

---

## 4. BẢO MẬT & ĐỘNG CƠ CÔNG NGHỆ

1. **Khóa Thiết Bị & Safari Lock:**
   - Chặn PC/Laptop/Android (`!isIOS()`).
   - Chặn trình duyệt In-App (Zalo, Facebook, TikTok, Messenger).
   - Dev Mode bypass: `localStorage.xw_dev_mode = 1` hoặc Firebase `appstore/dev_mode = true`.
2. **Anti-Share Live Heartbeat & Bẫy Gian Lận 2 Pha (Honeypot 6s + Khóa 15s):**
   - Client gửi ping mỗi 4s (`POST /api/guide/ping`).
   - **Pha 1 (Honeypot 6s):** Khi phát hiện 2 thiết bị ping cùng mã (`otherSessions.length > 0` hoặc `fbConcurrent`), hệ thống giữ nguyên giao diện hoạt động bình thường trong 6 giây để thu thập đầy đủ IP nguồn (`x-forwarded-for`), User-Agent và fingerprint thiết bị gian lận.
   - **Pha 2 (Khẩn cấp 15s):** Kích hoạt đếm ngược 15s (`fraud_warning`) đồng loạt trên CẢ HAI thiết bị kèm chuông cảnh báo. Bắn tin báo khẩn đến toàn bộ Admin Telegram kèm IP vi phạm. Hết 15s, mã bị chuyển trạng thái `fraud`, cờ `destroyed: true`, khóa vĩnh viễn không thể hồi phục.
3. **Apple ID Scraper On-Demand:**
   - Cào nguồn 1 -> Nguồn 2 backup -> Static fallback từ Firebase RTDB.
   - Giao diện che mật khẩu `••••••••`, chỉ copy vào Clipboard khi bấm nút.
4. **DNS Pool Xoay Vòng & Link DNS Riêng:**
   - Phân nhóm 5s và 15s, giới hạn slot `max_uses` (mặc định 5).
   - Kiểm tra sức chứa DNS dựa trên link DNS thực tế trong `private_dns_links`, không dùng trường ảo.
   - Link DNS Riêng có TTL 10 phút kích hoạt từ lần mở đầu tiên, có nút hồi sinh TTL trong Admin.
5. **Multi-Admin Telegram Webhook & Mobile-First UX:**
   - Hỗ trợ phát sóng đồng thời đến 2 Admin Telegram: `8676266893` (Xang Lee / @Xanglie) và `8374108763` (Quan Chūn / @zane_le).
   - Nạp linh hoạt qua `TELEGRAM_ADMIN_IDS`, `TELEGRAM_CHAT_ID` và danh sách hardcoded mặc định (dedup qua `Set`).
   - Gửi thông báo song song qua `Promise.allSettled` đảm bảo 100% admin nhận được tin tức thời.
   - Giao diện Mobile-First trên điện thoại: Tinh giản `/start`, ẩn menu `/stats` cồng kềnh, hiển thị thẻ CRM dạng danh thiếp mini trực quan.
   - Tra cứu CRM trực tiếp qua mã `VX-xxxxxx` (hoặc `XW-xxxxxx`), `KH-xxxxxxx`, SĐT, Tên.
6. **Đường Dẫn Module Locket Gold Chính Thức:**
   - URL tải thô: `https://raw.githubusercontent.com/Vxang1/Locket/main/Locket_Vxang.module` (Kho lưu trữ `Vxang1/Locket`, nhánh `main`). Khách cài đặt bằng cách sao chép liên kết vào Shadowrocket.

---

## 5. DANH SÁCH 11 SERVERLESS FUNCTIONS & CẤU TRÚC THƯ MỤC

```
Locket_Vxang/
├── api/
│   ├── _lib/
│   │   ├── utils.js
│   │   └── telegram-bot.js
│   ├── admin/
│   │   ├── login.js
│   │   ├── stats.js
│   │   ├── create-customer.js
│   │   ├── add-code.js
│   │   ├── sessions.js
│   │   ├── guide-steps.js
│   │   └── customers.js
│   └── guide/
│       ├── validate.js
│       ├── steps.js
│       ├── ping.js
│       └── complete.js
├── index.html
├── guide.html
├── admin.html
├── dns.html
├── vercel.json
├── package.json
├── gemini.md
└── handover.md
```

---

## 6. QUY ĐỊNH VỀ TÀI KHOẢN GITHUB & GIT PUSH

- **Tên tài khoản GitHub:** `Vxang1`
- **Email GitHub:** `tika68844@gmail.com`
- **Địa chỉ Repository:** `https://github.com/Vxang1/Locket_Vxang`
- **Git Commit Author:** `Vxang1 <tika68844@gmail.com>`
- **Lệnh Git Push bắt buộc:**
  ```bash
  git push https://Vxang1@github.com/Vxang1/Locket_Vxang.git main
  ```

---

## 7. RÀNG BUỘC KỸ THUẬT & PHƯƠNG PHÁP LUẬN: SUPER DEEP WRITER (SDW 4.0)

> **Tài liệu gốc tham chiếu:** `C:\Users\ADMIN\Downloads\super_deep_writer_prompt.md` & `super_deep_writer_prompt.md`  
> **Định vị & Vai trò:** Super Deep Writer (SDW) — Senior Principal Engineer, Thinking Partner, System Architect.

### 10 Tiên Đề Bắt Buộc (Core Axioms):
1. **AXIOM 1:** Suy nghĩ sâu trước khi viết code (*Think before you write. Always*).
2. **AXIOM 2:** Hiểu rõ TẠI SAO (*WHY*) trước khi làm THẾ NÀO (*HOW*).
3. **AXIOM 3:** Coi mỗi dòng code là một cam kết lâu dài cho tương lai hệ thống.
4. **AXIOM 4:** Tôn trọng thời gian, bối cảnh và mục tiêu của người dùng.
5. **AXIOM 5:** Trung thực tuyệt đối với sự không chắc chắn, không bịa đặt API/tính năng (*Never bluff*).
6. **AXIOM 6:** Chỉ bàn giao code đạt chuẩn chất lượng cao mà bản thân tự hào ký tên.
7. **AXIOM 7:** Ưu tiên theo thứ tự: **Tính đúng đắn (Correctness) > Độ rõ ràng (Clarity) > Hiệu năng (Performance)**.
8. **AXIOM 8:** Kỹ lưỡng, thấu đáo đến cùng nhưng không rườm rà lãng phí.
9. **AXIOM 9:** Thích ứng phong cách giao tiếp chuẩn kỹ sư đồng nghiệp.
10. **AXIOM 10:** Liên tục tự đánh giá và hoàn thiện giải pháp qua từng tương tác.

### Giao Thức Hiểu Sâu (Deep Understanding Protocol - DUP):
- **B1. PARSE:** Bóc tách chính xác yêu cầu kỹ thuật.
- **B2. INTERPRET:** Nắm bắt dụng ý kiến trúc cốt lõi đằng sau yêu cầu.
- **B3. CONTEXTUALIZE:** Đặt yêu cầu vào bức tranh tổng thể và ràng buộc bất biến của `Locket_Vxang`.
- **B4. ANTICIPATE:** Dự báo trước các lỗi biên, side-effects, lỗi schema và tác động dây chuyền.
- **B5. PLAN:** Hoạch định phương án tối ưu, cân nhắc trade-offs trước khi sửa đổi.
- **B6. EXECUTE:** Viết code hoàn chỉnh, chạy được ngay (*Copy-paste ready*), xử lý triệt để error handling.
- **B7. VERIFY:** Tự rà soát kiểm tra đối soát với 5 nguyên tắc bất biến của dự án.
- **B8. REFLECT:** Tối giản hóa giải pháp, loại bỏ sự phức tạp không cần thiết.

---

## 8. NHẬT KÝ ĐỒNG BỘ KIẾN TRÚC & SUPER DEEP CHECK AUDIT

### Kết Quả Rà Soát Toàn Diện Hệ Thống (Super Deep Check):
Hệ thống đã trải qua quy trình rà soát đối chiếu chéo (Cross-Reference Audit) độc lập giữa 11 Serverless Functions, 2 module dùng chung (`_lib/`) và 4 file HTML giao diện tĩnh. 10 vấn đề kỹ thuật đã được phân loại và xử lý triệt để:

1. **🔴 Vá lỗi Crash Runtime Anti-Fraud (`api/guide/ping.js`):**
   - *Nguyên nhân:* Biến `fraudTriggeredAt` khai báo dạng `const` bị gán lại `fraudTriggeredAt = nowIso` khi phát hiện đồng thời 2 thiết bị. Gây `TypeError: Assignment to constant variable` đánh sập endpoint, làm tê liệt bẫy chống gian lận.
   - *Xử lý:* Chuyển sang `let fraudTriggeredAt`.

2. **🔴 Khắc phục Kiểm tra Column Ảo (`api/admin/add-code.js`):**
   - *Nguyên nhân:* Kiểm tra `!cust?.has_private_dns` trong khi `has_private_dns` không phải cột trong bảng `customers` (được tính toán động trong `customers.js`). Dẫn đến biểu thức luôn bằng `true`, chặn cấp mã oan uổng cho khách đã có DNS riêng khi pool đầy.
   - *Xử lý:* Truy vấn thực tế vào bảng `private_dns_links` theo `customer_code`.

3. **🟡 Triệt Tiêu Mâu Thuẫn Gói Hạn Legacy (`api/admin/customers.js`):**
   - *Nguyên nhân:* Handler PATCH khách hàng cho phép gán `duration` trong mảng `['3m', '6m', '1y', 'perm']`, vi phạm quy tắc "100% Vĩnh Viễn" (`perm`).
   - *Xử lý:* Khóa chặt chỉ cho phép `duration === 'perm'`.

4. **🟠 Chống Spam Telegram Kích Hoạt Lại (`api/guide/validate.js`):**
   - *Nguyên nhân:* Nếu gặp sự cố mạng khi ghi `first_used_at`, biến `isFirstActivation` vẫn bằng `true` ở các lần validate tiếp theo, khiến bot Telegram liên tục bắn thông báo khách bắt đầu làm.
   - *Xử lý:* Bổ sung guard an toàn `!(codeRow.entry_count > 0)`.

5. **🟠 Đảm Bảo Định Danh Session Dự Phòng (`api/guide/steps.js`):**
   - *Nguyên nhân:* Khi tự tạo session nếu bị mất dữ liệu giữa các bước chuyển app, payload thiếu `device_id` và `is_original`, dễ gây nhận diện nhầm gian lận trong `ping.js`.
   - *Xử lý:* Bổ sung `device_id: payload.deviceId || null` và `is_original: true`.

6. **🟠 Chuẩn Hóa Hiển Thị Gói Telegram Bot (`api/_lib/telegram-bot.js`):**
   - *Nguyên nhân:* Tự tạo hàm escape trùng lặp và không gọi `normalizePackage()`, khiến việc hiển thị gói cước và kiểm tra điều kiện nâng cấp có thể sai lệch nếu cơ sở dữ liệu lưu chuỗi cũ (`5s`, `15s`, `150`, `180`).
   - *Xử lý:* Import và áp dụng triệt để `normalizePackage()` và `escTgHtml` từ `utils.js`.

7. **🟢 Tái Kích Hoạt Slot DNS Riêng & Chuyển DNS Pool 15s Khi Nâng Cấp (`customers.js`, `add-code.js`, `admin.html`):**
   - *Nguyên nhân:* Khi khách gói 30k nâng cấp lên 40k, hệ thống cần giải phóng link DNS riêng cũ cho khách tiếp theo và chuyển khách lên DNS Pool 15s. Trước đây, việc đổi tên `[THU HỒI]` chưa reset `first_accessed_at` và `expired_notified_at`, khiến link bị kẹt ở trạng thái hết hạn (`expired`), ngăn cản khách tiếp theo sử dụng.
   - *Xử lý:* Tự động gán `first_accessed_at: null`, `expired_notified_at: null` khi thu hồi để tái kích hoạt link (TTL 10 phút đếm lại từ đầu). Nâng cấp `dns_update_creds` cho phép gán mã khách mới `customer_code`, đồng bộ gói cước và dọn dẹp pool; bổ sung nút `👤 Gán cho khách mới` trực quan trong `admin.html`.

### Tiêu Chuẩn Kiểm Định Bắt Buộc Trước Khi Bàn Giao:
- Cú pháp toàn bộ file Node.js đạt chuẩn `node -c` (exit code 0).
- Toàn bộ script inline trong HTML (`admin.html`, `guide.html`, `index.html`) vượt qua kiểm tra cú pháp độc lập (`validate_html_scripts.js`).
- Hạn mức tuyệt đối đúng 11 Serverless Functions Vercel được duy trì nguyên vẹn.
- Mọi thay đổi logic kinh doanh phải được ghi nhận đầy đủ, chi tiết vào cả `GEMINI.md` và `handover.md`.

