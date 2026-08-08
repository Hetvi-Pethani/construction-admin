-- ==========================================
-- Migration 2: Customers Table
-- ==========================================

-- 1. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,  
    type TEXT NOT NULL DEFAULT 'customer',
    site_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADD site_name COLUMN (if table already exists)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS site_name TEXT;

-- 3. TYPE CONSTRAINT
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_type_check;

-- 4. RLS POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;

-- Allow all authenticated users to manage customers
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
