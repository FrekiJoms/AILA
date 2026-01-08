# 🔧 Bug Fix Summary - Role Setting on All Pages

## Issue You Reported
- ❌ Setting roles fails with error: "Edge Function returned a non-2xx status code"
- ❌ Only page 1 works properly  
- ❌ Users on pages 2+ can't have roles set (same bug as trial days)
- ❌ Searching for a user on page 4 and trying to set role fails

## Root Cause
The `profiles` table in Supabase doesn't have RLS policies configured, so the edge function can't update it.

## Quick Fix (3 Steps)

### Step 1: Open Supabase SQL Editor
Go to: https://app.supabase.com/project/woqlvcgryahmcejdlcqz/sql/new

### Step 2: Copy & Paste the SQL Migration
Copy everything from: `supabase/enable-role-features.sql`

Paste it into the SQL editor

### Step 3: Click "Run"
Execute the query. You should see success messages.

## What Gets Fixed
✅ Roles can be set on users from **ANY page** (not just page 1)
✅ Roles display in the admin table  
✅ Trial days work on all pages
✅ Search results can have roles set
✅ All users (regardless of page) can be updated

## Files Updated

**Code Changes:**
- `supabase/functions/set-role/index.ts` - Better error logging
- `admin/script.js` - Improved error messages

**Documentation Created:**
- `enable-role-features.sql` - SQL migration (run this in Supabase!)
- `QUICK_FIX.md` - Quick reference
- `BUG_FIX_EXPLANATION.md` - Detailed explanation

## Next Steps

1. **Run the SQL migration** (copy the file from `supabase/enable-role-features.sql`)
2. **Test**: Go to admin dashboard → page 2+ → click a user → set role → should work!
3. **If still broken**: Check Supabase function logs (dashboard → Functions → set-role → Logs)

## Common Issues After Applying Fix

**Still seeing errors?**
- Make sure you ran ALL the SQL commands (don't stop halfway)
- Check that your email is in the `admins` table
- Check the Supabase function logs for detailed error messages

**Need to verify RLS is working?**
Run these queries in Supabase SQL editor:
```sql
-- Check the policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

-- Should see:
-- - Users can read their own profile
-- - Service role full access to profiles  
-- - Users can update their own profile
```

