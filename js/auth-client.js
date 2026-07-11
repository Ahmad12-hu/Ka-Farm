import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Ces valeurs seront chargées depuis un fichier de config ou les variables d'environnement
// Pour l'instant, nous les mettons ici. Remplacez-les par vos clés Supabase.
const SUPABASE_URL = 'VOTRE_URL_DE_PROJET_SUPABASE';
const SUPABASE_ANON_KEY = 'VOTRE_CLÉ_ANON_PUBLIC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Gère la soumission du formulaire de connexion.
 * @param {Event} e L'événement de soumission.
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error-message');
  const loginButton = document.getElementById('login-button');
  const loginButtonText = document.getElementById('login-button-text');

  // UI feedback
  errorDiv.classList.add('hidden');
  loginButton.disabled = true;
  loginButtonText.textContent = 'Connexion...';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Erreur de connexion:', error.message);
    errorDiv.textContent = "L'email ou le mot de passe est incorrect.";
    errorDiv.classList.remove('hidden');
    loginButton.disabled = false;
    loginButtonText.textContent = 'Se Connecter';
  } else if (data.user) {
    // Redirection vers le tableau de bord après une connexion réussie
    window.location.href = '/pages/shared/dashboard.html';
  }
}

/**
 * Déconnecte l'utilisateur.
 */
export async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur de déconnexion:', error.message);
  } else {
    // Redirige vers la page de connexion après la déconnexion
    window.location.href = '/pages/login.html';
  }
}

/**
 * Vérifie si un utilisateur est connecté et s'il est l'administrateur.
 * Redirige si non autorisé.
 */
export async function protectPage() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Pas de session, redirige vers le login
    window.location.href = `/pages/login.html?redirect=${window.location.pathname}`;
    return;
  }

  // Mettez ici VOTRE email d'administrateur
  const ADMIN_EMAIL = "votre-email-admin@exemple.com";

  if (session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    // L'utilisateur est connecté mais n'est pas l'admin
    console.warn("Accès non autorisé refusé pour :", session.user.email);
    await handleLogout(); // Déconnecte l'utilisateur non autorisé
    return;
  }

  // L'utilisateur est l'admin, on peut continuer
  console.log('Accès autorisé pour :', session.user.email);
  return session.user;
}

/**
 * Récupère la session utilisateur actuelle.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
}

// Attache le gestionnaire de connexion au formulaire si la page est `login.html`
if (window.location.pathname.endsWith('login.html')) {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// Expose la fonction de déconnexion globalement pour le bouton dans la sidebar
window.handleLogout = handleLogout;