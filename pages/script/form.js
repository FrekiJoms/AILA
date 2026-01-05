document.addEventListener('DOMContentLoaded', () => {
    // Get all the necessary elements from the DOM
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMainContainer = document.getElementById('form-main-container');
    const successContainer = document.getElementById('success-container');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // Your Google Apps Script URL
    const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbxyBAMvcSxdV_Gbc8JIKB1yJRPw0ocQKpczfZ8KLp4Gln2LgWTTbFar3ugjODGrqjiE/exec";

    // Handle the form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const payload = Object.fromEntries(formData.entries());
            payload.event = 'Contact Form Submission';
            payload.timestamp = new Date().toISOString();
            
            fetch(SCRIPT_API_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // --- START: SUCCESS SCREEN LOGIC ---
                    // Hide the main form container
                    formMainContainer.style.display = 'none';
                    // Show the new success screen
                    successContainer.style.display = 'block';
                    // --- END: SUCCESS SCREEN LOGIC ---
                } else {
                    throw new Error(data.message || 'The script reported an unknown error.');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('There was an error sending your message. Please check the console for details and try again.');
                
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
        });
    }

    // --- START: NEW "SUBMIT ANOTHER" BUTTON LOGIC ---
    // Handle the click on the "Submit Another Message" button
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            // Hide the success screen
            successContainer.style.display = 'none';
            // Show the form container again
            formMainContainer.style.display = 'block';
            
            // Reset the form fields for a new message
            contactForm.reset();
            
            // Re-enable the submit button and reset its text
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        });
    }
    // --- END: NEW "SUBMIT ANOTHER" BUTTON LOGIC ---
});
