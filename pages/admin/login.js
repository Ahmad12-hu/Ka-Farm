import { Auth } from '/js/auth.js';

const form = document.getElementById('login-form');
const errorDiv = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    errorDiv.classList.add('hidden');

    try {
        const success = await Auth.login(email, password);

        if (!success) {
            return;
        }

        const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kafarm.sn';

        if (email !== ADMIN_EMAIL) {
            errorDiv.textContent = 'Accès refusé. Vous n\'êtes pas administrateur.';
            errorDiv.classList.remove('hidden');
            Auth.logout();
            return;
        }

        window.location.href = '/pages/admin/dashboard.html';

    } catch (error) {
        errorDiv.textContent = 'Erreur de connexion. Veuillez réessayer.';
        errorDiv.classList.remove('hidden');
        console.error('Login error:', error);
    }
});