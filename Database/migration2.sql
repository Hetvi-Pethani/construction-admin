-- ==========================================
-- Migration 2: Customers Table
-- ==========================================

-- 1. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,  
    type TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TYPE CONSTRAINT
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_type_check;
ALTER TABLE public.customers ADD CONSTRAINT customers_type_check 
CHECK (type IN ('customer', 'broker'));

-- 3. RLS POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;

-- Allow all authenticated users to manage customers
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
