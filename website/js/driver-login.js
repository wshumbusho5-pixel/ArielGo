// Driver Login JavaScript
const API_BASE = window.location.origin;

// Get DOM elements
const loginForm = document.getElementById('driverLoginForm');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
}

// Hide all messages
function hideMessages() {
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validate input
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }

    // Disable button and show loading state
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    hideMessages();

    try {
        // Make login request
        const response = await fetch(`${API_BASE}/api/driver/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Login successful
            showSuccess(`Welcome, ${data.driver.full_name}! Redirecting...`);

            // Redirect to driver dashboard after short delay
            setTimeout(() => {
                window.location.href = '/driver.html';
            }, 1000);
        } else {
            // Login failed
            showError(data.error || 'Login failed. Please check your credentials.');
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
            passwordInput.value = ''; // Clear password
            passwordInput.focus();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});

// Auto-focus username field on load
window.addEventListener('DOMContentLoaded', () => {
    usernameInput.focus();
});

// Check if already logged in
async function checkExistingSession() {
    try {
        const response = await fetch(`${API_BASE}/api/driver/session`);
        const data = await response.json();

        if (data.authenticated) {
            // Already logged in, redirect to dashboard
            window.location.href = '/driver.html';
        }
    } catch (error) {
        // Ignore errors, user is not logged in
        console.log('No existing session');
    }
}

// Check session on page load
checkExistingSession();
