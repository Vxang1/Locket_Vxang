-- ==============================================================================
-- ⚡ LOCKET_VXANG SUPABASE POSTGRESQL FULL DATABASE SCHEMA (DDL)
-- Hệ thống: Locket_Vxang (Cyber Tech Ultra Edition)
-- Đặc trưng: CHỈ CÓ KHÁCH MỚI - KHÔNG CÓ CỘT TYPE VÀ KHÁI NIỆM BẢO HÀNH
-- ==============================================================================

-- 0. BẬT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG CẤU HÌNH HỆ THỐNG (APP_CONFIG)
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Dữ liệu mẫu khởi tạo cho cấu hình DNS Template
INSERT INTO public.app_config (key, value)
VALUES ('dns_template', '{"template": "https://apple.dns.nextdns.io/{CODE}"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. BẢNG QUẢN LÝ KHÁCH HÀNG (CUSTOMERS)
-- Lưu ý: Không có cột `type` (mọi khách đều là khách mới, gói vĩnh viễn)
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

-- 3. BẢNG MÃ TRUY CẬP (ACCESS_CODES)
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

-- 4. BẢNG PHIÊN HOẠT ĐỘNG THỜI GIAN THỰC (SESSIONS)
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

-- 5. BẢNG HỒ CHỨA LINK DNS XOAY VÒNG (DNS_POOL)
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

-- 6. BẢNG LINK DNS RIÊNG BIỆT (PRIVATE_DNS_LINKS)
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

-- 7. BẢNG CẤU HÌNH BƯỚC HƯỚNG DẪN (GUIDE_STEPS)
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

-- ==============================================================================
-- TẮT RLS HOẶC CHO PHÉP TOÀN QUYỀN TRUY CẬP CHO BACKEND (SERVICE ROLE)
-- ==============================================================================
ALTER TABLE public.app_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_pool DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_dns_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_steps DISABLE ROW LEVEL SECURITY;
