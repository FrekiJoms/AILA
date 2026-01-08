-- Add role and role_color columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_color VARCHAR(7) DEFAULT NULL;

-- Add updated_at column to track when profile was last updated
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role name set by admins (e.g., "Developer", "Moderator")';
COMMENT ON COLUMN public.profiles.role_color IS 'Hex color code for the role badge display';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when the profile was last updated';
