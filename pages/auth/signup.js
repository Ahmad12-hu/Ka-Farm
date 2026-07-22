import { Auth } from '/js/auth.js';
import { validateSignup } from '/js/modules/validators.js';

function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const errorPara = input.closest('div.space-y-1')?.querySelector('.error-message');
  if (errorPara) {
    errorPara.textContent = message;
    errorPara.classList.add('visible');
  }
  input.classList.add('input-error');
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  clearErrors();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const role = document.getElementById('signup-role').value;
  const enterpriseName = document.getElementById('signup-enterprise-name')?.value?.trim() || '';
  const pass = document.getElementById('signup-password').value;
  const confirmPass = document.getElementById('signup-confirm-password')?.value || '';

  const validation = validateSignup({ name, email, role, enterpriseName, password: pass, confirmPassword: confirmPass });
  if (!validation.success) {
    for (const err of validation.errors) {
      if (err.field === 'name') showFieldError('signup-name', err.message);
      if (err.field === 'email') showFieldError('signup-email', err.message);
      if (err.field === 'role') showFieldError('signup-role', err.message);
      if (err.field === 'enterpriseName') showFieldError('signup-enterprise-name', err.message);
      if (err.field === 'password') showFieldError('signup-password', err.message);
      if (err.field === 'confirmPassword') showFieldError('signup-confirm-password', err.message);
    }
    return;
  }

  await Auth.signup(validation.data.name, validation.data.email, validation.data.role, validation.data.password, 'create', validation.data.enterpriseName);
});

lucide.createIcons();
