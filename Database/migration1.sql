-- ==========================================
-- PROPER FULL DATABASE SETUP (Migration 1)
-- ==========================================

-- 1. CLEANUP: PERMANENTLY DELETE ALL OLD DATA
-- This will clear all users from auth.users and public.profiles
DELETE FROM auth.users;

-- 2. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    mobile TEXT,  
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROLE CONSTRAINT
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'user'));

-- 4. STATUS CONSTRAINT
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('active', 'inactive'));

-- 5. TRIGGER FUNCTION
-- This function automatically creates a profile when a new user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, mobile, role, status)
  VALUES (
    new.id,
    COALESCE(NULLIF(new.raw_user_meta_data ->> 'name', ''), SPLIT_PART(new.email, '@', 1)),
    new.email,
    NULLIF(new.raw_user_meta_data ->> 'mobile', ''),
    LOWER(COALESCE(NULLIF(new.raw_user_meta_data ->> 'role', ''), 'user')), -- Default to 'user' for safety
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    mobile = EXCLUDED.mobile,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$;

-- 6. RE-ENABLE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow all authenticated users to see all profiles (needed for dashboard)
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 8. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
