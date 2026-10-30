// Polyfill TextEncoder pour l'environnement de test jsdom
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

// jwt local : renvoie toujours un utilisateur admin du tenant ka_farm.
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => ({
    userId: "USR-001",
    email: "amadou@ka-farm.sn",
    role: "admin",
    enterpriseId: "ka_farm",
  })),
  sign: jest.fn(),
}));

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]" })),
  cert: jest.fn(() => ({ projectId: "ka-farm-test" })),
}));

// Firestore à état : modèle « un document par entité » + doc tableau hérité.
jest.mock("firebase-admin/firestore", () => {
  const store = new Map();

  const makeDocRef = (path, id) => ({
    id,
    get: jest.fn(() =>
      Promise.resolve(
        store.has(path) ? { exists: true, id, data: () => store.get(path) } : { exists: false, id }
      )
    ),
    set: jest.fn((data) => {
      store.set(path, data);
      return Promise.resolve();
    }),
    delete: jest.fn(() => {
      store.delete(path);
      return Promise.resolve();
    }),
    collection: jest.fn((name) => makeCollection(`${path}/${name}`)),
  });

  const makeCollection = (prefix) => ({
    doc: jest.fn((id) => makeDocRef(`${prefix}/${id}`, id)),
    get: jest.fn(() =>
      Promise.resolve({
        docs: [...store.keys()]
          .filter(
            (k) => k.startsWith(prefix + "/") && !k.slice(prefix.length + 1).includes("/")
          )
          .map((k) => ({
            id: k.slice(prefix.length + 1),
            data: () => store.get(k),
            ref: {
              delete: jest.fn(() => {
                store.delete(k);
                return Promise.resolve();
              }),
            },
          })),
      })
    ),
  });

  return {
    getFirestore: jest.fn(() => ({ collection: jest.fn((name) => makeCollection(name)) })),
    __store: store,
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
const { __store: store } = require("firebase-admin/firestore");

const auth = { Authorization: "Bearer test-token" };
const CROPS_PREFIX = "app_data/ka_farm/crops";

beforeEach(() => {
  store.clear();
});

describe("Modèle Firestore « un document par entité »", () => {
  test("repli legacy puis migration paresseuse au premier write (sans perte)", async () => {
    store.set(`${CROPS_PREFIX}/data`, {
      data: [{ id: "C-101", name: "Héritée" }],
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const before = await request(app).get("/api/crops").set(auth);
    expect(before.status).toBe(200);
    expect(before.body.map((c) => c.id)).toEqual(["C-101"]);

    const created = await request(app)
      .post("/api/crops")
      .set(auth)
      .send({ id: "C-202", name: "Nouvelle" });
    expect(created.status).toBe(200);

    const after = await request(app).get("/api/crops").set(auth);
    expect(after.body.map((c) => c.id).sort()).toEqual(["C-101", "C-202"]);
    // Le doc tableau hérité a été supprimé et un marqueur posé.
    expect(store.has(`${CROPS_PREFIX}/data`)).toBe(false);
    expect(store.has(`${CROPS_PREFIX}/__meta`)).toBe(true);
  });

  test("PUT et DELETE opèrent sur une entité stockée côté Firestore", async () => {
    await request(app).post("/api/crops").set(auth).send({ id: "C-303", name: "À modifier" });

    const updated = await request(app)
      .put("/api/crops/C-303")
      .set(auth)
      .send({ status: "Floraison" });
    expect(updated.status).toBe(200);
    expect(updated.body.crop.name).toBe("À modifier");
    expect(updated.body.crop.status).toBe("Floraison");
    expect(store.get(`${CROPS_PREFIX}/C-303`).status).toBe("Floraison");

    const deleted = await request(app).delete("/api/crops/C-303").set(auth);
    expect(deleted.status).toBe(200);
    expect(store.has(`${CROPS_PREFIX}/C-303`)).toBe(false);
  });

  test("PUT renvoie 404 pour une entité inexistante", async () => {
    const response = await request(app)
      .put("/api/crops/INCONNU")
      .set(auth)
      .send({ name: "Test" });
    expect(response.status).toBe(404);
  });
});
