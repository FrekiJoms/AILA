# Role Hierarchy Quick Start Guide

## 🎯 Main Features

### 1. Change Role Orders
**Location:** Click "Roles" button in toolbar (top right)

```
Admin Controls
├── Filters
├── Columns
├── Sort
├── Refresh
├── Admins
└── ⭐ Roles ← Click here to reorder roles
```

**What happens:**
- Modal opens showing all roles
- Drag roles up/down to reorder (↕)
- Higher position = higher authority
- Changes save automatically

### 2. Add New Role (Auto-Hierarchy)
**When:** Assigning a role to any user

**Process:**
```
User Profile → Set Role → Type role name → Click Set Role
                              ↓
                    Role auto-added to hierarchy!
                    ↓
           Appears in filters & autocomplete
```

**Benefits:**
- No manual role setup needed
- Role immediately available everywhere
- Saves time and reduces errors

### 3. See All Roles in Filters
**Location:** Filters dropdown → "Filter by Role"

**Before:** Only roles assigned to current users shown
```
Filter by Role
├── Admin (2 users)
├── Editor (5 users)
└── Viewer (8 users)
```

**After:** ALL roles from hierarchy shown
```
Filter by Role
├── All Roles (10)
├── Admin (2 assigned)
├── Editor (5 assigned)
├── Viewer (8 assigned)
├── Founder (0 assigned)    ← Shows even unused roles
├── Manager (0 assigned)    ← Appears when added to hierarchy
└── Custom Role (0 assigned)
```

## 📋 Step-by-Step Workflows

### Workflow A: Reorder Existing Roles

```
1. Click "Roles" button
   └─ Modal opens with all roles

2. Drag role upward to increase authority
   └─ Founder → [drag↑] → Top position

3. Drag role downward to decrease authority
   └─ Manager → [drag↓] → Lower position

4. Changes auto-save
   └─ Database updated immediately

5. Close modal (click "Done" or X)
   └─ Back to main panel
```

### Workflow B: Create and Add New Role

```
1. Click user's options menu → "Set Role"
   └─ Role modal opens

2. Type new role name
   └─ "Marketing Manager"
   └─ Autocomplete shows similar roles

3. Set color (optional)
   └─ Custom color or auto-detected

4. Click "Set Role"
   └─ Role assigned to user
   └─ Role added to hierarchy
   └─ Hierarchy order auto-assigned

5. Next time you filter or assign roles
   └─ "Marketing Manager" appears everywhere
```

### Workflow C: Filter by All Available Roles

```
1. Click "Filters" button
   └─ Filter dropdown opens

2. Scroll to "Filter by Role" section
   └─ Shows ALL roles (assigned + unassigned)

3. Check "All Roles" checkbox
   └─ Selects all roles at once

4. Or select individual roles
   └─ Mix and match any roles

5. Filter applies automatically
   └─ Table updates to show matching users
```

## 🔄 Automatic Behavior

These happen without you doing anything:

| Event | What Happens |
|-------|--------------|
| Assign new role to user | Role auto-added to hierarchy with next order number |
| Refresh page | Role hierarchy loads from database |
| Open filters | All hierarchy roles shown (even if unused) |
| Focus role input | Autocomplete shows all available roles |
| Type in role input | Suggestions updated as you type |

## 💡 Pro Tips

1. **Role Ordering Matters**
   - Drag roles to set authority level
   - Founder at top = highest authority
   - Viewer at bottom = lowest authority

2. **Use Autocomplete**
   - Start typing a role name
   - Select from dropdown to avoid typos
   - Saves time vs. typing full name

3. **All Roles Visible**
   - Filters show all hierarchy roles
   - Even roles not yet assigned to users
   - Great for planning ahead

4. **Consistent Names**
   - Use autocomplete to ensure consistency
   - Avoid "admin", "Admin", "ADMIN" variations
   - Makes filtering and sorting reliable

## ⚙️ Behind the Scenes

```
┌─────────────────────────────────────────────┐
│         Admin Panel (Frontend)              │
│  - Role input with autocomplete            │
│  - Hierarchy modal with drag-drop          │
│  - Filter checkboxes from hierarchy        │
└────────────────┬────────────────────────────┘
                 │ API calls
┌────────────────▼────────────────────────────┐
│    Edge Function (Backend)                  │
│  - manage-role-hierarchy                    │
│  - Handles CRUD operations                  │
└────────────────┬────────────────────────────┘
                 │ Database queries
┌────────────────▼────────────────────────────┐
│      Supabase PostgreSQL Database           │
│  - role_hierarchy table                     │
│  - RLS policies for security                │
│  - Auto-timestamp updates                   │
└─────────────────────────────────────────────┘
```

## 📊 Example Hierarchy

After using the system, you'll have:

```
Hierarchy Order 1: Founder          (Highest authority)
                  ├─ Color: Purple
                  ├─ Assigned: 1 user
                  └─ Permissions: all

Hierarchy Order 2: Main Developer
                  ├─ Color: Blue
                  ├─ Assigned: 3 users
                  └─ Permissions: code + admin

Hierarchy Order 3: Manager
                  ├─ Color: Green
                  ├─ Assigned: 2 users
                  └─ Permissions: view + edit

Hierarchy Order 4: Viewer           (Lowest authority)
                  ├─ Color: Gray
                  ├─ Assigned: 5 users
                  └─ Permissions: view only
```

## ❓ FAQ

**Q: What if I don't see a role in the hierarchy?**
A: It might not exist yet. Assign it to a user first, then it auto-appears.

**Q: Can I delete roles?**
A: Yes, through the manage-role-hierarchy function (via the Roles modal).

**Q: Do changes save automatically?**
A: Yes! When you drag to reorder or add a new role, it's saved immediately.

**Q: What happens to users if I reorder roles?**
A: Nothing! Role hierarchy is just for ordering. User assignments stay the same.

**Q: Can I use the same color for multiple roles?**
A: Yes, but it's recommended to use different colors for visual clarity.

**Q: Why don't I see all roles in filters sometimes?**
A: The page may not have loaded the hierarchy yet. Refresh the page to reload it.

---

**Need help?** Check the code comments in admin/script.js or admin/index.html for more details!
