import { Auth } from '/js/auth.js';

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const role = document.getElementById('signup-role').value;
  const pass = document.getElementById('signup-password').value;

  // Utiliser localStorage pour l'inscription (mode création par défaut)
  await Auth.signup(name, email, role, pass, 'create');
});

lucide.createIcons();