const SUPABASE_URL = "https://woqlvcgryahmcejdlcqz.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcWx2Y2dyeWFobWNlamRsY3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDg5NTMsImV4cCI6MjA4MDMyNDk1M30.PXL0hJ-8Hv7BP21Fly3tHXonJoxfVL0GNCY7oWXDKRA";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- START: Security Check ---
const DEVELOPER_EMAILS = ["narvasajoshua61@gmail.com", "levercrafter@gmail.com"];

let allUsers = []; // Store all users for filtering/sorting
let currentSort = { field: 'created', direction: 'desc' };
let selectedUserEmail = null;

_supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN") {
        if (!session || !DEVELOPER_EMAILS.includes(session.user.email)) {
            window.location.replace("../index.html");
        } else {
            await loadAllUsers();
            startGlobalTrialTimer();
        }
    } else if (event === "SIGNED_OUT") {
        window.location.replace("../index.html");
    }
});
// --- END: Security Check ---

async function loadAllUsers() {
    const loadingMessage = document.getElementById('loading-message');
    const userTableContainer = document.getElementById('user-table-container');

    try {
        const { data, error } = await _supabase.functions.invoke('get-all-users');

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        allUsers = data.users.map(user => {
            const trialDays = user.user_metadata.custom_trial_days !== undefined ? user.user_metadata.custom_trial_days : 30;
            const trialEndDate = new Date(new Date(user.created_at).setDate(new Date(user.created_at).getDate() + trialDays));
            const isExpired = new Date() > trialEndDate;
            
            return {
                ...user,
                trialDays,
                trialEndDate,
                isExpired,
                displayName: user.user_metadata.full_name || 'N/A'
            };
        });

        renderTable();
        loadingMessage.classList.add('hidden');
        userTableContainer.classList.remove('hidden');
        attachEventListeners();

    } catch (error) {
        loadingMessage.textContent = `Error loading users: ${error.message}`;
        console.error(error);
    }
}

function renderTable() {
    const userTableBody = document.querySelector('#user-table tbody');
    userTableBody.innerHTML = '';

    // Filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) || 
                              user.displayName.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || 
                              (statusFilter === 'active' && !user.isExpired) || 
                              (statusFilter === 'expired' && user.isExpired);
        return matchesSearch && matchesStatus;
    });

    // Sort
    filteredUsers.sort((a, b) => {
        let valA, valB;
        switch(currentSort.field) {
            case 'email': valA = a.email; valB = b.email; break;
            case 'name': valA = a.displayName; valB = b.displayName; break;
            case 'created': valA = new Date(a.created_at); valB = new Date(b.created_at); break;
            case 'status': valA = a.isExpired; valB = b.isExpired; break;
            default: valA = new Date(a.created_at); valB = new Date(b.created_at);
        }

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.displayName}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="${user.isExpired ? 'expired' : 'active'}">
                ${user.isExpired ? 'Expired' : 'Active'} (${user.trialDays} days)
            </td>
            <td>
                <button class="action-btn options-btn" data-email="${user.email}">Options</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });

    // Re-attach listeners for the new buttons
    document.querySelectorAll('.options-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedUserEmail = e.target.dataset.email;
            openOptionsModal(selectedUserEmail);
        });
    });
}

function attachEventListeners() {
    // Search & Filter
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('statusFilter').addEventListener('change', renderTable);

    // Sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            renderTable();
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.modal).classList.add('hidden');
        });
    });

    // Options Modal Buttons
    document.getElementById('optSetTrial').addEventListener('click', () => {
        document.getElementById('optionsModal').classList.add('hidden');
        document.getElementById('modalUserEmail').textContent = selectedUserEmail;
        document.getElementById('trialModal').classList.remove('hidden');
    });

    document.getElementById('optLoginAs').addEventListener('click', async () => {
        if (confirm(`Login as ${selectedUserEmail}?`)) {
            await adminLoginAsUser(selectedUserEmail);
        }
    });

    document.getElementById('optBanUser').addEventListener('click', () => {
        alert('Ban functionality coming soon!');
    });

    document.getElementById('optResetPwd').addEventListener('click', async () => {
        if (confirm(`Send password reset email to ${selectedUserEmail}?`)) {
            const { error } = await _supabase.auth.resetPasswordForEmail(selectedUserEmail);
            if (error) alert('Error: ' + error.message);
            else alert('Password reset email sent.');
        }
    });

    document.getElementById('optSendEmail').addEventListener('click', () => {
        window.location.href = `mailto:${selectedUserEmail}`;
    });

    // Set Trial Form
    document.getElementById('setTrialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const days = parseInt(document.getElementById('trialDaysInput').value, 10);
        if (!isNaN(days)) {
            await adminSetTrialDays(selectedUserEmail, days);
            document.getElementById('trialModal').classList.add('hidden');
            loadAllUsers(); // Refresh data
        }
    });
}

function openOptionsModal(email) {
    document.getElementById('optionsUserEmail').textContent = email;
    document.getElementById('optionsModal').classList.remove('hidden');
}

function startGlobalTrialTimer() {
    const timerEl = document.getElementById('trial-timer');
    
    setInterval(() => {
        // Just showing a simple running clock or aggregate stat for now
        // as "remaining time left for all users" is ambiguous.
        // Let's show the count of active users vs total.
        if (allUsers.length > 0) {
            const activeCount = allUsers.filter(u => !u.isExpired).length;
            timerEl.textContent = `${activeCount} Active / ${allUsers.length} Total Users`;
        }
    }, 1000);
}

// --- Admin Actions ---

async function adminSetTrialDays(targetEmail, days) {
  try {
    const { data, error } = await _supabase.functions.invoke("set-trial-days", {
      body: { targetEmail, days },
    });
    if (error) throw error;
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      alert(`Success: ${data.message}`);
    }
  } catch (error) {
    console.error("Invocation failed:", error);
    alert("Failed to update trial days.");
  }
}

async function adminLoginAsUser(targetEmail) {
  try {
    const { data, error } = await _supabase.functions.invoke("impersonate-user", {
        body: { targetEmail },
      }
    );
    if (error) throw error;
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      window.open(data.magicLink, '_blank');
    }
  } catch (error) {
    console.error("Invocation failed:", error);
    alert("Failed to generate login link.");
  }
}

// Initial check
(async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session || !DEVELOPER_EMAILS.includes(session.user.email)) {
        window.location.replace("../index.html");
    } else {
        await loadAllUsers();
        startGlobalTrialTimer();
    }
})();
