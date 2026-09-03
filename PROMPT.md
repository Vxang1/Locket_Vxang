# ⚡ SUPER ULTRA MEGA DEEP SPECIFICATION & MASTER SYSTEM PROMPT: LOCKET_VXANG
### CODED VERSION: LOCKET_VXANG (CYBER TECH ULTRA EDITION)
> **Thư mục làm việc của dự án:** `C:\Users\ADMIN\Downloads\Locket_Vxang`  
> **Tên hệ thống & Thương hiệu:** `Locket_Vxang`  
> **Kiến trúc:** Static HTML5/ES Modules + 11 Vercel Serverless Functions (Node.js CommonJS) + Supabase PostgreSQL (PostgREST REST API) + Firebase Realtime Database.  
> **Ngôn ngữ & Môi trường:** Node.js 24.x, Vanilla JS (ES2024), PostgREST REST API, HTML5 Canvas/PWA, CSS3 Custom Properties.  
> **Phong cách:** High-Tech / Cyberpunk Glassmorphism / Dark Modern Tech (Dark Space #07090e, Neon Cyan #00f0ff, Electric Violet #8b5cf6, Matrix Emerald #10b981).  
> **Thiết bị mục tiêu:** 100% Mobile iPhone (iOS) qua trình duyệt Safari thuần.  
> **Đặc trưng khách hàng:** CHỈ CÓ KHÁCH MỚI — KHÔNG PHÂN LOẠI KHÁCH BẢO HÀNH.

---

## 📑 MỤC LỤC TOÀN DIỆN (SYSTEM TABLE OF CONTENTS)
1. [Bối Cảnh Dự Án, Triết Lý Thiết Kế & Ràng Buộc Bất Biến](#1-bối-cảnh-dự-án-triết-lý-thiết-kế--ràng-buộc-bất-biến)
2. [Quy Tắc Quản Lý Khách Hàng: Chỉ Có Khách Mới - Không Có Khách Bảo Hành](#2-quy-tắc-quản-lý-khách-hàng-chỉ-có-khách-mới---không-có-khách-bảo-hành)
3. [Hệ Thống Thiết Kế Cyber Tech & Quy Chuẩn Mobile-Only Viewport](#3-hệ-thống-thiết-kế-cyber-tech--quy-chuẩn-mobile-only-viewport)
4. [Cơ Chế Khóa Cứng Thiết Bị iPhone & Ép Mở Bằng Safari](#4-cơ-chế-khóa-cứng-thiết-bị-iphone--ép-mở-bằng-safari)
5. [Đặc Tả Bảng Giá, Phân Gói & Chi Tiết 4 Kịch Bản Step Flows](#5-đặc-tả-bảng-giá-phân-gói--chi-tiết-4-kịch-bản-step-flows)
6. [Động Cơ Phân Giải DNS, DNS Pool Xoay Vòng & Link DNS Riêng Biệt](#6-động-cơ-phân-giải-dns-dns-pool-xoay-vòng--link-dns-riêng-biệt)
7. [Cơ Chế Chống Chia Sẻ Mã & Anti-Share Live Heartbeat](#7-cơ-chế-chống-chia-sẻ-mã--anti-share-live-heartbeat)
8. [Hệ Thống Scraper Cào Tài Khoản Apple ID On-Demand Đa Tầng](#8-hệ-thống-scraper-cào-tài-khoản-apple-id-on-demand-đa-tầng)
9. [Telegram Bot Webhook: Thông Báo Sự Kiện & Tra Cứu CRM](#9-telegram-bot-webhook-thông-báo-sự-kiện--tra-cứu-crm)
10. [Mã Nguồn Mẫu Hoàn Chỉnh: Thư Viện Lõi api/_lib/utils.js](#10-mã-nguồn-mẫu-hoàn-chỉnh-thư-viện-lõi-api_libutilsjs)
11. [Mã Nguồn Mẫu Hoàn Chỉnh: Webhook Telegram Bot api/_lib/telegram-bot.js](#11-mã-nguồn-mẫu-hoàn-chỉnh-webhook-telegram-bot-api_libtelegram-botjs)
12. [Đặc Tả Chi Tiết 11 Serverless Functions (Full API Contracts & Implementation)](#12-đặc-tả-chi-tiết-11-serverless-functions-full-api-contracts--implementation)
13. [Đặc Tả & Blueprint Mã Nguồn 4 Giao Diện Frontend (HTML / CSS / JS)](#13-đặc-tả--blueprint-mã-nguồn-4-giao-diện-frontend-html--css--js)
14. [Cấu Trúc Cơ Sở Dữ Liệu Chi Tiết (Full Supabase SQL DDL & Firebase RTDB Tree)](#14-cấu-trúc-cơ-sở-dữ-liệu-chi-tiết-full-supabase-sql-ddl--firebase-rtdb-tree)
15. [Cấu Hình Hạ Tầng (vercel.json, package.json)](#15-cấu-hình-hạ-tầng-verceljson-packagejson)
16. [Quy Trình Quản Lý Ngữ Cảnh Bắt Buộc (SOP gemini.md & handover.md) & Hướng Dẫn Khởi Tạo](#16-quy-trình-quản-lý-ngữ-cảnh-bắt-buộc-sop-geminimd--handovermd--hướng-dẫn-khởi-tạo)

---

## 1. BỐI CẢNH DỰ ÁN, TRIẾT LÝ THIẾT KẾ & RÀNG BUỘC BẤT BIẾN

### 1.1. Bối Cảnh & Mục Tiêu
Hệ thống **`Locket_Vxang`** là nền tảng quản trị và hỗ trợ cài đặt gói dịch vụ Locket Gold Vĩnh Viễn cho người dùng iOS (iPhone/iPad) tại Việt Nam. Dự án biến các thao tác phức tạp (cài chứng chỉ, DNS DoH HTTPS, Shadowrocket, VPN, hạ cấp IPA) thành một quy trình từng bước trực quan, tự động và chuẩn mực nhất.

### 1.2. 5 Nguyên Tắc Bất Biến (Immutable Core Rules)
1. **Zero-Build & Zero-Dependency Tầng Frontend:**
   - Tuyệt đối không sử dụng Webpack, Vite, Babel, Next.js, Nuxt.js, React, Vue, Svelte hay Tailwind CLI.
   - Toàn bộ giao diện người dùng phải được viết bằng HTML5 tĩnh, CSS3 thuần (kết hợp CSS Variables) và Vanilla JavaScript (sử dụng ES Modules native).
   - Mã nguồn deploy tức thì lên Vercel Edge/Serverless mà không cần compile. Thư viện CDN duy nhất được phép dùng là `xlsx.full.min.js` (trong `admin.html`) để xuất báo cáo Excel cho Admin.
2. **Hạn Mức Tuyệt Đối 11 Serverless Functions (Vercel Hobby Quota):**
   - Dự án `Locket_Vxang` bắt buộc giữ đúng **chính xác 11 Serverless Functions** (gồm 7 endpoint `api/admin/*` và 4 endpoint `api/guide/*`).
   - Mọi module dùng chung, router webhook Telegram, database adapter, helper tính toán đặt trong thư mục `api/_lib/` (không tính vào quota functions của Vercel).
3. **Database Không Sử Dụng SDK Nặng:**
   - Cơ sở dữ liệu Supabase PostgreSQL được truy cập hoàn toàn thông qua **PostgREST REST API** bằng hàm `fetch` tích hợp sẵn trong Node.js.
   - Bật HTTP Connection Keep-Alive (`keepalive: true`, `Connection: keep-alive`) và timeout ngắn (7000ms qua AbortController) để giảm thiểu tối đa độ trễ mạng và loại bỏ hoàn toàn Cold Start kéo dài.
4. **Loại Bỏ Remote Token Injection (Không Dùng RevenueCat StoreKit 2):**
   - Loại bỏ hoàn toàn module `locket-gold.js`, các API nạp token StoreKit 2 từ xa, parser file capture `.txt`, lệnh bot `/gold`, `/token`.
   - Khách hàng sau khi hoàn tất các bước trên web sẽ được điều hướng đến màn hình hoàn thành (`completeScreen`), kèm checklist hướng dẫn chụp ảnh màn hình và nút 1-chạm gửi Zalo/Telegram cho Admin xác nhận.
5. **Loại Bỏ Trang Shadowrocket OTA Độc Lập:**
   - Không tạo và không sử dụng file `shadowrocket.html` hay route rewrite `/shadowrocket`.
   - Việc cài đặt ứng dụng Shadowrocket được tích hợp trực tiếp vào **Bước 1** của màn hình `guide.html` thông qua tài khoản Apple ID được cấp tự động từ scraper on-demand.

---

## 2. QUY TẮC QUẢN LÝ KHÁCH HÀNG: CHỈ CÓ KHÁCH MỚI - KHÔNG CÓ KHÁCH BẢO HÀNH

Đây là một nguyên tắc cốt lõi giúp hệ thống `Locket_Vxang` trở nên tinh gọn, tối giản và vận hành trơn tru:

### 2.1. Không Phân Loại Khách Hàng (Uniform Customer Entity)
- Toàn bộ khách hàng trong hệ thống đều là **khách mua mới**.
- **Loại bỏ hoàn toàn trường `type`** (`'moi'` / `'bh'` / `'renew'`) trong cơ sở dữ liệu và trong tất cả các API requests/responses.
- Trong form "➕ Tạo khách mới": **KHÔNG CÓ dropdown hay radio button chọn loại khách** (Khách mới / Bảo hành). Mọi khách tạo ra đều có cùng một cấu trúc chuẩn.
- Trong bảng quản trị CRM (`admin.html`): **KHÔNG CÓ bộ lọc theo loại khách** (nút lọc "Khách mới" / "Bảo hành" bị loại bỏ hoàn toàn). Chỉ lọc theo gói (`30k` / `40k`) và trạng thái hoàn thành.

### 2.2. Không Có Khái Niệm Hạn Bảo Hành (Permanent Packages)
- Vì dịch vụ chỉ có 2 gói Vĩnh Viễn (Gói 30k 5s và Gói 40k 15s), hệ thống **KHÔNG tính toán hạn bảo hành**:
  - Không có hàm `calculateWarrantyEnd()` hay `getWarrantyStatus()`.
  - Bảng `customers` không có cột `warranty_started_at` (thay bằng `activated_at` ghi nhận thời điểm hoàn thành lần đầu).
  - Không có khái niệm "Gia hạn bảo hành" hay "Hết hạn bảo hành".

### 2.3. Cấp Mã Truy Cập Cho Khách Cũ Khi Cần Cài Lại (Re-Install Code)
- Khi một khách hàng cũ đổi điện thoại hoặc lỡ xóa ứng dụng cần cài lại, Admin chỉ cần bấm nút **"➕ Cấp mã mới"** trong Modal Chi Tiết Khách Hàng.
- Mã mới sinh ra là một mã truy cập thông thường (`XW-xxxxxx`) có thời hạn 30 phút để khách thực hiện lại các bước, **hoàn toàn KHÔNG bị gắn nhãn là "mã bảo hành"** hay truyền cờ `is_renew: true`.

### 2.4. Duy Nhất Một Mẫu Tin Nhắn Zalo Chuẩn Gửi Khách
- Khi tạo khách mới hoặc khi bấm vào mã truy cập chưa kích hoạt, hệ thống chỉ hiển thị **DUY NHẤT 1 MẪU TIN NHẮN ZALO** (Mẫu Khách Mới chuẩn Safari).
- Loại bỏ hoàn toàn nút chuyển đổi qua lại giữa *"Mẫu Khách Mới"* và *"Mẫu Vào Lại / Update / BH"*.
### 2.5. Tinh Gọn Form Nhập: Ô Nhập SĐT & Link Profile Là Một Ô Duy Nhất (Smart Single Contact Input)
- **Thiết Kế Tối Giản Tột Cùng:** Thay vì để 2 ô riêng biệt ("Số điện thoại" và "Link mạng xã hội"), form Tạo Khách Mới và Modal Sửa Khách chỉ có **DUY NHẤT 1 Ô NHẬP LIỆU LIÊN HỆ**:
  `📞 Số điện thoại hoặc Link Profile (Zalo / FB / Telegram / TikTok...)`
- **Thuật Toán Tự Động Phân Loại Thông Minh (`parseContactInput`):**
  ```javascript
  function parseContactInput(input) {
    const str = String(input || '').trim();
    if (!str) return { phone: '', social_link: '', social_platform: 'zalo' };
    
    // Nếu là URL hoặc chứa domain MXH
    if (/^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(str) || /facebook\.com|fb\.com|zalo\.me|t\.me|tiktok\.com|instagram\.com|\//i.test(str)) {
      let platform = 'zalo';
      if (/facebook\.com|fb\.com/i.test(str)) platform = 'facebook';
      else if (/t\.me|telegram/i.test(str)) platform = 'telegram';
      else if (/tiktok\.com/i.test(str)) platform = 'tiktok';
      else if (/instagram\.com/i.test(str)) platform = 'instagram';
      else if (/zalo\.me/i.test(str)) platform = 'zalo';
      
      let link = str;
      if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
      
      // Nếu link Zalo có kèm SĐT: zalo.me/0912345678
      const phoneMatch = str.match(/zalo\.me\/(0[0-9]{9}|\+84[0-9]{9})/);
      const phone = phoneMatch ? phoneMatch[1] : '';
      return { phone, social_link: link, social_platform: platform };
    }
    
    // Nếu là số điện thoại (chỉ có số hoặc dấu +)
    const cleanDigits = str.replace(/[^0-9+]/g, '');
    if (cleanDigits.length >= 8) {
      const standardPhone = cleanDigits.replace(/^\+84/, '0');
      return {
        phone: standardPhone,
        social_link: `https://zalo.me/${standardPhone}`,
        social_platform: 'zalo'
      };
    }
    
    return { phone: '', social_link: str, social_platform: 'zalo' };
  }
  ```
- **Trải Nghiệm Admin Vượt Trội:**
  - Admin dán SĐT `0912345678` ➔ Hệ thống tự động nhận diện SĐT và tự sinh link Zalo `https://zalo.me/0912345678`.
  - Admin dán link FB `https://facebook.com/quyen` ➔ Hệ thống tự động nhận diện nền tảng là Facebook và lưu link.
  - Tốc độ tạo khách tăng gấp đôi, loại bỏ hoàn toàn các thao tác thừa thãi!


---

## 3. HỆ THỐNG THIẾT KẾ CYBER TECH & QUY CHUẨN MOBILE-ONLY VIEWPORT

### 3.1. Cyber Glassmorphism Design System Tokens
Toàn bộ 4 file HTML (`index.html`, `guide.html`, `admin.html`, `dns.html`) tuân thủ nghiêm ngặt bảng thông số CSS Design Tokens dưới đây:

```css
:root {
  /* Dark Space Surfaces */
  --bg: #07090e;
  --bg-surface: #0f172a;
  --bg-card: rgba(15, 23, 42, 0.78);
  --bg-card-hover: rgba(30, 41, 59, 0.85);
  
  /* Cyber Tech Borders & Glows */
  --border: rgba(0, 240, 255, 0.16);
  --border-focus: #00f0ff;
  --border-glow: 0 0 15px rgba(0, 240, 255, 0.25);
  
  /* Primary Cyber Accents */
  --p1: #00f0ff;               /* Neon Cyan - Tín hiệu chính */
  --p2: #8b5cf6;               /* Electric Violet - Chuyển sắc Gradient */
  --accent: #10b981;           /* Matrix Emerald - Trạng thái Hoạt động */
  
  /* Status Colors */
  --text: #f8fafc;             /* Pure High-contrast White */
  --text-dim: #94a3b8;         /* Secondary Steel */
  --muted: #64748b;            /* Muted Slate */
  --warning: #f59e0b;          /* Cyber Amber - Chờ thu tiền / Cảnh báo */
  --red: #ef4444;              /* Neon Crimson - Lỗi / Khóa gian lận */
  
  /* Geometry & Touch Target */
  --radius: 14px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --tap: 44px;                 /* Vùng bấm tối thiểu theo chuẩn Apple HIG */
  
  /* Safe-Area Insets */
  --sa-top: env(safe-area-inset-top, 0px);
  --sa-bottom: env(safe-area-inset-bottom, 0px);
}
```

### 3.2. Hiệu Ứng Bề Mặt & Nút Bấm Công Nghệ 3D (Cyber Controls)
- **Kính Mờ (Glassmorphism):**  
  `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);`
- **Nút Bấm 3D Neon Glow:**
  ```css
  .btn-cyber {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: var(--tap);
    padding: 13px 18px;
    border: none;
    border-radius: var(--radius);
    background: linear-gradient(135deg, var(--p1), var(--p2));
    color: #030712;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.92rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 4px 0 #4c1d95, 0 0 20px rgba(0, 240, 255, 0.28);
    transition: all 0.15s ease;
    touch-action: manipulation;
  }
  .btn-cyber:hover {
    filter: brightness(1.08);
    box-shadow: 0 4px 0 #4c1d95, 0 0 28px rgba(0, 240, 255, 0.45);
  }
  .btn-cyber:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #4c1d95, 0 0 10px rgba(0, 240, 255, 0.2);
  }
  .btn-cyber:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: grayscale(0.8);
  }
  ```

### 3.3. Quy Chuẩn Tỷ Lệ Màn Hình Mobile-Only (Mobile-Exclusive Ratio)
Toàn bộ hệ thống sinh ra nhằm mục đích phục vụ khách hàng trên điện thoại di động iPhone. Không được dàn trang dạng desktop:
1. **Khung Hiển Thị Mobile Container:**
   - Các trang `index.html`, `guide.html`, `dns.html` bắt buộc gói gọn trong container:
     `max-width: 440px; margin: 0 auto; min-height: 100vh; min-height: 100dvh;`
   - Khi mở trên màn hình máy tính hoặc iPad, trang web hiển thị căn giữa gọn gàng như một chiếc iPhone độc lập, không bị kéo bè ngang.
2. **Khai Báo Meta Viewport & Viewport-Fit Chuẩn Apple:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
   ```
   - Khai báo `viewport-fit=cover` là bắt buộc để trình duyệt Safari mở rộng viewport xuống dưới tai thỏ (Notch) / Dynamic Island và thanh gạch ngang Home Bar.
3. **Sử Dụng `100dvh` Khắc Phục Lỗi Thanh Safari:**
   - Trên iOS Safari, đơn vị `100vh` tính cả phần chiều cao thanh địa chỉ và thanh công cụ dưới đáy, làm sinh thanh cuộn thừa và giật trang. Bắt buộc dùng:
     ```css
     min-height: 100vh;
     min-height: 100dvh;
     ```
4. **Chống Lỗi Tự Động Phóng To Trên iPhone (Auto-Zoom Trap):**
   - Trên iOS Safari, nếu phần tử `<input>`, `<select>`, `<textarea>` có `font-size` nhỏ hơn `16px`, trình duyệt sẽ tự động zoom to màn hình khi người dùng chạm vào, làm lệch layout.
   - **Quy tắc bất biến:** Mọi ô nhập liệu bắt buộc phải đặt:
     `font-size: 16px !important;`
5. **Chống Tràn Ngang & Tối Ưu Chữ (Zero Horizontal Overflow):**
   - Toàn bộ `body` và `.page` thiết lập `overflow-x: hidden;`.
   - Các chuỗi token, URL, mã truy cập có `word-break: break-all; overflow-wrap: anywhere;`.
   - Huy hiệu trạng thái, nhãn nút có `white-space: nowrap;` để không rớt dòng bừa bãi trên các dòng máy nhỏ như iPhone SE/mini (375px).
6. **Xử Lý Safe-Area Cho Dynamic Island & Home Bar:**
   ```css
   padding-top: calc(14px + env(safe-area-inset-top, 0px));
   padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
   ```
7. **Thanh Điều Hướng Đáy Mỏng Nhẹ (`#navBar`):**
   - Thanh đáy được cố định (`position: fixed; bottom: 0; left: 0; right: 0;`).
   - Sử dụng JavaScript `syncBarHeights()` kết hợp `ResizeObserver` để đo chiều cao thực tế của topbar và navbar, gán vào CSS Variables `--topbar-h` và `--navbar-h` nhằm bù đệm padding chính xác cho vùng nội dung cuộn bên dưới, không bao giờ để thanh đáy che khuất nội dung bước cuối.

---

## 4. CƠ CHẾ KHÓA CỨNG THIẾT BỊ IPHONE & ÉP MỞ BẰNG SAFARI

### 4.1. Các Hàm Kiểm Tra Định Danh Thiết Bị & Trình Duyệt
Nhúng trực tiếp vào `index.html`, `guide.html`, `dns.html`:
```javascript
// Kiểm tra thiết bị iOS (iPhone / iPad)
function isIOS() {
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  return /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Kiểm tra trình duyệt tích hợp (In-App WebView)
function isInAppBrowser() {
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  return /zalo|zalomessenger|fbav|fban|fb_iab|messenger|instagram|tiktok|snapchat|line\/|micromessenger|telegram|crios|fxios|edgios/i.test(ua);
}
```

### 4.2. Hai Kịch Bản Chặn Bằng Modal Toàn Màn Hình
1. **Kịch Bản 1 — Khách Mở Bằng PC, Laptop, Android (`!isIOS()`):**
   - Modal hiển thị icon `📱`, tiêu đề: `Yêu Cầu Mở Trên iPhone`.
   - Cảnh báo: `⛔ Dịch vụ Locket_Vxang chỉ hỗ trợ cài đặt trên điện thoại iPhone / iPad. Vui lòng không sử dụng máy tính, PC hay Android!`.
   - Hướng dẫn: Bấm nút sao chép link ➔ Gửi qua Zalo/Tin nhắn cho chính bạn ➔ **Dùng iPhone mở link đó bằng Safari** để tiếp tục.
2. **Kịch Bản 2 — Khách Mở Trên iPhone Nhưng Dùng Trình Duyệt Nhúng (`isInAppBrowser()`):**
   - Modal hiển thị icon `🧭`, tiêu đề: `Bắt Buộc Mở Bằng Safari`.
   - Cảnh báo: `⛔ Trình duyệt ứng dụng này chặn tải file cấu hình DNS và chứng chỉ. Bạn bắt buộc phải chuyển sang Safari trên iPhone!`.
   - Cung cấp 2 hướng giải quyết:
     - *Cách 1:* Bấm dấu ba chấm **(•••)** ở góc màn hình ➔ Chọn **"Mở bằng trình duyệt"** (Safari).
     - *Cách 2:* Bấm nút `📋 Sao chép liên kết để mở Safari` ➔ Mở ứng dụng **Safari** trên màn hình chính iPhone và dán link vào.
   - Vô hiệu hóa nút đóng modal (modal không có nút tắt) và disable ô nhập mã truy cập.
3. **Cơ Chế Dev Mode Bypass Cho Lập Trình Viên:**
   - Trong Admin Panel, hỗ trợ nút bấm *"🛠️ Dev Mode"*. Khi bật, nó ghi `xw_dev_mode = 1` vào `localStorage` và cập nhật node `appstore/dev_mode = true` trên Firebase RTDB.
   - Khi cờ `dev_mode` kích hoạt, toàn bộ logic chặn thiết bị và chặn WebView được tự động bỏ qua, cho phép Admin/Dev test và debug hệ thống thoải mái trên PC/Chrome.

### 4.3. Mẫu Tin Nhắn Zalo Chuẩn Hướng Dẫn Safari (Duy Nhất 1 Mẫu)
Được định dạng sẵn trong `admin.html` để Admin copy 1-chạm gửi khách qua Zalo:
```text
Xwuan gửi thông tin dịch vụ Locket_Vxang của bạn nè! 🌟

👤 Mã khách hàng:
KH-xxxxxxx

🔑 Mã truy cập:
XW-xxxxxx

🔗 Link website:
[domain_locket_vxang]

📲 Hướng dẫn vào:
1. Mở ứng dụng SAFARI trên iPhone
2. Truy cập link trên
3. Nhập mã truy cập → Bấm Xác nhận
4. Làm theo đúng từng bước hướng dẫn nhé!

⏱ Lưu ý: Mã có hiệu lực trong 30 phút kể từ lúc xác thực. Bạn tranh thủ làm luôn một lần nhé!
```

---

## 5. ĐẶC TẢ BẢNG GIÁ, PHÂN GÓI & CHI TIẾT 4 KỊCH BẢN STEP FLOWS

### 5.1. Cấu Trúc Bảng Giá (`PRICING` Matrix)
Chỉ cung cấp **2 gói Vĩnh viễn**, không có chu kỳ 6 tháng hay 1 năm:
```javascript
const PRICING = {
  '30k': {
    'perm': { price: 30000, label: '5s Vĩnh viễn - 30k', months: null, pkg_type: '5s' }
  },
  '40k': {
    'perm': { price: 40000, label: '15s Vĩnh viễn - 40k', months: null, pkg_type: '15s' }
  }
};
```

### 5.2. Chi Tiết 4 Kịch Bản Step Flows
Mỗi gói được chia thành 2 nhánh flow tùy thuộc vào trường `customers.special_flow` (Khách thông thường vs Khách đặc biệt):

#### 🅰️ GÓI 30K (5S VĨNH VIỄN):
1. **Flow Thông Thường (`special_flow = false` - 3 bước):**
   - **Bước 1 — Cài Shadowrocket:**
     - Gọi `GET /api/guide/validate?action=appstore` lấy Apple ID.
     - Hiển thị thẻ sao chép Email và Password 1-chạm (mật khẩu che `••••••••`).
     - Hộp lưu ý: `⛔ LƯU Ý QUAN TRỌNG: Giữ lại app Shadowrocket trên máy, tuyệt đối không được xóa app Shadowrocket đi.`
     - Hộp hướng dẫn: `💡 Tải xong Shadowrocket thì phải đăng xuất tài khoản App Store của shop rồi đăng nhập lại tài khoản App Store cá nhân của bạn.`
     - Video hướng dẫn cài đặt Shadowrocket từ App Store.
   - **Bước 2 — Cài đặt DNS 5s:**
     - Gọi `GET /api/guide/validate?action=dns_pool_claim` lấy URL DNS (nhóm `5s`).
     - Nút tải file cấu hình DNS 5s: `⬇ Tải file DNS về máy` (tạo file `Locket_Vxang.mobileconfig`).
     - Video hướng dẫn cài và tin cậy hồ sơ cấu hình trong Cài đặt iPhone.
   - **Bước 3 — Lên Locket Gold:**
     - Nút sao chép link Config Locket Gold (Module Locket).
     - Cảnh báo: `⚠️ CẢNH BÁO QUAN TRỌNG: Đây là bước bắt buộc để duy trì Locket Gold ổn định.`
     - Video hướng dẫn dán link cấu hình vào Shadowrocket.
2. **Flow Đặc Biệt (`special_flow = true` - 3 bước):**
   - **Bước 1 — Cài Shadowrocket:**
     - Lấy tài khoản shop.
     - Lưu ý đặc biệt: `⚠️ Tải xong Shadowrocket KHÔNG ĐĂNG XUẤT tài khoản App Store vì cần phải dùng cho bước cài Locket IPA tiếp theo.`
   - **Bước 2 — Cài Locket IPA Hạ Cấp:**
     - Nút tải OTA qua manifest: `⬇ Tải Locket IPA` (giao thức `itms-services://?action=download-manifest&url=...`).
     - Cảnh báo cực kỳ quan trọng viền đỏ đậm: `⛔ LƯU Ý CỰC KỲ QUAN TRỌNG: Tuyệt đối KHÔNG ĐƯỢC XÓA ỨNG DỤNG LOCKET sau khi đã tải/cài đặt xong! Nếu xóa bạn sẽ bị mất bản hạ cấp và không thể tự cài lại được.`
     - Lưu ý: `💡 Tải xong Locket thì bạn hãy đăng xuất tài khoản App Store của shop rồi đăng nhập lại tài khoản cá nhân của bạn.`
     - Video hướng dẫn cài IPA.
   - **Bước 3 — Lên Locket Gold:**
     - Video hướng dẫn + Config Locket.
     - *(Kiến trúc: Flow Đặc Biệt gói 30k hoàn toàn không có bước DNS, tự động bypass kiểm tra capacity của DNS Pool).*

#### 🅱️ GÓI 40K (15S VĨNH VIỄN):
1. **Flow Thông Thường (`special_flow = false` - 4 bước):**
   - **Bước 1 — Cài Shadowrocket:** Tương tự gói 30k thường.
   - **Bước 2 — Cài đặt DNS 15s:** Tải profile NextDNS từ Pool 15s (`Locket_Vxang 15s.mobileconfig`).
   - **Bước 3 — Cài đặt VPN (Mỹ):**
     - Hướng dẫn cài app VPN USA và kết nối server Mỹ (US).
     - Hộp lưu ý: `⛔ LƯU Ý QUAN TRỌNG: Giữ lại app VPN USA trên máy, tuyệt đối không được xóa app VPN USA đi.`
     - Video hướng dẫn cài VPN.
   - **Bước 4 — Lên Locket Gold:** Video hướng dẫn + Sao chép Config.
2. **Flow Đặc Biệt (`special_flow = true` - 5 bước):**
   - **Bước 1 — Cài Shadowrocket:** Giữ đăng nhập tài khoản shop.
   - **Bước 2 — Cài Locket IPA Hạ Cấp:** Tải qua manifest OTA, cảnh báo không xóa Locket.
   - **Bước 3 — Cài đặt VPN (Mỹ):** Video hướng dẫn VPN + Lưu ý: `⚠️ LƯU Ý: Hãy bỏ qua bước xóa và cài đặt lại Locket ở trong video.`
   - **Bước 4 — Cài đặt DNS 15s:** Cài đặt profile DNS 15s (từ Pool 15s hoặc DNS riêng).
   - **Bước 5 — Lên Locket Gold:** Hoàn tất kích hoạt.

### 5.3. Quy Tắc Tự Động Bỏ Qua Bước Username Cho Khách Cũ
- Trong `guide.html`, khi nhận dữ liệu từ `GET /api/guide/steps`:
  - Nếu khách hàng **đã có** `locket_username` trong Supabase: Hệ thống tự động lọc bỏ bước nhập Username khỏi mảng `steps`. Khách vào thẳng các bước kỹ thuật.
  - Nếu khách hàng **chưa có** username: Bước 1 (Nhập Username) được hiển thị và mở khóa (editable) để khách điền.

---

## 6. ĐỘNG CƠ PHÂN GIẢI DNS, DNS POOL XOAY VÒNG & LINK DNS RIÊNG BIỆT

### 6.1. Động Cơ Mẫu URL DNS Tự Hiểu (DNS Template Engine)
Được cấu hình trong Supabase `app_config` key `dns_template` (mặc định: `https://apple.dns.nextdns.io/{CODE}`):
```javascript
function resolveDnsWithTemplate(rawInput, template) {
  if (!rawInput) return '';
  const trimmed = String(rawInput).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const tmpl = template || 'https://apple.dns.nextdns.io/{CODE}';
  let resolved = '';
  if (/\{code\}|\{id\}/i.test(tmpl)) {
    resolved = tmpl.replace(/\{code\}|\{id\}/gi, trimmed);
  } else {
    resolved = tmpl.replace(/\/+$/, '') + '/' + trimmed;
  }
  if (!/^https?:\/\//i.test(resolved)) resolved = 'https://' + resolved;
  return resolved;
}
```

### 6.2. Quản Lý DNS Pool Xoay Vòng (`dns_pool`)
- **Phân Nhóm:** Pool `5s` (dành cho gói 30k thường) và Pool `15s` (dành cho gói 40k thường và 40k đặc biệt).
- **Ngưỡng Giới Hạn:** Mỗi link phục vụ tối đa `max_uses` mã khách (mặc định 5).
- **Thuật Toán Cấp Link (`claimDnsFromPool`):**
  1. Chạy song song kiểm tra `private_dns_links` và `dns_pool` bằng `Promise.all`.
  2. Ưu tiên hàng đầu: Nếu khách có link trong `private_dns_links` ➔ Cấp ngay link DNS riêng.
  3. Kiểm tra Idempotency: Nếu `customerCode` đã tồn tại trong mảng `used_codes` của link nào ➔ Trả về đúng link đó, không tăng slot.
  4. Nếu khách mới: Tìm link active đầu tiên có `used < max`. Cập nhật:
     `used_codes = array_append(used_codes, customerCode)`, `used = used + 1`, nếu `used >= max` thì gán `is_full = true`.
- **Giải Phóng Slot Tự Động:**
  Khi xóa khách hàng hoặc cấp DNS riêng ➔ Hệ thống tự động quét sạch `customer_code` khỏi `used_codes` của các link trong `dns_pool`, giảm biến `used` và mở lại `is_full = false`.

### 6.3. Link DNS Riêng Biệt (`private_dns_links`) Kèm TTL 10 Phút
- Được cấp riêng cho 1 khách hàng cụ thể khi gặp sự cố nghẽn mạng: `https://[domain]/dns?t=<token>`.
- Trường trong DB: `token`, `customer_code`, `package`, `nextdns_url`, `nextdns_email`, `nextdns_password`, `status` (`'unopened'`, `'active'`, `'expired'`), `first_accessed_at`, `expires_at`.
- **Quy Trình Tính TTL 10 Phút:**
  - Khách chưa mở link: `status = 'unopened'`, `first_accessed_at = null`.
  - Khách bấm mở link lần đầu trên Safari (`dns.html` gọi `validate.js?action=dns_check`):
    Ghi nhận `first_accessed_at = now()`, tính `expires_at = now() + 10 minutes`, chuyển `status = 'active'`, bắn tin Telegram báo Admin.
  - Sau 10 phút: Trạng thái tự chuyển `expired`, màn hình `dns.html` khóa tải và báo hết hạn.
  - Hỗ trợ nút *"↻ Hồi sinh TTL"* trong Admin: Reset `status = 'unopened'`, `first_accessed_at = null`, đếm lại 10 phút từ lần mở kế tiếp.

---

## 7. CƠ CHẾ CHỐNG CHIA SẺ MÃ & ANTI-SHARE LIVE HEARTBEAT

### 7.1. Định Danh Thiết Bị (Device Fingerprint)
- Trong `guide.html`, hàm `getDeviceId()` tự sinh UUID ngẫu nhiên và lưu vào `localStorage.getItem('xwDeviceId')` (bền vững theo thiết bị/trình duyệt, không dùng `sessionStorage`).

### 7.2. Cơ Chế Heartbeat Live
- `guide.html` kích hoạt `setInterval` gửi `POST /api/guide/ping` mỗi 4 giây.
- Body gửi lên: `{ currentStep, totalSteps }`.
- Server cập nhật `last_ping = now()` và `current_step` vào bảng `sessions`.
- Ngưỡng coi là online trên Admin Dashboard: `last_ping > now() - 40s`.

### 7.3. Thuật Toán Bẫy Gian Lận Thiết Bị Kép (Concurrent Ping Trap)
- Khi có request ping gửi lên `/api/guide/ping`:
  1. Truy vấn các phiên có cùng mã `access_code` nhưng khác `device_id`.
  2. Nếu phát hiện có thiết bị thứ hai vừa ping trong vòng **12 giây** gần nhất:
     - Ghi nhận vi phạm vào DB: `fraud_triggered_at = now()`.
     - Sau thời gian trễ chiến thuật 5 giây (để cả 2 máy cùng rơi vào bẫy): Server trả về phản hồi:
       `{ fraud_warning: true, seconds_left: 15, is_original: true/false }`.
  3. Client nhận tín hiệu lập tức kích hoạt Modal đếm ngược khẩn cấp 15 giây (`showFraudModal`):
     - Đồng hồ đếm lùi trực tiếp từ 15 về 0.
     - Không cho phép thao tác bất kỳ bước nào.
  4. Khi hết 15 giây: Server tự động cập nhật mã truy cập `status = 'fraud'`, `is_active = false`. Mọi phiên bị hủy vĩnh viễn, popup thông báo khóa toàn bộ quyền truy cập và chuyển hướng về trang chủ.

---

## 8. HỆ THỐNG SCRAPER CÀO TÀI KHOẢN APPLE ID ON-DEMAND ĐA TẦNG

Được tích hợp trong `api/guide/validate.js?action=appstore`:
1. **Nguồn Sự Thật Duy Nhất Tại Firebase RTDB Node `/appstore`:**
   - `scraper_url`: URL trang web cào nguồn 1.
   - `scraper_url_backup`: URL trang web cào nguồn 2.
   - `email` & `password`: Tài khoản Apple ID dự phòng tĩnh.
2. **Quy Trình Cào On-Demand:**
   - Khi có khách truy cập vào Bước 1: Server thực hiện HTTP GET đến `scraper_url` (sử dụng regex bóc tách email và password, timeout 3000ms).
   - Nếu nguồn 1 trả về lỗi hoặc tài khoản không hợp lệ: Tự động chuyển tiếp cào `scraper_url_backup`.
   - Nếu nguồn 2 tiếp tục lỗi: Sử dụng tài khoản dự phòng tĩnh (`email`, `password`) trong Firebase.
3. **Đảm Bảo Tính Tươi Mới Của Dữ Liệu:**
   - Thêm `cache: 'no-store'` vào tất cả các lệnh gọi `fetch` để ngăn chặn triệt để tính năng cache hung hãn của Vercel Serverless Functions.
4. **Bảo Mật Giao Diện Khách Hàng:**
   - Trả về JSON: `{ ok: true, email_masked: "xwu***@icloud.com", email_real: "...", password: "..." }`.
   - Trên màn hình `guide.html`, ô mật khẩu luôn hiển thị `••••••••`, chỉ khi người dùng bấm nút *"⧉ Copy"* thì giá trị thực mới được copy vào Clipboard thông qua hàm `_copyAcct('password')`.

---

## 9. TELEGRAM BOT WEBHOOK: THÔNG BÁO SỰ KIỆN & TRA CỨU CRM

Triển khai tại `api/_lib/telegram-bot.js`, nhận Webhook tại `POST /api/admin/stats`:

### 9.1. Cấu Trúc Đóng Gói Tin Nhắn (Safe Notification Delivery)
- Hàm `sendTelegram(method, payload)`: Tự động gọi Telegram Bot API với cơ chế retry tối đa 3 lần nếu gặp mã HTTP 429 hoặc 5xx.
- Hàm `escMd(text)`: Tự động escape các ký tự đặc biệt của Telegram MarkdownV2 (`_ * [ ] ( ) ~ ` > # + - = | { } . !`).

### 9.2. Các Luồng Thông Báo Tự Động (Push Notifications)
1. **Khách Tạo Mới / Sinh Mã Mới:**
   Bắn tin: Tên khách hàng, Mã KH `KH-...`, Mã truy cập `XW-...`, Gói (`30k (5s)` hoặc `40k (15s)`), Ghi chú thanh toán.
2. **Khách Bắt Đầu Vào Làm:**
   Bắn tin: Thông báo khách vừa xác thực mã thành công vào `guide.html`, bắt đầu đếm thời gian phiên 30 phút.
3. **Khách Hoàn Tất Cài Đặt:**
   Bắn tin: Tên khách hàng, Mã KH, Gói dịch vụ, Thời gian thao tác hoàn thành, Nhắc Admin kiểm tra ảnh chụp màn hình gửi qua Zalo.
4. **Cảnh Báo Link DNS Riêng:**
   Bắn tin khi khách mở link DNS riêng lần đầu (bắt đầu đếm TTL 10 phút) và khi link hết hạn.
5. **Cảnh Báo Gian Lận Chia Sẻ Mã:**
   Bắn tin khẩn cấp: Báo động phát hiện 2 thiết bị khác nhau ping đồng thời trên cùng một mã truy cập.

### 9.3. Tính Năng Tra Cứu Hồ Sơ CRM (CRM Lookup)
Admin gửi trực tiếp từ khóa vào khung chat với Bot:
1. **Tra Cứu Mã Truy Cập (`XW-...`):**
   - Trả về thẻ tiêu điểm:
     - Trạng thái mã: 🟢 Đã hoàn thành / 🔵 Đang làm / ⚪ Chưa kích hoạt / ⚫ Hết hạn / 🔴 Khóa gian lận.
     - Thời điểm tạo, Thời điểm kích hoạt (`first_used_at`), Thời điểm hoàn thành (`completed_at`).
     - Hạn sử dụng còn lại của mã.
     - Tên và SĐT chủ sở hữu mã.
2. **Tra Cứu Mã Khách Hàng (`KH-...`), Số Điện Thoại hoặc Tên:**
   - Trả về hồ sơ khách hàng toàn diện:
     - Họ tên, Số điện thoại, Kênh liên hệ, Gói dịch vụ đang dùng.
     - Trạng thái thanh toán (`deposit_note`).
     - Danh sách toàn bộ các mã truy cập đã từng cấp trong lịch sử kèm trạng thái chi tiết.

---

## 10. MÃ NGUỒN MẪU HOÀN CHỈNH: THƯ VIỆN LÕI api/_lib/utils.js

Dưới đây là mã nguồn đầy đủ của `api/_lib/utils.js` (Đã lược bỏ toàn bộ logic phân loại bảo hành, giữ bảng giá 30k/40k vĩnh viễn):

```javascript
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogchtngdbywmayeluebh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || 'https://xwuan-access-e9d5e-default-rtdb.firebaseio.com';
const JWT_SECRET = process.env.JWT_SECRET || 'locket-secret-jwt-key-2026';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Bảng giá dịch vụ Locket_Vxang (100% Vĩnh viễn)
const PRICING = {
  '30k': { 'perm': { price: 30000, label: '5s Vĩnh viễn - 30k', months: null, pkg_type: '5s' } },
  '40k': { 'perm': { price: 40000, label: '15s Vĩnh viễn - 40k', months: null, pkg_type: '15s' } }
};

function normalizePackage(pkg) {
  if (pkg === '40k' || pkg === '15s' || pkg === '180') return '40k';
  return '30k';
}

function dnsPoolKey(pkg) {
  return normalizePackage(pkg) === '40k' ? '15s' : '5s';
}

// Gọi Supabase qua REST PostgREST API
async function sb(path, opts = {}) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
    ...opts.headers,
  };
  const ctrl = new AbortController();
  const tId = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...opts,
      headers,
      signal: ctrl.signal,
      keepalive: true
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || res.statusText || `HTTP ${res.status}`);
    return data;
  } finally {
    clearTimeout(tId);
  }
}

// Firebase RTDB Helpers
async function fbGet(node) {
  const res = await fetch(`${FIREBASE_DB_URL}/${node}.json`, { cache: 'no-store' });
  return await res.json().catch(() => null);
}
async function fbPut(node, val) {
  await fetch(`${FIREBASE_DB_URL}/${node}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(val),
  });
}

// JWT Sign / Verify (HMAC-SHA256 thuần)
function b64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signJWT(payload, expiresIn = '24h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  let expSeconds = 86400;
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const num = parseInt(expiresIn);
    if (unit === 'd') expSeconds = num * 86400;
    else if (unit === 'h') expSeconds = num * 3600;
    else if (unit === 'm') expSeconds = num * 60;
  }
  const exp = Math.floor(Date.now() / 1000) + expSeconds;
  const p = { ...payload, exp };
  const h64 = b64url(JSON.stringify(header));
  const p64 = b64url(JSON.stringify(p));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${h64}.${p64}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${h64}.${p64}.${sig}`;
}
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h64, p64, sig] = parts;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h64}.${p64}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(p64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middlewares
function requireAdmin(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const p = verifyJWT(token);
  return p && p.role === 'admin';
}
function requireGuide(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const p = verifyJWT(token);
  return p && p.role === 'guide' ? p : false;
}
function allowMethods(req, res, methods = ['GET', 'POST']) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return false;
  }
  return true;
}

// Động cơ phân giải mẫu URL DNS
function resolveDnsWithTemplate(rawInput, template) {
  if (!rawInput) return '';
  const trimmed = String(rawInput).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const tmpl = template || 'https://apple.dns.nextdns.io/{CODE}';
  let resolved = '';
  if (/\{code\}|\{id\}/i.test(tmpl)) {
    resolved = tmpl.replace(/\{code\}|\{id\}/gi, trimmed);
  } else {
    resolved = tmpl.replace(/\/+$/, '') + '/' + trimmed;
  }
  if (!/^https?:\/\//i.test(resolved)) resolved = 'https://' + resolved;
  return resolved;
}
async function getDnsTemplate() {
  try {
    const res = await sb('app_config?key=eq.dns_template&select=value');
    if (res && res.length && res[0].value && res[0].value.template) {
      return res[0].value.template;
    }
  } catch {}
  return 'https://apple.dns.nextdns.io/{CODE}';
}

// Quản lý DNS Pool & DNS Riêng
async function claimDnsFromPool(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  const [privateRows, poolRows] = await Promise.all([
    customerCode ? sb(`private_dns_links?customer_code=eq.${encodeURIComponent(customerCode)}&select=*`).catch(() => []) : Promise.resolve([]),
    sb(`dns_pool?package=eq.${key}&is_active=eq.true&order=created_at.asc`).catch(() => [])
  ]);

  if (privateRows && privateRows.length) {
    const pRow = privateRows[0];
    const url = pRow.nextdns_url || pRow.ublockdns_url;
    if (url) return { ok: true, dns_url: url, package: pRow.package, customer_code: customerCode, is_private: true };
  }

  if (!poolRows || !poolRows.length) {
    return { ok: false, error: 'Chưa có link DNS khả dụng cho gói này. Vui lòng liên hệ Admin.' };
  }

  if (customerCode) {
    const existing = poolRows.find(r => (r.used_codes || []).includes(customerCode));
    if (existing) {
      return { ok: true, dns_url: existing.dns_url, package: existing.package, customer_code: customerCode };
    }
  }

  const available = poolRows.find(r => !r.is_full && (r.used || 0) < (r.max || 5));
  if (!available) {
    return { ok: false, error: 'DNS Pool đã đầy tất cả các link. Vui lòng liên hệ Admin.' };
  }

  if (customerCode) {
    const nextCodes = [...(available.used_codes || []), customerCode];
    const nextUsed = (available.used || 0) + 1;
    const isFull = nextUsed >= (available.max || 5);
    await sb(`dns_pool?id=eq.${available.id}`, {
      method: 'PATCH',
      body: { used_codes: nextCodes, used: nextUsed, is_full: isFull }
    }).catch(() => {});
  }

  return { ok: true, dns_url: available.dns_url, package: available.package, customer_code: customerCode };
}

async function releaseCustomerFromDnsPool(customerCode) {
  if (!customerCode) return;
  try {
    const poolRows = await sb('dns_pool?select=*');
    if (!poolRows || !poolRows.length) return;
    for (const r of poolRows) {
      const codes = r.used_codes || [];
      if (codes.includes(customerCode)) {
        const nextCodes = codes.filter(c => c !== customerCode);
        const nextUsed = Math.max(0, nextCodes.length);
        await sb(`dns_pool?id=eq.${r.id}`, {
          method: 'PATCH',
          body: { used_codes: nextCodes, used: nextUsed, is_full: false }
        });
      }
    }
  } catch {}
}

async function dnsPoolHasCapacity(pkg, customerCode) {
  const key = dnsPoolKey(pkg);
  try {
    const [privateRows, poolRows] = await Promise.all([
      customerCode ? sb(`private_dns_links?customer_code=eq.${encodeURIComponent(customerCode)}&select=id`) : Promise.resolve([]),
      sb(`dns_pool?package=eq.${key}&is_active=eq.true`)
    ]);
    if (privateRows && privateRows.length) return true;
    if (!poolRows || !poolRows.length) return false;
    if (customerCode && poolRows.some(r => (r.used_codes || []).includes(customerCode))) return true;
    return poolRows.some(r => !r.is_full && (r.used || 0) < (r.max || 5));
  } catch {
    return false;
  }
}

// Telegram Notifications
function escMd(str) {
  return String(str ?? '').replace(/[_*[\]()~\>#+\-=|{}.!]/g, '\\$&');
}
async function notifyTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      })
    });
  } catch {}
}

function genCode(prefix = 'XW-') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return prefix + s;
}

module.exports = {
  PRICING, normalizePackage, dnsPoolKey,
  sb, fbGet, fbPut, signJWT, verifyJWT,
  requireAdmin, requireGuide, allowMethods,
  resolveDnsWithTemplate, getDnsTemplate,
  claimDnsFromPool, releaseCustomerFromDnsPool, dnsPoolHasCapacity,
  escMd, notifyTelegram, genCode
};
```

---

## 11. MÃ NGUỒN MẪU HOÀN CHỈNH: WEBHOOK TELEGRAM BOT api/_lib/telegram-bot.js

Dưới đây là mã nguồn của Webhook Telegram Bot trong `api/_lib/telegram-bot.js`:

```javascript
const { sb, escMd } = require('./utils');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function replyTelegram(chatId, text, extra = {}) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
        ...extra
      })
    });
  } catch (err) {
    console.error('replyTelegram error:', err);
  }
}

async function handleTelegramUpdate(body) {
  if (!body) return;
  const msg = body.message;
  if (!msg || !msg.text) return;

  const chatId = String(msg.chat.id);
  if (TELEGRAM_CHAT_ID && chatId !== String(TELEGRAM_CHAT_ID)) {
    await replyTelegram(chatId, '⛔ *Truy cập bị từ chối\.* Bạn không có quyền điều khiển bot này\.');
    return;
  }

  const text = msg.text.trim();

  // Lệnh /start hoặc /help
  if (text === '/start' || text === '/help') {
    const welcome = 
`⚡ *LOCKET\_VXANG TELEGRAM BOT* ⚡
───────────────
Bot phục vụ thông báo và tra cứu CRM hệ thống Locket\_Vxang\.

🔍 *Cú pháp tra cứu nhanh:*
• Gõ mã truy cập: `XW-ABC123`
• Gõ mã khách hàng: `KH-1234567`
• Gõ số điện thoại hoặc tên khách hàng\.

📊 *Lệnh thống kê:*
• `/stats` : Xem thống kê phiên live và doanh thu\.`;
    await replyTelegram(chatId, welcome);
    return;
  }

  // Lệnh /stats
  if (text === '/stats') {
    try {
      const [customers, codes, completedCodes, activeSessions] = await Promise.all([
        sb('customers?select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb('access_codes?select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb('access_codes?completed_at=not.is.null&select=id', { headers: { 'Prefer': 'count=exact' } }),
        sb(`sessions?last_ping=gt.${new Date(Date.now() - 40000).toISOString()}&select=id`)
      ]);
      const rep = 
`📊 *THỐNG KÊ HỆ THỐNG LOCKET\_VXANG*
───────────────
👥 Tổng số khách: *${customers ? customers.length : 0}*
🎫 Tổng mã đã cấp: *${codes ? codes.length : 0}*
✅ Mã đã hoàn thành: *${completedCodes ? completedCodes.length : 0}*
🟢 Thiết bị đang online: *${activeSessions ? activeSessions.length : 0}*`;
      await replyTelegram(chatId, rep);
    } catch (e) {
      await replyTelegram(chatId, `❌ Lỗi tải thống kê: ${escMd(e.message)}`);
    }
    return;
  }

  // Tra cứu mã truy cập XW-xxxxxx
  if (/^XW-[A-Z0-9]{6}$/i.test(text)) {
    const codeVal = text.toUpperCase();
    try {
      const rows = await sb(`access_codes?code=eq.${codeVal}&select=*,customers(*)`);
      if (!rows || !rows.length) {
        await replyTelegram(chatId, `❌ Không tìm thấy mã truy cập *${escMd(codeVal)}*`);
        return;
      }
      const c = rows[0];
      const cust = c.customers || {};
      const statusMap = {
        'completed': '🟢 Đã hoàn thành',
        'active': '🔵 Đang cài đặt',
        'pending': '⚪ Chưa kích hoạt',
        'expired': '⚫ Đã hết hạn',
        'fraud': '🔴 Khóa do chia sẻ mã'
      };
      const statusTxt = statusMap[c.status] || c.status;
      const rep = 
`🎫 *THÔNG TIN MÃ TRUY CẬP*
───────────────
🔑 Mã: `${escMd(c.code)}`
📌 Trạng thái: *${escMd(statusTxt)}*
👤 Khách hàng: *${escMd(cust.name || '—')}* (`${escMd(cust.customer_code || '—')}`)
📦 Gói: *${escMd(cust.package === '40k' ? '15s Vĩnh viễn (40k)' : '5s Vĩnh viễn (30k)')}*
🕒 Tạo lúc: ${escMd(new Date(c.created_at).toLocaleString('vi-VN'))}
⚡ Kích hoạt: ${c.first_used_at ? escMd(new Date(c.first_used_at).toLocaleString('vi-VN')) : 'Chưa mở web'}
✅ Hoàn thành: ${c.completed_at ? escMd(new Date(c.completed_at).toLocaleString('vi-VN')) : 'Chưa xong'}`;
      await replyTelegram(chatId, rep);
    } catch (e) {
      await replyTelegram(chatId, `❌ Lỗi tra cứu: ${escMd(e.message)}`);
    }
    return;
  }

  // Tra cứu theo Mã KH (KH-xxxxxxx), SĐT hoặc Tên
  try {
    let custRows = [];
    if (/^KH-[A-Z0-9]+$/i.test(text)) {
      custRows = await sb(`customers?customer_code=eq.${text.toUpperCase()}&select=*`);
    } else if (/^[0-9+]{8,15}$/.test(text)) {
      custRows = await sb(`customers?phone=eq.${text}&select=*`);
    } else {
      custRows = await sb(`customers?name=ilike.*${encodeURIComponent(text)}*&select=*`);
    }

    if (!custRows || !custRows.length) {
      await replyTelegram(chatId, `🔍 Không tìm thấy hồ sơ nào khớp với: *${escMd(text)}*`);
      return;
    }

    const cust = custRows[0];
    const codes = await sb(`access_codes?customer_id=eq.${cust.id}&order=created_at.desc&select=*`);
    const codeLines = (codes || []).map(cd => {
      return `• `${escMd(cd.code)}` \[${escMd(cd.status)}\] \(${escMd(new Date(cd.created_at).toLocaleDateString('vi-VN'))}\)`;
    }).join('\n') || 'Chưa cấp mã nào';

    const rep = 
`👤 *HỒ SƠ KHÁCH HÀNG*
───────────────
🏷️ Mã KH: `${escMd(cust.customer_code)}`
👤 Họ tên: *${escMd(cust.name)}*
📞 SĐT: ${escMd(cust.phone || '—')}
📦 Gói: *${escMd(cust.package === '40k' ? '15s Vĩnh viễn (40k)' : '5s Vĩnh viễn (30k)')}*
💰 Thanh toán: *${escMd(cust.deposit_note || 'Chờ thu tiền')}*
🛡️ Luồng: *${cust.special_flow ? 'Flow Đặc Biệt (IPA)' : 'Flow Thường (DNS)'}*
📱 Locket: ${cust.locket_username ? escMd(cust.locket_username) : 'Chưa có'}

🎫 *Lịch sử mã truy cập:*
${codeLines}`;

    await replyTelegram(chatId, rep);
  } catch (e) {
    await replyTelegram(chatId, `❌ Lỗi tra cứu: ${escMd(e.message)}`);
  }
}

module.exports = { replyTelegram, handleTelegramUpdate };
```

---

## 12. ĐẶC TẢ CHI TIẾT 11 SERVERLESS FUNCTIONS (FULL API CONTRACTS & IMPLEMENTATION)

### 12.1. `api/admin/login.js`
```javascript
const { allowMethods, signJWT } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const { password, remember } = req.body || {};
  const expectedPw = process.env.ADMIN_PASSWORD || '19082006';
  if (!password || password !== expectedPw) {
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }
  const token = signJWT({ role: 'admin' }, remember ? '365d' : '24h');
  return res.status(200).json({ ok: true, token });
};
```

### 12.2. `api/admin/stats.js`
```javascript
const { sb, requireAdmin, allowMethods } = require('../_lib/utils');
const { handleTelegramUpdate } = require('../_lib/telegram-bot');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await handleTelegramUpdate(req.body);
    } catch (e) {
      console.error('Webhook error:', e);
    }
    return res.status(200).json({ ok: true });
  }

  if (!allowMethods(req, res, ['GET'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const since40s = new Date(Date.now() - 40000).toISOString();
    const [c, ac, comp, sess] = await Promise.all([
      sb('customers?select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb('access_codes?select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb('access_codes?completed_at=not.is.null&select=id', { headers: { 'Prefer': 'count=exact' } }),
      sb(`sessions?last_ping=gt.${since40s}&select=id`)
    ]);
    return res.status(200).json({
      customers: c ? c.length : 0,
      codes: ac ? ac.length : 0,
      completed: comp ? comp.length : 0,
      sessions: sess ? sess.length : 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
```

### 12.3. `api/admin/create-customer.js` (Không có trường type / Khách mới hoàn toàn)
```javascript
const { sb, requireAdmin, allowMethods, genCode, dnsPoolHasCapacity, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { name, contact, phone, social_platform, social_link, notes, package: pkg } = req.body || {};
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

  // Kiểm tra sức chứa DNS Pool
  if (!await dnsPoolHasCapacity(cleanPkg)) {
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
    deposit_note: cleanPkg === '40k' ? 'Chờ thu 40k' : 'Chờ thu 30k'
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

  notifyTelegram(`🌟 *KHÁCH HÀNG MỚI ĐƯỢC TẠO*\n───────────────\n👤 Tên: *${escMd(name.trim())}*\n🏷️ Mã KH: `${escMd(custCode)}`\n🔑 Mã truy cập: `${escMd(accCode)}`\n📦 Gói: *${escMd(cleanPkg)}*`);

  return res.status(200).json({ ok: true, customer_id: custId, customer_code: custCode, access_code: accCode });
};
```

### 12.4. `api/admin/add-code.js` (Cấp mã mới cho khách cũ - Không gắn nhãn bảo hành)
```javascript
const { sb, requireAdmin, allowMethods, genCode, dnsPoolHasCapacity, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { customer_id } = req.body || {};
  if (!customer_id) return res.status(400).json({ error: 'Thiếu customer_id' });

  const custRows = await sb(`customers?id=eq.${customer_id}&select=*`);
  if (!custRows || !custRows.length) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
  const cust = custRows[0];

  const cleanPkg = cust.package;
  const needsDns = !(cleanPkg === '30k' && cust.special_flow === true);

  if (needsDns && !await dnsPoolHasCapacity(cleanPkg, cust.customer_code)) {
    return res.status(503).json({ error: 'DNS pool đã đầy, vui lòng thêm link DNS mới!' });
  }

  const accCode = genCode('XW-');
  await sb('access_codes', {
    method: 'POST',
    body: {
      customer_id,
      code: accCode,
      is_active: true,
      status: 'pending'
    }
  });

  notifyTelegram(`🎫 *MÃ TRUY CẬP MỚI ĐƯỢC CẤP*\n───────────────\n👤 Khách: *${escMd(cust.name)}* (`${escMd(cust.customer_code)}`)\n🔑 Mã mới: `${escMd(accCode)}`\n📦 Gói: *${escMd(cleanPkg)}*`);

  return res.status(200).json({ ok: true, access_code: accCode });
};
```

### 12.5. `api/admin/sessions.js`
```javascript
const { sb, requireAdmin, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Thiếu session_id' });
    await sb(`sessions?id=eq.${session_id}`, { method: 'PATCH', body: { is_kicked: true } });
    return res.status(200).json({ ok: true });
  }

  if (!allowMethods(req, res, ['GET'])) return;

  const since40s = new Date(Date.now() - 40000).toISOString();
  const sessions = await sb(`sessions?last_ping=gt.${since40s}&order=last_ping.desc&select=*,access_codes(code,customer_id,customers(name,customer_code,package,locket_username))`);

  return res.status(200).json(sessions || []);
};
```

### 12.6. `api/admin/guide-steps.js`
```javascript
const { sb, requireAdmin, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const steps = await sb('guide_steps?order=order_num.asc');
    return res.status(200).json(steps || []);
  }

  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const created = await sb('guide_steps', { method: 'POST', body: req.body, headers: { 'Prefer': 'return=representation' } });
    return res.status(200).json(created ? created[0] : {});
  }
  if (req.method === 'PATCH') {
    const id = req.query.id;
    await sb(`guide_steps?id=eq.${id}`, { method: 'PATCH', body: req.body });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    await sb(`guide_steps?id=eq.${id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
```

### 12.7. `api/admin/customers.js`
```javascript
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
```

### 12.8. `api/guide/validate.js`
```javascript
const { sb, fbGet, signJWT, allowMethods, claimDnsFromPool, notifyTelegram, escMd } = require('../_lib/utils');
const crypto = require('crypto');

module.exports = async (req, res) => {
  const action = req.query.action;

  // Cào Apple ID on-demand
  if (action === 'appstore') {
    try {
      const appstore = await fbGet('appstore') || {};
      let email = appstore.email || '';
      let password = appstore.password || '';

      if (appstore.scraper_url) {
        try {
          const sRes = await fetch(appstore.scraper_url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
          const html = await sRes.text();
          const em = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const pw = html.match(/(?:pass|pwd|password|mật khẩu)[\s:=]+([A-Za-z0-9!@#$%^&*()_+=-]{6,30})/i);
          if (em) email = em[1];
          if (pw) password = pw[1];
        } catch {}
      }

      const masked = email ? email.replace(/^(.{3}).*(@.*)$/, '$1***$2') : '';
      return res.status(200).json({ ok: true, email_real: email, email_masked: masked, password, has_ipa: !!appstore.ipa_url });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // Tải Plist Manifest IPA OTA
  if (action === 'ipa_plist') {
    const appstore = await fbGet('appstore') || {};
    const ipaUrl = appstore.ipa_url || 'https://example.com/locket.ipa';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${ipaUrl}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>com.locket.Locket</string>
        <key>bundle-version</key>
        <string>1.0.0</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>Locket Gold Hạ Cấp</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }

  // Claim DNS Pool
  if (action === 'dns_pool_claim') {
    const token = (req.headers['authorization'] || '').slice(7);
    const { verifyJWT } = require('../_lib/utils');
    const p = verifyJWT(token);
    if (!p) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const custRows = await sb(`customers?id=eq.${p.customer_id}&select=package,customer_code`);
    if (!custRows || !custRows.length) return res.status(404).json({ ok: false, error: 'Không tìm thấy khách' });

    const c = custRows[0];
    const dnsData = await claimDnsFromPool(c.package, c.customer_code);
    return res.status(dnsData.ok ? 200 : 503).json(dnsData);
  }

  // Kiểm tra Link DNS Riêng kèm TTL 10 phút
  if (action === 'dns_check') {
    const t = req.query.t;
    if (!t) return res.status(400).json({ error: 'Thiếu token' });
    const rows = await sb(`private_dns_links?token=eq.${encodeURIComponent(t)}`);
    if (!rows || !rows.length) return res.status(404).json({ error: 'Link không hợp lệ' });
    const row = rows[0];

    // Lần đầu mở link
    if (row.status === 'unopened' || !row.first_accessed_at) {
      const now = new Date();
      const expires = new Date(now.getTime() + 600000);
      await sb(`private_dns_links?id=eq.${row.id}`, {
        method: 'PATCH',
        body: { status: 'active', first_accessed_at: now.toISOString(), expires_at: expires.toISOString() }
      });
      notifyTelegram(`🔒 *KHÁCH BẮT ĐẦU CÀI DNS RIÊNG*\n───────────────\n👤 Mã KH: `${escMd(row.customer_code)}`\n⏱ Link hết hạn sau: 10 phút`);
      return res.status(200).json({ ok: true, ublockdns_url: row.nextdns_url || row.ublockdns_url, package: row.package, customer_code: row.customer_code });
    }

    // Đã mở, kiểm tra hết hạn
    if (new Date(row.expires_at) < new Date()) {
      if (row.status !== 'expired') {
        await sb(`private_dns_links?id=eq.${row.id}`, { method: 'PATCH', body: { status: 'expired' } });
      }
      return res.status(200).json({ expired: true });
    }

    return res.status(200).json({ ok: true, ublockdns_url: row.nextdns_url || row.ublockdns_url, package: row.package, customer_code: row.customer_code });
  }

  // Đánh thức serverless
  if (action === 'warmup') return res.status(200).json({ ok: true });

  // Xác thực mã truy cập POST
  if (!allowMethods(req, res, ['POST'])) return;
  const { code, device_id } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã truy cập' });

  const cleanCode = code.trim().toUpperCase();
  const codes = await sb(`access_codes?code=eq.${cleanCode}&select=*,customers(*)`);
  if (!codes || !codes.length) return res.status(404).json({ error: 'Mã truy cập không đúng' });

  const c = codes[0];
  if (!c.is_active || c.status === 'fraud') return res.status(403).json({ error: 'Mã truy cập đã bị vô hiệu hóa' });

  let expiresAt = c.expires_at;
  // Lần đầu vào: Tính 30 phút
  if (!c.first_used_at) {
    const now = new Date();
    expiresAt = new Date(now.getTime() + 1800000).toISOString();
    await sb(`access_codes?id=eq.${c.id}`, {
      method: 'PATCH',
      body: { first_used_at: now.toISOString(), expires_at: expiresAt, status: 'active' }
    });
    notifyTelegram(`⚡ *KHÁCH BẮT ĐẦU VÀO WEB*\n───────────────\n👤 Khách: *${escMd(c.customers?.name || '')}* (`${escMd(c.customers?.customer_code || '')}`)\n🔑 Mã: `${escMd(cleanCode)}`\n⏱ Hết hạn lúc: ${escMd(new Date(expiresAt).toLocaleTimeString('vi-VN'))}`);
  } else if (new Date(c.expires_at) < new Date()) {
    return res.status(403).json({ error: 'Mã truy cập đã hết thời gian sử dụng' });
  }

  // Tạo phiên live
  const sessToken = crypto.randomBytes(16).toString('hex');
  const sess = await sb('sessions', {
    method: 'POST',
    body: { access_code: cleanCode, session_token: sessToken, device_id: device_id || '', current_step: 0 },
    headers: { 'Prefer': 'return=representation' }
  });

  const guideJwt = signJWT({
    code: cleanCode,
    customer_id: c.customer_id,
    session_id: sess ? sess[0].id : null,
    role: 'guide'
  }, '45m');

  return res.status(200).json({ ok: true, token: guideJwt, expires_at: expiresAt });
};
```

### 12.9. `api/guide/steps.js`
```javascript
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
```

### 12.10. `api/guide/ping.js`
```javascript
const { sb, requireGuide, allowMethods } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const p = requireGuide(req);
  if (!p) return res.status(401).json({ error: 'Unauthorized' });

  const { currentStep, username } = req.body || {};

  if (username && String(username).trim()) {
    sb(`customers?id=eq.${p.customer_id}`, { method: 'PATCH', body: { locket_username: String(username).trim() } }).catch(() => {});
  }

  if (p.session_id) {
    await sb(`sessions?id=eq.${p.session_id}`, {
      method: 'PATCH',
      body: { last_ping: new Date().toISOString(), current_step: currentStep || 0 }
    });
  }

  const [sRows, cRows] = await Promise.all([
    p.session_id ? sb(`sessions?id=eq.${p.session_id}&select=is_kicked,fraud_triggered_at`) : Promise.resolve([]),
    sb(`access_codes?code=eq.${p.code}&select=status,expires_at,is_active`)
  ]);

  if (sRows && sRows.length && sRows[0].is_kicked) return res.status(200).json({ kicked: true });
  if (!cRows || !cRows.length || !cRows[0].is_active || cRows[0].status === 'fraud') return res.status(200).json({ expired: true, fraud_final: true });
  if (new Date(cRows[0].expires_at) < new Date()) return res.status(200).json({ expired: true });

  const curSess = sRows && sRows[0];
  if (curSess && curSess.fraud_triggered_at) {
    const elapsed = (Date.now() - new Date(curSess.fraud_triggered_at).getTime()) / 1000;
    if (elapsed > 5) {
      const left = Math.max(0, 20 - elapsed);
      if (left <= 0) {
        await sb(`access_codes?code=eq.${p.code}`, { method: 'PATCH', body: { status: 'fraud', is_active: false } });
        return res.status(200).json({ expired: true, fraud_final: true });
      }
      return res.status(200).json({ fraud_warning: true, seconds_left: left });
    }
  }

  return res.status(200).json({ ok: true });
};
```

### 12.11. `api/guide/complete.js`
```javascript
const { sb, requireGuide, allowMethods, notifyTelegram, escMd } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ['POST'])) return;
  const p = requireGuide(req);
  if (!p) return res.status(401).json({ error: 'Unauthorized' });

  const now = new Date().toISOString();
  await Promise.all([
    sb(`access_codes?code=eq.${p.code}`, { method: 'PATCH', body: { completed_at: now, status: 'completed' } }),
    sb(`customers?id=eq.${p.customer_id}`, { method: 'PATCH', body: { service_status: 'active', activated_at: now } })
  ]);

  const cust = await sb(`customers?id=eq.${p.customer_id}&select=name,customer_code,package`);
  const cName = cust && cust[0] ? cust[0].name : '';
  const cCode = cust && cust[0] ? cust[0].customer_code : '';
  const cPkg = cust && cust[0] ? cust[0].package : '';

  notifyTelegram(`🎉 *KHÁCH ĐÃ HOÀN TẤT CÁC BƯỚC*\n───────────────\n👤 Khách: *${escMd(cName)}* (`${escMd(cCode)}`)\n🔑 Mã: `${escMd(p.code)}`\n📦 Gói: *${escMd(cPkg)}*\n📸 Nhắc khách gửi ảnh màn hình qua Zalo Admin\!`);

  return res.status(200).json({ ok: true });
};
```

---

## 13. ĐẶC TẢ & BLUEPRINT MÃ NGUỒN 4 GIAO DIỆN FRONTEND (HTML / CSS / JS)

### 13.1. Cấu Trúc Khung Mẫu Cho `index.html`
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
  <title>Locket_Vxang 💫 — Cài Đặt Locket Gold</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg: #07090e;
      --bg-card: rgba(15, 23, 42, 0.78);
      --border: rgba(0, 240, 255, 0.16);
      --p1: #00f0ff;
      --p2: #8b5cf6;
      --text: #f8fafc;
      --muted: #64748b;
      --radius: 16px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Be Vietnam Pro', sans-serif;
      min-height: 100vh;
      min-height: 100dvh;
      overflow-x: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .app-frame {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
      text-align: center;
    }
    .brand-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--p1), var(--p2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .card-glass {
      background: var(--bg-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius);
      padding: 28px 22px;
      box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5);
    }
    .input-cyber {
      width: 100%;
      background: #0b1120;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px !important; /* >= 16px chống iOS auto-zoom */
      color: var(--p1);
      font-weight: 800;
      text-align: center;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      outline: none;
      margin-bottom: 18px;
      transition: all 0.2s ease;
    }
    .input-cyber:focus {
      border-color: var(--p1);
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.3);
    }
    .btn-cyber {
      width: 100%;
      min-height: 48px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--p1), var(--p2));
      color: #030712;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 0 #4c1d95, 0 0 20px rgba(0, 240, 255, 0.3);
      transition: all 0.15s;
    }
    .btn-cyber:active { transform: translateY(3px); box-shadow: 0 1px 0 #4c1d95; }
    /* Modal Fullscreen Chặn Thiết Bị & Safari */
    .modal-lock {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(7, 9, 14, 0.96);
      backdrop-filter: blur(20px);
      padding: 20px;
      align-items: center;
      justify-content: center;
    }
    .modal-box {
      max-width: 380px;
      width: 100%;
      background: #0f172a;
      border: 1.5px solid var(--p1);
      border-radius: 20px;
      padding: 26px 20px;
      text-align: center;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.25);
    }
  </style>
</head>
<body>
  <div class="app-frame">
    <div class="brand-title">Locket_Vxang 💫</div>
    <div style="font-size: 0.88rem; color: var(--muted); margin-bottom: 24px;">Hệ thống cài đặt & duy trì Locket Gold ổn định</div>

    <div class="card-glass">
      <input type="text" id="codeInput" class="input-cyber" placeholder="XW-XXXXXX" maxlength="9" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false"/>
      <button class="btn-cyber" id="btnEnter" onclick="handleEnter()">Xác Nhận Mã Truy Cập</button>
      <div id="errMsg" style="display:none; margin-top:14px; font-size:0.82rem; color:#ef4444; font-weight:700;"></div>
    </div>
  </div>

  <!-- IN-APP & PC BLOCK MODAL -->
  <div class="modal-lock" id="blockModal">
    <div class="modal-box">
      <div style="font-size: 44px; margin-bottom: 8px;" id="blockIcon">🧭</div>
      <div style="font-family:'Space Grotesk'; font-weight:900; font-size:1.25rem; color:var(--p1); margin-bottom:12px;" id="blockTitle">Bắt Buộc Mở Bằng Safari</div>
      <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;" id="blockDesc">
        Dịch vụ yêu cầu mở bằng <b>Safari trên iPhone</b> để cài đặt cấu hình DNS.
      </div>
      <button class="btn-cyber" onclick="copyLink()">📋 Sao Chép Link Mở Safari</button>
    </div>
  </div>

  <script>
    function isIOS() {
      const ua = (navigator.userAgent || '').toLowerCase();
      return /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
    function isInApp() {
      const ua = (navigator.userAgent || '').toLowerCase();
      return /zalo|fbav|fban|messenger|instagram|tiktok|telegram|crios|fxios/.test(ua);
    }

    function checkEnvironment() {
      if (localStorage.getItem('xw_dev_mode') === '1') return true;
      const modal = document.getElementById('blockModal');
      if (!isIOS()) {
        document.getElementById('blockIcon').textContent = '📱';
        document.getElementById('blockTitle').textContent = 'Yêu Cầu Mở Trên iPhone';
        document.getElementById('blockDesc').innerHTML = '⛔ Dịch vụ chỉ hỗ trợ trên <b>iPhone / iPad</b>. Vui lòng không sử dụng máy tính, PC hay Android!';
        modal.style.display = 'flex';
        return false;
      }
      if (isInApp()) {
        modal.style.display = 'flex';
        return false;
      }
      return true;
    }

    function copyLink() {
      navigator.clipboard.writeText(window.location.href).then(() => alert('✓ Đã sao chép! Hãy mở ứng dụng Safari và dán vào nhé.'));
    }

    function handleEnter() {
      if (!checkEnvironment()) return;
      const code = document.getElementById('codeInput').value.trim().toUpperCase();
      if (!code) return;
      window.location.href = '/guide?code=' + encodeURIComponent(code);
    }

    window.addEventListener('DOMContentLoaded', () => {
      checkEnvironment();
      const params = new URLSearchParams(window.location.search);
      const c = params.get('code');
      if (c) document.getElementById('codeInput').value = c.toUpperCase();
    });
  </script>
</body>
</html>
```

### 13.2. Kiến Trúc & Xử Lý Logic `guide.html`
File `guide.html` bao gồm:
1. **Dynamic Mobile Height Sync:**
   ```javascript
   function syncBarHeights() {
     const topbar = document.getElementById('topBar');
     const navbar = document.getElementById('navBar');
     if (!topbar || !navbar) return;
     const set = () => {
       document.documentElement.style.setProperty('--topbar-h', Math.round(topbar.getBoundingClientRect().height) + 'px');
       document.documentElement.style.setProperty('--navbar-h', Math.round(navbar.getBoundingClientRect().height) + 'px');
     };
     set();
     if (typeof ResizeObserver !== 'undefined') {
       new ResizeObserver(set).observe(topbar);
       new ResizeObserver(set).observe(navbar);
     }
   }
   ```
2. **Client-side `.mobileconfig` Generator (`downloadDnsProfile`):**
   Tạo trực tiếp blob XML ngay trên trình duyệt, đặt tên `Locket_Vxang.mobileconfig` hoặc `Locket_Vxang_15s.mobileconfig`, kích hoạt link tải `URL.createObjectURL(blob)`.
3. **Cơ Chế Khóa Nút NavBar:**
   - Nếu bước hiện tại là `appstore` mà chưa có tài khoản ➔ Nút hiển thị: *"Đợi cập nhật"*, disable nút.
   - Nếu bước hiện tại là `ipa` mà chưa có file ➔ Nút hiển thị: *"Chưa có File"*, disable nút.
   - Nếu bước hiện tại là `choice` (DNS) mà lỗi pool ➔ Nút hiển thị: *"Lỗi DNS"*, disable nút.
   - Chỉ khi đủ điều kiện mới mở nút *"Tiếp theo →"* hoặc *"✅ Hoàn thành"*.

### 13.3. Kiến Trúc Bảng Quản Trị `admin.html` (Không Phân Loại Khách)
1. **Form Tạo Khách Mới Tối Giản & Ô Nhập Liên Hệ Duy Nhất:**
   - **Ô 1:** Tên khách hàng (`#custName`).
   - **Ô 2:** `📞 Số điện thoại hoặc Link MXH` (`#custPhoneOrLink`) — **Ô DUY NHẤT** tích hợp hàm `parseContactInput()` tự động nhận diện SĐT và link Zalo/Facebook/Telegram.
   - **Ô 3:** Gói dịch vụ (`#custPkg`: 30k hoặc 40k).
   - **Ô 4:** Checkbox luồng đặc biệt (`#custSpecialFlow`).
   - **Ô 5:** Ghi chú (`#custNotes`).
   - **Tuyệt đối KHÔNG có trường chọn loại khách, không có bảo hành**.
2. **Bảng Khách Hàng 4 Cột Tinh Gọn:**
   - Cột 1: Thông tin khách hàng (Tên, SĐT, Icon MXH).
   - Cột 2: Gói dịch vụ & Mã KH (`KH-...`).
   - Cột 3: Trạng thái & Smart Badge thanh toán 1-chạm.
   - Cột 4: Ngày tạo.
   - Cột nút Xem được cố định (`position: sticky; right: 0;`).
   - **Bộ lọc CRM:** Chỉ lọc theo Gói (`Tất cả`, `Gói 30k`, `Gói 40k`) và Trạng thái (`Tất cả`, `Đang chờ`, `Hoàn thành`). Tuyệt đối không có tab hay nút lọc "Mới" vs "Bảo hành".
3. **Cơ Chế 1-Chạm Xác Nhận Thu Tiền (`deposit_note`):**
   ```javascript
   window.toggleDeposit = async function(e, custId, curNote) {
     e.stopPropagation();
     const nextNote = curNote.includes('Đã thu đủ') ? 'Chờ thu tiền' : 'Đã thu đủ';
     await api('PATCH', `/api/admin/customers?id=${custId}`, { deposit_note: nextNote });
     showToast('✓ Đã cập nhật trạng thái thanh toán', 'green');
     loadCustomers();
   };
   ```
4. **Responsive Mobile Cards (`.m-card`):**
   Khi màn hình ≤ 900px, bảng tự động chuyển sang hiển thị danh sách thẻ card di động viền cyan phát sáng, chạm vào thẻ để mở ngay Modal Chi Tiết Khách Hàng.

### 13.4. Trang `dns.html` (Cài Đặt Profile DNS Riêng 1-Chạm)
- Đọc token `?t=<token>`.
- Gọi `GET /api/guide/validate?action=dns_check&t=<token>`.
- Nếu hợp lệ: Hiển thị giao diện Cyber Glassmorphism với nút bấm lớn: `🔒 CÀI ĐẶT DNS RIÊNG`. Bấm nút ➔ Kích hoạt hàm sinh profile `.mobileconfig` chuẩn của `Locket_Vxang`.
- Nếu quá hạn 10 phút: Chuyển sang màn hình cảnh báo link đã hết hiệu lực.

---

## 14. CẤU TRÚC CƠ SỞ DỮ LIỆU CHI TIẾT (FULL SUPABASE SQL DDL & FIREBASE RTDB TREE)

### 14.1. Supabase PostgreSQL DDL Script (Không có cột type và bảo hành)
```sql
-- BẬT EXTENSION UUID NẾU CHƯA CÓ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG APP_CONFIG
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. BẢNG CUSTOMERS (Chỉ có khách mới, không có cột type)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    social_platform TEXT DEFAULT 'zalo',
    social_link TEXT,
    notes TEXT,
    package TEXT NOT NULL DEFAULT '30k',
    duration TEXT NOT NULL DEFAULT 'perm',
    service_status TEXT NOT NULL DEFAULT 'pending_gold',
    deposit_note TEXT DEFAULT 'Chờ thu tiền',
    special_flow BOOLEAN DEFAULT false,
    locket_username TEXT,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_username ON public.customers(locket_username);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);

-- 3. BẢNG ACCESS_CODES
CREATE TABLE IF NOT EXISTS public.access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    first_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_customer_id ON public.access_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON public.access_codes(status);

-- 4. BẢNG SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_code TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    device_id TEXT,
    current_step INT DEFAULT 0,
    last_ping TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    is_kicked BOOLEAN DEFAULT false,
    fraud_triggered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_access_code ON public.sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_sessions_last_ping ON public.sessions(last_ping);

-- 5. BẢNG DNS_POOL
CREATE TABLE IF NOT EXISTS public.dns_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package TEXT NOT NULL DEFAULT '5s',
    dns_url TEXT NOT NULL,
    used INT DEFAULT 0,
    max INT DEFAULT 5,
    used_codes TEXT[] DEFAULT '{}'::TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_full BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_dns_pool_package ON public.dns_pool(package);
CREATE INDEX IF NOT EXISTS idx_dns_pool_is_active ON public.dns_pool(is_active);

-- 6. BẢNG PRIVATE_DNS_LINKS
CREATE TABLE IF NOT EXISTS public.private_dns_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    customer_code TEXT NOT NULL,
    package TEXT NOT NULL DEFAULT '5s',
    nextdns_url TEXT NOT NULL,
    ublockdns_url TEXT NOT NULL DEFAULT '',
    dashboard_key TEXT NOT NULL DEFAULT '',
    nextdns_email TEXT,
    nextdns_password TEXT,
    status TEXT NOT NULL DEFAULT 'unopened',
    first_accessed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_private_dns_token ON public.private_dns_links(token);
CREATE INDEX IF NOT EXISTS idx_private_dns_customer ON public.private_dns_links(customer_code);

-- 7. BẢNG GUIDE_STEPS
CREATE TABLE IF NOT EXISTS public.guide_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_num INT NOT NULL,
    step_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    package TEXT DEFAULT '30k',
    is_active BOOLEAN DEFAULT true
);
```

### 14.2. Firebase Realtime Database Sample Tree
```json
{
  "appstore": {
    "email": "demo.appleid@icloud.com",
    "password": "SamplePassword123@",
    "scraper_url": "https://example.com/source1",
    "scraper_url_backup": "https://example.com/source2",
    "ipa_url": "https://example.com/files/locket_downgrade.ipa",
    "dev_mode": false
  },
  "referrals": {
    "KH-8392019": {
      "count": 2,
      "cycleCount": 1,
      "histories": [
        { "timestamp": 1756800000000, "referred_code": "KH-9928172" }
      ]
    }
  }
}
```

---

## 15. CẤU HÌNH HẠ TẦNG (VERCEL.JSON, PACKAGE.JSON)

### 15.1. File `vercel.json`
```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin.html" },
    { "source": "/guide", "destination": "/guide.html" },
    { "source": "/dns",   "destination": "/dns.html" }
  ],
  "crons": [
    {
      "path": "/api/admin/stats",
      "schedule": "0 1 * * *"
    }
  ],
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 15.2. File `package.json`
```json
{
  "name": "locket-vxang",
  "version": "1.0.0",
  "description": "Locket_Vxang Cyber Tech Architecture Unified",
  "engines": {
    "node": "24.x"
  },
  "private": true
}
```

---

## 16. QUY TRÌNH QUẢN LÝ NGỮ CẢNH BẮT BUỘC (SOP GEMINI.MD & HANDOVER.MD) & HƯỚNG DẪN KHỞI TẠO

### 16.1. Hai Tập Tin Ngữ Cảnh Bất Biến (Context Management SOP)
1. **`gemini.md`:**  
   Là bản thiết kế kỹ thuật bất biến của dự án `Locket_Vxang`. Chứa danh sách Tech Stack, bảng giá (30k/40k vĩnh viễn), quy tắc chỉ có khách mới (không phân loại khách bảo hành), cấu trúc 11 serverless functions, quy chuẩn Safari/iOS lock, và logic cốt lõi. AI **tuyệt đối không được tự ý xóa hoặc làm thay đổi logic** của file này trừ khi có yêu cầu rõ ràng từ người dùng.
2. **`handover.md`:**  
   Là nhật ký trạng thái và bàn giao phiên làm việc.  
   ⚠️ **QUY TẮC BẤT BIẾN:** TRƯỚC KHI kết thúc bất kỳ phiên làm việc nào hoặc thông báo hoàn tất cho người dùng, AI **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT** file `handover.md` theo cấu trúc:
   - **Current State:** Chi tiết tất cả các tính năng/file vừa lập trình hoặc chỉnh sửa xong.
   - **Known Bugs:** Các lỗi vừa phát hiện hoặc vừa được fix triệt để.
   - **Next Steps:** Các công việc cần tiếp tục triển khai trong phiên tiếp theo.

### 16.2. Lệnh Kiểm Tra Cú Pháp Toàn Dự Án
Trước khi bàn giao bất kỳ tính năng nào, bắt buộc phải chạy lệnh kiểm tra cú pháp trên toàn bộ các file JavaScript của backend serverless:
```powershell
Get-ChildItem -Path "api" -Filter *.js -Recurse | ForEach-Object { node --check $_.FullName }
```
Đảm bảo 100% file không có lỗi cú pháp syntax error.

### 16.3. Git & Remote Setup (Cấu hình sau)
- **Git Author:** *(Sẽ cập nhật sau)*
- **Git Remote Repo:** *(Sẽ cập nhật sau)*

---

### 🏁 TRÌNH TỰ BẮT ĐẦU TRIỂN KHAI DỰ ÁN CHO AI (EXECUTION PLAN):
Bây giờ, hãy bắt đầu triển khai dự án **`Locket_Vxang`** theo đúng trình tự chuẩn mực từng bước:
1. Tạo file `gemini.md` (chứa toàn bộ luật cốt lõi trên) và `handover.md` (nhật ký phiên khởi tạo).
2. Xây dựng thư viện dùng chung: `api/_lib/utils.js` và `api/_lib/telegram-bot.js`.
3. Xây dựng lần lượt 7 Serverless Functions quản trị trong `api/admin/`.
4. Xây dựng 4 Serverless Functions khách hàng trong `api/guide/`.
5. Thiết kế 4 file giao diện HTML chuẩn Cyber Dark Glassmorphism, Mobile-Only Safari Lock (`index.html`, `guide.html`, `admin.html`, `dns.html`).
6. Tạo `vercel.json` và `package.json`.
7. Chạy kiểm tra cú pháp `node --check` toàn dự án, cập nhật `handover.md` và báo cáo hoàn thành!
