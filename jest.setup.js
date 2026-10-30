// Jest setup file to handle console methods in tests

// Les tests doivent être déterministes quel que soit l'environnement ambiant :
// si NODE_ENV=production, api/index.js démarre sans données de démo (isProd)
// et les tests CRUD (ex. PUT /api/crops/:id) échouent. On force l'environnement
// de test avant tout import de module applicatif.
process.env.NODE_ENV = "test";
delete process.env.VERCEL_ENV;

// Mock console.error to prevent test failures when logger tries to log
const originalConsoleError = console.error;
console.error = jest.fn((...args) => {
  // Allow the error to be logged but don't throw
  if (typeof originalConsoleError === "function") {
    try {
      originalConsoleError.apply(console, args);
    } catch (e) {
      // Silently fail if console is not available
    }
  }
});

// Mock console.warn to prevent test failures when logger tries to log
const originalConsoleWarn = console.warn;
console.warn = jest.fn((...args) => {
  // Allow the warning to be logged but don't throw
  if (typeof originalConsoleWarn === "function") {
    try {
      originalConsoleWarn.apply(console, args);
    } catch (e) {
      // Silently fail if console is not available
    }
  }
});

// Keep console.log working normally for debugging
// console.log = jest.fn((...args) => {
//   if (typeof originalConsoleLog === 'function') {
//     originalConsoleLog.apply(console, args);
//   }
// });
