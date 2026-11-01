// KA Farm - Tests du module de validation partagé (api-validation.js)
// utilisé par le serveur de dev (server.js) et l'API de production.

const {
  validateBody,
  MessageSchema,
  CropSchema,
  ParcelleSchema,
  StocksPayloadSchema,
  TreatmentSchema,
  AiRequestSchema,
} = require("../js/modules/api-validation.js");

function mockRes() {
  return {
    statusCode: 200,
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (body) {
      this.body = body;
      return this;
    }),
  };
}

describe("Module api-validation partagé", () => {
  describe("validateBody()", () => {
    test("charge utile invalide -> 400 avec details, next non appelé", () => {
      const req = { body: { name: "Sans id" } };
      const res = mockRes();
      const next = jest.fn();

      validateBody(CropSchema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toBe("Données invalides");
      expect(res.body.details.some((d) => d.field === "id")).toBe(true);
      expect(next).not.toHaveBeenCalled();
    });

    test("charge utile valide -> next appelé et req.body parsé", () => {
      const req = { body: { id: "C-1", name: "Tomate", champLibre: "conservé" } };
      const res = mockRes();
      const next = jest.fn();

      validateBody(CropSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toMatchObject({ id: "C-1", name: "Tomate" });
      expect(req.body.champLibre).toBe("conservé");
    });

    test("body absent -> 400 (pas de crash)", () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      validateBody(CropSchema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Parité dev/prod (identifiants libres)", () => {
    test("ParcelleSchema accepte les ids non-UUID du frontend", () => {
      expect(ParcelleSchema.safeParse({ id: "P-001", name: "Parcelle Nord" }).success).toBe(true);
    });
  });

  describe("Schémas métier", () => {
    test("MessageSchema refuse un email invalide", () => {
      const result = MessageSchema.safeParse({ senderEmail: "pas-un-email", text: "Salut" });
      expect(result.success).toBe(false);
    });

    test("MessageSchema refuse un texte vide", () => {
      const result = MessageSchema.safeParse({ senderEmail: "a@b.sn", text: "" });
      expect(result.success).toBe(false);
    });

    test("StocksPayloadSchema accepte un tableau vide et refuse un stock sans id", () => {
      expect(StocksPayloadSchema.safeParse({ stocks: [] }).success).toBe(true);
      expect(StocksPayloadSchema.safeParse({ stocks: [{ name: "Engrais" }] }).success).toBe(false);
    });

    test("TreatmentSchema accepte productName (camelCase) et product_name (legacy)", () => {
      expect(TreatmentSchema.safeParse({ id: "TR-1", productName: "Neem" }).success).toBe(true);
      expect(TreatmentSchema.safeParse({ id: "TR-1", product_name: "Neem" }).success).toBe(true);
      expect(TreatmentSchema.safeParse({ id: "TR-1" }).success).toBe(false);
    });

    test("AiRequestSchema exige un prompt non vide", () => {
      expect(AiRequestSchema.safeParse({ prompt: "" }).success).toBe(false);
      expect(
        AiRequestSchema.safeParse({ prompt: "Bonjour", history: [{ role: "user", text: "x" }] })
          .success
      ).toBe(true);
    });
  });
});
