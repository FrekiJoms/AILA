// ========== Supabase Configuration ========== //
const SUPABASE_URL = "https://woqlvcgryahmcejdlcqz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcWx2Y2dyeWFobWNlamRsY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDg5NTMsImV4cCI6MjA4MDMyNDk1M30.PXL0hJ-8Hv7BP21Fly3tHXonJoxfVL0GNCY7oWXDKRA";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin list - will be fetched from database
let adminEmails = [];

// ========== Default Role Color Mapping ========== //
const DEFAULT_ROLE_COLORS = {
  'Moderator': '#FF6B6B',      // Red
  'Owner': '#4ECDC4',           // Teal
  'Helper': '#95E1D3',          // Light Green
  'Tester': '#F7DC6F',          // Yellow
  'Founder': '#BB8FCE',         // Purple
  'Co-Founder': '#85C1E2',      // Light Blue
  'Head Developer': '#df4b4bff',  // Light Blue (same as Co-Founder)
  'Investor': '#F8B195'         // Orange
};

// Function to get default color for a role
function getDefaultRoleColor(roleName) {
  return DEFAULT_ROLE_COLORS[roleName] || '#4D96FF'; // Default blue if not found
}

// ========== User Table & Pop-up Logic ========== //

// Fetch users from Supabase backend
// Pagination state
let currentPage = 1;
let currentSearch = '';
let totalPages = 1;
let currentSortColumn = 'uid';
let currentSortDirection = 'asc';

async function fetchUsers(page = 1, search = '') {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session || !session.access_token) {
      throw new Error('No active session. Please log in first.');
    }
    
    // Build query string
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', '30');
    if (search) {
      params.append('search', search);
    }
    
    // Make direct fetch request to the edge function with query params
    const url = `${SUPABASE_URL}/functions/v1/get-users?${params.toString()}`;
    console.log('Fetching:', url);
    console.log('Auth token present:', !!session.access_token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.error) throw new Error(data.error);
    
    // Store pagination info
    currentPage = data.page || 1;
    totalPages = data.totalPages || 1;
    
    // Map API response to table format
    return (data.users || []).map(user => {
      // Role data is already included in the response from get-users edge function
      const trialDays = user.user_metadata?.custom_trial_days || 30;
      
      // Safely parse created_at date
      let createdDate = new Date();
      if (user.created_at) {
        try {
          const parsed = new Date(user.created_at);
          if (!isNaN(parsed.getTime())) {
            createdDate = parsed;
          }
        } catch (e) {
          console.warn('Invalid date for user', user.id, user.created_at);
        }
      }
      
      // Calculate trial end date
      let trialEndDate = new Date();
      try {
        trialEndDate = new Date(createdDate.getTime() + trialDays * 24 * 60 * 60 * 1000);
        if (isNaN(trialEndDate.getTime())) {
          trialEndDate = new Date();
        }
      } catch (e) {
        console.warn('Error calculating trial end date for user', user.id);
        trialEndDate = new Date();
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || user.user_metadata?.full_name || 'N/A',
        created_at: user.created_at || new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at || null,
        role: user.role || '-',
        role_color: user.role_color || '#4D96FF',
        trial_end: trialEndDate.toISOString(),
        trial_days: trialDays,
        avatar_url: user.avatar_url,
        user_metadata: user.user_metadata || {}
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Failed to load users: ' + error.message);
    return [];
  }
}

// Render the user table
function renderUserTable(users) {
    const table = document.getElementById('userTableBody');
    const totalCount = document.getElementById('totalUsersCount');
    table.innerHTML = '';
    totalCount.textContent = users.length > 0 ? `${users.length} of ${totalPages > 1 ? (currentPage - 1) * 30 + users.length + (totalPages - currentPage) * 30 : users.length}` : '0';
    
    // Sort users
    const sortedUsers = sortUsers(users);
    
    // Update pagination UI
    document.getElementById('currentPageNum').textContent = currentPage;
    document.getElementById('totalPageNum').textContent = totalPages;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    
    // Update sort indicator in headers
    updateSortIndicators();
    
    sortedUsers.forEach((user, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.userId = user.id;
        tr.dataset.userEmail = user.email;
        const avatar = user.avatar_url || user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email || 'User');
        const createdDate = formatDate(user.created_at);
        const lastSignInDate = formatDate(user.last_sign_in_at);
        
        tr.innerHTML = `
            <td class="avatar-col" data-column="avatar"><img src="${avatar}" alt="avatar" class="user-avatar"></td>
            <td class="uid-text" data-column="uid">${user.id}</td>
            <td data-column="name">${user.name || '-'}</td>
            <td data-column="email">${user.email}</td>
            <td data-column="role"><span class="role-badge" ${user.role ? `style="color: ${user.role_color || '#4D96FF'}"` : ''}>${user.role || '-'}</span></td>
            <td data-column="phone">-</td>
            <td data-column="providers">Google</td>
            <td data-column="provider_type">Social</td>
            <td data-column="trial"><span class="trial-countdown" data-trial-end="${user.trial_end}"></span></td>
            <td data-column="created_at" style="display:none;">${createdDate}</td>
            <td data-column="last_signin" style="display:none;">${lastSignInDate}</td>
        `;
        tr.addEventListener('click', (e) => {
            onUserRowClick(e, user, idx);
        });
        table.appendChild(tr);
    });
}

// Format date utility
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString();
}

// Sort users based on current sort column and direction
function sortUsers(users) {
  const sorted = [...users];
  
  sorted.sort((a, b) => {
    let aVal = a[currentSortColumn];
    let bVal = b[currentSortColumn];
    
    // Handle nested properties like user_metadata
    if (currentSortColumn === 'name' && !aVal) {
      aVal = a.user_metadata?.full_name || '';
    }
    if (currentSortColumn === 'name' && !bVal) {
      bVal = b.user_metadata?.full_name || '';
    }
    
    // Convert to lowercase for string comparison
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    // Handle null/undefined
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Compare
    if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// Update visual indicators for current sort
function updateSortIndicators() {
  const tableHead = document.querySelector('table thead');
  if (!tableHead) return;
  
  tableHead.querySelectorAll('th[data-column]').forEach(th => {
    const col = th.getAttribute('data-column');
    const sortIcon = th.querySelector('.sort-icon');
    
    if (col === currentSortColumn) {
      if (sortIcon) {
        sortIcon.textContent = currentSortDirection === 'asc' ? ' ▲' : ' ▼';
      }
      th.style.opacity = '40';
    } else {
      if (sortIcon) {
        sortIcon.textContent = '';
      }
      th.style.opacity = '0.6';
    }
  });
}

// Handle header click to sort
function handleHeaderClick(column) {
  if (column === 'avatar') return; // Don't sort by avatar
  
  if (currentSortColumn === column) {
    // Toggle direction if same column
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    currentSortColumn = column;
    currentSortDirection = 'asc';
  }
  
  // Reset to page 1 when sorting changes, then re-render
  currentPage = 1;
  (async () => {
    const users = await fetchUsers(currentPage, currentSearch);
    renderUserTable(users);
    
    // Re-apply column visibility preferences after sorting
    const saved = localStorage.getItem('visibleColumns');
    if (saved) {
      const visibleColumns = JSON.parse(saved);
      updateTableColumnVisibility(visibleColumns);
    }
  })();
}

// Handle row click to show pop-up
let currentPopup = null;
// Store current selected user data
let currentSelectedUser = null;

function onUserRowClick(event, user, idx) {
    currentSelectedUser = user;
    
    // Update sidebar with user data
    const avatar = user.avatar_url || user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email || 'User');
    const displayName = user.name || user.user_metadata?.full_name || user.email.split('@')[0];
    
    document.getElementById('optionsUserAvatar').src = avatar;
    document.getElementById('optionsUserName').textContent = displayName;
    document.getElementById('optionsUserEmail').textContent = user.email;
    
    // Open sidebar
    const modal = document.getElementById('optionsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    // Close any existing popup
    if (currentPopup) currentPopup.remove();
}

// Close options sidebar
function closeOptionsSidebar() {
    const modal = document.getElementById('optionsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentSelectedUser = null;
}

// Handle sidebar button clicks
function handleOptionClick(action) {
    if (!currentSelectedUser) return;
    
    switch(action) {
        case 'setRole':
            setRole(currentSelectedUser.id, currentSelectedUser.email);
            break;
        case 'setTrial':
            setTrialDate(currentSelectedUser.id);
            break;
        case 'loginAs':
            loginAsUser(currentSelectedUser.id);
            break;
        case 'banUser':
            banUser(currentSelectedUser.id);
            break;
        case 'resetPwd':
            sendRecoveryLink(currentSelectedUser.id);
            break;
        case 'sendEmail':
            sendGmail(currentSelectedUser.id);
            break;
    }
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('optionsModal');
    const sidebar = document.querySelector('.options-sidebar');
    
    if (modal && !modal.classList.contains('hidden')) {
        if (!sidebar || !sidebar.contains(e.target)) {
            // Check if click is on a table row
            if (!e.target.closest('tr')) {
                closeOptionsSidebar();
            }
        }
    }
});

// ========== Action Handlers ========== //

// Ban a user
async function banUser(userId) {
  if (!confirm('Are you sure you want to ban this user?')) return;
  
  try {
    const { data, error } = await _supabase.functions.invoke('ban-user', {
      body: { userId }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    alert('User banned successfully');
    if (currentPopup) currentPopup.remove();
    await loadUsersAndRefresh();
  } catch (error) {
    console.error('Error banning user:', error);
    alert('Failed to ban user: ' + error.message);
  }
}

// Set trial days for a user
async function setTrialDate(userId) {
  const days = prompt('Enter number of trial days:', '30');
  if (days === null) return;
  
  const daysNum = parseInt(days, 10);
  if (isNaN(daysNum) || daysNum < 0) {
    alert('Please enter a valid number');
    return;
  }
  
  try {
    // Get user email from the DOM row
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    const userEmail = row?.dataset.userEmail;
    if (!userEmail) {
      alert('User email not found');
      return;
    }
    
    const { data, error } = await _supabase.functions.invoke('set-trial-days', {
      body: { targetEmail: userEmail, days: daysNum }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    alert(`Trial days set to ${daysNum} successfully`);
    if (currentPopup) currentPopup.remove();
    await loadUsersAndRefresh();
  } catch (error) {
    console.error('Error setting trial days:', error);
    alert('Failed to set trial days: ' + error.message);
  }
}

// Set user role - Store data to apply after modal submission
let pendingRoleData = null;

async function setRole(userId, userEmail) {
  pendingRoleData = { userId, userEmail };
  
  // Close sidebar
  closeOptionsSidebar();
  
  // Open the role modal
  const modal = document.getElementById('roleModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
  
  // Focus on the role input
  setTimeout(() => {
    const roleInput = document.getElementById('roleInput');
    if (roleInput) roleInput.focus();
  }, 100);
}

// Close role modal
function closeRoleModal() {
  const modal = document.getElementById('roleModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  pendingRoleData = null;
  resetRoleForm();
}

// Delete role from modal
async function deleteRoleModal() {
  if (!pendingRoleData) {
    alert('No user selected');
    return;
  }

  if (!confirm('Are you sure you want to delete this user\'s role?')) {
    return;
  }

  // Show loading state
  const statusContainer = document.getElementById('roleStatusContainer');
  const loadingState = document.getElementById('roleLoadingState');
  const successState = document.getElementById('roleSuccessState');
  const errorState = document.getElementById('roleErrorState');
  const submitBtn = document.getElementById('roleModalSubmitBtn');
  const deleteBtn = document.getElementById('roleModalDeleteBtn');

  // Hide all states initially
  loadingState.classList.remove('hidden');
  successState.classList.add('hidden');
  errorState.classList.add('hidden');
  statusContainer.classList.remove('hidden');

  // Disable buttons
  submitBtn.disabled = true;
  deleteBtn.disabled = true;

  try {
    const { data, error } = await _supabase.functions.invoke('delete-role', {
      body: { 
        targetEmail: pendingRoleData.userEmail
      }
    });

    console.log('Delete-role response:', { data, error });

    if (error) {
      console.error('Function error:', error);
      throw error;
    }
    if (data?.error) {
      throw new Error(data.error);
    }

    // Show success state
    loadingState.classList.add('hidden');
    successState.classList.remove('hidden');
    document.getElementById('roleSuccessText').textContent = `Role deleted successfully!`;

    // Close modal and refresh after 1.5 seconds
    setTimeout(async () => {
      closeRoleModal();
      await loadUsersAndRefresh();
    }, 1500);
  } catch (error) {
    console.error('Error deleting role:', error);
    console.error('Pending role data:', pendingRoleData);

    // Show error state
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    document.getElementById('roleErrorText').textContent = `Error: ${error.message || 'Failed to delete role'}`;

    // Re-enable buttons for retry
    setTimeout(() => {
      submitBtn.disabled = false;
      deleteBtn.disabled = false;
    }, 2000);
  }
}

// Reset role form to defaults
function resetRoleForm() {
  const roleInput = document.getElementById('roleInput');
  const roleColor = document.getElementById('roleColor');
  const roleColorValue = document.getElementById('roleColorValue');
  const previewBadge = document.getElementById('rolePreviewBadge');
  const statusContainer = document.getElementById('roleStatusContainer');
  const submitBtn = document.getElementById('roleModalSubmitBtn');
  
  if (roleInput) {
    roleInput.value = '';
    roleInput.disabled = false;
  }
  if (roleColor) {
    roleColor.value = '#4D96FF';
    roleColor.disabled = false;
  }
  if (roleColorValue) roleColorValue.textContent = '#4D96FF';
  if (previewBadge) {
    previewBadge.textContent = 'Custom Role';
    previewBadge.style.color = '#4D96FF';
  }
  if (statusContainer) {
    statusContainer.classList.add('hidden');
  }
  if (submitBtn) {
    submitBtn.disabled = false;
  }
}

// Save role from modal
async function saveRoleModal() {
  if (!pendingRoleData) {
    alert('No user selected');
    return;
  }
  
  const roleInput = document.getElementById('roleInput');
  const roleColor = document.getElementById('roleColor');
  
  const role = roleInput.value.trim();
  let roleColorValue = roleColor.value;
  
  if (!role) {
    alert('Please enter a role name');
    return;
  }
  
  // Use default color if it's a known role
  if (DEFAULT_ROLE_COLORS[role]) {
    roleColorValue = DEFAULT_ROLE_COLORS[role];
  }
  
  // Show loading state
  const statusContainer = document.getElementById('roleStatusContainer');
  const loadingState = document.getElementById('roleLoadingState');
  const successState = document.getElementById('roleSuccessState');
  const errorState = document.getElementById('roleErrorState');
  const modalActions = document.getElementById('roleModalActions');
  const submitBtn = document.getElementById('roleModalSubmitBtn');
  
  // Hide all states initially
  loadingState.classList.remove('hidden');
  successState.classList.add('hidden');
  errorState.classList.add('hidden');
  statusContainer.classList.remove('hidden');
  
  // Disable form inputs and buttons
  roleInput.disabled = true;
  roleColor.disabled = true;
  submitBtn.disabled = true;
  
  // Show loading state
  loadingState.classList.remove('hidden');
  successState.classList.add('hidden');
  errorState.classList.add('hidden');
  
  try {
    const { data, error } = await _supabase.functions.invoke('set-role', {
      body: { 
        targetEmail: pendingRoleData.userEmail, 
        role: role, 
        roleColor: roleColorValue 
      }
    });
    
    console.log('Set-role response:', { data, error });
    
    if (error) {
      console.error('Function error:', error);
      throw error;
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    
    // Show success state
    loadingState.classList.add('hidden');
    successState.classList.remove('hidden');
    document.getElementById('roleSuccessText').textContent = `Role "${role}" set successfully!`;
    
    // Close modal and refresh after 1.5 seconds
    setTimeout(async () => {
      closeRoleModal();
      await loadUsersAndRefresh();
    }, 1500);
  } catch (error) {
    console.error('Error setting role:', error);
    console.error('Pending role data:', pendingRoleData);
    
    // Parse the error message for better UX
    let errorMessage = error.message || 'Failed to set role';
    if (error.message?.includes('RLS')) {
      errorMessage = 'Database permission issue. Please contact admin to run: enable-role-features.sql';
    } else if (error.message?.includes('2xx')) {
      errorMessage = 'Server error. Check Supabase function logs for details.';
    }
    
    // Show error state
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    document.getElementById('roleErrorText').textContent = `Error: ${errorMessage}`;
    
    // Re-enable form for retry
    setTimeout(() => {
      roleInput.disabled = false;
      roleColor.disabled = false;
      submitBtn.disabled = false;
    }, 2000);
  }
}

// Update role preview when input changes
document.addEventListener('DOMContentLoaded', () => {
  const roleInput = document.getElementById('roleInput');
  const roleColor = document.getElementById('roleColor');
  const roleColorValue = document.getElementById('roleColorValue');
  const previewBadge = document.getElementById('rolePreviewBadge');
  
  if (roleInput) {
    roleInput.addEventListener('input', () => {
      const roleName = roleInput.value.trim();
      
      if (previewBadge) {
        previewBadge.textContent = roleName || 'Custom Role';
      }
      
      // Check if role matches a default role and auto-set color
      const defaultColor = getDefaultRoleColor(roleName);
      if (DEFAULT_ROLE_COLORS[roleName]) {
        // Auto-set color for default role
        roleColor.value = defaultColor;
        if (roleColorValue) {
          roleColorValue.textContent = defaultColor;
        }
        if (previewBadge) {
          previewBadge.style.color = defaultColor;
        }
      }
    });
  }
  
  if (roleColor) {
    roleColor.addEventListener('change', () => {
      if (roleColorValue) {
        roleColorValue.textContent = roleColor.value;
      }
      if (previewBadge) {
        previewBadge.style.color = roleColor.value;
      }
    });
    
    // Also update on input (for real-time preview)
    roleColor.addEventListener('input', () => {
      if (roleColorValue) {
        roleColorValue.textContent = roleColor.value;
      }
      if (previewBadge) {
        previewBadge.style.color = roleColor.value;
      }
    });
  }
  
  // Close modal when clicking the X button
  const closeBtn = document.querySelector('[data-modal="roleModal"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeRoleModal);
  }
});

// Login as a user (impersonate)
async function loginAsUser(userId) {
  if (!confirm('Generate a magic login link for this user?')) return;
  
  try {
    // Get user email from the DOM row
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    const userEmail = row?.dataset.userEmail;
    if (!userEmail) {
      alert('User email not found');
      return;
    }
    
    const { data, error } = await _supabase.functions.invoke('impersonate-user', {
      body: { targetEmail: userEmail }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    if (data.magicLink) {
      window.open(data.magicLink, '_blank');
      alert('Magic link opened in a new tab');
    } else {
      throw new Error('No magic link returned');
    }
    if (currentPopup) currentPopup.remove();
  } catch (error) {
    console.error('Error generating login link:', error);
    alert('Failed to generate login link: ' + error.message);
  }
}

// Send recovery/reset password link
async function sendRecoveryLink(userId) {
  if (!confirm('Send password recovery email to this user?')) return;
  
  try {
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    const userEmail = row?.dataset.userEmail;
    if (!userEmail) throw new Error('User email not found');
    
    const { error } = await _supabase.auth.resetPasswordForEmail(userEmail);
    if (error) throw error;
    
    alert('Recovery email sent successfully');
    if (currentPopup) currentPopup.remove();
  } catch (error) {
    console.error('Error sending recovery link:', error);
    alert('Failed to send recovery link: ' + error.message);
  }
}

// Send Gmail to user
async function sendGmail(userId) {
  const row = document.querySelector(`tr[data-user-id="${userId}"]`);
  const userEmail = row?.dataset.userEmail;
  if (!userEmail) {
    alert('User email not found');
    return;
  }
  
  // Open Gmail compose with the user's email
  const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(userEmail)}`;
  window.open(gmailUrl, '_blank');
  if (currentPopup) currentPopup.remove();
}

// Helper: Get user email by ID
function getUserEmailById(userId) {
  const user = allUsers.find(u => u.id === userId);
  return user ? user.email : null;
}

// Helper: Reload users and refresh table (preserves current page)
async function loadUsersAndRefresh() {
  // Fetch users for the current page and search term
  const users = await fetchUsers(currentPage, currentSearch);
  renderUserTable(users);
  updateTrialCountdowns();
}

// Real-time trial countdown
function updateTrialCountdowns() {
    const now = new Date();
    document.querySelectorAll('.trial-countdown').forEach(span => {
        const end = new Date(span.dataset.trialEnd);
        const diff = end - now;
        if (isNaN(end.getTime())) {
            span.textContent = 'N/A';
        } else if (diff <= 0) {
            span.textContent = 'Expired';
            span.classList.add('expired');
        } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);
            span.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
            span.classList.remove('expired');
        }
    });
}
setInterval(updateTrialCountdowns, 1000);

// On page load, fetch and render users
let allUsers = [];

// Show unauthorized message
function showUnauthorizedMessage(message) {
  const main = document.querySelector('main');
  if (!main) return;
  
  main.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1.5rem;
    ">
      <div style="
        font-size: 2rem;
        font-weight: 600;
        color: #c9d1d9;
        text-align: center;
      ">
        ${message}
      </div>
      <a href="../index.html" style="
        padding: 0.7rem 1.5rem;
        background: #238636;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        transition: background 0.2s;
      " onmouseover="this.style.background='#2ea043'" onmouseout="this.style.background='#238636'">
        ← Back to App
      </a>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _supabase.auth.getSession();
  
  if (!session) {
    showUnauthorizedMessage('You must be logged in');
    return;
  }
  
  // Fetch admins from database
  let adminFetchSucceeded = false;
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'list' })
    });
    
    if (response.ok) {
      const data = await response.json();
      adminEmails = data.admins.map((admin) => admin.email);
      adminFetchSucceeded = true;
      console.log('✅ Admin list fetched successfully:', adminEmails);
    } else {
      console.error('❌ Failed to fetch admins. Response status:', response.status);
      const errorText = await response.text();
      console.error('Response body:', errorText);
    }
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
  }
  
  // If we couldn't fetch the admin list, block access
  if (!adminFetchSucceeded || adminEmails.length === 0) {
    showUnauthorizedMessage('Not enough permissions. You must be an admin to access this page.');
    return;
  }
  
  // Security check - user must be an admin
  if (!adminEmails.includes(session.user.email)) {
    showUnauthorizedMessage('Not enough permissions. You must be an admin to access this page.');
    return;
  }
  
  // Load admin profile
  loadAdminProfile(session.user);
  
  allUsers = await fetchUsers();
  console.log('Loaded users:', allUsers);
  renderUserTable(allUsers);
  updateTrialCountdowns();
  setupSearchListener();
  loadColumnPreferences();
  createSortDropdown();
  loadAdminsList();
  
  // Setup column selection button
  const columnsBtn = document.getElementById('columnsBtn');
  if (columnsBtn) {
    columnsBtn.addEventListener('click', openColumnsDropdown);
  }
});

// Setup search functionality
function setupSearchListener() {
  const searchInput = document.getElementById('searchInput');
  const searchFilterDropdown = document.getElementById('searchFilterDropdown');
  
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
  }
  
  if (searchFilterDropdown) {
    searchFilterDropdown.addEventListener('change', () => {
      // Update placeholder based on selected filter
      const selected = searchFilterDropdown.value;
      const placeholders = {
        'email': 'Search by email',
        'uid': 'Search by user ID',
        'name': 'Search by name',
        'role': 'Search by role',
        'phone': 'Search by phone'
      };
      searchInput.placeholder = placeholders[selected] || 'Search...';
      performSearch();
    });
  }
}

async function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();
  
  // Store current search term
  currentSearch = searchTerm;
  currentPage = 1; // Reset to page 1 when searching
  
  // Fetch users with search and page 1
  const users = await fetchUsers(1, searchTerm);
  renderUserTable(users);
  updateTrialCountdowns();
  updatePaginationInfo();
}

// Column visibility management
function openColumnsDropdown() {
  document.getElementById('columnsDropdown').classList.toggle('hidden');
}

function closeColumnsDropdown() {
  document.getElementById('columnsDropdown').classList.add('hidden');
}

// Sort dropdown management
function toggleSortDropdown() {
  const dropdown = document.getElementById('sortDropdown');
  if (!dropdown) createSortDropdown();
  const existing = document.getElementById('sortDropdown');
  existing?.classList.toggle('hidden');
}

function createSortDropdown() {
  // Check if already exists
  if (document.getElementById('sortDropdown')) return;
  
  const sortBtn = document.getElementById('sortBtn');
  const dropdown = document.createElement('div');
  dropdown.id = 'sortDropdown';
  dropdown.className = 'sort-dropdown hidden';
  dropdown.style.position = 'absolute';
  dropdown.style.top = sortBtn.offsetHeight + 5 + 'px';
  dropdown.style.right = '0';
  dropdown.style.background = 'var(--card-bg, #1a1a1a)';
  dropdown.style.border = '1px solid var(--border-color, #333)';
  dropdown.style.borderRadius = '8px';
  dropdown.style.padding = '8px';
  dropdown.style.minWidth = '180px';
  dropdown.style.zIndex = '100';
  dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  
  const columns = [
    { key: 'uid', label: 'User ID' },
    { key: 'name', label: 'Display Name' },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Created At' },
    { key: 'trial_end', label: 'Trial End' }
  ];
  
  columns.forEach(col => {
    const option = document.createElement('div');
    option.style.padding = '8px 12px';
    option.style.cursor = 'pointer';
    option.style.borderRadius = '4px';
    option.style.fontSize = '14px';
    option.textContent = col.textContent + (currentSortColumn === col.key ? (currentSortDirection === 'asc' ? ' ▲' : ' ▼') : '');
    option.onmouseover = () => option.style.background = 'var(--hover-bg, #2a2a2a)';
    option.onmouseout = () => option.style.background = 'transparent';
    option.onclick = async () => {
      if (currentSortColumn === col.key) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortColumn = col.key;
        currentSortDirection = 'asc';
      }
      updateSortLabel();
      currentPage = 1; // Reset to page 1
      const users = await fetchUsers(currentPage, currentSearch);
      renderUserTable(users);
      document.getElementById('sortDropdown').classList.add('hidden');
    };
    dropdown.appendChild(option);
  });
  
  sortBtn.parentElement.style.position = 'relative';
  sortBtn.parentElement.appendChild(dropdown);
}

function updateSortLabel() {
  const columnNames = {
    uid: 'User ID',
    name: 'Display Name',
    email: 'Email',
    created_at: 'Created At',
    trial_end: 'Trial End'
  };
  document.getElementById('sortLabel').textContent = columnNames[currentSortColumn] || 'User ID';
}

// Pagination functions
async function goToPage(pageNum) {
  const users = await fetchUsers(pageNum, currentSearch);
  renderUserTable(users);
  updateTrialCountdowns();
  updatePaginationInfo();
  // Scroll to top
  document.querySelector('.user-table-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
}

async function nextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

async function prevPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function updatePaginationInfo() {
  // Update pagination display if you add pagination UI
  console.log(`Page ${currentPage} of ${totalPages}`);
}

function saveColumnsAndClose() {
  const checkboxes = document.querySelectorAll('#columnsDropdown .column-checkbox input');
  const visibleColumns = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.column);
  
  // Save to localStorage
  localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  
  // Update table visibility
  updateTableColumnVisibility(visibleColumns);
  closeColumnsDropdown();
}

function saveColumns() {
  saveColumnsAndClose();
}

function resetColumns() {
  const defaultColumns = ['uid', 'name', 'email', 'role', 'phone', 'providers', 'provider_type', 'created_at', 'last_signin'];
  const checkboxes = document.querySelectorAll('#columnsDropdown .column-checkbox input');
  checkboxes.forEach(cb => {
    cb.checked = defaultColumns.includes(cb.dataset.column);
  });
  
  // Clear localStorage
  localStorage.removeItem('visibleColumns');
  
  // Update table visibility immediately
  updateTableColumnVisibility(defaultColumns);
}

function updateTableColumnVisibility(visibleColumns) {
  // Only affect table cells, not dropdown elements
  const table = document.getElementById('userTableBody');
  const tableHead = document.querySelector('table thead');
  if (!table) return;
  
  // Always show avatar and trial columns, hide others
  table.querySelectorAll('[data-column]').forEach(el => {
    const col = el.getAttribute('data-column');
    if (col === 'avatar' || col === 'trial') {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  
  // Hide/show headers as well
  if (tableHead) {
    tableHead.querySelectorAll('[data-column]').forEach(el => {
      const col = el.getAttribute('data-column');
      if (col === 'avatar' || col === 'trial') {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  }
  
  // Show selected columns
  visibleColumns.forEach(col => {
    table.querySelectorAll(`[data-column="${col}"]`).forEach(el => {
      el.style.display = '';
    });
    if (tableHead) {
      tableHead.querySelectorAll(`[data-column="${col}"]`).forEach(el => {
        el.style.display = '';
      });
    }
  });
}

function loadColumnPreferences() {
  const saved = localStorage.getItem('visibleColumns');
  if (saved) {
    const visibleColumns = JSON.parse(saved);
    updateTableColumnVisibility(visibleColumns);
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('#columnsDropdown .column-checkbox input');
    checkboxes.forEach(cb => {
      cb.checked = visibleColumns.includes(cb.dataset.column);
    });
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('columnsDropdown');
  const columnsWrapper = document.querySelector('.columns-dropdown-wrapper');
  const sortDropdown = document.getElementById('sortDropdown');
  const sortBtn = document.getElementById('sortBtn');
  
  if (dropdown && columnsWrapper && !columnsWrapper.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
  
  if (sortDropdown && sortBtn && !sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
    sortDropdown.classList.add('hidden');
  }
});

// ========== Admin Profile Loading ========== //
async function loadAdminProfile(user) {
  try {
    if (user) {
      // Set admin name
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
      document.getElementById('adminName').textContent = displayName;
      
      // Set admin avatar if available
      if (user.user_metadata?.avatar_url) {
        document.getElementById('adminAvatar').src = user.user_metadata.avatar_url;
      } else {
        // Create a simple avatar with initials
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Create avatar background color based on name
        const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
        const colorIndex = displayName.length % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(0, 0, 40, 40);
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 20, 20);
        
        document.getElementById('adminAvatar').src = canvas.toDataURL();
      }
    }
  } catch (error) {
    console.error('Error loading admin profile:', error);
  }
}

// ========== Admin Management ========== //

async function loadAdminsList() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'list' })
    });

    if (response.ok) {
      const data = await response.json();
      renderAdminsList(data.admins, session.user.email);
    }
  } catch (error) {
    console.error('Error loading admins:', error);
  }
}

function renderAdminsList(admins, currentUserEmail) {
  const adminsList = document.getElementById('adminsList');
  if (!adminsList) return;

  adminsList.innerHTML = '';

  if (admins.length === 0) {
    adminsList.innerHTML = '<p style="color: #8b949e; font-size: 0.9rem;">No admins found</p>';
    return;
  }

  admins.forEach(admin => {
    const adminItem = document.createElement('div');
    adminItem.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem;
      background: #161b22;
      border-radius: 6px;
      border: 1px solid #30363d;
    `;

    const isCurrentUser = admin.email === currentUserEmail;

    adminItem.innerHTML = `
      <div>
        <div style="font-weight: 500; color: #c9d1d9;">${admin.email}</div>
        <div style="font-size: 0.75rem; color: #8b949e; margin-top: 0.2rem;">
          Added: ${new Date(admin.created_at).toLocaleDateString()}
          ${isCurrentUser ? '<span style="color: #238636; margin-left: 0.5rem;">(You)</span>' : ''}
        </div>
      </div>
      ${!isCurrentUser ? `
        <button 
          onclick="removeAdmin('${admin.email}')"
          style="
            background: #da3633;
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 500;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#f85149'"
          onmouseout="this.style.background='#da3633'"
        >
          Remove
        </button>
      ` : ''}
    `;

    adminsList.appendChild(adminItem);
  });
}

function openAdminSettings() {
  const modal = document.getElementById('adminSettingsModal');
  if (modal) {
    modal.classList.remove('hidden');
    loadAdminsList();
  }
}

async function addAdmin() {
  const emailInput = document.getElementById('newAdminEmail');
  if (!emailInput) return;

  const email = emailInput.value.trim();

  if (!email) {
    alert('Please enter an email address');
    return;
  }

  if (!email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please refresh the page.');
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'add', email: email.toLowerCase() })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Admin added: ${email}`);
      emailInput.value = '';
      loadAdminsList();
      // Update adminEmails array
      if (!adminEmails.includes(email.toLowerCase())) {
        adminEmails.push(email.toLowerCase());
      }
    } else {
      alert(`Error: ${data.error || 'Failed to add admin'}`);
    }
  } catch (error) {
    alert(`Error adding admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
  }
}

async function removeAdmin(email) {
  if (
    !confirm(`Are you sure you want to remove ${email} as an admin?\n\nThis action cannot be undone.`)
  ) {
    return;
  }

  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please refresh the page.');
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'remove', email: email })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Admin removed: ${email}`);
      loadAdminsList();
      // Update adminEmails array
      adminEmails = adminEmails.filter(e => e !== email);
    } else {
      alert(`Error: ${data.error || 'Failed to remove admin'}`);
    }
  } catch (error) {
    alert(`Error removing admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
  }
}

// ========== Modal Management ========== //
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('.modal-close-btn');
  if (closeBtn) {
    const modalId = closeBtn.dataset.modal;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }
});

// ========== End User Table & Pop-up Logic ========== //
