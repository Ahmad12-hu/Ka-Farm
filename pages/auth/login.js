import { Auth } from '/js/auth.js';
import { ErrorHandler } from '/js/modules/error-handler.js';
window.ErrorHandler = ErrorHandler;

const form = document.getElementById('login-form');
const submitBtn = document.getElementById('login-submit-btn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
    const errorMsg = document.getElementById('login-error-message');
    if (errorMsg) {
      errorMsg.classList.add('hidden');
      errorMsg.classList.remove('visible');
    }

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const rem = document.getElementById('login-remember').checked;

    let hasError = false;
    if (!email || !email.includes('@')) {
      const emailError = document.getElementById('email-error');
      if (emailError) emailError.classList.add('visible');
      hasError = true;
    }
    if (!pass) {
      const passwordError = document.getElementById('password-error');
      if (passwordError) passwordError.classList.add('visible');
      hasError = true;
    }
    if (hasError) return;

    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    try {
      await Auth.login(email, pass, rem);
    } catch (error) {
      if (errorMsg) {
        errorMsg.textContent = 'Email ou mot de passe incorrect';
        errorMsg.classList.remove('hidden');
        errorMsg.classList.add('visible');
      }
      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
      }
    }
  });
}

lucide.createIcons();