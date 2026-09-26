// Tests unitaires pour le module d'initialisation Firebase client
// (js/firebase/firebase.js).
//
// On MOCKE firebase/app et firebase/auth pour :
//   1) garder le test déterministe et rapide (pas d'import lourd du SDK,
//      pas de dépendance réseau/émulateur) ;
//   2) vérifier la CONFIG passée à initializeApp et la valeur des exports,
//      sans dépendre d'un environnement navigateur complet.

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn((cfg) => ({ name: "[MOCK-APP]", options: cfg })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: "[MOCK-EXISTING]" })),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn((appObj) => ({ app: appObj, __mockAuth: true })),
}));

describe("Firebase client init (js/firebase/firebase.js)", () => {
  test("lit la config publique depuis firebase-applet-config.json (projet ka-farm-prod)", async () => {
    const config = require("../firebase-applet-config.json");
    expect(config.projectId).toBe("ka-farm-prod");
    expect(typeof config.apiKey).toBe("string");
    expect(config.apiKey.length).toBeGreaterThan(0);
    expect(typeof config.appId).toBe("string");
    expect(typeof config.authDomain).toBe("string");
  });

  test("initialise l'app avec la bonne config et expose auth", async () => {
    const { initializeApp } = require("firebase/app");
    const { getAuth } = require("firebase/auth");

    // Importe le module APRÈS la mise en place des mocks pour les appliquer.
    const fb = require("../js/firebase/firebase.js");

    expect(initializeApp).toHaveBeenCalledTimes(1);
    const [cfgArg] = initializeApp.mock.calls[0];
    expect(cfgArg.projectId).toBe("ka-farm-prod");
    expect(cfgArg.apiKey).toContain("AIza");

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(fb.auth).toEqual(expect.objectContaining({ __mockAuth: true }));
    expect(fb.app.name).toBe("[MOCK-APP]");
    // Le module émet `auth` comme export par défaut.
    expect(fb.default).toBe(fb.auth);
  }, 15000);

  test("réutilise une app existante si présente (évite le double init)", async () => {
    jest.resetModules();

    const { getApps, getApp, initializeApp } = require("firebase/app");
    getApps.mockReturnValue([{ name: "[MOCK-APP]" }]);
    initializeApp.mockClear();

    const fb = require("../js/firebase/firebase.js");
    expect(initializeApp).not.toHaveBeenCalled();
    expect(getApp).toHaveBeenCalledTimes(1);
    expect(fb.app.name).toBe("[MOCK-EXISTING]");
  }, 15000);
});
