# 🎯 MASTER PROMPT: CHỈNH SỬA & KHÓA BỐ CỤC (LAYOUT & DOM STRUCTURE) GIỐNG BẢN GỐC 100% — PHONG CÁCH CYBER TECH CHO LOCKET_VXANG

> ⚠️ **CHỈ THỊ TỐI CAO DÀNH CHO AI THIẾT KẾ:**
> - **NGUYÊN TẮC CỐT LÕI (BẤT BIẾN):** Bố cục web (**Layout, DOM Structure, Hierarchy, vị trí các thành phần**) **KHÔNG ĐƯỢC THAY ĐỔI DÙ CHỈ 1 PIXEL** so với bản gốc `locket-unified`.
> - **ĐIỀU DUY NHẤT THAY ĐỔI:** Chỉ thay đổi **Phong cách thị giác (Visual Style / Skin / Theme)**: từ màu tím dễ thương pastel sang **Phong cách Cyber Tech / Dark Space Neon (Nền đen sâu `#07090e`, viền Neon Cyan `#00f0ff`, Electric Violet `#8b5cf6`, Glassmorphism bóng mờ, font JetBrains Mono / Space Grotesk / Be Vietnam Pro)**.
> - **LỖI NGHIÊM TRỌNG BẠN VỪA MẮC PHẢI:** Bạn đã tự ý sáng tạo lại layout (biến form Tạo khách thành Modal, bỏ thanh 10 tab của Admin, bỏ bố cục thẻ Mobile `.m-card`, bỏ hàng ngang Quick Entry của Index, bỏ thanh điều hướng dán đáy `#navBar` và các màn hình `#completeScreen`, `#welcomeOverlay`, `#fraudOverlay` của Guide).
> - **YÊU CẦU:** Hãy đọc và làm lại toàn bộ 4 file giao diện (`index.html`, `guide.html`, `admin.html`, `dns.html`) theo **ĐÚNG 100% BỐ CỤC KHUNG HTML DƯỚI ĐÂY**.

---

## 1. BỐ CỤC CHUẨN CỦA `index.html` (TRANG CHỦ NHẬP MÃ)

Bản gốc có bố cục căn giữa màn hình điện thoại (Mobile Viewport `max-width: 460px`) với các thành phần xếp từ trên xuống dưới:

### 1.1. Sơ đồ Cấu trúc DOM (Khung HTML bắt buộc 100%):
```html
<body class="cyber-theme">
  <!-- Hiệu ứng nền không gian công nghệ: thay thế chấm tím dễ thương bằng lưới tọa độ Cyber Grid & các hạt sáng Tech -->
  <div class="bg-grid"></div>
  <div class="bg-glow-orbs"><span>✦</span><span>⚡</span><span>💠</span><span>💫</span></div>

  <div class="wrap"> <!-- max-width: 460px; margin: 0 auto; padding: 28px 16px 72px; -->
    
    <!-- 1. HERO SECTION -->
    <div class="hero">
      <div class="avatar-wrap">
        <!-- Khung avatar tròn 96x96 có viền phát sáng Neon Cyan/Violet -->
        <img class="hero-avatar" src="images/avatar.png" alt="Vxang" onerror="this.style.background='linear-gradient(135deg,#00f0ff,#8b5cf6)'"/>
        <!-- Huy hiệu badge nhỏ 32x32 nằm ở GÓC DƯỚI BÊN PHẢI avatar -->
        <div class="badge"><img src="images/locket.png" alt="Locket" onerror="this.style.background='#0f172a'"/></div>
      </div>
      <div class="brand">Locket_Vxang ✦ Cyber VIP</div>
      <div class="tagline">✦ Locket Gold Vĩnh Viễn · Chuẩn iOS Safari · Siêu Ổn Định ✦</div>
    </div>

    <!-- 2. QUICK ENTRY SECTION (Ô NHẬP MÃ TRUY CẬP NHANH) -->
    <!-- BỐ CỤC BẮT BUỘC: Nhãn ở trên, Hàng ngang gồm Ô INPUT và NÚT BẤM nằm CÙNG 1 DÒNG (flex row) -->
    <div class="quick-entry">
      <div class="entry-label">⚡ NHẬP MÃ TRUY CẬP NHANH</div>
      <div class="entry-row">
        <input class="entry-input" id="codeInput" placeholder="VD: XW-A3K7P2" maxlength="20"
          autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false"
          oninput="this.value=this.value.toUpperCase()"
          onkeydown="if(event.key==='Enter')goGuide()"/>
        <button class="btn-entry" id="btnSubmit" onclick="goGuide()">→ VÀO GUIDE</button>
      </div>
      <div id="errMsg" class="error-box"></div>
    </div>

    <!-- 3. CARD GRID (2 THẺ TIỆN ÍCH SONG SONG NHAU BÊN DƯỚI) -->
    <div class="card-grid"> <!-- display: grid; grid-template-columns: 1fr 1fr; gap: 12px; -->
      <a class="card" href="https://t.me/locket_vxang" target="_blank">
        <div class="card-row">
          <div class="card-icon cyber-cyan">🌐</div>
          <div>
            <div class="card-title">Dịch vụ khác</div>
            <div class="card-sub">Khám phá thêm</div>
          </div>
        </div>
        <span class="card-arrow">→ Xem ngay</span>
      </a>

      <a class="card" href="https://zalo.me/0822307662" target="_blank">
        <div class="card-row">
          <div class="card-icon cyber-violet">💬</div>
          <div>
            <div class="card-title">Nhắn Hỗ Trợ</div>
            <div class="card-sub">Zalo · Phản hồi ngay</div>
          </div>
        </div>
        <span class="card-arrow">→ Zalo Admin</span>
      </a>
    </div>

    <!-- 4. FOOTER -->
    <footer class="footer-copy">© 2026 Locket_Vxang · Cyber Security &amp; Permanent Gold ⚡</footer>
  </div>

  <!-- 5. IN-APP BROWSER & NON-IOS BLOCKING MODAL -->
  <!-- Modal toàn màn hình chặn mở từ Zalo/FB hoặc PC/Android, bắt buộc chuyển sang Safari iPhone -->
  <div id="inappBlockModal" class="modal-lock">
    <div class="modal-box">
      <div class="modal-icon">🧭</div>
      <div class="modal-title" id="inappTitle">Bắt Buộc Mở Bằng Safari</div>
      <div class="modal-msg-box" id="inappMsg">
        ⛔ <b>Trình duyệt ứng dụng này không thể tải cấu hình Locket Gold</b>. Bạn bắt buộc phải chuyển sang ứng dụng <b>Safari</b> của iPhone!
      </div>
      <div class="modal-guide-box" id="inappGuide">
        <div class="guide-lead">👉 Cách mở trên Safari:</div>
        <div><b>Cách 1:</b> Bấm dấu <b>(•••)</b> ở góc màn hình ➔ Chọn <b>"Mở bằng trình duyệt" (Safari)</b>.</div>
        <div style="margin-top:6px;"><b>Cách 2:</b> Bấm nút sao chép bên dưới ➔ Mở ứng dụng <b>Safari</b> trên iPhone và dán link vào.</div>
      </div>
      <button id="btnCopyInapp" class="btn-modal-action" onclick="copyCurrentUrl(this)">
        📋 Sao chép liên kết để mở Safari
      </button>
    </div>
  </div>
</body>
```

---

## 2. BỐ CỤC CHUẨN CỦA `guide.html` (TRANG WIZARD HƯỚNG DẪN TỪNG BƯỚC)

Bản gốc hoạt động theo kiến trúc: **Top bar dán đỉnh, Thân trang cuộn ở giữa hiển thị duy nhất 1 step card tại một thời điểm, Bottom Nav bar dán đáy cố định**.

### 2.1. Sơ đồ Cấu trúc DOM (Khung HTML bắt buộc 100%):
```html
<body class="cyber-guide">
  
  <!-- 1. LOADING SCREEN (Màn hình xoay lúc đang check mã) -->
  <div class="screen hidden" id="loadScreen">
    <div class="loading-box">
      <div class="spin-cyber"></div>
      <div class="loading-text">ĐANG XÁC THỰC MÃ TRUY CẬP...</div>
    </div>
  </div>

  <!-- 2. MAIN GUIDE UI (Hiển thị khi mã hợp lệ) -->
  <div id="guideUI" style="display:none; min-height: 100dvh; position: relative;">
    
    <!-- A. TOPBAR CỐ ĐỊNH DÁN ĐỈNH (Fixed Top) -->
    <div id="headerWrap" style="position:fixed; top:0; left:0; right:0; z-index:20;">
      <div class="topbar">
        <div class="topbar-logo">✦ LOCKET_VXANG</div>
        <div class="timer-chip" id="timerChip">⏱ --:--</div>
      </div>
    </div>

    <!-- B. THÂN NỘI DUNG CUỘN Ở GIỮA (Step Container) -->
    <!-- Chừa khoảng trống padding-top cho topbar và padding-bottom cho navbar -->
    <div class="guide-content" id="stepContainer">
      <!-- JavaScript sinh động ĐÚNG 1 THẺ .step-card ứng với bước hiện tại:
           - Gói 30k Flow Thường: Step 1 (Shadow) -> Step 2 (DNS 5s) -> Step 3 (Gold)
           - Gói 30k Flow Đặc Biệt: Step 1 (Shadow) -> Step 2 (IPA) -> Step 3 (Gold)
           - Gói 40k Flow Thường: Step 1 (Shadow) -> Step 2 (DNS 15s) -> Step 3 (VPN) -> Step 4 (Gold)
           - Gói 40k Flow Đặc Biệt: Step 1 (Shadow) -> Step 2 (IPA) -> Step 3 (VPN) -> Step 4 (DNS 15s) -> Step 5 (Gold)
      -->
    </div>

    <!-- C. NAVBAR CỐ ĐỊNH DÁN ĐÁY (Fixed Bottom Navigation) -->
    <!-- BỐ CỤC BẮT BUỘC: Hộp hint hướng dẫn ở trên, Hàng nút hành động ở dưới -->
    <div class="nav-bar" id="navBar">
      <div class="nav-hint" id="navHint">
        <span class="hint-arrow">👆</span>&nbsp;<span id="navHintText">Làm theo hướng dẫn bên trên để tiếp tục</span>
      </div>
      <div class="nav-btns">
        <button class="btn-nav btn-prev" id="btnPrev" onclick="prevStep()">← Quay lại</button>
        <button class="btn-nav btn-complete" id="btnNext" onclick="nextStep()">Tiếp theo →</button>
      </div>
    </div>
  </div>

  <!-- 3. COMPLETE SCREEN (Màn hình hoàn tất sau khi bấm Hoàn thành ở bước Gold) -->
  <div class="screen hidden" id="completeScreen">
    <div class="complete-wrap">
      
      <!-- Banner Hero Bảo Hành Vĩnh Viễn dán sát mép đỉnh -->
      <div class="complete-hero">
        <div class="hero-shield-icon">🛡️</div>
        <div class="hero-title">GÓI VĨNH VIỄN TRỌN ĐỜI</div>
        <div class="hero-sub">Hệ thống hỗ trợ <b style="color:#00f0ff">cài lại miễn phí vĩnh viễn ngay cả khi bạn đổi máy</b>. 💎</div>
        <div class="hero-badge">
          <span>🎉</span>
          <span>CÀI ĐẶT HOÀN TẤT!</span>
        </div>
      </div>

      <div class="complete-sub-hint">Còn <b style="color:var(--p1)">3 bước nhỏ</b> bên dưới để hoàn tất xác nhận 👇</div>

      <!-- Thanh tiến trình 0 / 3 bước -->
      <div class="complete-progress-wrap">
        <div class="progress-meta"><span>Tiến trình</span><span id="cProgressTxt">0 / 3 bước</span></div>
        <div class="progress-bar-bg"><div id="cProgressFill" class="progress-bar-fill"></div></div>
      </div>

      <!-- Danh sách 3 thẻ hành động cuối cùng -->
      <div class="complete-cards-list">
        
        <!-- THẺ 1: Chụp màn hình gửi Zalo xác nhận -->
        <div id="cCard1" class="complete-card active-card">
          <div class="card-head">
            <div class="card-num-badge">1</div>
            <div class="card-text-block">
              <div class="card-h">📸 Chụp màn hình gửi Vxang</div>
              <div class="card-p">Chụp lại ảnh màn hình này gửi qua Zalo cho Vxang để xác nhận kích hoạt. <b style="color:var(--p1)">Quan trọng!</b></div>
            </div>
          </div>
          <button id="cBtn1" class="btn-card-action" onclick="cGoZaloGold()">💬 Gửi Zalo Cho Vxang Ngay</button>
        </div>

        <!-- THẺ 2: Kết bạn Locket -->
        <div id="cCard2" class="complete-card">
          <div class="card-head">
            <div class="card-num-badge">2</div>
            <div class="card-text-block">
              <div class="card-h">🤝 Kết bạn Locket @vxang</div>
              <div class="card-p">Add shop để nhận thông báo và hỗ trợ kích hoạt trực tiếp.</div>
            </div>
          </div>
          <button id="cBtn2" class="btn-card-action btn-danger-action" onclick="cGoLocket()">Kết bạn @vxang →</button>
        </div>

        <!-- THẺ 3: Nhóm Thông Báo Zalo -->
        <div id="cCard3" class="complete-card card-highlight">
          <div class="card-head">
            <div class="card-num-badge badge-cyan">3</div>
            <div class="card-text-block">
              <div class="card-h">📣 Vào nhóm thông báo Locket_Vxang <span class="badge-tag">ĐỪNG BỎ QUA</span></div>
              <div class="card-p">Nhận cập nhật sớm nhất — ưu đãi, icon sự kiện, bản vá lỗi Locket Gold.</div>
            </div>
          </div>
          <button id="cBtn3" class="btn-card-action btn-cyan-action" onclick="cGoZalo()">📣 Vào nhóm thông báo →</button>
        </div>

      </div>

      <div style="text-align:center; padding: 0 16px 28px;">
        <a href="/" class="btn-back-home">← Về trang chủ</a>
      </div>
    </div>
  </div>

  <!-- 4. MODALS OVERLAY THIẾT YẾU CỦA GUIDE -->
  <!-- Modal Chào Mừng Đọc Kỹ -->
  <div id="welcomeOverlay" class="guide-modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="modal-ico">⚡</div>
      <div class="modal-title">Chào bạn! Đọc kỹ trước nhé</div>
      <div class="modal-box-info">
        <div>📖 <b>Làm theo đúng thứ tự</b> từng bước hướng dẫn.</div>
        <div style="margin-top:8px;">▶️ <b>Vừa xem video vừa làm theo</b> để tránh thao tác sai.</div>
        <div style="margin-top:8px; padding:8px 10px; background:rgba(239,68,68,.12); border:1px solid #ef4444; border-radius:8px;">
          ⚠️ Có thắc mắc, <b>nhắn Zalo cho Vxang</b> để được trợ giúp ngay.
        </div>
      </div>
      <button class="btn-cyber" onclick="closeWelcome()">OK, ĐÃ HIỂU! 🚀</button>
    </div>
  </div>

  <!-- Modal Bẫy Gian Lận (Fraud Trap) Có Đếm Ngược 15 Giây -->
  <div id="fraudOverlay" class="guide-modal-overlay" style="display:none;">
    <div class="modal-card modal-fraud">
      <div class="fraud-icon">🚨</div>
      <div class="fraud-title" id="fraudTitle">PHÁT HIỆN CHIA SẺ MÃ TRÁI PHÉP</div>
      <div class="fraud-msg" id="fraudMsg">Mã truy cập chỉ áp dụng cho 1 thiết bị duy nhất. Hành vi chia sẻ mã đã bị hệ thống ghi nhận.</div>
      <div class="fraud-timer-label">MÃ SẼ BỊ KHÓA VĨNH VIỄN TRONG</div>
      <div class="fraud-countdown" id="fraudCountdown">15</div>
    </div>
  </div>

  <!-- Modal Xác Nhận Hoàn Thành -->
  <div class="confirm-overlay" id="confirmOverlay" style="display:none;">
    <div class="confirm-box">
      <div class="confirm-icon">✅</div>
      <div class="confirm-title">Xác nhận hoàn thành?</div>
      <div class="confirm-sub">Bạn đã thực hiện đầy đủ các bước chưa? Sau khi xác nhận, mã truy cập sẽ <b>hết hiệu lực ngay</b>.</div>
      <div class="confirm-btns">
        <button class="confirm-cancel" onclick="closeConfirm()">Chưa xong</button>
        <button class="confirm-ok" onclick="doComplete()">✓ Xác nhận</button>
      </div>
    </div>
  </div>
</body>
```

---

## 3. BỐ CỤC CHUẨN CỦA `admin.html` (BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN)

Bản gốc hợp nhất toàn bộ nghiệp vụ vào 1 trang duy nhất, điều hướng bằng **Thanh 10 Tabs cuộn ngang** dán đỉnh, có form tạo khách trực tiếp (KHÔNG DÙNG MODAL ĐỂ TẠO KHÁCH) và giao diện Mobile Card chuyên dụng.

### 3.1. Sơ đồ Cấu trúc DOM (Khung HTML bắt buộc 100%):
```html
<body class="cyber-admin">
  
  <!-- 1. TOP HEADER DÁN ĐỈNH -->
  <header class="admin-header">
    <div class="header-left">
      <div class="admin-logo">⚡ LOCKET_VXANG ADMIN</div>
      <div class="status-chip live-chip"><span class="pulse-dot"></span> LIVE</div>
    </div>
    <div class="header-right">
      <button class="btn-head" onclick="doLogout()">Đăng xuất ➔</button>
    </div>
  </header>

  <!-- 2. THANH TAB ĐIỀU HƯỚNG CUỘN NGANG (HORIZONTAL SCROLL TABS) -->
  <!-- BẮT BUỘC ĐỦ CÁC TAB ĐỘC LẬP - KHÔNG ĐƯỢC GỘP HAY BỎ -->
  <nav class="tabs-nav" id="tabNav">
    <button class="t-btn active" onclick="switchTab('dashboard')">📊 Tổng quan</button>
    <button class="t-btn" onclick="switchTab('create')">➕ Tạo khách</button>
    <button class="t-btn" onclick="switchTab('customer')">👥 Khách hàng</button>
    <button class="t-btn" onclick="switchTab('sessions')">🟢 Phiên live</button>
    <button class="t-btn" onclick="switchTab('codes')">🎫 Mã truy cập</button>
    <button class="t-btn" onclick="switchTab('dnsgen')">🔒 DNS riêng</button>
    <button class="t-btn" onclick="switchTab('dnsdefault')">🌐 DNS mặc định</button>
    <button class="t-btn" onclick="switchTab('appstore')">🍎 Appstore</button>
    <button class="t-btn" onclick="switchTab('special')">🛡️ Khách đặc biệt</button>
    <button class="t-btn" onclick="switchTab('referral')">🎁 Referral</button>
  </nav>

  <!-- 3. KHÔNG GIAN NỘI DUNG TỪNG TAB (.tab-content) -->
  <main class="admin-main">
    
    <!-- TAB 1: DASHBOARD (TỔNG QUAN) -->
    <section class="tab-content active" id="tab-dashboard">
      <!-- 4 thẻ thống kê số liệu -->
      <div class="stat-grid-4">
        <div class="stat-box"><span class="sb-label">TỔNG KHÁCH</span><span class="sb-val" id="statCust">0</span></div>
        <div class="stat-box"><span class="sb-label">GÓI 30K (5S)</span><span class="sb-val" id="stat30k">0</span></div>
        <div class="stat-box"><span class="sb-label">GÓI 40K (15S)</span><span class="sb-val" id="stat40k">0</span></div>
        <div class="stat-box"><span class="sb-label">PHIÊN ĐANG LIVE</span><span class="sb-val" id="statLive">0</span></div>
      </div>

      <!-- Hộp 🚀 Truy cập nhanh (Quick Shortcuts Grid) -->
      <div class="quick-nav-card">
        <div class="card-title-sm">🚀 TRUY CẬP NHANH</div>
        <div class="quick-btns-grid">
          <button onclick="switchTab('create')">➕ Tạo khách mới</button>
          <button onclick="switchTab('customer')">👥 Khách hàng (CRM)</button>
          <button onclick="switchTab('sessions')">🟢 Xem phiên live</button>
          <button onclick="switchTab('dnsgen')">🔒 Cấp DNS riêng</button>
          <button onclick="switchTab('dnsdefault')">🌐 Quản lý DNS Pool</button>
          <button onclick="switchTab('appstore')">🍎 Cấu hình Apple ID</button>
        </div>
      </div>
    </section>

    <!-- TAB 2: TẠO KHÁCH HÀNG (FORM TRỰC TIẾP TRÊN TAB - KHÔNG DÙNG MODAL) -->
    <section class="tab-content" id="tab-create">
      <div class="form-card">
        <div class="form-head">
          <div class="fh-title">➕ Tạo Khách Hàng Mới</div>
          <div class="fh-sub">Điền thông tin · Hệ thống tự động sinh mã khách & mã truy cập</div>
        </div>

        <div class="form-body">
          <!-- Hàng 1: Tên khách & Ô DUY NHẤT (SĐT hoặc Link Profile) -->
          <div class="form-grid-2">
            <div class="field">
              <label>Tên khách hàng *</label>
              <input type="text" id="cName" placeholder="VD: Hoàng Long, Bảo Ngọc..."/>
            </div>
            <div class="field">
              <label>Số điện thoại hoặc Link profile (Zalo / FB / Telegram...)</label>
              <input type="text" id="cContact" placeholder="Dán SĐT (09xxx) hoặc Link Zalo, Facebook..."/>
            </div>
          </div>

          <!-- Hàng 2: Gói dịch vụ & Checkbox Luồng đặc biệt -->
          <div class="form-grid-2">
            <div class="field">
              <label>Gói dịch vụ *</label>
              <select id="cPackage" onchange="updateCreatePrice()">
                <option value="30k">⚡ Gói 30k (5s Vĩnh Viễn)</option>
                <option value="40k">⏱ Gói 40k (15s Vĩnh Viễn)</option>
              </select>
            </div>
            <div class="field field-checkbox-wrap">
              <label class="checkbox-cyber">
                <input type="checkbox" id="cSpecialFlow"/>
                <span>🛡️ Bật Flow đặc biệt (có bước cài Locket IPA)</span>
              </label>
            </div>
          </div>

          <!-- Hàng 3: Ghi chú -->
          <div class="field">
            <label>Ghi chú khách hàng</label>
            <textarea id="cNotes" placeholder="Ghi chú thêm nếu có (tùy chọn)..."></textarea>
          </div>

          <!-- Nút bấm Tạo khách -->
          <button class="btn-cyber btn-block" id="btnCreate" onclick="createCustomer()">
            🚀 TẠO MÃ KHÁCH &amp; MÃ TRUY CẬP
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 3: KHÁCH HÀNG (CRM) -->
    <section class="tab-content" id="tab-customer">
      
      <!-- Thanh tìm kiếm & Bộ nút Lọc gói -->
      <div class="crm-toolbar">
        <div class="search-box">
          <input type="text" id="custSearchInput" placeholder="🔍 Tìm theo Tên, SĐT, Mã KH..." oninput="applyCustFilters()"/>
        </div>
        <div class="filter-pill-group">
          <button class="f-pill active" onclick="setCustPkgFilter('all')">Tất cả</button>
          <button class="f-pill" onclick="setCustPkgFilter('30k')">Gói 30k</button>
          <button class="f-pill" onclick="setCustPkgFilter('40k')">Gói 40k</button>
          <button class="f-pill" onclick="setCustStatusFilter('pending')">⏳ Đang chờ</button>
          <button class="f-pill" onclick="setCustStatusFilter('completed')">✅ Hoàn thành</button>
        </div>
        <button class="btn-outline-sm" onclick="exportXLSX()">📊 Xuất Excel</button>
      </div>

      <!-- BẢNG DESKTOP (4 CỘT CHUẨN) -->
      <div class="table-desktop-wrap">
        <table class="cyber-table" id="customerTable">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Gói &amp; Mã KH</th>
              <th>Trạng thái &amp; Thanh toán</th>
              <th style="text-align:right;">Ngày tạo</th>
            </tr>
          </thead>
          <tbody id="customerTableBody"></tbody>
        </table>
      </div>

      <!-- DANH SÁCH THẺ MOBILE (.m-card) CHO ĐIỆN THOẠI -->
      <div class="mobile-cards-list" id="mobileCards"></div>
    </section>

    <!-- TAB 4: PHIÊN LIVE -->
    <section class="tab-content" id="tab-sessions">
      <div class="table-desktop-wrap">
        <table class="cyber-table">
          <thead>
            <tr>
              <th>Mã truy cập</th>
              <th>Khách hàng</th>
              <th>Bước hiện tại</th>
              <th>Trạng thái Ping</th>
              <th style="text-align:right;">Thao tác</th>
            </tr>
          </thead>
          <tbody id="sessionsTableBody"></tbody>
        </table>
      </div>
    </section>

    <!-- TAB 5: MÃ TRUY CẬP -->
    <section class="tab-content" id="tab-codes">
      <div class="codes-list" id="codesList"></div>
    </section>

    <!-- TAB 6: DNS RIÊNG -->
    <section class="tab-content" id="tab-dnsgen">
      <!-- Quản lý cấp link DNS riêng kèm email/pass và mẫu URL tự hiểu -->
    </section>

    <!-- TAB 7: DNS MẶC ĐỊNH (POOL) -->
    <section class="tab-content" id="tab-dnsdefault">
      <!-- Quản lý DNS Pool xoay vòng max 5 khách/link, hỗ trợ Bulk Add URLs -->
    </section>

    <!-- TAB 8: APPSTORE & IPA -->
    <section class="tab-content" id="tab-appstore">
      <!-- Cấu hình tài khoản Apple ID, link IPA và video minh họa -->
    </section>
  </main>

  <!-- 4. TOÀN BỘ CÁC MODAL THIẾT YẾU TRONG BẢN GỐC -->
  
  <!-- Modal Chi Tiết Khách Hàng (#detailModal) -->
  <div class="modal-overlay" id="detailModal">
    <div class="modal-dialog">
      <div class="modal-head">
        <div class="modal-title" id="dTitle">Chi Tiết Khách Hàng</div>
        <button class="modal-close" onclick="closeCustDetail()">✕</button>
      </div>
      <div class="modal-body" id="dBody">
        <!-- Bảng thông tin chi tiết, Danh sách mã truy cập, Nút cấp mã mới, Nút sửa, Nút xóa -->
      </div>
    </div>
  </div>

  <!-- Modal Chỉnh Sửa Khách Hàng (#editModal) -->
  <div class="modal-overlay" id="editModal">
    <div class="modal-dialog">
      <div class="modal-head">
        <div class="modal-title">✏️ Chỉnh Sửa Thông Tin Khách</div>
        <button class="modal-close" onclick="closeEditCust()">✕</button>
      </div>
      <div class="modal-body">
        <div class="field"><label>Tên khách *</label><input type="text" id="eN"/></div>
        <div class="field"><label>Số điện thoại hoặc Link profile</label><input type="text" id="eContact"/></div>
        <div class="field">
          <label>Gói dịch vụ</label>
          <select id="ePkg">
            <option value="30k">⚡ Gói 30k (5s Vĩnh Viễn)</option>
            <option value="40k">⏱ Gói 40k (15s Vĩnh Viễn)</option>
          </select>
        </div>
        <div class="field">
          <label class="checkbox-cyber">
            <input type="checkbox" id="eSf"/>
            <span>🛡️ Bật Flow đặc biệt (có bước Locket IPA)</span>
          </label>
        </div>
        <div class="field"><label>Ghi chú</label><textarea id="eNo"></textarea></div>
        <div style="display:flex; gap:10px; margin-top:14px;">
          <button class="btn-cyber" style="flex:1" onclick="saveEditCust()">💾 Lưu Thay Đổi</button>
          <button class="btn-outline" onclick="closeEditCust()">Hủy</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Tin Nhắn Zalo Chuẩn (#msgModal) -->
  <div class="modal-overlay" id="msgModal">
    <div class="modal-dialog">
      <div class="modal-head">
        <div class="modal-title">📋 Mẫu Tin Nhắn Gửi Khách (Safari)</div>
        <button class="modal-close" onclick="closeMsgModal()">✕</button>
      </div>
      <div class="modal-body">
        <textarea id="zaloMsgText" readonly></textarea>
        <button class="btn-cyber btn-block" onclick="copyZaloMsg(this)">📋 Sao Chép Tin Nhắn</button>
      </div>
    </div>
  </div>

  <!-- Modal Mẫu Tin Nhắn DNS Riêng (#dnsMsgModal) -->
  <div class="modal-overlay" id="dnsMsgModal">
    <div class="modal-dialog">
      <div class="modal-head">
        <div class="modal-title">🔒 Mẫu Tin Nhắn Cài DNS Riêng</div>
        <button class="modal-close" onclick="closeDnsMsgModal()">✕</button>
      </div>
      <div class="modal-body">
        <textarea id="dnsMsgText" readonly></textarea>
        <button class="btn-cyber btn-block" onclick="copyDnsMsg(this)">📋 Sao Chép Tin Nhắn DNS</button>
      </div>
    </div>
  </div>
</body>
```

---

## 4. BỐ CỤC CHUẨN CỦA `dns.html` (TRANG CÀI ĐẶT DNS RIÊNG 1-CHẠM)

### Sơ đồ Cấu trúc DOM (Khung HTML bắt buộc 100%):
```html
<body class="cyber-dns">
  <div class="bg-grid"></div>

  <!-- Canh giữa màn hình mobile wrap max 420px -->
  <div class="wrap">
    
    <!-- Icon huy hiệu vuông bo góc 72x72 viền Neon phát sáng -->
    <div class="icon-badge">🔒</div>
    <div class="brand">Locket_Vxang</div>

    <!-- 1. Vùng Loading khi đang giải mã Token -->
    <div id="loadingArea">
      <div class="card"><div class="spinner-cyber"></div></div>
    </div>

    <!-- 2. Vùng Hợp Lệ: Hiển thị khi link còn trong thời hạn TTL 10 phút -->
    <div id="validArea" style="display:none">
      <div class="desc">Bấm nút bên dưới để cài đặt cấu hình DNS riêng cho thiết bị của bạn.</div>
      <div class="card">
        <button class="btn-install-pulse" id="btnInstall" onclick="installDns()">
          🔒 CÀI ĐẶT DNS RIÊNG NGAY
        </button>
        <div class="hint">Sau khi bấm, vào <b>Cài đặt</b> trên iPhone → chọn <b>Đã tải về hồ sơ</b> → bấm <b>Cài đặt</b>.</div>
        <div id="msg" class="msg-box"></div>
      </div>
    </div>

    <!-- 3. Vùng Hết Hạn: Hiển thị khi link quá 10 phút -->
    <div id="expiredArea" style="display:none">
      <div class="card">
        <div class="expired-ico">⏳</div>
        <div class="expired-title">Liên kết DNS đã hết hạn</div>
        <div class="expired-desc">Link cài DNS riêng chỉ có hiệu lực trong 10 phút vì lý do bảo mật. Vui lòng nhắn Zalo cho Vxang để nhận lại link mới.</div>
      </div>
    </div>
  </div>

  <!-- Modal Chặn Safari trên dns.html -->
  <div id="inappBlockModal" class="modal-lock">
    <!-- Cấu trúc popup chặn tương tự như index.html -->
  </div>
</body>
```

---

## 5. BẢNG CHECKLIST KIỂM THỬ BỐ CỤC (ACCEPTANCE CRITERIA)

Sau khi chỉnh sửa, hệ thống `Locket_Vxang` phải thỏa mãn 100% các tiêu chí sau:

1. [x] **`index.html`:**
   - [x] Có avatar tròn 96x96 kèm badge góc dưới phải.
   - [x] Ô nhập mã và Nút "Vào Guide" nằm trên **CÙNG 1 DÒNG** (`entry-row`).
   - [x] 2 thẻ dịch vụ và hỗ trợ nằm cạnh nhau (`card-grid` 2 cột).
2. [x] **`guide.html`:**
   - [x] Thanh `#headerWrap` dán cố định ở mép trên cùng (fixed top) chứa logo và `#timerChip`.
   - [x] Chỉ hiển thị duy nhất 1 thẻ `.step-card` ở thân trang ứng với bước hiện tại.
   - [x] Thanh `#navBar` dán cố định ở mép dưới cùng (fixed bottom) chứa `#navHint` và nút 3D `#btnNext`.
   - [x] Màn hình `#completeScreen` có Hero Banner dán đỉnh và danh sách 3 thẻ hoàn tất.
   - [x] Có đầy đủ 3 modal overlay: `#welcomeOverlay`, `#fraudOverlay` (đếm ngược 15s), `#confirmOverlay`.
3. [x] **`admin.html`:**
   - [x] Có thanh cuộn ngang 10 tabs độc lập.
   - [x] Tab "➕ Tạo khách" là **form hiển thị trực tiếp trên tab**, không phải popup modal.
   - [x] Form tạo khách có **Ô NHẬP LIÊN HỆ DUY NHẤT** (`#cContact`).
   - [x] Tab Khách hàng hiển thị song song: Bảng Desktop 4 cột và Danh sách thẻ Mobile `.m-card`.
   - [x] Có đầy đủ 4 modal: `#detailModal`, `#editModal`, `#msgModal`, `#dnsMsgModal`.
4. [x] **`dns.html`:**
   - [x] Giữ nguyên khung `.wrap` 420px, `.icon-badge` 72x72, nút lớn `.btn-install-pulse` có hiệu ứng đập nhịp (pulse).
