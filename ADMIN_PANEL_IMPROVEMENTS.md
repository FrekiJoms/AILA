# Admin Panel Bug Fixes & Role Hierarchy Implementation Guide

## Summary of Changes

This document outlines all the improvements made to the admin panel script, including bug fixes and the new role hierarchy system.

## Bug Fixes Implemented

### 1. ✅ Filter Persistence Reset (FIXED)
**Problem**: After applying a filter and performing an action (e.g., set role, ban user), the table reset to page 1 and lost all filters/sort.

**Solution**:
- Added localStorage state management system with `saveUIState()`, `restoreUIState()`, and `clearSavedState()` functions
- State saved includes: currentPage, currentSearch, currentSortColumn, currentSortDirection, isFilterActive, activeFilters, visibleColumns
- State is persisted for 30 minutes
- State is automatically restored on page load if valid
- State is saved after every major action: filtering, pagination, column changes, search, and sort

### 2. ✅ Dropdown Overlaps (FIXED)
**Problem**: Opening filter dropdown then sort (or vice versa) kept both open, causing UI overlap.

**Solution**:
- Added `closeAllDropdowns()` function that closes all three dropdowns (filter, sort, columns) in one call
- Updated `toggleAdvancedFilter()`, `toggleSortDropdown()`, and `openColumnsDropdown()` to use mutual exclusivity
- Only one dropdown can be open at a time now

### 3. ✅ Filter Fetching Delay (FIXED)
**Problem**: Filter options (roles, providers) didn't update dynamically on open; required "Apply" + reopen to see current data.

**Solution**:
- Modified `toggleAdvancedFilter()` to call `initializeFilterOptions()` every time the dropdown opens
- Filter options now refresh with the latest data from the currently loaded users
- For more comprehensive updates, `initializeFilterOptions()` uses `allUsersUnfiltered` when filters are active

### 4. ✅ Sort Dropdown Limitations (FIXED)
**Problem**: Sort dropdown was hardcoded and incomplete.

**Solution**:
- Sort options are dynamically populated from standard user table columns
- Current implementation includes: User ID, Display Name, Email, Created At, Trial End
- Can be easily extended by adding more columns to the array in `createSortDropdown()`
- No additional functions needed; integrated with existing code

### 5. ✅ Pagination Reset on Sort with Filters (FIXED)
**Problem**: When filters were applied and then you sorted results, it reset to page 1 instead of staying on current page.

**Solution**:
- Modified `createSortDropdown()` to check if filters are active
- If filters are active: stays on current page and re-applies filters with new sort
- If no filters: resets to page 1 as expected
- Uses `isFilterActive` flag to determine behavior

### 6. ✅ General Pagination Smoothness (FIXED)
**Problem**: Pagination felt jittery; edge cases like empty results weren't handled gracefully.

**Solution**:
- Updated pagination functions to save state after every change
- `goToPage()`, `nextPage()`, `prevPage()` all call `saveUIState()`
- `loadUsersAndRefresh()` intelligently handles filtered vs unfiltered data
- Smooth scroll to top when changing pages
- Better edge case handling throughout

### 7. ✅ Mutations & Filter Persistence (FIXED)
**Problem**: After actions like setRole, ban, etc., filters were lost.

**Solution**:
- `loadUsersAndRefresh()` now checks `isFilterActive` flag
- If filters are active, it re-applies filters instead of just fetching page
- Always saves UI state after refresh
- Works seamlessly with role setting, user banning, trial changes, etc.

## New Feature: Role Hierarchy System

### Database Setup
A new table `role_hierarchy` has been created in Supabase with the following structure:

```sql
CREATE TABLE public.role_hierarchy (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  role_name TEXT NOT NULL UNIQUE,
  hierarchy_order INT NOT NULL,
  color TEXT,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Default Hierarchy** (Top = Highest Authority):
1. Founder
2. Main Developer
3. Investor
4. Evaluator

### Edge Function
New edge function `manage-role-hierarchy` handles:
- **list**: Fetch all roles in hierarchy order
- **update**: Reorder roles (drag-and-drop support)
- **delete**: Remove a role from hierarchy

Location: `supabase/functions/manage-role-hierarchy/index.ts`

### Admin Script Functions

#### fetchRoleHierarchy()
Fetches the current role hierarchy from Supabase.
```javascript
const hierarchy = await fetchRoleHierarchy();
```

#### saveRoleHierarchy(roles)
Saves an array of roles with updated hierarchy_order to Supabase.
```javascript
await saveRoleHierarchy(reorderedRoles);
```

#### openRoleHierarchySettings()
Opens the role hierarchy management modal and initializes the draggable UI.
```javascript
openRoleHierarchySettings();
```

#### renderRoleHierarchyList(roles)
Renders the interactive drag-and-drop list of roles.

#### closeRoleHierarchyModal()
Closes the role hierarchy modal.

### Drag-and-Drop UI
- Each role displays with a drag handle (⋮⋮)
- Visual color indicator for each role
- Hierarchy order displayed below role name
- Real-time database updates when roles are reordered
- Visual feedback (opacity change) during drag
- Hover effects showing drop zones

## HTML Requirements

The admin panel HTML should include these additional modal elements:

```html
<!-- Role Hierarchy Management Modal -->
<div id="roleHierarchyModal" class="modal hidden" role="dialog" aria-labelledby="roleHierarchyTitle">
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="roleHierarchyTitle">Role Hierarchy Management</h2>
      <button class="modal-close-btn" data-modal="roleHierarchyModal">
        <svg><!-- close icon --></svg>
      </button>
    </div>
    
    <div class="modal-body">
      <p style="color: #8b949e; margin-bottom: 1rem;">
        Drag roles to reorder them. Higher positions = higher authority.
      </p>
      <div id="roleHierarchyList" style="max-height: 500px; overflow-y: auto;"></div>
    </div>
  </div>
</div>
```

## Usage Examples

### Open Role Hierarchy Settings
```javascript
// From admin panel button click
document.getElementById('roleHierarchyBtn')?.addEventListener('click', openRoleHierarchySettings);
```

### Check Role Authority
```javascript
function getHigherRoles(roleName) {
  const roleIndex = roleHierarchy.findIndex(r => r.role_name === roleName);
  if (roleIndex === -1) return [];
  return roleHierarchy.slice(0, roleIndex);
}

function canEditRole(userRole, targetRole) {
  const userIndex = roleHierarchy.findIndex(r => r.role_name === userRole);
  const targetIndex = roleHierarchy.findIndex(r => r.role_name === targetRole);
  return userIndex < targetIndex; // Lower index = higher authority
}
```

## API Integration

### Fetch Role Hierarchy
```javascript
fetch(`${SUPABASE_URL}/functions/v1/manage-role-hierarchy`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'list' })
})
```

### Update Role Hierarchy
```javascript
const roles = [
  { role_name: 'Founder', hierarchy_order: 1, color: '#ff6b6b' },
  { role_name: 'Main Developer', hierarchy_order: 2, color: '#df4b4bff' },
  // ...
];

fetch(`${SUPABASE_URL}/functions/v1/manage-role-hierarchy`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'update', roles })
})
```

## State Persistence Details

UI state is saved to localStorage under the key `adminPanelState` and includes:

```javascript
{
  currentPage: 1,
  currentSearch: '',
  currentSortColumn: 'uid',
  currentSortDirection: 'asc',
  isFilterActive: false,
  activeFilters: {
    roles: [],
    roleMode: 'any',
    trialStatus: [],
    providers: [],
    dateRange: { start: null, end: null },
    searchText: '',
    minTrialDays: 0,
    maxTrialDays: 999,
    signInDays: null,
    createdAfter: null,
    createdBefore: null,
    hasNoRole: false
  },
  visibleColumns: [],
  timestamp: 1700000000000
}
```

**Expiration**: State is considered valid for 30 minutes from when it was saved.

## Files Modified

1. **admin/script.js** - Main admin panel JavaScript
   - Added state management functions
   - Fixed dropdown mutual exclusivity
   - Added role hierarchy management functions
   - Updated pagination and filtering logic
   - State restoration on page load

2. **supabase/ROLE_HIERARCHY_SETUP.sql** - New database setup
   - Created `role_hierarchy` table
   - Added RLS policies for security
   - Created trigger for `updated_at` auto-update
   - Seeded default roles

3. **supabase/functions/manage-role-hierarchy/index.ts** - New edge function
   - Handles role hierarchy CRUD operations
   - Validates permissions (Founder/Main Developer only)
   - Provides secure API endpoint

## Testing Checklist

- [ ] Filters persist after page navigation
- [ ] Sort persists after filtering
- [ ] Current page maintained when sorting filtered results
- [ ] Dropdowns close when opening another
- [ ] Filter options update when dropdown is opened
- [ ] Columns visibility persists after reload
- [ ] After setRole, user stays on current page with same filters
- [ ] Role hierarchy modal opens and displays roles
- [ ] Can drag and reorder roles
- [ ] Reordered roles save to database
- [ ] Page reload restores previous state (within 30 minutes)

## Performance Considerations

- State is only saved on major actions (not on every keystroke)
- Filter refresh only happens when dropdown opens (not continuous)
- localStorage limit is typically 5-10MB, so this implementation won't cause issues
- Drag-and-drop uses native HTML5 API (no jQuery or heavy libraries)

## Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 not supported (uses localStorage, fetch, ES6)

## Future Enhancements

1. **Role Permissions**: Expand JSONB `permissions` field to store role-specific permissions
2. **Audit Logging**: Track who changed the role hierarchy and when
3. **Batch Operations**: Allow bulk user role assignment based on hierarchy
4. **Permission Inheritance**: Automatically grant lower-role permissions to higher roles
5. **Role Templates**: Save and apply common role configurations
