// --- Supabase Client Initialization ---
const SUPABASE_URL = 'https://woqlvcgryahmcejdlcqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcWx2Y2dyeWFobWNlamRsY3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU2NTE1ODUsImV4cCI6MjAxMTIyNzU4NX0.s17pBCeS3Qca9C4l1mCV2O91Z2-q6a-KSM_p3B3d5lI';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// --- Get DOM Elements ---
const resetPinForm = document.getElementById('resetPinForm');
const updatePinBtn = document.getElementById('updatePinBtn');
const pinContainer = document.getElementById('pinContainer');
const pinConfirmContainer = document.getElementById('pinConfirmContainer');
const alertBox = document.getElementById('customAlert');
const authModalBody = document.querySelector('.auth-modal-body');

// --- Helper Functions ---
function setupPinInputs(container) {
    const inputs = container.querySelectorAll('.pin-digit');
    inputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

function showAlert(message, isSuccess = false) {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
    alertBox.classList.toggle('success', isSuccess);
    alertBox.classList.toggle('error', !isSuccess); // Use an error class for consistency
}

function setButtonLoading(isLoading) {
    updatePinBtn.classList.toggle('loading', isLoading);
    updatePinBtn.disabled = isLoading;
}

// --- Main Authentication Logic ---

// This is the crucial part. It listens for Supabase auth events.
_supabase.auth.onAuthStateChange(async (event, session) => {
    // The 'PASSWORD_RECOVERY' event fires after the user clicks the link in the email.
    // This means Supabase has verified the token from the URL and a session is active.
    if (event === "PASSWORD_RECOVERY") {
        
        // Now that the session is verified, we can safely attach the form submission listener.
        resetPinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setButtonLoading(true);
            alertBox.classList.add('hidden');

            const newPin = Array.from(pinContainer.querySelectorAll('.pin-digit')).map(input => input.value).join('');
            const confirmPin = Array.from(pinConfirmContainer.querySelectorAll('.pin-digit')).map(input => input.value).join('');

            // --- Input Validation ---
            if (newPin.length !== 6 || confirmPin.length !== 6) {
                showAlert('Please enter a complete 6-digit PIN and confirmation.');
                setButtonLoading(false);
                return;
            }

            if (newPin !== confirmPin) {
                showAlert('The PINs do not match. Please try again.');
                setButtonLoading(false);
                return;
            }

            // --- Update User PIN in Supabase ---
            // Because we are inside this event listener, Supabase knows who the user is.
            const { data, error } = await _supabase.auth.updateUser({
                password: newPin
            });

            if (error) {
                showAlert(`Error: ${error.message || 'An unknown error occurred.'}`);
            } else {
                showAlert('Your PIN has been successfully updated! Redirecting to login...', true);
                // Hide the form to prevent re-submission
                resetPinForm.style.display = 'none';
                // Redirect after a short delay
                setTimeout(() => {
                    // Redirect to the main page (index.html)
                    window.location.href = window.location.origin; 
                }, 3000);
            }

            setButtonLoading(false);
        });
    }
});


// --- Initial Page Setup ---
setupPinInputs(pinContainer);
setupPinInputs(pinConfirmContainer);