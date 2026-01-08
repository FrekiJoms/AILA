# Quick Fix: Enable Role Features

**If you're seeing "Edge Function returned a non-2xx status code" errors when trying to set roles**, you need to run the SQL migration to enable the role features.

## Steps to Fix:

### 1. Go to Supabase SQL Editor
- Navigate to: https://app.supabase.com/project/woqlvcgryahmcejdlcqz/sql/new
- Or go to your Supabase dashboard → SQL Editor → New Query

### 2. Copy and Paste the Migration
Open the file `supabase/enable-role-features.sql` and copy its entire contents.

Paste into the SQL editor.

### 3. Execute the Script
Click the "Run" button (or press Ctrl+Enter).

You should see confirmation messages for each command:
- ✓ ALTER TABLE public.profiles...
- ✓ ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY
- ✓ CREATE POLICY...
- etc.

### 4. Verify It Worked
Run these verification queries in the SQL editor:

```sql
-- Check profiles table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('role', 'role_color', 'updated_at');

-- Check RLS is enabled on profiles
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'profiles';

-- Check RLS policies on profiles
SELECT policyname, schemaname, tablename FROM pg_policies 
WHERE tablename = 'profiles';
```

### 5. Test Role Setting
Go back to the admin dashboard and try setting a role on a user from any page. It should now work!

## What This Fixes:
- ✅ Roles can be set on users from any page (not just page 1)
- ✅ Roles display in the admin table
- ✅ Search and role settings work together
- ✅ Trial days setting works on all pages

## If You Still See Errors:

Check the Supabase function logs:
1. Go to: https://app.supabase.com/project/woqlvcgryahmcejdlcqz/functions
2. Click on `set-role`
3. Click "Logs" tab
4. Look for error messages

Common issues:
- **RLS policies not applied**: Run the SQL again, make sure each command succeeded
- **Admin not in admins table**: Add your email to the admins table with this query:
  ```sql
  INSERT INTO public.admins (email) VALUES ('your-email@example.com')
  ON CONFLICT (email) DO NOTHING;
  ```
- **Token expired**: Refresh the admin dashboard page

