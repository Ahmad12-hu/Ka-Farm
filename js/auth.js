// KA Farm - Authentication Controller
import { KAStorage } from './storage.js';
import { UserManager } from './user-manager.js';
import { Crypto } from './modules/crypto.js';
import { logger } from './modules/logger.js';
import { ErrorHandler } from './modules/error-handler.js';

export const Auth = {
  async login(email, password, remember = true) {
    try {
      const users = KAStorage.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        ErrorHandler.showToast("Identifiants incorrects. Si vous n'avez pas de compte, veuillez vous inscrire via le lien d'inscription.", 'error');
        return false;
      }

      // Check if user has new format (salt + hash) or old format (legacy SHA-256)
      if (user.password_salt) {
        // New secure format with PBKDF2
        const isValid = await Crypto.verifyPassword(password, user.password, user.password_salt);
        if (!isValid) {
          ErrorHandler.showToast("Mot de passe incorrect.", 'error');
          return false;
        }
      } else {
        // Legacy format - migrate on the fly
        const legacyHash = KAStorage.hashPassword(password);
        if (user.password !== legacyHash) {
          ErrorHandler.showToast("Mot de passe incorrect.", 'error');
          return false;
        }
        // Migrate to new format
        const { hash, salt } = await Crypto.hashPassword(password);
        user.password = hash;
        user.password_salt = salt;
        KAStorage.saveUsers(users);
      }

      KAStorage.setCurrentUser({
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseId: user.enterpriseId || 'ka_farm',
        enterpriseName: user.enterpriseName || 'KA Farm',
        enterpriseCode: user.enterpriseCode || 'KA-FARM'
      }, remember);
      
      ErrorHandler.showToast(`Bienvenue, ${user.name} (${user.role}) !`, 'success');
      window.location.href = '/pages/shared/dashboard.html';
      return true;
    } catch (error) {
      logger.error('Login error', { error: error.message });
      ErrorHandler.showToast("Erreur lors de la connexion. Veuillez réessayer.", 'error');
      return false;
    }
  },

  async signup(name, email, role, password, mode = 'create', enterpriseName = '', invitationCode = '') {
    try {
      const users = KAStorage.getUsers();
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (exists) {
        ErrorHandler.showToast("Cette adresse e-mail est déjà utilisée.", 'error');
        return false;
      }

      let enterpriseId = '';
      let entName = '';
      let entCode = '';

      if (mode === 'create') {
        enterpriseId = `ent_${Date.now()}`;
        entName = (enterpriseName || 'Mon Exploitation').trim();
        entCode = `KAF-${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        const code = (invitationCode || '').trim().toUpperCase();
        const foundUser = users.find(u => u.enterpriseCode && u.enterpriseCode.toUpperCase() === code);
        if (!foundUser) {
        ErrorHandler.showToast("Code d'invitation de l'équipe invalide. Veuillez demander le code à l'entrepreneur gérant.", 'error');
        return false;
        }
        enterpriseId = foundUser.enterpriseId;
        entName = foundUser.enterpriseName;
        entCode = foundUser.enterpriseCode;
      }

      // Hash password with new secure method
      const { hash, salt } = await Crypto.hashPassword(password);
      
      const newUser = { 
        name, 
        email, 
        role, 
        enterpriseId,
        enterpriseName: entName,
        enterpriseCode: entCode,
        password: hash,
        password_salt: salt 
      };
      
      users.push(newUser);
      KAStorage.saveUsers(users);
      
      KAStorage.setCurrentUser(newUser, true);
      
      ErrorHandler.showToast(`Compte créé avec succès !\nExploitation : ${entName}\nCode Équipe : ${entCode}`, 'success');
      window.location.href = '/pages/shared/dashboard.html';
      return true;
    } catch (error) {
      logger.error('Signup error', { error: error.message });
      ErrorHandler.showToast("Erreur lors de la création du compte. Veuillez réessayer.", 'error');
      return false;
    }
  },

  logout() {
    KAStorage.setCurrentUser(null);
    ErrorHandler.showToast("Vous avez été déconnecté.", 'success');
    window.location.href = '/index.html';
  }
};

// Expose globally so inline onclick/onsubmit can call it if needed
window.Auth = Auth;
