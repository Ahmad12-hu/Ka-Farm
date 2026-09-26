// Tests unitaires pour le contrôleur d'authentification Firebase
// (js/auth.js).
//
// On mocke :
//   - ../js/firebase/firebase.js : exporte un `auth` factice (pas d'init SDK réelle) ;
//   - firebase/auth : signInWithEmailAndPassword, createUser..., signOut,
//     getIdToken, onAuthStateChanged (contrôlés par les tests) ;
//   - ../js/storage.js : stub KAStorage (setCurrentUser/getCurrentUser) ;
//   - logger & error-handler : silencieux/contrôlés.
//
// jsdom ne gère pas la navigation : on stub window.location.assign.

jest.mock("../js/firebase/firebase.js", () => ({
  auth: { currentUser: null, __cb: null },
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(async () => {}),
  getIdToken: jest.fn(async () => "id-token-ABC"),
  onAuthStateChanged: jest.fn((authObj, cb) => {
    authObj.__cb = cb;
    return () => {};
  }),
}));

jest.mock("../js/storage.js", () => ({
  KAStorage: {
    getCurrentUser: jest.fn(() => null),
    setCurrentUser: jest.fn(),
  },
}));

jest.mock("../js/modules/error-handler.js", () => ({
  ErrorHandler: { showToast: jest.fn() },
}));

jest.mock("../js/modules/logger.js", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const FB_USER = {
  uid: "uid-123",
  email: "amadou@ka-farm.sn",
  displayName: "Amadou KA",
};

describe("Auth (Firebase)", () => {
  let Auth;
  let KAStorage;
  let firebaseAuth;
  let locationAssign;

  beforeAll(() => {
    // Le module s'auto-importe au premier require ; mocks déjà en place.
    Auth = require("../js/auth.js").Auth;
    KAStorage = require("../js/storage.js").KAStorage;
    firebaseAuth = require("firebase/auth");
    locationAssign = jest.fn();
    // jsdom ne permet pas de redéfinir `location.assign` directement (propriété
    // non-configurable). On remplace donc l'objet `window.location` entier par
    // un stub (configurable), pour capturer les navigations sans erreur.
    Object.defineProperty(window, "location", {
      value: {
        assign: locationAssign,
        replace: jest.fn(),
        reload: jest.fn(),
        href: "http://localhost/",
        hostname: "localhost",
        pathname: "/",
      },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Par défaut : serveur hors-ligne (retourne null) → fallback local/défaut.
    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    }));
    firebaseAuth.getIdToken.mockResolvedValue("id-token-ABC");
  });
test("login réussi : set token + hydratation serveur + profil persévé", async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: FB_USER,
    });
    // Serveur (Firestore users/{uid}) renvoie un rôle admin.
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          name: "Amadou KA",
          role: "admin",
          enterpriseId: "ent_1",
          enterpriseName: "KA Farm",
          enterpriseCode: "KA-FARM",
        },
      }),
    });

    const ok = await Auth.login("amadou@ka-farm.sn", "secret");
    expect(ok).toBe(true);
    expect(localStorage.getItem("kafarm_token")).toBe("id-token-ABC");
    // hydrateProfile privilégie le rôle serveur (admin), pas le défaut.
    expect(KAStorage.setCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin", uid: "uid-123", firebase: true }),
      true
    );
    expect(locationAssign).toHaveBeenCalledWith("/pages/shared/dashboard.html");
  });

  test("login échoué : message convivial, pas de profil persévé", async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
    });

    const ok = await Auth.login("amadou@ka-farm.sn", "mauvais");
    expect(ok).toBe(false);
    expect(KAStorage.setCurrentUser).not.toHaveBeenCalled();
    expect(localStorage.getItem("kafarm_token")).toBeNull();
  });

  test("signup réussi : crée le compte, set token, profil local", async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: FB_USER,
    });
    firebaseAuth.getIdToken.mockResolvedValue("id-token-NEW");

    const ok = await Auth.signup(
      "Amadou KA",
      "amadou@ka-farm.sn",
      "Bureau",
      "pass1234",
      "create",
      "Ferme du KA"
    );
    expect(ok).toBe(true);
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(
      FB_USER,
      expect.objectContaining({ displayName: "Amadou KA" })
    );
    expect(localStorage.getItem("kafarm_token")).toBe("id-token-NEW");
    expect(KAStorage.setCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "Bureau", email: "amadou@ka-farm.sn" }),
      true
    );
    expect(locationAssign).toHaveBeenCalledWith("/pages/shared/dashboard.html");
  });

  test("logout : signOut + purge token + purge profil local", async () => {
    localStorage.setItem("kafarm_token", "id-token-ABC");

    await Auth.logout();
    expect(firebaseAuth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem("kafarm_token")).toBeNull();
    expect(KAStorage.setCurrentUser).toHaveBeenCalledWith(null);
    expect(locationAssign).toHaveBeenCalledWith("/index.html");
  });

  test("getFirebaseToken : ID token si currentUser, sinon token cache", async () => {
    localStorage.setItem("kafarm_token", "cached-token");
    // Pas de currentUser → token en cache.
    expect(await Auth.getFirebaseToken()).toBe("cached-token");

    // Avec currentUser → getIdToken.
    const authObj = require("../js/firebase/firebase.js").auth;
    authObj.currentUser = { uid: "uid-123" };
    expect(await Auth.getFirebaseToken(true)).toBe("id-token-ABC");
    expect(firebaseAuth.getIdToken).toHaveBeenCalledWith(
      { uid: "uid-123" },
      true
    );
  });

  test("onAuthStateChanged : restaure token + profil quand le profil local est vide", async () => {
    const authObj = require("../js/firebase/firebase.js").auth;
    const cb = authObj.__cb;
    expect(typeof cb).toBe("function");

    // Pas de profil local, utilisateur Firebase connecté.
    await cb(FB_USER);
    expect(localStorage.getItem("kafarm_token")).toBe("id-token-ABC");
    expect(KAStorage.setCurrentUser).toHaveBeenCalled();

    // Utilisateur Firebase déconnecté → purge.
    await cb(null);
    expect(localStorage.getItem("kafarm_token")).toBeNull();
    expect(KAStorage.setCurrentUser).toHaveBeenCalledWith(null);
  });
});