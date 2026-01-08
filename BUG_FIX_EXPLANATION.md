# Role Setting Bug - Root Cause & Solution

## The Problem

When trying to set a role for users (especially on pages 2+), you get this error:
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

This only happens on page 1 if you're seeing it everywhere, OR it works on page 1 but fails on other pages.

## Root Cause

The `profiles` table doesn't have the proper RLS (Row-Level Security) policies configured. This means the `set-role` edge function (which runs as the `service_role`) cannot update the `profiles` table to save roles.

### Why It Might Work on Page 1:
If you only tested on page 1, it might have appeared to work initially, but was likely failing silently or the table wasn't refreshing properly.

## The Solution

You need to run a SQL migration that:
1. Adds `role`, `role_color`, and `updated_at` columns to the `profiles` table
2. Enables RLS on the `profiles` table
3. Creates a policy that allows the service role to read and update profiles
4. Creates a policy for the `admins` table

### How to Apply the Fix:

**File:** `supabase/enable-role-features.sql`

**Steps:**
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" 
3. Click "New Query"
4. Copy the entire contents of `supabase/enable-role-features.sql`
5. Paste it into the SQL editor
6. Click "Run"

**Expected Output:**
All commands should complete successfully with no errors.

## What Gets Fixed After Running SQL:

✅ Roles can be set on users from ANY page (not just page 1)
✅ Roles display correctly in the admin dashboard table
✅ Trial days can be set on users from any page
✅ Search and filtering work with roles
✅ Role colors persist correctly

## Testing

After running the SQL:

1. Go to the admin dashboard
2. Go to page 2 or search for a user
3. Click on them and try to set a role
4. It should now work without errors!

## If You Still See Errors

Check the Supabase function logs:
1. Go to https://app.supabase.com/project/woqlvcgryahmcejdlcqz/functions
2. Click "set-role"
3. Click "Logs"
4. You'll see the actual error details

Common error messages:
- **"permission denied for schema public"** → RLS policy wasn't created
- **"relation 'public.admins' does not exist"** → admins table needs to be created
- **"column 'role' of relation 'public.profiles' does not exist"** → role column needs to be added

If you see any of these, run the SQL migration again.

## File Changes Made

**supabase/functions/set-role/index.ts**
- Added detailed error logging to help diagnose RLS issues
- Error messages now explain what might be wrong

**admin/script.js**
- Improved error handling in `saveRoleModal()`
- Better error messages shown to the user
- Detects RLS-related errors and suggests running the SQL migration

**New Files:**
- `enable-role-features.sql` - The SQL migration to fix everything
- `QUICK_FIX.md` - Quick reference guide
- This file - Complete explanation

