# Deployment Guide

## Supabase Edge Functions Deployment

The AILA admin system uses several Supabase Edge Functions that need to be deployed to your Supabase project.

### Functions to Deploy

1. **set-role** - Sets a user's role and role color in the profiles table
   - Location: `supabase/functions/set-role/index.ts`
   - Purpose: Admin endpoint to update user roles

2. **get-users** - Fetches all users with pagination, search, and role data
   - Location: `supabase/functions/get-users/index.ts`
   - Purpose: Fetch users list for admin dashboard

3. **manage-admins** - Manages admin user list
   - Location: `supabase/functions/manage-admins/index.ts`
   - Purpose: Add/remove admin privileges

### Deployment Steps

#### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref woqlvcgryahmcejdlcqz
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy set-role
   supabase functions deploy get-users
   supabase functions deploy manage-admins
   ```

#### Option 2: Using Supabase Dashboard

1. Go to: https://app.supabase.com/project/woqlvcgryahmcejdlcqz/functions
2. Click "Create a new function"
3. For each function:
   - Name: `set-role` (or respective name)
   - Copy the entire contents from the `.ts` file in `supabase/functions/{name}/index.ts`
   - Paste into the editor
   - Click "Deploy"

### Database Setup

Execute these SQL migrations in the Supabase SQL Editor:

1. **Add role columns to profiles table:**
   ```sql
   ALTER TABLE public.profiles
   ADD COLUMN role VARCHAR(255),
   ADD COLUMN role_color VARCHAR(7),
   ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
   ```

2. **Enable RLS for profiles table (if not already enabled):**
   ```sql
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

   -- Allow authenticated users to read their own profile
   CREATE POLICY "Users can read their own profile"
   ON public.profiles FOR SELECT
   USING (auth.uid() = id);

   -- Allow service role to access profiles (for edge functions)
   CREATE POLICY "Service role access"
   ON public.profiles
   USING (auth.role() = 'service_role')
   WITH CHECK (auth.role() = 'service_role');
   ```

3. **Create admins table if it doesn't exist:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.admins (
     email VARCHAR(255) PRIMARY KEY,
     role VARCHAR(255) DEFAULT 'admin',
     role_color VARCHAR(7) DEFAULT '#FF0000',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

   -- Allow service role to query admins
   CREATE POLICY "Service role can read admins"
   ON public.admins FOR SELECT
   USING (auth.role() = 'service_role');
   ```

### Troubleshooting

**404 Error on set-role:**
- Verify the function is deployed in the Supabase dashboard under Functions
- Check the function name matches exactly: "set-role"
- Check browser console for the exact error message

**Roles not showing in admin table:**
- Check that profiles table has role and role_color columns
- Verify RLS policies are set correctly for service role access
- Check Supabase logs for get-users function errors

**401 Unauthorized errors:**
- Ensure your user email is added to the admins table
- Verify admin table exists and has your email

### Environment Variables

Make sure these are set in your Supabase project settings:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (keep secret!)
- `SUPABASE_ANON_KEY` - Your anon key

These are automatically available to edge functions.

### Testing Edge Functions

After deployment, test in the browser console:

```javascript
// Test set-role
const { data, error } = await _supabase.functions.invoke('set-role', {
  body: { 
    targetEmail: 'user@example.com',
    role: 'Moderator',
    roleColor: '#3B82F6'
  }
});
console.log(data, error);

// Test get-users
const response = await _supabase.functions.invoke('get-users', {
  body: { page: 1, pageSize: 30 }
});
console.log(response);
```

### Monitoring

View function logs in the Supabase dashboard:
1. Go to Functions → [function name]
2. Click "Logs" tab
3. Watch real-time execution logs

