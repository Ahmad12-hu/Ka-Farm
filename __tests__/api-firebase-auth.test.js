// Polyfill TextEncoder pour l'environnement de test jsdom
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Simuler @google/genai
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: "Mocked AI response" }),
    },
  })),
}));

// jsonwebtoken : on force TOUJOURS l'échec de jwt.verify pour obliger
// requireAuth à passer par le chemin ID token Firebase (fallback).
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => {
    throw new Error("JWT local invalide -> tester le chemin Firebase");
  }),
  sign: jest.fn(),
}));

// Simuler firebase-admin/app
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]" })),
  cert: jest.fn(() => ({ projectId: "ka-farm-test" })),
}));

// Simuler firebase-admin/auth : verifyIdToken résout un ID token Firebase valide
jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "firebase-uid-123",
      email: "admin@kafarm.sn",
    }),
  })),
}));

// Simuler firebase-admin/firestore : collection users/{uid} existe avec un rôle
jest.mock("firebase-admin/firestore", () => {
  const doc = { exists: true, data: () => ({ role: "Admin", name: "Admin KA Farm" }) };
  const get = jest.fn(() => Promise.resolve(doc));

  return {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ get })),
      })),
    })),
  };
});

process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  project_id: "ka-farm-test",
  client_email: "test@ka-farm-test.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\\\nMOCK\\\\n-----END PRIVATE KEY-----\\\\n",
});
process.env.GEMINI_API_KEY = "test-api-key-for-mocking";

const request = require("supertest");
const app = require("../api/index.js").default;

describe("API Auth - Chemin ID token Firebase", () => {
  test("requireAuth accepte un ID token Firebase et lit le rôle depuis Firestore", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: "Bearer firebase-id-token" });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.uid).toBe("firebase-uid-123");
    expect(response.body.user.email).toBe("admin@kafarm.sn");
    expect(response.body.user.role).toBe("Admin");
    expect(response.body.user.firebase).toBe(true);
  });

  test("les routes protégées IA (ex: /api/gemini) acceptent un ID token Firebase", async () => {
    const response = await request(app)
      .post("/api/gemini")
      .set({ Authorization: "Bearer firebase-id-token" })
      .send({ prompt: "Comment planter des oignons ?" });

    expect(response.status).toBe(200);
    expect(response.body.text).toContain("Mocked AI response");
  });

  test("requireAuth renvoie 401 sans header Authorization", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });
});
