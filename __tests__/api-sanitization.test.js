// KA Farm - Tests de sanitisation des chaînes (Phase 1 sécurité).
// Les entrées texte sont nettoyées à la frontière API : espaces superflus,
// caractères de contrôle, balises HTML, longueurs maximales.
// Le mot de passe et les images base64 ne sont jamais transformés.
// Harnais de mocks identique à api-validation.test.js.

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
    userId: "USR-SAN",
    email: "san@ka-farm.sn",
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
const {
  sanitizeText,
  CropSchema,
  TaskSchema,
  TreatmentSchema,
  MessageSchema,
  LoginSchema,
  AiRequestSchema,
} = require("../js/modules/api-validation.js");

function authHeaders(role = "admin") {
  jwt.verify.mockReturnValue({
    userId: "USR-SAN",
    email: "san@ka-farm.sn",
    role,
    enterpriseId: "ka_farm",
  });
  return { Authorization: "Bearer test-token" };
}

describe("Sanitisation des chaînes", () => {
  describe("sanitizeText()", () => {
    test("retire les espaces de début et de fin", () => {
      expect(sanitizeText("   Tomate  ")).toBe("Tomate");
    });

    test("retire les caractères de contrôle", () => {
      expect(sanitizeText("To\u0000ma\u0007te")).toBe("Tomate");
    });

    test("conserve les retours à la ligne et tabulations internes", () => {
      expect(sanitizeText("Ligne 1\nLigne\t2")).toBe("Ligne 1\nLigne\t2");
    });

    test("retire les balises HTML en gardant le texte", () => {
      expect(sanitizeText("Tomate <script>alert(1)</script>")).toBe("Tomate alert(1)");
      expect(sanitizeText("<b>Parcelle</b> Nord")).toBe("Parcelle Nord");
    });

    test("préserve les chevrons qui ne sont pas des balises", () => {
      expect(sanitizeText("Sacs < 5 000 F")).toBe("Sacs < 5 000 F");
    });
  });

  describe("Schémas — champs déclarés", () => {
    test("CropSchema nettoie id et name", () => {
      const crop = CropSchema.parse({
        id: "  C-XSS  ",
        name: "  Tomate <script>alert(1)</script>  ",
      });
      expect(crop.id).toBe("C-XSS");
      expect(crop.name).toBe("Tomate alert(1)");
    });

    test("un nom vide après nettoyage est refusé", () => {
      const result = CropSchema.safeParse({ id: "C-1", name: " <b></b> " });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toEqual(["name"]);
    });

    test("longueur maximale appliquée après nettoyage", () => {
      const ok = TaskSchema.safeParse({ id: "T-1", title: "a".repeat(255) });
      const tooLong = TaskSchema.safeParse({ id: "T-1", title: "a".repeat(256) });
      expect(ok.success).toBe(true);
      expect(tooLong.success).toBe(false);
      expect(tooLong.error.issues[0].message).toContain("trop long");
    });

    test("TreatmentSchema nettoie les notes et laisse passer les champs libres", () => {
      const treatment = TreatmentSchema.parse({
        id: "TR-1",
        product_name: "Neem",
        notes: "  <i>Appliquer</i> le soir  ",
        quantityUsed: 2,
      });
      expect(treatment.notes).toBe("Appliquer le soir");
      expect(treatment.quantityUsed).toBe(2);
    });

    test("MessageSchema trime l'email et nettoie le texte", () => {
      const message = MessageSchema.parse({
        senderEmail: "  san@ka-farm.sn  ",
        text: "  <div>Bonjour</div>  ",
      });
      expect(message.senderEmail).toBe("san@ka-farm.sn");
      expect(message.text).toBe("Bonjour");
    });

    test("LoginSchema ne touche jamais au mot de passe", () => {
      const login = LoginSchema.parse({
        email: "  san@ka-farm.sn  ",
        password: "  secret  ",
      });
      expect(login.email).toBe("san@ka-farm.sn");
      expect(login.password).toBe("  secret  ");
    });

    test("AiRequestSchema laisse l'image base64 intacte", () => {
      const image = "data:image/png;base64,iVBORw0KGgo=";
      const ai = AiRequestSchema.parse({ prompt: "  Diagnostic  ", image });
      expect(ai.prompt).toBe("Diagnostic");
      expect(ai.image).toBe(image);
    });
  });

  describe("API — écritures sanitisées", () => {
    test("POST /api/crops stocke un nom nettoyé", async () => {
      const res = await request(app).post("/api/crops").set(authHeaders()).send({
        id: "C-XSS",
        name: "  Tomate <script>alert(1)</script>  ",
      });
      expect(res.status).toBe(200);
      expect(res.body.crop.name).toBe("Tomate alert(1)");
      expect(res.body.crop.id).toBe("C-XSS");
    });

    test("PUT /api/crops/:id nettoie le patch", async () => {
      await request(app)
        .post("/api/crops")
        .set(authHeaders())
        .send({ id: "C-PUT", name: "Tomate" });

      const res = await request(app)
        .put("/api/crops/C-PUT")
        .set(authHeaders())
        .send({ name: "  <b>Gombo</b>  " });
      expect(res.status).toBe(200);
      expect(res.body.crop.name).toBe("Gombo");
    });

    test("POST /api/treatments refuse un produit vide après nettoyage", async () => {
      const res = await request(app)
        .post("/api/treatments")
        .set(authHeaders())
        .send({ id: "TR-VIDE", product_name: " <b> </b> " });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d) => d.field === "product_name")).toBe(true);
    });
  });
});
