// KA Farm - Choix de la clé Gemini selon le modèle demandé.
// GEMINI_FLASH_KEY / GEMINI_PRO_KEY isole les quotas ; GEMINI_API_KEY sert de repli.
// Harnais de mocks identique à api-validation.test.js.

if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

const mockClientKeys = [];
jest.mock("@google/genai", () => {
  const streamStub = {
    [Symbol.asyncIterator]() {
      let done = false;
      return {
        next() {
          if (done) return Promise.resolve({ value: undefined, done: true });
          done = true;
          return Promise.resolve({ value: { text: "Bonjour" }, done: false });
        },
      };
    },
  };
  return {
    GoogleGenAI: jest.fn().mockImplementation((options) => {
      mockClientKeys.push(options.apiKey);
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({ text: "Réponse mock" }),
          generateContentStream: jest.fn(() => Promise.resolve(streamStub)),
        },
      };
    }),
  };
});

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
        })),
      })),
    })),
  });
  return { getFirestore: jest.fn(() => ({ collection: jest.fn(mockCollection) })) };
});

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => ({
    userId: "USR-AI",
    email: "ai@ka-farm.sn",
    role: "admin",
    enterpriseId: "ka_farm",
  })),
}));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

process.env.GEMINI_FLASH_KEY = "flash-test-key";
process.env.GEMINI_PRO_KEY = "pro-test-key";
process.env.GEMINI_API_KEY = "fallback-test-key";
process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  project_id: "ka-farm-test",
  client_email: "test@ka-farm-test.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----\\n",
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../api/index.js").default;
const { geminiKeyFor } = require("../js/modules/gemini-keys.js");

function authHeaders() {
  jwt.verify.mockReturnValue({
    userId: "USR-AI",
    email: "ai@ka-farm.sn",
    role: "admin",
    enterpriseId: "ka_farm",
  });
  return { Authorization: "Bearer test-token" };
}

describe("Clés Gemini par modèle", () => {
  describe("geminiKeyFor()", () => {
    const env = {
      GEMINI_API_KEY: "fallback",
      GEMINI_FLASH_KEY: "flash",
      GEMINI_PRO_KEY: "pro",
    };

    test("un modèle pro utilise la clé pro", () => {
      expect(geminiKeyFor("gemini-3.6-pro", env)).toBe("pro");
    });

    test("un modèle flash ou flash-lite utilise la clé flash", () => {
      expect(geminiKeyFor("gemini-3.6-flash", env)).toBe("flash");
      expect(geminiKeyFor("gemini-3.5-flash-lite", env)).toBe("flash");
    });

    test("un modèle inconnu utilise la clé commune", () => {
      expect(geminiKeyFor("modele-maison", env)).toBe("fallback");
      expect(geminiKeyFor(undefined, env)).toBe("fallback");
    });

    test("repli sur GEMINI_API_KEY quand la clé dédiée manque", () => {
      const sansFlash = { GEMINI_API_KEY: "fallback", GEMINI_PRO_KEY: "pro" };
      expect(geminiKeyFor("gemini-3.6-flash", sansFlash)).toBe("fallback");

      const sansPro = { GEMINI_API_KEY: "fallback", GEMINI_FLASH_KEY: "flash" };
      expect(geminiKeyFor("gemini-3.6-pro", sansPro)).toBe("fallback");
    });

    test("repli sur l'autre clé dédiée si la commune manque aussi", () => {
      expect(geminiKeyFor("gemini-3.6-flash", { GEMINI_PRO_KEY: "pro" })).toBe("pro");
    });

    test("les clés vides ou blanches sont ignorées", () => {
      expect(geminiKeyFor("gemini-3.6-flash", { GEMINI_API_KEY: "   " })).toBeNull();
      expect(geminiKeyFor("gemini-3.6-pro", {})).toBeNull();
    });
  });

  describe("Routes IA — clé réellement utilisée", () => {
    test("/api/gemini avec un modèle pro utilise la clé pro", async () => {
      const res = await request(app)
        .post("/api/gemini")
        .set(authHeaders())
        .send({ prompt: "Bonjour", model: "gemini-3.6-pro" });
      expect(res.status).toBe(200);
      expect(mockClientKeys.at(-1)).toBe("pro-test-key");
    });

    test("/api/gemini avec un modèle flash utilise la clé flash", async () => {
      const res = await request(app)
        .post("/api/gemini")
        .set(authHeaders())
        .send({ prompt: "Bonjour", model: "gemini-3.6-flash" });
      expect(res.status).toBe(200);
      expect(mockClientKeys.at(-1)).toBe("flash-test-key");
    });

    test("/api/gemini sans modèle utilise la clé flash par défaut", async () => {
      const res = await request(app)
        .post("/api/gemini")
        .set(authHeaders())
        .send({ prompt: "Bonjour" });
      expect(res.status).toBe(200);
      expect(mockClientKeys.at(-1)).toBe("flash-test-key");
    });

    test("/api/gemini avec un modèle inconnu retombe sur la clé commune", async () => {
      const res = await request(app)
        .post("/api/gemini")
        .set(authHeaders())
        .send({ prompt: "Bonjour", model: "modele-maison" });
      expect(res.status).toBe(200);
      expect(mockClientKeys.at(-1)).toBe("fallback-test-key");
    });

    test("clé flash absente : repli sur la clé commune", async () => {
      const flashKey = process.env.GEMINI_FLASH_KEY;
      delete process.env.GEMINI_FLASH_KEY;
      try {
        const res = await request(app)
          .post("/api/gemini")
          .set(authHeaders())
          .send({ prompt: "Bonjour", model: "gemini-3.6-flash" });
        expect(res.status).toBe(200);
        expect(mockClientKeys.at(-1)).toBe("fallback-test-key");
      } finally {
        process.env.GEMINI_FLASH_KEY = flashKey;
      }
    });

    test("/api/ai/translate utilise la clé flash", async () => {
      const res = await request(app)
        .post("/api/ai/translate")
        .set(authHeaders())
        .send({ text: "Bonjour" });
      expect(res.status).toBe(200);
      expect(mockClientKeys.at(-1)).toBe("flash-test-key");
    });

    test("/api/ai/stream utilise la clé flash", async () => {
      const res = await request(app)
        .post("/api/ai/stream")
        .set(authHeaders())
        .send({ prompt: "Bonjour" });
      expect(res.status).toBe(200);
      expect(res.text).toContain("Bonjour");
      expect(mockClientKeys.at(-1)).toBe("flash-test-key");
    });

    test("aucune clé configurée -> 500 explicite", async () => {
      const saved = {
        GEMINI_FLASH_KEY: process.env.GEMINI_FLASH_KEY,
        GEMINI_PRO_KEY: process.env.GEMINI_PRO_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      };
      delete process.env.GEMINI_FLASH_KEY;
      delete process.env.GEMINI_PRO_KEY;
      delete process.env.GEMINI_API_KEY;
      try {
        const res = await request(app)
          .post("/api/gemini")
          .set(authHeaders())
          .send({ prompt: "Bonjour", model: "gemini-3.6-pro" });
        expect(res.status).toBe(500);
        expect(res.body.error).toContain("GEMINI_FLASH_KEY");
        expect(res.body.error).toContain("GEMINI_PRO_KEY");
      } finally {
        Object.assign(process.env, saved);
      }
    });
  });
});
