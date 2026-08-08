-- ==========================================
-- Migration 3: Sites Table
-- ==========================================

-- 1. CREATE SITES TABLE
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS POLICIES
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage sites" ON public.sites;

-- Allow all authenticated users to manage sites
CREATE POLICY "Authenticated users can manage sites" ON public.sites FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
