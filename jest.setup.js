// Jest setup file to handle console methods in tests

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
