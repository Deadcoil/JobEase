// public/js/admin/auth.js - Admin authentication utilities

class AdminAuth {
    constructor() {
        this.checkAuthOnLoad();
    }

    checkAuthOnLoad() {
        // Check if we're on a protected admin page (not login page)
        const isLoginPage = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
        
        if (!isLoginPage && !this.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = '/admin';
        }
    }

    isAuthenticated() {
        // Check session storage for authentication status
        return sessionStorage.getItem('admin_authenticated') === 'true';
    }

    setAuthenticated(status) {
        if (status) {
            sessionStorage.setItem('admin_authenticated', 'true');
        } else {
            sessionStorage.removeItem('admin_authenticated');
        }
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                this.setAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: result.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    logout() {
        this.setAuthenticated(false);
        
        // Make logout request to server to clear session
        fetch('/api/admin/logout', { method: 'POST' })
            .catch(error => console.error('Logout error:', error));
        
        // Redirect to login page
        window.location.href = '/admin';
    }

    // Utility method for making authenticated API requests
    async authenticatedRequest(url, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (response.status === 401) {
                // Session expired, redirect to login
                this.setAuthenticated(false);
                window.location.href = '/admin';
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Authenticated request failed:', error);
            throw error;
        }
    }
}

// Initialize admin auth
const adminAuth = new AdminAuth();

// Handle login form if on login page
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('login-btn');
        const formError = document.getElementById('form-error');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            clearErrors(loginForm);
            hideElement(formError);

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showError('Please enter both username and password', formError);
                return;
            }

            // Disable login button
            loginBtn.disabled = true;
            loginBtn.innerHTML = `
                <svg class="animate-spin w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
            `;

            try {
                const result = await adminAuth.login(username, password);

                if (result.success) {
                    // Redirect to dashboard
                    window.location.href = '/admin/dashboard';
                } else {
                    showError(result.error, formError);
                }
            } catch (error) {
                showError('Login failed. Please try again.', formError);
            } finally {
                // Re-enable login button
                loginBtn.disabled = false;
                loginBtn.innerHTML = `
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Sign In
                `;
            }
        });
    }

    // Handle logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                adminAuth.logout();
            }
        });
    }
});