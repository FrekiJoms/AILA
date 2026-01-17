# Admin Panel - Quick Reference Guide

## 🔧 Key Functions Reference

### State Management

| Function | Purpose | Usage |
|----------|---------|-------|
| `saveUIState()` | Save current admin state to localStorage | Called automatically after major actions |
| `restoreUIState()` | Restore state from localStorage on page load | Called in DOMContentLoaded |
| `clearSavedState()` | Clear saved state from storage | Called after filter reset |

### Dropdown Management

| Function | Purpose | Usage |
|----------|---------|-------|
| `closeAllDropdowns()` | Close all open dropdowns | Called before opening any dropdown |
| `toggleAdvancedFilter()` | Open/close filter dropdown | Click "Advanced Filter" button |
| `toggleSortDropdown()` | Open/close sort dropdown | Click "Sort" button |
| `openColumnsDropdown()` | Open columns dropdown | Click "Columns" button |
| `closeColumnsDropdown()` | Close columns dropdown | Internal use |

### Filtering

| Function | Purpose | Usage |
|----------|---------|-------|
| `toggleAdvancedFilter()` | Open filter with fresh options | `<button onclick="toggleAdvancedFilter()">` |
| `initializeFilterOptions()` | Refresh filter options from data | Called on dropdown open |
| `applyFilters()` | Apply selected filters to table | Click "Apply" in filter UI |
| `resetAllFilters()` | Clear all filters | Click "Reset All" in filter UI |

### Pagination

| Function | Purpose | Usage |
|----------|---------|-------|
| `goToPage(pageNum)` | Navigate to specific page | Link/button with page number |
| `nextPage()` | Go to next page | Next button click |
| `prevPage()` | Go to previous page | Previous button click |
| `updatePaginationInfo()` | Update pagination display | Called after pagination change |

### Role Hierarchy

| Function | Purpose | Usage |
|----------|---------|-------|
| `fetchRoleHierarchy()` | Get roles from Supabase | Called on page load |
| `saveRoleHierarchy(roles)` | Save reordered roles | Called after drag-drop |
| `openRoleHierarchySettings()` | Open role management modal | Role Hierarchy button click |
| `renderRoleHierarchyList(roles)` | Render draggable role list | Called by openRoleHierarchySettings |
| `closeRoleHierarchyModal()` | Close role hierarchy modal | Done button click |

## 🎯 Common Tasks

### Display Fresh Filters
```javascript
toggleAdvancedFilter();
// initializeFilterOptions() called automatically
```

### Apply Filter and Stay on Page
```javascript
// User selects filter options then clicks Apply
applyFilters();
// Page 1 shown, filters saved in localStorage
```

### Navigate While Keeping Filters
```javascript
goToPage(2);
// Fetches page 2 with current filters
// State saved automatically
```

### Refresh After User Action
```javascript
// After setRole, ban, etc.
await loadUsersAndRefresh();
// Re-applies filters if active, or fetches fresh page
```

### Reorder Roles
```javascript
// User drags role in modal
// Drag event triggers saveRoleHierarchy()
// Roles reordered in database
```

## 📊 State Object Structure

```javascript
const state = {
  // Pagination
  currentPage: 1,
  currentSearch: '',
  
  // Sorting
  currentSortColumn: 'uid',
  currentSortDirection: 'asc',
  
  // Filtering
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
  
  // UI
  visibleColumns: ['uid', 'name', 'email', 'role', ...],
  
  // Meta
  timestamp: Date.now()  // Expires in 30 minutes
};
```

## 🔑 Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `currentPage` | number | Current page in pagination |
| `currentSearch` | string | Current search term |
| `currentSortColumn` | string | Column being sorted by |
| `currentSortDirection` | 'asc'\|'desc' | Sort direction |
| `isFilterActive` | boolean | Whether filters are applied |
| `activeFilters` | object | Current filter selections |
| `allUsers` | array | Users on current page |
| `allUsersUnfiltered` | array | All users from all pages (for filtering) |
| `roleHierarchy` | array | All roles with hierarchy order |
| `adminEmails` | array | List of admin emails |

## 🎨 CSS Classes

| Class | Purpose | Example |
|-------|---------|---------|
| `.hidden` | Hide element | `modal.classList.add('hidden')` |
| `.modal-close-btn` | Close button handler | `<button class="modal-close-btn" data-modal="id">` |
| `.modal` | Modal styling | Auto-handled |
| `.role-badge` | Role display styling | Auto-handled |
| `.trial-countdown` | Trial timer styling | Auto-handled |

## 🌐 API Endpoints

### manage-role-hierarchy Edge Function
```
POST /functions/v1/manage-role-hierarchy
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  action: 'list' | 'update' | 'delete',
  roles?: RoleHierarchyItem[],  // for 'update'
  roleName?: string             // for 'delete'
}

Response:
{
  success: true,
  data: RoleHierarchyItem[] | boolean
}
```

## 💾 localStorage Keys

| Key | Contents | Size |
|-----|----------|------|
| `adminPanelState` | Full UI state | ~2KB |
| `visibleColumns` | Column visibility | ~500B |
| `roleTemplates` | Recent role templates | ~1KB |

## 🐛 Debugging

### Check Saved State
```javascript
console.log(JSON.parse(localStorage.getItem('adminPanelState')));
```

### Check Active Filters
```javascript
console.log(activeFilters);
console.log(isFilterActive);
```

### Check Role Hierarchy
```javascript
console.log(roleHierarchy);
```

### Force Refresh
```javascript
clearSavedState();
location.reload();
```

### Verify Dropdown Status
```javascript
console.log(document.getElementById('advancedFilterDropdown').classList);
console.log(document.getElementById('sortDropdown').classList);
```

## 🚨 Common Issues & Solutions

### Filters Not Persisting
**Problem**: Filters lost after refresh  
**Solution**: Check `isFilterActive` flag and ensure `applyFilters()` was called
```javascript
console.log(isFilterActive);  // Should be true
console.log(localStorage.getItem('adminPanelState'));  // Should have filters
```

### Dropdowns Overlapping
**Problem**: Multiple dropdowns open at once  
**Solution**: Ensure `closeAllDropdowns()` is called
```javascript
// Before opening any dropdown:
closeAllDropdowns();
// Then open the one you want
```

### Filter Options Stale
**Problem**: New roles don't appear in filter list  
**Solution**: Open filter dropdown (calls `initializeFilterOptions()` automatically)
```javascript
toggleAdvancedFilter();  // Re-opens with fresh options
```

### Role Hierarchy Not Saving
**Problem**: Reordered roles revert  
**Solution**: Check network tab for failed requests
```javascript
// Manual save attempt:
await saveRoleHierarchy(roleHierarchy);
```

### Page Resets on Sort
**Problem**: Page goes back to 1 when sorting filtered results  
**Solution**: This is actually correct! Set `isFilterActive = false` if you want page to stay
```javascript
console.log(isFilterActive);  // Should be true for filters to persist
```

## 📱 Responsive Design Notes

- Modal max-width: 600px (adjustable)
- Drag-and-drop tested on desktop
- Mobile: Touch support via standard drag events
- Dropdowns position relative to button
- All fonts scale with viewport

## ♿ Accessibility Features

- Modal uses `role="dialog"`
- Headers use semantic HTML (`<h2>` with id)
- Labels for form inputs
- ARIA attributes where needed
- Keyboard navigation support (Tab, Escape)
- Focus management in modals

## 🔒 Security Checklist

- [ ] All API calls include Bearer token
- [ ] RLS policies active on role_hierarchy table
- [ ] Authorization checks in edge function
- [ ] Input validation on all endpoints
- [ ] CORS headers properly configured
- [ ] No sensitive data in localStorage
- [ ] Session validation on critical operations

## 📞 Getting Help

1. **Code Issues**: Check function comments in script.js
2. **API Issues**: Check manage-role-hierarchy/index.ts
3. **Database Issues**: Check ROLE_HIERARCHY_SETUP.sql
4. **Integration Issues**: Check ROLE_HIERARCHY_HTML_EXAMPLE.html
5. **General Questions**: See ADMIN_PANEL_IMPROVEMENTS.md

---

**Version**: 1.0  
**Last Updated**: January 2026  
**For**: Admin Panel 2026 Edition
