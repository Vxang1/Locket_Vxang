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
- Giao diện CRM Admin tính toán tự động thời gian dựa trên ngày kích hoạt (`activated_at`) — **KHÔNG fallback `created_at`** (khách chưa kích hoạt không bị tính ngày từ lúc tạo, tránh mất ưu đãi +10k oan), tự hiển thị nút đổi gói, tự cộng ghi chú lịch sử và sinh tin nhắn Zalo tương ứng.
- **Cơ Chế DNS Riêng 1:1 & Quy Trình Tạo Khách / Đổi Máy / Nâng Cấp:**
  - **Tạo Khách Mới & Zero Delay:** Khi tạo khách mới, Admin đợi NextDNS tạo xong ngay lúc tạo khách (`create-customer.js`). Khách mở `guide.html` là DNS ĐÃ CÓ RỒI, `/api/guide/steps` trả kèm luôn `dns_url`, tuyệt đối không gặp độ trễ/loading khi vào guide.
  - **Khách Đổi Máy Mua Lại Từ Đầu:** Mua lại từ đầu nhưng **VẪN DÙNG TÀI KHOẢN NEXTDNS CŨ** (hệ thống tự tra cứu theo SĐT hoặc Social Link của khách để gán lại đúng tài khoản NextDNS cũ sang mã KH mới).
  - **Khách Nâng Cấp Gói 30k -> 40k:** DNS 5s của gói 30k cũ được thu hồi chuyển sang trạng thái `[SẴN SÀNG]` để cấp cho khách mới gói 30k (tối ưu hóa tài khoản, không lãng phí). Khách nâng cấp lên 40k được cấp tài khoản DNS 15s riêng mới + Token VPN USA 1:1.
  - **Tuyệt Đối Không Dùng DNS Pool Dùng Chung:** 100% khách hàng đều sở hữu DNS riêng biệt 1:1.


### 4 Kịch Bản Flows:
1. **Gói 30k Thường (`special_flow = false` - 3 bước):**
   - Bước 1: Cài Shadowrocket (Tài khoản Apple ID shop on-demand)
   - Bước 2: Cài đặt DNS 5s (Tải `.mobileconfig` từ DNS Riêng 1:1 của khách)
   - Bước 3: Lên Locket Gold (Sao chép module cấu hình Shadowrocket)
2. **Gói 30k Đặc Biệt (`special_flow = true` - 3 bước):**
   - Bước 1: Cài Shadowrocket (Giữ đăng nhập tài khoản shop)
   - Bước 2: Cài Locket IPA Hạ Cấp (OTA qua itms-services manifest, cảnh báo không xóa Locket)
   - Bước 3: Lên Locket Gold (Sao chép cấu hình Shadowrocket)
3. **Gói 40k Thường (`special_flow = false` - 4 bước):**
   - Bước 1: Cài Shadowrocket
   - Bước 2: Cài đặt DNS 15s (Tải profile từ DNS Riêng 1:1 của khách)
   - Bước 3: Cài đặt VPN USA (Sao chép link VPN Sub Token riêng dạng `https://locketvxang.vercel.app/s/{token}` dán vào Subscribe Shadowrocket, khóa thiết bị 1:1)
   - Bước 4: Lên Locket Gold
4. **Gói 40k Đặc Biệt (`special_flow = true` - 5 bước):**
   - Bước 1: Cài Shadowrocket (Giữ đăng nhập tài khoản shop)
   - Bước 2: Cài Locket IPA Hạ Cấp
   - Bước 3: Cài đặt VPN USA (Sao chép link VPN Sub Token riêng 1:1)
   - Bước 4: Cài đặt DNS 15s (Tải profile từ DNS Riêng 1:1 của khách)
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
4. **Hệ Thống DNS Riêng 1:1 Độc Lập (Thay Thế Hoàn Toàn DNS Pool):**
   - Loại bỏ 100% DNS pool dùng chung; mỗi khách hàng sở hữu 1 tài khoản NextDNS riêng biệt 1:1, không dùng chung với bất kỳ ai.
   - Tự động tạo NextDNS và cấu hình Denylist chuẩn theo gói (5s / 15s) ngay khi tạo khách hàng hoặc lazy fallback khi vào guide.
   - Hệ thống DNS động: admin có thể đổi template (NextDNS/AdGuard/ControlD) qua tab Quản lý DNS Riêng mà không cần đổi code.
   - Link DNS Riêng có TTL 10 phút kích hoạt từ lần mở đầu tiên, có nút hồi sinh TTL trong Admin.
5. **Multi-Admin Telegram Webhook & Mobile-First UX:**
   - Hỗ trợ phát sóng đồng thời đến nhiều Admin Telegram qua `TELEGRAM_CHAT_ID` / `TELEGRAM_ADMIN_IDS` (phân tách dấu phẩy).
   - **KHÔNG còn hardcoded admin IDs** — toàn bộ lấy từ env vars Vercel.
   - Gửi thông báo song song qua `Promise.allSettled` đảm bảo 100% admin nhận được tin tức thời.
   - Giao diện Mobile-First trên điện thoại: Tinh giản `/start`, ẩn menu `/stats` cồng kềnh, hiển thị thẻ CRM dạng danh thiếp mini trực quan.
   - Tra cứu CRM trực tiếp qua mã `VX-xxxxxx` (hoặc `XW-xxxxxx`), `KH-xxxxxxx`, SĐT, Tên.
6. **Đường Dẫn Module Locket Gold Chính Thức:**
   - URL tải thô: `https://raw.githubusercontent.com/Vxang1/Locket/main/Locket_Vxang.module` (Kho lưu trữ `Vxang1/Locket`, nhánh `main`). Khách cài đặt bằng cách sao chép liên kết vào Shadowrocket.
7. **VPN USA Sub Token Riêng Biệt & Khóa Thiết Bị 1:1 (Vercel Native):**
   - Mỗi khách hàng gói 40k (15s) được cấp 1 Token duy nhất (`vx-15s-XXXXXX`) với URL subscription mang chính tên miền của shop dạng `https://{domain}/s/{token}`.
   - **Tích hợp Native vào Vercel:** Vercel định tuyến `/s/:token` về `/api/guide/validate?action=vpn_sub&token=:token`. Serverless function tự động cào trực tiếp từ nguồn `v2nodes.com`, bóc tách key mới nhất tức thời và trả về file sub cho Shadowrocket mà không để lộ bất kỳ dấu vết hay domain cào ra ngoài.
   - **Khóa thiết bị 1:1 (Device Binding):** Ở lần quét link đầu tiên, hệ thống tự động ghi nhận User-Agent (`device_ua`) và IP vào bảng `vpn_tokens` trên Supabase. Ở các lần cập nhật sub tiếp theo, hệ thống so sánh User-Agent, nếu phát hiện thiết bị khác (ví dụ: khách gói 5s sao chép link) sẽ lập tức chặn HTTP 403 `This subscription is bound to another device`.
   - **Quản trị toàn diện trên CRM:** Admin có quyền xem tình trạng thiết bị, IP kết nối, lần cuối sử dụng, và thao tác 3 nút: Cấp mã mới (`vpn_regenerate`), Gỡ khóa thiết bị (`vpn_unbind`), và Thu hồi vĩnh viễn (`vpn_revoke`).

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
Hệ thống đã trải qua 2 đợt rà soát đối chiếu chéo (Cross-Reference Audit) độc lập giữa 11 Serverless Functions, 2 module dùng chung (`_lib/`) và 4 file HTML giao diện tĩnh. Tổng cộng **14 vấn đề kỹ thuật** đã được phân loại và xử lý triệt để:

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

---

### Super Deep Check v2 — 14 Vấn Đề Kỹ Thuật (7 files, Security + Schema + Logic + DNS Dynamic + Deployment):

8. **🔴 Loại bỏ Hardcoded Admin Telegram IDs (`api/_lib/telegram-bot.js`):**
   - *Nguyên nhân:* `TG_CHAT_IDS` chứa danh sách hardcoded `['8676266893', '8374108763']` làm fallback, gây rủi ro bảo mật khi source code public trên GitHub — mọi người đều biết được admin Telegram IDs.
   - *Xử lý:* Xóa toàn bộ hardcoded fallback. `TG_CHAT_IDS` giờ chỉ đọc từ env vars `TELEGRAM_CHAT_ID` và `TELEGRAM_ADMIN_IDS` (phân tách dấu phẩy), dedup qua `Set`. Nếu không set env → throw lỗi rõ ràng khi khởi động.

9. **🔴 Tăng cường Bảo mật JWT (`api/_lib/utils.js`):**
   - *Nguyên nhân:* `verifyJWT` dùng `===` để so sánh signature (không chống timing attack), và `getToken()` chấp nhận query param `?t=` (token xuất hiện trong server logs, browser history, Referer header).
   - *Xử lý:* `verifyJWT` chuyển sang `crypto.timingSafeEqual` + wrap `try/catch`. `getToken()` loại bỏ query param fallback, chỉ đọc header `Authorization: Bearer <token>`.

10. **🔴 Bảo mật Service Key & JWT Secret (`api/_lib/utils.js`):**
    - *Nguyên nhân:* `SB_KEY` và `JWT_SEC` có fallback rỗng `''` khi env vars chưa set, gây silent failure — mọi request Supabase đều 401 nhưng không có lỗi rõ ràng.
    - *Xử lý:* Throw `Error('SB_KEY/JWT_SEC chưa được cấu hình')` ngay khi module load nếu env vars thiếu.

11. **🟡 Chuẩn Hóa Tên Cột DNS Pool (`api/admin/customers.js`, `api/guide/validate.js`, `api/guide/ping.js`):**
    - *Nguyên nhân:* Trộn lẫn `max_uses` và `max` trong cùng query Supabase. Schema dùng `max` nhưng code vẫn viết `max_uses` ở nhiều nơi → PostgREST trả lỗi 400 hoặc silent fail.
    - *Xử lý:* Thống nhất toàn bộ sang `max` khớp với schema `dns_pool`.

12. **🟡 Đồng Bộ Tên Cột Guide Steps (`api/admin/sessions.js`):**
    - *Nguyên nhân:* Query `getCachedGuideSteps` dùng `select=type` trong khi schema đã đổi sang `step_type`.
    - *Xử lý:* Đổi thành `select=step_type` trong session cache và confirm `stepLabel` trong `utils.js` cũng đọc `step?.step_type || step?.type` (backward compat).

13. **🟠 Sửa Logic Thời Gian Code Hết Hạn (`api/_lib/utils.js`, `api/guide/validate.js`):**
    - *Nguyên nhân:* `expireCodeAndNotify` dùng `isPermPackage(normalizePackage(...))` để quyết định thời hạn — nhưng `isPermPackage()` luôn trả về `true` (vì mọi gói đều vĩnh viễn), khiến TẤT CẢ code đều hiển thị "45 PHÚT" thay vì đúng "30 PHÚT" cho gói 30k.
    - *Xử lý:* Thay bằng `normalizePackage(codeRow.package) === '40k' ? '45 PHÚT' : '30 PHÚT'`. Gói 30k → 30 phút, gói 40k → 45 phút.

14. **🟠 Triệt Tiêu Fallback Tokens Table & Schema Cleanup (`api/_lib/utils.js`, `schema.sql`):**
    - *Nguyên nhân:* `getAppConfig`/`setAppConfig` fallback về bảng `tokens` legacy khi `app_config` trả rỗng — gây confusion và có thể trả config cũ sai. Schema thiếu cột `expired_notified_at` trong `private_dns_links`, và còn cột `ublockdns_url` thừa.
   - *Xử lý:* Xóa toàn bộ fallback tokens table. Schema: thêm `expired_notified_at TIMESTAMPTZ`, xóa `ublockdns_url`. Code xử lý DNS động `dnsPrivateUrl()` giờ chỉ trả `row?.nextdns_url || ''` (admin thay đổi template qua UI, không cần硬-coded URL).

15. **🔴 Khắc Phục Triệt Để Sai Lệch Thời Gian & Múi Giờ (Client Clock Skew & Timezone Resilience):**
    - *Hiện tượng:* Khách đang làm trên điện thoại bình thường nhưng trên máy tính Admin báo "⚠️ Hết hạn chưa xong" và Tab Phiên Live trống trơn (`🟢 Không có phiên nào đang active`).
    - *Nguyên nhân cốt lõi:* Hệ điều hành máy tính bị đặt múi giờ Pacific Time (UTC-7) trong khi đồng hồ hiển thị giờ Việt Nam. JavaScript `new Date()` trên PC tính ra giờ UTC là `20:20`, lệch 14 tiếng so với giờ UTC của server Vercel (`06:20`). Khi `admin.html` so sánh `exp <= now` và `now - lp >= 25000` bằng `Date.now()` cục bộ, 100% các phiên live bị loại bỏ oan uổng và mã truy cập bị đánh dấu thành `dead` (Hết hạn).
    - *Xử lý triệt để 3 lớp:*
      1. **Tự động đồng bộ giờ Server (`nowServer()`):** Endpoint backend gắn header `X-Server-Time` và `Date`. Client `admin.html` và `guide.html` tự tính toán `serverTimeOffset = serverTime - Date.now()`. Mọi so sánh thời hạn, kiểm tra online 25s, và đếm ngược ticker đều sử dụng `nowServer()`.
      2. **Chuẩn hóa hiển thị giờ Việt Nam (`timeZone: 'Asia/Ho_Chi_Minh'`):** Sử dụng các hàm `fmtVnDateTime`, `fmtVnDate`, `fmtVnTime` cố định múi giờ UTC+7. Dù máy Admin ở bất kỳ múi giờ nào trên thế giới cũng luôn hiển thị giờ Việt Nam chính xác 100%.
      3. **Đồng bộ hệ thống Windows:** Chuyển TimeZone Windows về `SE Asia Standard Time` (UTC+07:00 Bangkok, Hanoi, Jakarta) và đồng bộ đồng hồ hệ thống khớp từng giây với server.

### Super Deep Check v3 — 7 Vấn Đề Kỹ Thuật (5 files, Schema + Security + Logic + Dead-code):

16. **🔴 Sửa POST Tạo Step Guide Sai Cột (`api/admin/guide-steps.js`):**
    - *Nguyên nhân:* POST tạo step mới gửi cột `type` (không tồn tại trong `guide_steps`) thay vì `step_type` (NOT NULL) → mọi INSERT đều fail 500. Đồng thời gửi các cột không tồn tại `caption`, `layout`, `bg_color` bị PostgREST silent-drop.
    - *Xử lý:* Đổi sang `step_type`, xóa toàn bộ cột không tồn tại khỏi body.

17. **🟡 Bỏ Ghi `updated_at` Vào Cột Không Tồn Tại (`api/admin/guide-steps.js`):**
    - *Nguyên nhân:* PATCH step ghi `updated_at` nhưng `guide_steps` không có cột này → PostgREST silent-drop, mất audit trail.
    - *Xử lý:* Xóa dòng gán `fields.updated_at`.

18. **🔴 Xóa Ghi `locket_choice` Vào Cột Không Tồn Tại (`api/guide/complete.js`):**
    - *Nguyên nhân:* Ghi `locket_choice` vào `access_codes` (cột không tồn tại) → dữ liệu `choice` bị mất hoàn toàn.
    - *Xử lý:* Xóa theo yêu cầu chủ dự án — không cần lưu choice. Đồng thời dọn biến `what`, `pkg` dead code và import thừa `setAppConfig`, `isPermPackage`.

19. **🔴 Bảo mật Endpoint Diagnostic Telegram (`api/_lib/telegram-bot.js`):**
    - *Nguyên nhân:* Endpoint `?diag=1` lộ `token_prefix`, `admin_ids`, `botInfo`, `hookInfo` công khai không cần xác thực.
    - *Xử lý:* Thêm kiểm tra `isTgAdmin` — chỉ admin mới xem được diagnostic.

20. **🟠 Sửa NULL Semantics Trong Đếm Session (`api/admin/stats.js`):**
    - *Nguyên nhân:* Query `is_kicked=eq.false` loại bỏ các session có `is_kicked = NULL` (SQL NULL semantics) → đếm thiếu session.
    - *Xử lý:* Đổi thành `or=(is_kicked.is.null,is_kicked=eq.false)` — khớp với cách xử lý an toàn trong `sessions.js`.

21. **🟢 Xóa Dead Code Badge Choice (`admin.html`):**
    - *Nguyên nhân:* `choiceBadge` đọc `c.locket_choice` (cột không tồn tại) → badge luôn rỗng.
    - *Xử lý:* Xóa toàn bộ khối `choiceBadge` và tham chiếu `${choiceBadge}` trong template mã truy cập.

22. **⚡ Tái Cấu Trúc NextDNS Tự Động Trực Tiếp Vào Tab DNS Riêng & DNS Pool + Tối Ưu Mobile Safari:**
    - *Mục tiêu:* Loại bỏ tab NextDNS độc lập, tích hợp công cụ tự động NextDNS trực tiếp vào 2 tab nghiệp vụ cốt lõi:
      1. **Tab DNS Riêng (`tab-dnsgen`):** Tạo 1 tài khoản NextDNS mỗi lần theo mã khách hàng (`customer_code`). Tự động nhận diện gói (`5s`/`15s`), đăng ký tài khoản với denylist chuẩn, lưu `email`, `password`, `dns_url` vào `private_dns_links`, giải phóng khách khỏi pool nếu có (`releaseCustomerFromDnsPool`), sinh link và tin nhắn Zalo 1-chạm. Tối ưu giao diện trên Mobile Safari (lưới nút thao tác 2 cột `.dns-row-actions`, layout co giãn mượt mà).
      2. **Tab DNS Pool (`tab-dnspool`):** Tự động tạo tài khoản NextDNS theo lô (1, 5, 10 tài khoản) với nhóm gói tùy chọn (`5s`/`15s`), nạp thẳng `dns_url` vào `dns_pool` (`max_uses` mặc định 5, `used_codes: []`). Vòng lặp tuần tự phía client chống Vercel timeout 10s, có progress bar realtime.
    - *Kiến trúc & Backend:* Giữ nguyên 11 Serverless Functions. Bổ sung 2 action `dns_auto_create_private` và `dns_auto_create_pool` vào `api/admin/customers.js`, tận dụng `createNextDnsAccountHelper` trong `api/_lib/utils.js`. Dọn dẹp triệt để tab NextDNS độc lập và các hàm JS dead code.

23. **⚡ Chuyển Đổi Toàn Diện Sang 100% DNS Riêng 1:1 (Loại Bỏ Hoàn Toàn DNS Pool Dùng Chung):**
    - *Mục tiêu:* Xóa bỏ hoàn toàn mô hình DNS pool dùng chung (rotate 5 khách/link) để tránh tình trạng nghẽn kết nối, cạn kiệt slot và chặn tạo mã khi pool đầy. Mỗi khách hàng được cấp riêng 1 tài khoản DNS NextDNS 1:1 độc lập, không dùng chung với bất kỳ ai.
    - *Dual-Trigger Automation:*
      1. **Trigger 1 (Khi tạo khách):** `create-customer.js` tự động gọi `getOrCreatePrivateDns` đăng ký tài khoản NextDNS riêng, gán Denylist chuẩn theo gói (5s/15s) và lưu vào `private_dns_links`.
      2. **Trigger 2 (Just-In-Time tại Guide):** Nếu NextDNS API gặp độ trễ lúc tạo khách, khi khách mở `guide.html` (bước cài DNS), hệ thống kiểm tra và tự động lazy-provision tài khoản DNS riêng tức thời.
    - *Tương thích ngược 100% (Backward Compatibility):* `validate.js?action=dns_pool_claim` và `utils.js:claimDnsFromPool` chuyển hướng phục vụ DNS riêng 1:1 mà không làm đứt gãy khách hàng đang sử dụng.
    - *Giao diện Admin & Clean Architecture:* Loại bỏ tab "DNS mặc định" (`tab-dnspool`), modal chi tiết pool và các hàm quản trị pool. Đổi tên tab DNS thành "Quản lý DNS (1:1 Riêng Biệt)". Gỡ bỏ hoàn toàn logic chặn tạo mã/cấp mã khi pool đầy.
 24. **⚡ Chuẩn Hóa Tái Sử Dụng Slot DNS Trống (`[AVAILABLE]`), Ràng Buộc Bất Biến 1 Khách 1 DNS 1:1 & Tối Ưu Toàn Diện Giao Diện Mobile/Desktop:**
    - *Ràng buộc bất biến 1:1 (Strict 1:1 Invariant):* Một khách hàng tuyệt đối không thể sở hữu 2 tài khoản DNS riêng biệt trong cùng một thời điểm. Mọi quy trình nâng cấp gói (30k -> 40k), hạ cấp (40k -> 30k), gán thủ công hoặc xóa khách hàng đều tự động kiểm tra và thu hồi triệt để slot DNS cũ trước khi cấp slot mới.
    - *Tái sử dụng 100% tài nguyên (Zero-Waste Recycling):* Khi tạo khách mới hoặc cấp lại mã, hệ thống luôn ưu tiên quét và tái sử dụng các slot DNS trống sẵn có trong kho (`[AVAILABLE]`) trước tiên. Chỉ khi toàn bộ kho trống không còn slot khớp nhóm gói (`5s` / `15s`), hệ thống mới gọi API NextDNS để tạo tài khoản mới. Cơ chế này đạt độ trễ 0ms và loại bỏ hoàn toàn lãng phí tài khoản NextDNS.
    - *Chuẩn hóa cờ `[AVAILABLE]` & Phòng ngừa lỗi PostgREST:* Thay thế toàn bộ các cờ Unicode tiếng Việt có dấu (`[SẴN SÀNG]`, `[THU HỒI]`) bằng định dạng chuẩn ASCII `[AVAILABLE]`. Triệt tiêu hoàn toàn mã lỗi HTTP 400 Bad Request do URI encoding của PostgREST, sử dụng hàm helper `isDnsSlotAvailable(r)` kiểm tra an toàn trong bộ nhớ Node.js.
    - *Nút Thu Hồi 1 Chạm trên CRM:* Bổ sung nút bấm trực quan `♻ Thu hồi` cho từng dòng DNS đang hoạt động trong bảng Admin, cho phép kỹ thuật viên chủ động giải phóng bất kỳ slot DNS nào về kho trống `[AVAILABLE]` chỉ bằng 1 thao tác.
    - *Tối ưu hóa hiển thị Responsive Mobile & Desktop toàn diện:*
      - `admin.html`: Khắc phục lỗi thiếu CSS Grid cho `.quick-btns` trên màn hình Desktop lớn; tối ưu thanh filter danh mục 1 dòng vuốt ngang cảm ứng mượt mà trên Mobile Safari; bố trí lại Modal Sổ cái khách hàng dạng 2 cột trực quan.
      - `guide.html`: Cấu hình chuẩn `viewport-fit=cover`, bù trừ chính xác `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`. Tăng padding nội dung lên `calc(96px + env(safe-area-inset-bottom))` để triệt tiêu hoàn toàn hiện tượng thanh điều hướng cố định (Fixed Navbar) che khuất nút thao tác trên iPhone có tai thỏ / Dynamic Island.
      - `dns.html` & `index.html`: Bổ sung safe-area padding và breakpoints thích ứng cho các dòng iPhone cỡ nhỏ (< 360px).

 25. **🎨 Tối Ưu Pixel-Perfect Giao Diện Admin & Khắc Phục Triệt Để Lỗi Bất Đối Xứng Gây Khó Chịu Thị Giác (OCD Design Fix) (2026-09-12):**
     - **Vấn đề thị giác & Nguyên nhân gốc rễ:**
       1. *Lệch dòng & Nhảy bố cục Thẻ chọn gói (`.pkg-card-btn`):* Trong Modal Chi tiết khách (`#detailModal`), Form Tạo khách (`#custCreateCard`), Form DNS (`#tab-dnsgen`), Modal Sửa (`#editModal`):
          - Vòng tròn tích chọn (`.pkg-card-check`) trước đây dùng `display: none` khi chưa chọn và `display: flex` khi được chọn (`.active`). Điều này làm thẻ đang chọn bị mất 30px chiều ngang (20px width + 10px flex gap), ép phụ đề "5s Vĩnh viễn · 30.000đ" phải ngắt xuống 2 dòng, trong khi thẻ chưa chọn (Gói 40k) còn nguyên chiều rộng nên phụ đề chỉ có 1 dòng.
          - Hệ quả: Thẻ 30k cao 3 dòng chữ, thẻ 40k cao 2 dòng chữ. Thuộc tính `align-items: center` kéo tiêu đề "Gói 30k" lệch cao hơn tiêu đề "Gói 40k" khoảng 8px trên cùng một hàng.
          - Hiệu ứng `transform: translate(-1px, -1px)` trên thẻ `.active` làm cạnh trên của thẻ được chọn bị lệch cao hơn 1px so với thẻ bên cạnh.
          - Biểu tượng Star dùng emoji `⭐` (ngôi sao phẳng) và `🌟` (ngôi sao phát sáng), khác biệt về kích thước quang học và trọng số màu, vi phạm nguyên tắc "NO emojis as UI icons".
       2. *Vỡ hàng Nút Thao tác Thẻ DNS Riêng (`.dns-row-actions`):*
          - Thuộc tính `max-width: 320px; flex-wrap: wrap;` trên Desktop khiến khi xuất hiện nút `Gán khách` (hoặc khi font co giãn), tổng chiều rộng của 4 nút (`Copy link`, `Gán khách`, `Sửa`, `Xóa`) vượt quá 320px, ép nút `Xóa` bị rớt xuống dòng 2 một mình trơ trọi (orphan button), làm vỡ toàn bộ lưới thẳng hàng dù màn hình máy tính còn rất nhiều khoảng trống.
          - Dùng emoji làm icon nút (`⧉`, `👤`, `♻️`, `✎`, `↻`, `🗑️`) và badge gói (`🟢 5s` vs `40k`), Twemoji thay thế bằng thẻ `<img>` không đồng đều về kích thước.
     - **Giải pháp triệt để:**
       1. *Vòng tròn Radio Indicator cố định 100% kích thước:*
          - `.pkg-card-check` luôn hiện diện trên CẢ HAI thẻ (đã chọn và chưa chọn) với kích thước cố định `18x18px`, `flex-shrink: 0`.
          - Thẻ chưa chọn: Vòng tròn viền mảnh `1.5px solid rgba(26,26,26,0.25)`, SVG tick ẩn (`display: none`).
          - Thẻ đã chọn: Vòng tròn viền mực đen `2px solid var(--ink)` và bóng đổ cứng, SVG tick hiện (`display: block`).
          - Triệt tiêu hoàn toàn layout shift: Hai thẻ luôn có khoảng không gian ngang dành cho văn bản bằng nhau tuyệt đối, chuyển đổi mượt mà không dịch chuyển dù chỉ 1 pixel.
       2. *Khóa cứng phụ đề 1 dòng & Căn thẳng Baseline chữ:*
          - Thêm `white-space: nowrap;` vào `.pkg-card-sub` và `.pkg-card-title`. Tinh chỉnh padding `9px 10px` và font-size `0.68rem` để nội dung luôn nằm gọn trên 1 dòng đơn.
          - Tiêu đề thẻ chuẩn hóa thành **"Gói 30.000đ"** và **"Gói 40.000đ"**, phụ đề bên dưới rút gọn thành **"5s Vĩnh viễn"** và **"15s Vĩnh viễn"**, loại bỏ hoàn toàn sự lặp lại giá tiền thừa thãi (`· 30.000đ` / `· 40.000đ`), tạo sự cân đối thị giác hoàn hảo giữa 2 thẻ.
          - Bỏ `transform: translate(-1px, -1px)` trên `.pkg-card-btn.active`. Cả hai thẻ nằm trên cùng một mặt phẳng ngang, tiêu đề và phụ đề thẳng hàng trục tọa độ Y tuyệt đối.
       3. *Vector hóa Icon SVG chuẩn công nghiệp:*
          - Thay thế toàn bộ emoji `⭐` và `🌟` bằng SVG vector 20x20px chuẩn (5 cánh vàng `#F5C842` viền mực `#1A1A1A`), phiên bản 40k điểm thêm tia sáng tinh tế, tâm quang học và chiều cao đồng nhất 100%.
          - Chuẩn hóa icon SVG cho các thẻ DNS (Lucide Shield) và thẻ Trạng thái (Lucide Clock, CheckCircle).
       4. *Chuẩn hóa Hàng Nút DNS Riêng (.dns-row-actions):*
          - Bỏ giới hạn `max-width: 320px`, áp dụng `flex-wrap: nowrap;` trên Desktop (>768px). Toàn bộ 4-5 nút thao tác luôn dàn đều trên 1 hàng ngang duy nhất, chiều cao đồng đều 30px, dùng icon Lucide SVG sắc nét.
          - Trên Mobile (<=768px): Tự động chuyển thành lưới 2 cột `grid-template-columns: repeat(2, 1fr)` cân xứng hoàn hảo.
          - Loại bỏ emoji `⚪`, `🟢`, `⚫`: Dùng chấm tròn CSS trạng thái `statusDot` 7x7px bo tròn viền đen sắc nét. Badge gói cước chuẩn hóa đồng nhất `5s` và `15s`.
          - Bỏ emoji `🔎` khỏi placeholder ô tìm kiếm.

 26. **⚡ Tối Ưu Lưới Thông Tin Khách Hàng (Symmetrical 2x4 Grid) & Loại Bỏ Trường "DNS Kết Nối" Thừa Thãi (2026-09-12):**
     - **Bối cảnh & Phân tích:**
       - Kể từ khi hệ thống chuyển đổi toàn diện sang **100% DNS Riêng 1:1** (loại bỏ hoàn toàn DNS pool dùng chung), tất cả khách hàng đều tự động sở hữu DNS riêng 1:1.
       - Việc hiển thị thẻ "DNS KẾT NỐI: 🌐 DNS Riêng (1:1)" trong Modal Chi tiết khách hàng (`#detailModal` -> `#dInfoGrid`) trở nên hoàn toàn dư thừa và lặp lại thông tin không cần thiết.
       - Đồng thời, trước đây thẻ "Trạng thái & Thanh toán" sử dụng class `info-span-2` (chiếm trọn 2 cột), làm đứt gãy luồng hiển thị 2 cột, tạo ra khoảng trống không cân xứng.
     - **Giải pháp xử lý:**
       - Loại bỏ hoàn toàn thẻ "DNS kết nối" khỏi `#dInfoGrid`.
       - Gỡ bỏ thuộc tính `info-span-2` khỏi thẻ "Trạng thái & Thanh toán", đưa thẻ này lên hàng 2 đứng sóng đôi cạnh thẻ "Gói dịch vụ".
       - Cấu trúc lưới thông tin 8 thẻ cân xứng hoàn hảo (2 cột x 4 hàng):
         - Hàng 1: `Mã khách hàng` | `Số điện thoại`
         - Hàng 2: `Gói dịch vụ` | `Trạng thái & Thanh toán`
         - Hàng 3: `Nền tảng` | `Flow hướng dẫn`
         - Hàng 4: `Kích hoạt lúc` | `Ngày tạo`
         - Các trường tùy chọn (nếu có: `Link liên hệ`, `Ghi chú`) chiếm trọn 2 cột ở dưới cùng mà không làm ảnh hưởng lưới 4 hàng phía trên.
       - Chuẩn hóa nhãn gói cước trong modal chi tiết thành `Gói 30.000đ (5s Vĩnh viễn)` và `Gói 40.000đ (15s Vĩnh viễn)`.

### Tiêu Chuẩn Kiểm Định Bắt Buộc Trước Khi Bàn Giao:
- Cú pháp toàn bộ file Node.js đạt chuẩn `node -c` (exit code 0).
- Toàn bộ script inline trong HTML (`admin.html`, `guide.html`, `index.html`) vượt qua kiểm tra cú pháp độc lập (`check_scripts.js`).
- Hạn mức tuyệt đối đúng 11 Serverless Functions Vercel được duy trì nguyên vẹn.
- Mọi thay đổi logic kinh doanh phải được ghi nhận đầy đủ, chi tiết vào cả `GEMINI.md` và `handover.md`.




