// KA Farm - Tests du contrôle des rôles (RBAC) sur l'API.
// Vérifie que finances / employés / stocks / crop-profits / sync respectent
// le tableau des rôles : Terrain, Bureau, admin, super_admin.
// Harnais similaire à api.test.js : mock jsonwebtoken pour piloter req.user.role.

if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: jest.fn().mockResolvedValue({ text: "Mocked AI response" }) },
  })),
}));

jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(), doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(),
}));
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]" })),
  cert: jest.fn(() => ({ projectId: "ka-farm-test" })),
}));
jest.mock("firebase-admin/firestore", () => {
  const mockCollection = () => ({
    doc: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ exists: false })),
          set: jest.fn(() => Promise.resolve()),
        })),
      })),
    })),
  });
  return { getFirestore: jest.fn(() => ({ collection: jest.fn(mockCollection) })) };
});

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => ({ userId: "USR-RBAC", email: "rbac@ka-farm.sn", role: "admin", enterpriseId: "ka_farm" })),
}));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

process.env.GEMINI_API_KEY = "test-api-key-for-mocking";
process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  project_id: "ka-farm-test",
  client_email: "test@ka-farm-test.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----\\n",
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../api/index.js").default;

function authHeaders(role) {
  jwt.verify.mockReturnValue({ userId: "USR-RBAC", email: "rbac@ka-farm.sn", role, enterpriseId: "ka_farm" });
  return { Authorization: "Bearer test-token" };
}

describe("RBAC API — contrôle des rôles", () => {
  describe("FINANCES (/api/finances)", () => {
    test("Terrain ne peut PAS créer une transaction financière -> 403", async () => {
      const res = await request(app).post("/api/finances").set(authHeaders("Terrain"))
        .send({ id: "F-RBAC", description: "Test", amount: 1000 });
      expect(res.status).toBe(403);
    });

    test("Bureau peut créer une transaction financière -> 200", async () => {
      const res = await request(app).post("/api/finances").set(authHeaders("Bureau"))
        .send({ id: "F-RBAC", description: "Test Bureau", type: "Revenu", amount: 1000 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain ne peut PAS supprimer une transaction financière -> 403", async () => {
      const res = await request(app).delete("/api/finances/F-RBAC").set(authHeaders("Terrain"));
      expect(res.status).toBe(403);
    });

    test("admin peut créer une transaction financière -> 200", async () => {
      const res = await request(app).post("/api/finances").set(authHeaders("admin"))
        .send({ id: "F-RBAC-ADMIN", description: "Test admin", type: "Dépense", amount: 500 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain peut LIRE /api/finances -> 200", async () => {
      const res = await request(app).get("/api/finances").set(authHeaders("Terrain"));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("EMPLOYÉS (/api/employees)", () => {
    test("Terrain ne peut PAS créer un employé -> 403", async () => {
      const res = await request(app).post("/api/employees").set(authHeaders("Terrain"))
        .send({ id: "E-RBAC", name: "Ouvrier RBAC", dailyRate: 3500 });
      expect(res.status).toBe(403);
    });

    test("Bureau peut créer un employé -> 200", async () => {
      const res = await request(app).post("/api/employees").set(authHeaders("Bureau"))
        .send({ id: "E-RBAC", name: "Ouvrier RBAC", role: "Ouvrier agricole", dailyRate: 3500, status: "Actif" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain ne peut PAS modifier un employé -> 403", async () => {
      const res = await request(app).put("/api/employees/E-RBAC").set(authHeaders("Terrain"))
        .send({ name: "Renommé" });
      expect(res.status).toBe(403);
    });

    test("Bureau peut modifier un employé -> 200", async () => {
      const res = await request(app).put("/api/employees/E-RBAC").set(authHeaders("Bureau"))
        .send({ name: "Ouvrier RBAC modifié" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Bureau ne peut PAS supprimer un employé -> 403", async () => {
      const res = await request(app).delete("/api/employees/E-RBAC").set(authHeaders("Bureau"));
      expect(res.status).toBe(403);
    });

    test("admin peut supprimer un employé -> 200", async () => {
      const res = await request(app).delete("/api/employees/E-RBAC").set(authHeaders("admin"));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain lit les employés SANS le salaire (dailyRate absent)", async () => {
      const res = await request(app).get("/api/employees").set(authHeaders("Terrain"));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((e) => expect(e).not.toHaveProperty("dailyRate"));
    });

    test("Bureau lit les employés AVEC le salaire (dailyRate présent)", async () => {
      const res = await request(app).get("/api/employees").set(authHeaders("Bureau"));
      expect(res.status).toBe(200);
      const elmt = res.body.find((x) => x.id === "E-001");
      expect(elmt).toBeDefined();
      expect(elmt.dailyRate).toBeDefined();
    });
  });

  describe("STOCKS (/api/stocks)", () => {
    test("Terrain ne peut PAS écrire les stocks -> 403", async () => {
      const res = await request(app).post("/api/stocks").set(authHeaders("Terrain")).send({ stocks: [] });
      expect(res.status).toBe(403);
    });

    test("Bureau peut écrire les stocks -> 200", async () => {
      const res = await request(app).post("/api/stocks").set(authHeaders("Bureau")).send({ stocks: [] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain peut LIRE /api/stocks -> 200", async () => {
      const res = await request(app).get("/api/stocks").set(authHeaders("Terrain"));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("CROP PROFITS (rentabilité, liée aux finances)", () => {
    test("Terrain ne peut PAS écrire /api/crop-profits -> 403", async () => {
      const res = await request(app).post("/api/crop-profits").set(authHeaders("Terrain"))
        .send({ id: "CP-RBAC", crop_name: "Tomate" });
      expect(res.status).toBe(403);
    });

    test("Bureau peut écrire /api/crop-profits -> 200", async () => {
      const res = await request(app).post("/api/crop-profits").set(authHeaders("Bureau"))
        .send({ id: "CP-RBAC", crop_name: "Tomate" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("Terrain peut LIRE /api/crop-profits -> 200", async () => {
      const res = await request(app).get("/api/crop-profits").set(authHeaders("Terrain"));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("SYNC — collections sensibles (finances / employés)", () => {
    test("Terrain ne peut pas écrire finances via /api/sync/item -> 403", async () => {
      const res = await request(app).post("/api/sync/item").set(authHeaders("Terrain"))
        .send({ collection: "finances", type: "CREATE", data: { id: "F-SYNC", description: "x" } });
      expect(res.status).toBe(403);
    });

    test("Bureau peut écrire finances via /api/sync/item -> 200", async () => {
      const res = await request(app).post("/api/sync/item").set(authHeaders("Bureau"))
        .send({ collection: "finances", type: "CREATE", data: { id: "F-SYNC", description: "x" } });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("Bureau ne peut PAS supprimer un employé via /api/sync/item -> 403", async () => {
      const res = await request(app).post("/api/sync/item").set(authHeaders("Bureau"))
        .send({ collection: "employees", type: "DELETE", data: { id: "E-SYNC" } });
      expect(res.status).toBe(403);
    });

    test("admin peut supprimer un employé via /api/sync/item -> 200", async () => {
      const res = await request(app).post("/api/sync/item").set(authHeaders("admin"))
        .send({ collection: "employees", type: "DELETE", data: { id: "E-SYNC" } });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("batch : Terrain ne peut pas écrire finances via /api/sync (action refusée)", async () => {
      const res = await request(app).post("/api/sync").set(authHeaders("Terrain"))
        .send({ actions: [{ collection: "finances", type: "SAVE_ALL", data: [] }] });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.results[0].ok).toBe(false);
    });

    test("sans authentification, écriture finances via /api/sync/item -> 401", async () => {
      const res = await request(app).post("/api/sync/item")
        .send({ collection: "finances", type: "CREATE", data: { id: "F-NOAUTH", description: "x" } });
      expect(res.status).toBe(401);
    });
  });
});