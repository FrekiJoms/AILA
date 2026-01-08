# Default Role Colors Reference

This document lists all default roles and their automatically assigned colors in the AILA Admin Dashboard.

## Default Roles & Colors

| Role | Hex Color | Color Name |
|------|-----------|-----------|
| **Moderator** | `#FF6B6B` | Red |
| **Owner** | `#4ECDC4` | Teal |
| **Helper** | `#95E1D3` | Light Green |
| **Tester** | `#F7DC6F` | Yellow |
| **Founder** | `#BB8FCE` | Purple |
| **Co-Founder** | `#85C1E2` | Light Blue |
| **Head Developer** | `#85C1E2` | Light Blue |
| **Investor** | `#F8B195` | Orange |

## How It Works

1. **Auto-Detection**: When you type a role name that matches one of the default roles (exact case-sensitive match), the color picker automatically updates to show the default color.

2. **Manual Override**: You can still manually change the color if desired - the color picker is always available for custom colors.

3. **Automatic Assignment**: When saving a role that matches a default role, the system automatically uses the default color even if you haven't manually selected it.

4. **Custom Roles**: Any role name that doesn't match the defaults will use a light blue color (`#4D96FF`) by default, but you can customize it.

## Examples

- Type "Moderator" → Color automatically becomes `#FF6B6B` (Red)
- Type "Custom Role" → Color stays at your selection or defaults to `#4D96FF`
- Type "Owner" → Color automatically becomes `#4ECDC4` (Teal)

## Adding New Default Roles

To add more default roles, edit the `DEFAULT_ROLE_COLORS` object in `admin/script.js`:

```javascript
const DEFAULT_ROLE_COLORS = {
  'RoleName': '#HexColorCode',
  'Moderator': '#FF6B6B',
  // ... more roles
};
```

Then the auto-detection and auto-assignment will work for the new role.
