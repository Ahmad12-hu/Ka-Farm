// KA Farm - Authentication Controller
import { KAStorage } from './storage.js';
import { UserManager } from './user-manager.js';

export const Auth = {
  login(email, password, remember = true) {
    const users = KAStorage.getUsers();
    const hashedPassword = KAStorage.hashPassword(password);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword);
    
    if (user) {
      KAStorage.setCurrentUser({
        email: user.email,
        name: user.name,
        role: user.role
      }, remember);
      
      alert(`Bienvenue, ${user.name} (${user.role}) !`);
      window.location.href = '/pages/shared/dashboard.html';
      return true;
    } else {
      // If user doesn't exist, we can register them as a default experience for smooth user testing!
      // Let's create a new account for them automatically if they are logging in for the first time
      // with a secure message so they don't get stuck.
      const isPredefined = ['moussa@kafarm.sn', 'aly@kafarm.sn', 'amadoucoumbaka@gmail.com'].includes(email.toLowerCase());
      alert("Identifiants incorrects. Si vous n'avez pas de compte, veuillez vous inscrire via le lien d'inscription.");
      return false;
    }
  },

  signup(name, email, role, password) {
    const users = KAStorage.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      alert("Cette adresse e-mail est déjà utilisée.");
      return false;
    }
    
    const newUser = { name, email, role, password: KAStorage.hashPassword(password) };
    users.push(newUser);
    KAStorage.saveUsers(users);
    
    KAStorage.setCurrentUser({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }, true);
    
    alert(`Compte créé avec succès ! Bienvenue ${name}.`);
    window.location.href = '/pages/shared/dashboard.html';
    return true;
  },

  logout() {
    KAStorage.setCurrentUser(null);
    alert("Vous avez été déconnecté.");
    window.location.href = '/index.html';
  }
};

// Expose globally so inline onclick/onsubmit can call it if needed
window.Auth = Auth;
