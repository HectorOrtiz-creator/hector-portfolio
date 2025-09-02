/**
 * Authentication System
 * Handles user registration, login, logout, and session management
 * 
 * @author Hector Ortiz
 * @version 1.0.0
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.users = this.loadUsers();
        this.sessions = this.loadSessions();
        
        // Check if user is already logged in
        this.checkExistingSession();
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Load users from localStorage
     */
    loadUsers() {
        const stored = localStorage.getItem('portfolio_users');
        return stored ? JSON.parse(stored) : this.getDefaultUsers();
    }

    /**
     * Load sessions from localStorage
     */
    loadSessions() {
        const stored = localStorage.getItem('portfolio_sessions');
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Get default users for demo purposes
     */
    getDefaultUsers() {
        return [
            {
                id: 'demo-user-1',
                username: 'demo',
                email: 'demo@example.com',
                password: this.hashPassword('demo123'),
                fullName: 'Demo User',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                profile: {
                    avatar: null,
                    bio: 'This is a demo account for testing purposes.',
                    skills: ['JavaScript', 'HTML', 'CSS'],
                    location: 'San Francisco, CA'
                }
            }
        ];
    }

    /**
     * Hash password (simple implementation - use bcrypt in production)
     */
    hashPassword(password) {
        // Simple hash for demo - in production use bcrypt or similar
        return btoa(password + 'salt');
    }

    /**
     * Verify password
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate session token
     */
    generateSessionToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save users to localStorage
     */
    saveUsers() {
        localStorage.setItem('portfolio_users', JSON.stringify(this.users));
    }

    /**
     * Save sessions to localStorage
     */
    saveSessions() {
        localStorage.setItem('portfolio_sessions', JSON.stringify(this.sessions));
    }

    /**
     * Check if email already exists
     */
    emailExists(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Check if username already exists
     */
    usernameExists(username) {
        return this.users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    /**
     * User registration
     */
    async register(userData) {
        try {
            // Validation
            if (!userData.fullName || !userData.email || !userData.username || !userData.password || !userData.confirmPassword) {
                throw new Error('All fields are required');
            }

            if (!this.validateEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            if (this.emailExists(userData.email)) {
                throw new Error('Email already registered');
            }

            if (this.usernameExists(userData.username)) {
                throw new Error('Username already taken');
            }

            if (userData.password !== userData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (!this.validatePassword(userData.password)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Create new user
            const newUser = {
                id: this.generateId(),
                username: userData.username.toLowerCase(),
                email: userData.email.toLowerCase(),
                password: this.hashPassword(userData.password),
                fullName: userData.fullName,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                profile: {
                    avatar: null,
                    bio: '',
                    skills: [],
                    location: ''
                }
            };

            // Add user to system
            this.users.push(newUser);
            this.saveUsers();

            // Auto-login after registration
            await this.login(userData.email, userData.password);

            return {
                success: true,
                message: 'Account created successfully! Welcome aboard!',
                user: this.getPublicUserData(newUser)
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * User login
     */
    async login(email, password) {
        try {
            // Find user by email
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Invalid email or password');
            }

            // Create session
            const sessionToken = this.generateSessionToken();
            const session = {
                token: sessionToken,
                userId: user.id,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            // Store session
            this.sessions[sessionToken] = session;
            this.saveSessions();

            // Update user last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            // Set current user
            this.currentUser = user;
            this.isAuthenticated = true;

            // Store session token
            localStorage.setItem('portfolio_session_token', sessionToken);

            return {
                success: true,
                message: `Welcome back, ${user.fullName}!`,
                user: this.getPublicUserData(user),
                sessionToken
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * User logout
     */
    logout() {
        const sessionToken = localStorage.getItem('portfolio_session_token');
        
        if (sessionToken && this.sessions[sessionToken]) {
            delete this.sessions[sessionToken];
            this.saveSessions();
        }

        localStorage.removeItem('portfolio_session_token');
        this.currentUser = null;
        this.isAuthenticated = false;

        // Update UI
        this.updateAuthUI();
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Check existing session
     */
    checkExistingSession() {
        const sessionToken = localStorage.getItem('portfolio_session_token');
        
        if (sessionToken && this.sessions[sessionToken]) {
            const session = this.sessions[sessionToken];
            
            // Check if session is expired
            if (new Date(session.expiresAt) > new Date()) {
                const user = this.users.find(u => u.id === session.userId);
                if (user) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    this.updateAuthUI();
                    return true;
                }
            } else {
                // Remove expired session
                delete this.sessions[sessionToken];
                this.saveSessions();
                localStorage.removeItem('portfolio_session_token');
            }
        }
        
        return false;
    }

    /**
     * Get public user data (without sensitive information)
     */
    getPublicUserData(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            profile: user.profile
        };
    }

    /**
     * Update user profile
     */
    updateProfile(profileData) {
        if (!this.isAuthenticated || !this.currentUser) {
            throw new Error('User not authenticated');
        }

        // Update profile
        this.currentUser.profile = { ...this.currentUser.profile, ...profileData };
        this.saveUsers();

        return {
            success: true,
            message: 'Profile updated successfully',
            profile: this.currentUser.profile
        };
    }

    /**
     * Change password
     */
    changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated || !this.currentUser) {
            throw new Error('User not authenticated');
        }

        // Verify current password
        if (!this.verifyPassword(currentPassword, this.currentUser.password)) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        if (!this.validatePassword(newPassword)) {
            throw new Error('New password must be at least 8 characters with uppercase, lowercase, and number');
        }

        // Update password
        this.currentUser.password = this.hashPassword(newPassword);
        this.saveUsers();

        return {
            success: true,
            message: 'Password changed successfully'
        };
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser ? this.getPublicUserData(this.currentUser) : null;
    }

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Listen for storage changes (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolio_session_token') {
                this.checkExistingSession();
            }
        });

        // Update UI on page load
        this.updateAuthUI();
    }

    /**
     * Update authentication UI
     */
    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.isAuthenticated && this.currentUser) {
            // Show user menu
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            
            // Update user info
            this.updateUserInfo();
        } else {
            // Show auth buttons
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    /**
     * Update user information display
     */
    updateUserInfo() {
        const userNameElement = document.querySelector('.user-name');
        const userAvatarElement = document.querySelector('.user-avatar');
        
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.fullName;
        }
        
        if (userAvatarElement && this.currentUser) {
            userAvatarElement.textContent = this.currentUser.fullName.charAt(0).toUpperCase();
        }
    }

    /**
     * Get user statistics
     */
    getUserStats() {
        if (!this.isAuthenticated || !this.currentUser) {
            return null;
        }

        return {
            totalUsers: this.users.length,
            daysSinceRegistration: Math.floor((new Date() - new Date(this.currentUser.createdAt)) / (1000 * 60 * 60 * 24)),
            lastLoginDays: this.currentUser.lastLogin ? 
                Math.floor((new Date() - new Date(this.currentUser.lastLogin)) / (1000 * 60 * 60 * 24)) : null
        };
    }

    /**
     * Reset demo data
     */
    resetDemoData() {
        localStorage.removeItem('portfolio_users');
        localStorage.removeItem('portfolio_sessions');
        localStorage.removeItem('portfolio_session_token');
        
        this.users = this.getDefaultUsers();
        this.sessions = {};
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.saveUsers();
        this.saveSessions();
        this.updateAuthUI();
        
        return {
            success: true,
            message: 'Demo data reset successfully'
        };
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
} else {
    window.authSystem = authSystem;
}

console.log('✅ Authentication System loaded successfully!');
console.log('🔐 Demo user: demo@example.com / demo123');
console.log('📝 Use authSystem.register() and authSystem.login() methods');
