-- ========== ROLE HIERARCHY TABLE SETUP ========== --
-- This table stores the organizational hierarchy of roles
-- Used for authorization checks and role-based permissions

-- Create the role_hierarchy table
CREATE TABLE IF NOT EXISTS public.role_hierarchy (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  role_name TEXT NOT NULL UNIQUE,
  hierarchy_order INT NOT NULL,
  color TEXT,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_order ON public.role_hierarchy(hierarchy_order);
CREATE INDEX IF NOT EXISTS idx_role_name ON public.role_hierarchy(role_name);

-- Insert default role hierarchy (top to bottom = highest to lowest authority)
INSERT INTO public.role_hierarchy (role_name, hierarchy_order, color, description)
VALUES
  ('Founder', 1, '#ff6b6b', 'Highest authority - Full system access'),
  ('Main Developer', 2, '#df4b4bff', 'Development and technical decisions'),
  ('Investor', 3, '#F8B195', 'Financial stakeholder'),
  ('Evaluator', 4, '#85C1E2', 'Evaluation and assessment role')
ON CONFLICT (role_name) DO UPDATE
SET hierarchy_order = EXCLUDED.hierarchy_order,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Enable RLS (Row Level Security) if needed
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read role hierarchy
CREATE POLICY "Allow admins to read role hierarchy"
  ON public.role_hierarchy
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.email = AUTH.email()
      AND profiles.role IN ('Founder', 'Main Developer')
    )
  );

-- Create policy to allow admins to update role hierarchy
CREATE POLICY "Allow admins to update role hierarchy"
  ON public.role_hierarchy
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.email = AUTH.email()
      AND profiles.role = 'Founder'
    )
  );

-- Create policy to allow admins to insert roles
CREATE POLICY "Allow admins to insert roles"
  ON public.role_hierarchy
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.email = AUTH.email()
      AND profiles.role = 'Founder'
    )
  );

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_role_hierarchy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
DROP TRIGGER IF EXISTS role_hierarchy_updated_at_trigger ON public.role_hierarchy;
CREATE TRIGGER role_hierarchy_updated_at_trigger
  BEFORE UPDATE ON public.role_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION update_role_hierarchy_updated_at();
