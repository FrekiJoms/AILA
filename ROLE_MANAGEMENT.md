# Role Management System

## Overview

The AILA admin dashboard includes a comprehensive role management system that allows administrators to assign and manage user roles with custom colors.

## Features

✅ **Role Assignment** - Set user roles from the admin dashboard
✅ **Default Role Colors** - 8 predefined roles with automatic color assignment
✅ **Role Display** - Roles visible in admin dashboard and user profiles
✅ **Search & Filter** - Search users by role name
✅ **Multi-page Support** - Set roles on any page without issues
✅ **Real-time Sync** - Changes reflect immediately in the dashboard

## How to Set a Role

1. Go to the Admin Dashboard (`/admin/`)
2. Click on a user row to select them
3. Click **"Set Role"** from the sidebar options
4. Enter a role name or select from default roles:
   - Moderator
   - Owner
   - Helper
   - Tester
   - Founder
   - Co-Founder
   - Head Developer
   - Investor

5. The color will auto-set if it's a default role, or choose a custom color
6. Click **"Set Role"** to save

## Default Roles with Colors

| Role | Color |
|------|-------|
| Moderator | #3B82F6 (Blue) |
| Owner | #8B5CF6 (Purple) |
| Helper | #10B981 (Green) |
| Tester | #F59E0B (Amber) |
| Founder | #EF4444 (Red) |
| Co-Founder | #EC4899 (Pink) |
| Head Developer | #6366F1 (Indigo) |
| Investor | #14B8A6 (Teal) |

## Technical Implementation

### Edge Functions

**set-role** - Updates a user's role in the profiles table
- Endpoint: `POST /functions/v1/set-role`
- Authorization: Admin verification via `admins` table
- Body: `{ targetEmail, role, roleColor }`

**get-users** - Fetches all users with role data
- Endpoint: `GET /functions/v1/get-users`
- Query params: `page`, `pageSize`, `search`
- Returns: Users with role and role_color included

### Database Schema

**profiles table**
```sql
id UUID (primary key)
email VARCHAR(255)
role VARCHAR(255) -- User's role
role_color VARCHAR(7) -- Hex color code
updated_at TIMESTAMPTZ -- Last update time
```

**admins table**
```sql
email VARCHAR(255) (primary key)
role VARCHAR(255) -- Admin's role
role_color VARCHAR(7) -- Admin's role color
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### RLS Policies

- Authenticated users can read their own profile
- Service role (edge functions) has full access to profiles
- Service role has full access to admins table

## Troubleshooting

### Roles Not Displaying in Admin Table

**Issue**: Roles are saved but not showing in the admin dashboard table

**Solution**:
1. Run the SQL migration: `enable-role-features.sql`
2. Verify RLS policies are correct:
   ```sql
   SELECT * FROM information_schema.table_privileges 
   WHERE table_name = 'profiles' AND grantee = 'service_role';
   ```
3. Check edge function logs in Supabase dashboard

### 404 Error When Setting Role

**Issue**: "Error: HTTP 404" when trying to set a role

**Solution**:
1. Verify set-role function is deployed in Supabase Functions
2. Check function name is exactly "set-role"
3. Verify your email is in the `admins` table:
   ```sql
   SELECT * FROM public.admins WHERE email = 'your-email@example.com';
   ```

### Search Not Finding Users

**Issue**: Search works on page 1 but not on other results

**Solution**:
1. The get-users function searches across all users and then paginates
2. This means search results are accurate but may span multiple "pages"
3. Use the pagination controls to navigate search results

## Adding Custom Roles

To add a new custom role:

1. **In Code** (admin/script.js):
   ```javascript
   const DEFAULT_ROLE_COLORS = {
     'Moderator': '#3B82F6',
     'MyNewRole': '#ABC123', // Add your role here
   };
   ```

2. **Or Enter Manually**: 
   - Use the role modal to set any custom role name
   - Choose your own color
   - The role will be saved to the user's profile

## Admin Requirements

To manage roles, a user must:
1. Be logged in with an active session
2. Have their email in the `admins` table
3. Have appropriate permissions in Supabase

To add an admin, run:
```sql
INSERT INTO public.admins (email, role, role_color)
VALUES ('admin@example.com', 'Admin', '#3B82F6');
```

## API Examples

### Set a Role (from client code)

```javascript
const { data, error } = await _supabase.functions.invoke('set-role', {
  body: {
    targetEmail: 'user@example.com',
    role: 'Moderator',
    roleColor: '#3B82F6'
  }
});

if (error) console.error('Error:', error);
else console.log('Role set successfully:', data);
```

### Fetch Users with Roles

```javascript
const response = await fetch(
  '/functions/v1/get-users?page=1&pageSize=30&search=moderator',
  {
    headers: {
      'Authorization': `Bearer ${sessionToken}`
    }
  }
);
const data = await response.json();
console.log(data.users);
```

## Performance Notes

- Role data is fetched in batches using the `.in()` filter in Supabase
- Search is performed server-side to avoid loading all users
- RLS policies allow efficient access control
- Indexes on `profiles.id` and `profiles.role` improve query performance

## Future Enhancements

- [ ] Bulk role assignment
- [ ] Role templates with predefined permissions
- [ ] Role audit logs
- [ ] Permission management per role
- [ ] API keys with role-based access control
