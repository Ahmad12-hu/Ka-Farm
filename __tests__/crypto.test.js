const { Crypto } = require('../js/modules/crypto.js');

describe('Crypto Module', function() {
  beforeEach(() => {
    // Clear any stored passwords before each test
    localStorage.clear();
  });

  test('hashPassword creates a hash and salt', async function() {
    const { hash, salt } = await Crypto.hashPassword('testPassword123');
    
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash).not.toBe('testPassword123');
    expect(hash.length).toBeGreaterThan(0);
    expect(salt.length).toBeGreaterThan(0);
  });

  test('verifyPassword returns true for correct password', async function() {
    const { hash, salt } = await Crypto.hashPassword('mySecretPass');
    const isValid = await Crypto.verifyPassword('mySecretPass', hash, salt);
    
    expect(isValid).toBe(true);
  });

  test('verifyPassword returns false for incorrect password', async function() {
    const { hash, salt } = await Crypto.hashPassword('mySecretPass');
    const isValid = await Crypto.verifyPassword('wrongPassword', hash, salt);
    
    expect(isValid).toBe(false);
  });

  test('hashPassword generates different hashes for same password (different salts)', async function() {
    const { hash: hash1, salt: salt1 } = await Crypto.hashPassword('samePassword');
    const { hash: hash2, salt: salt2 } = await Crypto.hashPassword('samePassword');
    
    expect(hash1).not.toBe(hash2);
    expect(salt1).not.toBe(salt2);
  });

  test('detectHashType identifies PBKDF2 hash', function() {
    const pbkdf2Hash = 'PBKDF2:100000:abc123:hash';
    expect(Crypto.detectHashType(pbkdf2Hash)).toBe('pbkdf2');
  });

  test('detectHashType identifies legacy SHA-256 hash', function() {
    // SHA-256 produces 64-character hex strings
    const legacyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(Crypto.detectHashType(legacyHash)).toBe('legacy');
  });
});