// Tests unitaires pour KA Farm
import { KAStorage } from '../js/storage.js';
import { UserManager } from '../js/user-manager.js';

describe('KAStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  test('devrait initialiser le storage', () => {
    KAStorage.init();
    expect(KAStorage).toBeDefined();
  });

  test('devrait stocker et récupérer des données', () => {
    const testData = { name: 'Test Farm', location: 'Dakar' };
    KAStorage.set('test_farm', testData);
    const retrieved = KAStorage.get('test_farm');
    expect(retrieved).toEqual(testData);
  });

  test('devrait retourner une valeur par défaut si la clé n\'existe pas', () => {
    const defaultValue = 'default_value';
    const retrieved = KAStorage.get('non_existent_key', defaultValue);
    expect(retrieved).toBe(defaultValue);
  });

  test('devrait supprimer une clé', () => {
    KAStorage.set('test_key', 'test_value');
    KAStorage.remove('test_key');
    const retrieved = KAStorage.get('test_key');
    expect(retrieved).toBeNull();
  });
});

describe('UserManager', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  test('devrait créer un utilisateur', () => {
    const user = {
      id: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'Bureau'
    };
    
    const result = UserManager.createUser(user);
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
  });

  test('devrait récupérer l\'utilisateur courant', () => {
    const user = {
      id: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'Bureau'
    };
    
    UserManager.createUser(user);
    UserManager.setCurrentUser(user);
    const currentUser = UserManager.getCurrentUser();
    
    expect(currentUser).toBeDefined();
    expect(currentUser.email).toBe(user.email);
  });

  test('devrait vérifier si l\'utilisateur est authentifié', () => {
    const isAuth = UserManager.isAuthenticated();
    expect(typeof isAuth).toBe('boolean');
  });
});

describe('Validators', () => {
  test('devrait valider un email', () => {
    // Test basique de validation d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });

  test('devrait valider un numéro de téléphone sénégalais', () => {
    const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
    expect(phoneRegex.test('771234567')).toBe(true);
    expect(phoneRegex.test('+221771234567')).toBe(true);
    expect(phoneRegex.test('123')).toBe(false);
  });
});