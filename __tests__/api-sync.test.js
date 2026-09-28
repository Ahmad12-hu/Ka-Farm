// KA Farm - Tests d'intégration des routes de synchronisation (Phase 1 Fullstack)
// Vérifie le comportement best-effort : ne jamais casser le frontend même
// si Firestore est indisponible (dégradation gracieuse).

// Polyfill requis par superagent/cuid2 dans certains environnements Node.
if (typeof globalThis.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Polyfill ReadableStream/WritableStream (exigé par @google/genai en isolation).
if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream = require("stream/web").ReadableStream;
}
if (typeof globalThis.WritableStream === "undefined") {
  globalThis.WritableStream = require("stream/web").WritableStream;
}
if (typeof globalThis.TransformStream === "undefined") {
  globalThis.TransformStream = require("stream/web").TransformStream;
}

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(() => ({
    userId: "USR-001",
    email: "amadou@ka-farm.sn",
    role: "admin",
    enterpriseId: "ka_farm",
  })),
}));

const request = require("supertest");

const authHeaders = { Authorization: "Bearer test-token" };

describe("Sync API Routes (additive)", () => {
  const app = require("../api/index.js").default;

  test("GET /api/health répond ok sans auth", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.status).toBe("up");
  });

  test("POST /api/sync/item collection inconnue -> 400 sans crash", async () => {
    const response = await request(app)
      .post("/api/sync/item")
      .set(authHeaders)
      .send({ collection: "inconnue", type: "SAVE", data: [] });
    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
  });

  test("POST /api/sync/item SAVE valide -> ok (avec ou sans Firestore)", async () => {
    const response = await request(app)
      .post("/api/sync/item")
      .set(authHeaders)
      .send({ collection: "crops", type: "SAVE", data: [{ id: "C-TEST", name: "Test" }] });
    // Best-effort : on accepte ok:true, que la persistance ait réussi ou non.
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect("persisted" in response.body).toBe(true);
  });

  test("POST /api/sync batch valide -> ok avec results", async () => {
    const response = await request(app).post("/api/sync").set(authHeaders).send({
      actions: [
        { collection: "tasks", type: "SAVE_ALL", data: [{ id: "T-TEST", title: "T" }] },
        { collection: "X", type: "SAVE_ALL", data: [] },
      ],
    });
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(Array.isArray(response.body.results)).toBe(true);
    expect(response.body.results.length).toBe(2);
  });

  test("POST /api/sync sans actions -> 400 sans crash", async () => {
    const response = await request(app).post("/api/sync").set(authHeaders).send({});
    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
  });
});