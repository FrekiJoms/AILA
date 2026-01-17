# Admin Panel - Visual Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL FRONTEND                      │
│                     (admin/script.js)                         │
└──────┬──────────────────────────────────────────────┬────────┘
       │                                              │
       ▼                                              ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│   STATE MANAGEMENT       │              │   DROPDOWN MANAGEMENT    │
├──────────────────────────┤              ├──────────────────────────┤
│ • saveUIState()          │              │ • closeAllDropdowns()    │
│ • restoreUIState()       │              │ • toggleAdvancedFilter() │
│ • clearSavedState()      │              │ • toggleSortDropdown()   │
│                          │              │ • openColumnsDropdown()  │
│ localStorage:            │              │                          │
│  - currentPage           │              │ Mutual Exclusivity:      │
│  - currentSearch         │              │  Only 1 open at a time   │
│  - currentSort*          │              │                          │
│  - activeFilters         │              │ Auto-refresh filters:    │
│  - visibleColumns        │              │  On every open           │
└──────────────────────────┘              └──────────────────────────┘
       │                                              │
       ▼                                              ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│   TABLE OPERATIONS       │              │   PAGINATION & SORTING   │
├──────────────────────────┤              ├──────────────────────────┤
│ • fetchUsers()           │              │ • goToPage(n)            │
│ • renderUserTable()      │              │ • nextPage()             │
│ • performSearch()        │              │ • prevPage()             │
│ • loadUsersAndRefresh()  │              │ • createSortDropdown()   │
│ • applyFilters()         │              │                          │
│ • resetAllFilters()      │              │ Smart behavior:          │
│                          │              │ • With filters: stay page│
│ With filter persistence: │              │ • No filters: reset to 1 │
│ • Re-apply on refresh    │              │ • Auto-save state        │
│ • Maintain page number   │              │                          │
└──────────────────────────┘              └──────────────────────────┘
       │                                              │
       └──────────────────┬───────────────────────────┘
                          │
                          ▼
                    ┌────────────────┐
                    │  Supabase      │
                    │  Auth & API    │
                    └────────────────┘
```

## Data Flow Diagram

### Filter Application Flow

```
User Opens Filter Dropdown
            │
            ▼
    initializeFilterOptions()
    ├─ Get roles from allUsers
    ├─ Get providers from allUsers
    └─ Render checkboxes
            │
User Selects Filters & Clicks "Apply"
            │
            ▼
    applyFilters()
    ├─ Fetch all users if needed
    ├─ Filter by selected criteria
    ├─ Set isFilterActive = true
    ├─ currentPage = 1
    ├─ renderUserTable(filtered)
    └─ saveUIState() ◄─── STATE SAVED
            │
            ▼
    updateTrialCountdowns()
            │
            ▼
    closeAdvancedFilter()
            │
            ▼
    User sees filtered results on page 1
    (State persists after reload)
```

### Pagination with Filters Flow

```
User on Page 1 with Active Filters
            │
User Clicks "Next" or "Go to Page 2"
            │
            ▼
    goToPage(2)
    ├─ if (isFilterActive) {
    │    Re-apply filters for page 2
    │  } else {
    │    fetchUsers(2)
    │  }
    ├─ renderUserTable()
    ├─ updateTrialCountdowns()
    ├─ saveUIState() ◄─── STATE SAVED (page 2 + filters)
    └─ scrollTo top
            │
            ▼
User sees page 2 with same filters applied
(State includes page 2 info)
```

### Mutation with State Preservation Flow

```
User Clicks Row → Opens Sidebar
            │
User Sets Role / Bans / Changes Trial
            │
            ▼
    banUser() / setRole() / setTrialDate()
    ├─ API call to edge function
    ├─ User data updated
    └─ return
            │
            ▼
    loadUsersAndRefresh()
    ├─ if (isFilterActive) {
    │    applyFilters() ◄─── RE-APPLY FILTERS
    │  } else {
    │    fetchUsers(currentPage, currentSearch)
    │  }
    ├─ renderUserTable()
    ├─ saveUIState() ◄─── STATE SAVED
    └─ closeOptionsSidebar()
            │
            ▼
User still on same page, same filters, updated data
```

### Role Hierarchy Management Flow

```
User Clicks "Role Hierarchy" Button
            │
            ▼
    openRoleHierarchySettings()
    ├─ fetchRoleHierarchy()
    │  └─ GET manage-role-hierarchy (action: list)
    │     └─ Returns roles sorted by hierarchy_order
    ├─ renderRoleHierarchyList(roles)
    │  └─ Create draggable <li> for each role
    │     ├─ Drag handles (⋮⋮)
    │     ├─ Color swatches
    │     └─ Hierarchy order
    └─ Open modal
            │
        User drags role
            │
            ▼
    <li> dragstart event
    ├─ Set dataTransfer
    └─ Change opacity to 0.5
            │
        User drags over other role
            │
            ▼
    <li> dragover event
    └─ Change background color
            │
        User drops role
            │
            ▼
    <li> drop event
    ├─ Reorder roles array
    ├─ Update hierarchy_order for all
    ├─ saveRoleHierarchy(newRoles)
    │  └─ POST manage-role-hierarchy (action: update)
    │     └─ Upsert all roles to database
    ├─ renderRoleHierarchyList(newRoles)
    └─ Reset opacity and background
            │
            ▼
User sees reordered list, changes saved to DB
```

## State Persistence Timeline

```
Page Load
   │
   ├─ Get saved state from localStorage
   │   │
   │   ├─ If valid (< 30 min old):
   │   │   ├─ currentPage = saved.currentPage
   │   │   ├─ activeFilters = saved.activeFilters
   │   │   ├─ isFilterActive = saved.isFilterActive
   │   │   └─ Restore UI
   │   │
   │   └─ Else (expired or not found):
   │       └─ Use defaults (page 1, no filters)
   │
   └─ Fetch users
       │
       ├─ If filters were active:
       │   └─ applyFilters() ◄─── STATE DRIVEN
       │
       └─ Else:
           └─ Normal page load
               │
               ▼
           User Actions...
               │
               ├─ Filter → applyFilters() → saveUIState()
               ├─ Sort → renderUserTable() → saveUIState()
               ├─ Search → performSearch() → saveUIState()
               ├─ Page → goToPage() → saveUIState()
               └─ Columns → saveColumnsAndClose() → saveUIState()
               
       After 30 minutes: State expires in localStorage
```

## Component Dependency Graph

```
┌─────────────────────────────────────────┐
│       DOMContentLoaded Handler           │
├─────────────────────────────────────────┤
│ • restoreUIState()  ◄─── Read state     │
│ • loadAdminProfile()                    │
│ • fetchRoleHierarchy()                  │
│ • fetchUsers()  ◄─── Query backend      │
│ • renderUserTable()  ◄─── Render        │
│ • setupSearchListener()                 │
│ • loadColumnPreferences()               │
│ • createSortDropdown()                  │
│ • loadAdminsList()                      │
└──────────┬──────────────────────────────┘
           │
           ├─────────────────────────┬──────────────────────┐
           │                         │                      │
    ┌──────▼──────┐         ┌────────▼────────┐    ┌────────▼─────┐
    │User Clicking│         │User Scrolling   │    │Page Reloads  │
    │Buttons      │         │or Dragging      │    │              │
    └──────┬──────┘         └────────┬────────┘    └────────┬─────┘
           │                         │                      │
    ┌──────▼──────────────────┐      │          ┌───────────▼──────┐
    │Dropdown/Filter/Sort     │      │          │ restoreUIState() │
    │Functions Called         │      │          └──────────────────┘
    │                         │      │                     │
    │ • toggleSort()          │      │          ┌──────────▼─────────┐
    │ • toggleFilter()        │      │          │ Re-apply filters   │
    │ • applyFilters()        │      │          │ Re-apply sort      │
    │ • goToPage()            │      │          │ Re-render table    │
    │ • performSearch()       │      │          │                    │
    │ • setRole()             │      │          └────────────────────┘
    │ • banUser()             │      │
    └──────┬──────────────────┘      │
           │                         │
    ┌──────▼──────────────────┐      │
    │ saveUIState() CALLED    │      │
    │ (After every action)    │      │
    └──────┬──────────────────┘      │
           │                         │
    ┌──────▼──────────────────┐      │
    │ localStorage Updated    │      │
    │ (2KB state blob)        │      │
    └──────────────────────────┘      │
                                     ▼
                          ┌──────────────────┐
                          │ Drag-Drop Modal  │
                          │ openRoleMgmt()   │
                          │ renderDragList() │
                          │ saveRolesToDB()  │
                          └──────────────────┘
```

## API Call Sequence

### Initial Load
```
1. getSession() → Get auth token
2. manage-admins (list) → Get admin list
3. get-users → Fetch page 1
4. manage-role-hierarchy (list) → Fetch role hierarchy
5. profiles → Get admin profile (optional)
```

### After Filter Applied
```
1. getSession() → Get token
2. get-users (paginated) → Fetch all pages
3. Filter locally in memory
4. renderUserTable() → Display results
```

### After Role Hierarchy Reordered
```
1. getSession() → Get token
2. manage-role-hierarchy (update) → POST new order
3. Database updates (UPSERT)
4. Trigger updates updated_at
5. Local array updated
6. renderRoleHierarchyList() → Re-render with new order
```

## Dropdown Lifecycle

```
┌─ Columns Dropdown ──────┐
│ [HIDDEN] → click btn    │
│  ↓                      │
│  closeAllDropdowns()    │
│  (hides all)            │
│  ↓                      │
│ [VISIBLE]               │
│  ↓                      │
│ User interacts...       │
│  ↓                      │
│ saveColumns()           │
│ saveUIState()           │
│  ↓                      │
│ closeColumnsDropdown()  │
│  ↓                      │
│ [HIDDEN]                │
└─────────────────────────┘

This same pattern for Filter and Sort dropdowns
```

## Error Handling Flow

```
API Call Made
    │
    ├─ Network Error?
    │  └─ catch (error) → console.error() → alert()
    │
    ├─ Auth Error?
    │  └─ showUnauthorizedMessage()
    │
    ├─ Server Error?
    │  └─ alert() with error message
    │
    ├─ Parsing Error?
    │  └─ console.error() + fallback
    │
    └─ Success?
       └─ Continue execution
```

## Browser Storage Flow

```
localStorage['adminPanelState']
{
  "currentPage": 1,
  "currentSearch": "",
  "currentSortColumn": "uid",
  "currentSortDirection": "asc",
  "isFilterActive": false,
  "activeFilters": {...},
  "visibleColumns": [...],
  "timestamp": 1704067200000
}

localStorage['visibleColumns']
["uid", "name", "email", "role", ...]

localStorage['roleTemplates']
[
  {"name": "Founder", "color": "#ff6b6b"},
  ...
]
```

## Security Layers

```
User Request
    │
    ├─ Browser Check
    │  └─ Token present in Authorization header?
    │
    ├─ Edge Function Check
    │  ├─ Token valid?
    │  ├─ User authenticated?
    │  └─ User role sufficient?
    │
    ├─ Database RLS Check
    │  ├─ Row level security policies
    │  ├─ User can read/write row?
    │  └─ Session ownership
    │
    └─ Data Validation
       ├─ Input types correct?
       ├─ Values in valid ranges?
       └─ Required fields present?
```

---

This architecture ensures:
- ✅ Data consistency across page reloads
- ✅ Smooth user experience with persistent state
- ✅ Security through multiple validation layers
- ✅ Performance through efficient state management
- ✅ Extensibility for future features
