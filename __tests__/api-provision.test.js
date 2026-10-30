// Polyfill TextEncoder pour l'environnement de test jsdom
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Simuler @google/genai (évite l'analyse ESM du SDK dans Jest)
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: jest.fn().mockResolvedValue({ text: "Mocked AI response" }) },
  })),
}));

// jwt local toujours invalide -> requireAuth passe par le chemin ID token Firebase
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => {
    throw new Error("JWT local invalide -> chemin Firebase");
  }),
  sign: jest.fn(),
}));

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]" })),
  cert: jest.fn(() => ({ projectId: "ka-farm-test" })),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "firebase-uid-123", email: "awa@kafarm.sn" }),
  })),
}));

// Firestore stateful minimal : mémorise les docs users/{uid} écrits par le
// provisionnement pour vérifier la création puis l'idempotence.
jest.mock("firebase-admin/firestore", () => {
  const store = new Map();
  const makeRef = (path) => ({
    get: jest.fn(() =>
      Promise.resolve(
        store.has(path)
          ? { exists: true, data: () => store.get(path) }
          : { exists: false, data: () => undefined }
      )
    ),
    set: jest.fn((data) => {
      store.set(path, { ...(store.get(path) || {}), ...data });
      return Promise.resolve();
    }),
  });
  return {
    getFirestore: jest.fn(() => ({
      collection: jest.fn((name) => ({ doc: jest.fn((id) => makeRef(`${name}/${id}`)) })),
    })),
  };
});

process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  project_id: "ka-farm-test",
  client_email: "test@ka-farm-test.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----\\n",
});
process.env.GEMINI_API_KEY = "test-api-key-for-mocking";

const request = require("supertest");
const app = require("../api/index.js").default;

const auth = { Authorization: "Bearer firebase-id-token" };

describe("POST /api/auth/provision", () => {
  test("refuse l'accès sans token (401)", async () => {
    const response = await request(app).post("/api/auth/provision").send({ role: "Bureau" });
    expect(response.status).toBe(401);
  });

  test("refuse un rôle hors allowlist (400)", async () => {
    const response = await request(app)
      .post("/api/auth/provision")
      .set(auth)
      .send({ role: "super_admin" });
    expect(response.status).toBe(400);
    expect(response.body.details.some((d) => d.field === "role")).toBe(true);
  });

  test("crée le tenant au premier appel puis reste idempotent", async () => {
    const first = await request(app)
      .post("/api/auth/provision")
      .set(auth)
      .send({ role: "Bureau", enterpriseName: "Ferme Test", name: "Awa" });

    expect(first.status).toBe(200);
    expect(first.body.user.provisioned).toBe(true);
    expect(first.body.user.role).toBe("Bureau");
    expect(first.body.user.enterpriseName).toBe("Ferme Test");
    expect(first.body.user.enterpriseId).toMatch(/^ent_[0-9a-f]+$/);
    expect(first.body.user.enterpriseCode).toMatch(/^KAF-[0-9A-F]+$/);

    // Second appel : le profil existant est renvoyé sans être écrasé.
    const second = await request(app)
      .post("/api/auth/provision")
      .set(auth)
      .send({ role: "Terrain" });

    expect(second.status).toBe(200);
    expect(second.body.user.existing).toBe(true);
    expect(second.body.user.role).toBe("Bureau");
    expect(second.body.user.enterpriseId).toBe(first.body.user.enterpriseId);
  });
});
