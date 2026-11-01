// Choix de la clé Gemini selon la famille de modèle demandée, partagé par
// l'API de production (api/index.js) et le serveur de développement (server.js).
// GEMINI_FLASH_KEY / GEMINI_PRO_KEY permettent d'isoler les quotas ;
// GEMINI_API_KEY sert de repli commun quand la clé dédiée manque.

export const GEMINI_KEYS_MISSING_ERROR =
  "Aucune clé Gemini configurée (GEMINI_API_KEY, GEMINI_FLASH_KEY ou GEMINI_PRO_KEY)";

function readKey(env, name) {
  const value = env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function geminiKeyFor(model, env = process.env) {
  const name = String(model || "").toLowerCase();
  const flash = readKey(env, "GEMINI_FLASH_KEY");
  const pro = readKey(env, "GEMINI_PRO_KEY");
  const fallback = readKey(env, "GEMINI_API_KEY");

  if (name.includes("pro")) return pro || fallback || flash;
  if (name.includes("flash")) return flash || fallback || pro;
  return fallback || flash || pro;
}

export function createGeminiClientFactory(GoogleGenAI, env = process.env) {
  return (model) => {
    const apiKey = geminiKeyFor(model, env);
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };
}
