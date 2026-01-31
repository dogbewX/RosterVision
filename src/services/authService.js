import config from '../config.js';

const USERS_KEY = 'fd_users';
const SESSION_KEY = 'fd_session';
const API_URL = `${config.getApiUrl()}/auth`;

export const authService = {
    async register(username, email, password) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');

            // Auto-login after register
            return this.login(username, password);
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            const sessionUser = data.user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
            return sessionUser;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser() {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }
};
