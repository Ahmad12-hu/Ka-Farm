const { Crypto } = require('../js/modules/crypto.js');

// Polyfill TextEncoder for jsdom test environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

describe('Crypto Module', function() {
  beforeEach(() => {
    localStorage.clear();
  });

  test('simpleHash returns a hash string', function() {
    const hash = Crypto.simpleHash('test');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  test('simpleHash returns different hashes for different inputs', function() {
    const hash1 = Crypto.simpleHash('input1');
    const hash2 = Crypto.simpleHash('input2');
    expect(hash1).not.toBe(hash2);
  });

  test('simpleHash returns same hash for same input', function() {
    const hash1 = Crypto.simpleHash('sameInput');
    const hash2 = Crypto.simpleHash('sameInput');
    expect(hash1).toBe(hash2);
  });

  test('generateToken creates a random token', function() {
    const token1 = Crypto.generateToken();
    const token2 = Crypto.generateToken();
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(0);
  });
});