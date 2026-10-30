// Tests : les appels IA du frontend envoient bien le jeton Firebase.
//
// Contexte : /api/gemini et /api/ai/* sont protégés par requireAuth. Sans
// en-tête `Authorization: Bearer <idToken>`, ils répondent 401 « Token requis ».
// Ces tests verrouillent (1) la construction d'en-têtes dans api-client.js et
// (2) l'usage effectif de `authHeaders()` par AIService.

jest.mock("../js/modules/logger.js", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("../js/modules/error-handler.js", () => ({
  ErrorHandler: { showToast: jest.fn() },
}));

jest.mock("../js/storage.js", () => ({
  KAStorage: {
    getCrops: () => [],
    getCheptel: () => [],
    getElevageProduction: () => [],
    getFinances: () => [],
    getParcelles: () => [],
  },
}));

const { authHeaders, getAuthToken } = require("../js/services/api-client.js");
const { AIService } = require("../js/modules/ai-service.js");

function okResponse(payload) {
  return { ok: true, status: 200, json: async () => payload };
}

describe("authHeaders", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("aucun jeton stocké → aucune en-tête Authorization", () => {
    expect(getAuthToken()).toBeNull();
    expect(authHeaders({ "Content-Type": "application/json" })).toEqual({
      "Content-Type": "application/json",
    });
  });

  test("jeton kafarm_token présent → Bearer ajouté", () => {
    localStorage.setItem("kafarm_token", "tok-123");
    expect(authHeaders({ "Content-Type": "application/json" })).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer tok-123",
    });
  });

  test("ancien emplacement ka_farm_token encore accepté", () => {
    localStorage.setItem("ka_farm_token", "legacy-456");
    expect(authHeaders()["Authorization"]).toBe("Bearer legacy-456");
  });

  test("jeton vide ou espaces → ignoré", () => {
    localStorage.setItem("kafarm_token", "   ");
    expect(authHeaders()).not.toHaveProperty("Authorization");
  });

  test("les en-têtes fournis ne sont pas modifiés sur place", () => {
    localStorage.setItem("kafarm_token", "tok-123");
    const extra = { "Content-Type": "application/json" };
    authHeaders(extra);
    expect(extra).toEqual({ "Content-Type": "application/json" });
  });
});

describe("AIService envoie le jeton aux routes protégées", () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    AIService.clearCache();
  });

  test("ask() → POST /api/gemini avec Authorization", async () => {
    localStorage.setItem("kafarm_token", "tok-abc");
    fetchMock.mockResolvedValue(okResponse({ text: "Bonjour" }));

    const result = await AIService.ask({ prompt: "Comment planter l'oignon ?" });

    expect(result).toEqual({ text: "Bonjour", provider: "gemini" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/gemini");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer tok-abc");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  test("ask() sans jeton → pas d'Authorization (preuve que le test mord)", async () => {
    fetchMock.mockResolvedValue(okResponse({ text: "Bonjour" }));

    await AIService.ask({ prompt: "Quel compost pour la tomate ?" });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  test("askStreaming() → POST /api/ai/stream avec Authorization", () => {
    localStorage.setItem("kafarm_token", "tok-sse");
    fetchMock.mockResolvedValue(okResponse({}));

    AIService.askStreaming({ prompt: "Irrigation goutte-à-goutte ?" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai/stream");
    expect(options.headers.Authorization).toBe("Bearer tok-sse");
  });
});
