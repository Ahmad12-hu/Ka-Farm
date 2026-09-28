// KA Farm - Tests de régression des validateurs d'authentification
// ------------------------------------------------------------------
// Corrige le bug d'inscription silencieuse : le formulaire (signup.html)
// omettait les champs `enterpriseName` et `confirmPassword` que le validateur
// SignupSchema exige. validateSignup échouait donc SILENCIEUSEMENT (les champs
// d'erreur n'existaient pas non plus dans le HTML) → "rien ne se passe".
// Ces tests verrouillent le comportement du validateur.
// ------------------------------------------------------------------

import { validateSignup } from "../js/modules/validators.js";

const validFields = {
  name: "Seydou Ndiaye",
  email: "seydou@gmail.com",
  role: "Terrain",
  enterpriseName: "Ferme Agro-Ecolo KA",
  password: "seydou123",
  confirmPassword: "seydou123",
};

describe("validateSignup", () => {
  test("accepte les 6 champs attendus par le formulaire (régression bug inscription)", () => {
    const result = validateSignup(validFields);
    expect(result.success).toBe(true);
    expect(result.errors).toBeNull();
    expect(result.data.enterpriseName).toBe("Ferme Agro-Ecolo KA");
  });

  test("échoue si enterpriseName est manquant (ancien bug : champ absent du HTML)", () => {
    const { enterpriseName: _omit, ...rest } = validFields;
    const result = validateSignup(rest);
    expect(result.success).toBe(false);
    result.errors.forEach((err) => expect(err.field).toBe("enterpriseName"));
  });

  test("échoue si confirmPassword est manquant (ancien bug : champ absent du HTML)", () => {
    const { confirmPassword: _omit, ...rest } = validFields;
    const result = validateSignup(rest);
    expect(result.success).toBe(false);
    const badField = result.errors.map((err) => err.field);
    expect(badField).toContain("confirmPassword");
  });

  test("échoue si les mots de passe ne correspondent pas", () => {
    const result = validateSignup({ ...validFields, confirmPassword: "different123" });
    expect(result.success).toBe(false);
    expect(result.errors.map((err) => err.field)).toContain("confirmPassword");
  });

  test("échoue si le mot de passe est trop court (< 6 caractères)", () => {
    const result = validateSignup({ ...validFields, password: "12345", confirmPassword: "12345" });
    expect(result.success).toBe(false);
    expect(result.errors.map((err) => err.field)).toContain("password");
  });
});