import { authService } from './services/authService.js';

const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');

if (authService.getCurrentUser()) {
    window.location.href = '/index.html';
}

console.log("Login script loaded");

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    console.log("Attempting login for:", username, "Password length:", password.length);

    try {
        const user = await authService.login(username, password);
        console.log("Login successful, user:", user);
        window.location.href = '/index.html';
    } catch (err) {
        console.error("Login failed:", err);
        authError.textContent = err.message;
    }
});
