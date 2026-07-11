// KA Farm - Cryptographic Utilities
// Uses Web Crypto API for secure password hashing (PBKDF2)

export const Crypto = {
  /**
   * Hash a password using PBKDF2 with SHA-256
   * @param {string} password - Plain text password
   * @param {string} salt - Base64 encoded salt (or null to generate new)
   * @returns {Promise<{hash: string, salt: string}>}
   */
  async hashPassword(password, salt = null) {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Generate or use provided salt
      let saltBuffer;
      if (salt) {
        saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
      } else {
        saltBuffer = crypto.getRandomValues(new Uint8Array(16));
      }

      const saltBase64 = btoa(String.fromCharCode(...saltBuffer));

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000, // OWASP recommended minimum
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['deriveBits']
      );

      const hashBuffer = await crypto.subtle.exportKey('raw', derivedKey);
      const hashArray = new Uint8Array(hashBuffer);
      const hashBase64 = btoa(String.fromCharCode(...hashArray));

      return {
        hash: hashBase64,
        salt: saltBase64
      };
    } catch (error) {
      console.error('Crypto error:', error);
      throw new Error('Impossible de sécuriser le mot de passe');
    }
  },

  /**
   * Verify a password against a stored hash
   * @param {string} password - Plain text password to verify
   * @param {string} hash - Stored hash (base64)
   * @param {string} salt - Stored salt (base64)
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password, hash, salt) {
    try {
      const { hash: newHash } = await this.hashPassword(password, salt);
      return newHash === hash;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  },

  /**
   * Generate a random secure token
   * @param {number} length - Length in bytes (default 32)
   * @returns {string} Base64 encoded random token
   */
  generateToken(length = 32) {
    const array = crypto.getRandomValues(new Uint8Array(length));
    return btoa(String.fromCharCode(...array));
  },

  /**
   * Simple hash for non-critical purposes (like IDs)
   * @param {string} input
   * @returns {string}
   */
  simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
};