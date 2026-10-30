// KA Farm - Tests de validation Zod des écritures API (Phase 1 sécurité).
// Vérifie que les endpoints POST/PUT rejettent les charges utiles invalides
// avec un 400 structuré, sans casser les contrats existants (snake_case legacy
// et camelCase utilisé par le frontend).
// Harnais de mocks identique à api-rbac.test.js.

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
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
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
          delete: jest.fn(() => Promise.resolve()),
        })),
      })),
    })),
  });
  return { getFirestore: jest.fn(() => ({ collection: jest.fn(mockCollection) })) };
});

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => ({
    userId: "USR-VAL",
    email: "val@ka-farm.sn",
    role: "admin",
    enterpriseId: "ka_farm",
  })),
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
  jwt.verify.mockReturnValue({
    userId: "USR-VAL",
    email: "val@ka-farm.sn",
    role,
    enterpriseId: "ka_farm",
  });
  return { Authorization: "Bearer test-token" };
}

describe("Validation Zod — écritures API", () => {
  describe("TRAITEMENTS (/api/treatments)", () => {
    test("payload vide -> 400 structuré", async () => {
      const res = await request(app).post("/api/treatments").set(authHeaders("admin")).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
      expect(Array.isArray(res.body.details)).toBe(true);
    });

    test("sans id -> 400", async () => {
      const res = await request(app)
        .post("/api/treatments")
        .set(authHeaders("admin"))
        .send({ product_name: "Neem" });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "id")).toBe(true);
    });

    test("sans nom de produit -> 400", async () => {
      const res = await request(app)
        .post("/api/treatments")
        .set(authHeaders("admin"))
        .send({ id: "TR-SANS-NOM" });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "product_name")).toBe(true);
    });

    test("snake_case valide -> 200", async () => {
      const res = await request(app)
        .post("/api/treatments")
        .set(authHeaders("admin"))
        .send({ id: "TR-VALID", product_name: "Purin de neem", dar_days: 7 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("camelCase frontend accepté -> 200 (productName)", async () => {
      const res = await request(app).post("/api/treatments").set(authHeaders("admin")).send({
        id: "TR-CAMEL",
        productName: "Bacillus thuringiensis",
        quantityUsed: 2,
        unit: "L",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("TRAITEMENTS SYNC (/api/treatments/sync)", () => {
    test("treatments non tableau -> 400", async () => {
      const res = await request(app)
        .post("/api/treatments/sync")
        .set(authHeaders("admin"))
        .send({ treatments: "nope" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });

    test("élément sans id -> 400", async () => {
      const res = await request(app)
        .post("/api/treatments/sync")
        .set(authHeaders("admin"))
        .send({ treatments: [{ product_name: "Neem" }] });
      expect(res.status).toBe(400);
    });

    test("tableau vide -> 200", async () => {
      const res = await request(app)
        .post("/api/treatments/sync")
        .set(authHeaders("admin"))
        .send({ treatments: [] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("STOCKS (/api/stocks)", () => {
    test("stocks non tableau -> 400", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({ stocks: "nope" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });

    test("intrant sans id -> 400 avec champ précis", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({ stocks: [{ name: "Engrais NPK" }] });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "stocks.0.id")).toBe(true);
    });

    test("quantité en chaîne -> 400 (type number attendu)", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({ stocks: [{ id: "S-BAD", name: "Engrais", quantity: "12" }] });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "stocks.0.quantity")).toBe(true);
    });

    test("quantité négative -> 400", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({ stocks: [{ id: "S-NEG", name: "Engrais", quantity: -5 }] });
      expect(res.status).toBe(400);
    });

    test("tableau vide -> 200 (contrat conservé)", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({ stocks: [] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("intrant camelCase valide -> 200 et champs préservés", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Bureau"))
        .send({
          stocks: [
            {
              id: "S-VALID",
              name: "Semences",
              category: "Semences",
              quantity: 12,
              maxQuantity: 50,
              unit: "sachets",
            },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.stocks[0]).toMatchObject({ id: "S-VALID", maxQuantity: 50, unit: "sachets" });
    });

    test("le rôle est contrôlé AVANT la validation (Terrain + payload invalide -> 403)", async () => {
      const res = await request(app)
        .post("/api/stocks")
        .set(authHeaders("Terrain"))
        .send({ stocks: "nope" });
      expect(res.status).toBe(403);
    });
  });

  describe("RENTABILITÉ (/api/crop-profits)", () => {
    test("sans nom de culture -> 400", async () => {
      const res = await request(app)
        .post("/api/crop-profits")
        .set(authHeaders("Bureau"))
        .send({ id: "CP-BAD" });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "crop_name")).toBe(true);
    });

    test("sans id -> 400", async () => {
      const res = await request(app)
        .post("/api/crop-profits")
        .set(authHeaders("Bureau"))
        .send({ crop_name: "Tomate" });
      expect(res.status).toBe(400);
    });

    test("snake_case valide -> 200", async () => {
      const res = await request(app)
        .post("/api/crop-profits")
        .set(authHeaders("Bureau"))
        .send({ id: "CP-VALID", crop_name: "Tomate" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("camelCase frontend accepté -> 200 (cropName + champs libres préservés)", async () => {
      const res = await request(app)
        .post("/api/crop-profits")
        .set(authHeaders("Bureau"))
        .send({ id: "CP-CAMEL", cropName: "Oignon", yieldKg: 120, netMargin: 45000 });
      expect(res.status).toBe(200);
      expect(res.body.profit).toMatchObject({ cropName: "Oignon", netMargin: 45000 });
    });

    test("sync non tableau -> 400", async () => {
      const res = await request(app)
        .post("/api/crop-profits/sync")
        .set(authHeaders("Bureau"))
        .send({ cropProfits: {} });
      expect(res.status).toBe(400);
    });
  });

  describe("AUTH (/api/auth/login)", () => {
    test("payload vide -> 400 avec champs email/password", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      const fields = res.body.details.map((d) => d.field);
      expect(fields).toEqual(expect.arrayContaining(["email", "password"]));
    });

    test("email mal formé -> 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "pas-un-email", password: "secret" });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "email")).toBe(true);
    });
  });

  describe("SYNC (/api/sync/item)", () => {
    test("collection manquante -> 400 ok:false", async () => {
      const res = await request(app)
        .post("/api/sync/item")
        .set(authHeaders("admin"))
        .send({ type: "SAVE", data: [] });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    test("action valide -> 200 (contrat conservé)", async () => {
      const res = await request(app)
        .post("/api/sync/item")
        .set(authHeaders("admin"))
        .send({ collection: "crops", type: "SAVE", data: [{ id: "C-VAL", name: "Test" }] });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe("PUT déjà validés — non-régression", () => {
    test("PUT /api/crops/:id avec mauvais type -> 400", async () => {
      const res = await request(app)
        .put("/api/crops/C-ANY")
        .set(authHeaders("admin"))
        .send({ name: 123 });
      expect(res.status).toBe(400);
    });

    test("PUT /api/tasks/:id avec mauvais type -> 400", async () => {
      const res = await request(app)
        .put("/api/tasks/T-ANY")
        .set(authHeaders("admin"))
        .send({ completed: "oui" });
      expect(res.status).toBe(400);
    });
  });
});
