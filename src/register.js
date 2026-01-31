import { authService } from './services/authService.js';

const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');

// Redirect if already logged in
if (authService.getCurrentUser()) {
    window.location.href = '/';
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();

    if (password !== confirmPassword) {
        authError.textContent = "Passwords do not match";
        return;
    }

    try {
        await authService.register(username, email, password);
        window.location.href = '/index.html';
    } catch (err) {
        authError.textContent = err.message;
    }
});
