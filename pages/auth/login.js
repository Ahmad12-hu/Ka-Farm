import { Auth } from '/js/auth.js';
import { ErrorHandler } from '/js/modules/error-handler.js';
import { validateLogin } from '/js/modules/validators.js';
window.ErrorHandler = ErrorHandler;

const form = document.getElementById('login-form');
const submitBtn = document.getElementById('login-submit-btn');

function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId.replace('login-', '').replace('password', 'password').replace('email', 'email') + '-error');
  if (!input) return;
  const errorPara = input.closest('div.space-y-1')?.querySelector('.error-message') || errorEl;
  if (errorPara) {
    errorPara.textContent = message;
    errorPara.classList.add('visible');
  }
  input.classList.add('input-error');
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('visible');
    el.textContent = el.id === 'email-error' ? 'Veuillez entrer une adresse email valide' : 'Le mot de passe est requis';
  });
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearErrors();

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const rem = document.getElementById('login-remember').checked;

    const validation = validateLogin({ email, password: pass, remember: rem });
    if (!validation.success) {
      for (const err of validation.errors) {
        if (err.field === 'email') showFieldError('login-email', err.message);
        if (err.field === 'password') showFieldError('login-password', err.message);
      }
      return;
    }

    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    try {
      await Auth.login(validation.data.email, validation.data.password, validation.data.remember);
    } catch (error) {
      const errorMsg = document.getElementById('login-error-message');
      if (errorMsg) {
        errorMsg.textContent = 'Email ou mot de passe incorrect';
        errorMsg.classList.remove('hidden');
        errorMsg.classList.add('visible');
      }
    } finally {
      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
      }
    }
  });
}

lucide.createIcons();
