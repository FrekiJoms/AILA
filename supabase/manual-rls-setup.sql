-- Manual RLS Setup for Role Features
-- Copy and paste these commands one by one or all at once in Supabase SQL Editor

-- Step 1: Add columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(255),
ADD COLUMN IF NOT EXISTS role_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policy for service role on profiles
CREATE POLICY "Service role full access to profiles"
ON public.profiles
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 4: Create RLS policy for users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Step 5: Create RLS policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 6: Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policy for service role on admins
CREATE POLICY "Service role full access to admins"
ON public.admins
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Done! Your role features should now work on all pages.
