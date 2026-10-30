// Régression déploiement Vercel : la fonction /api doit démarrer en production
// même sans JWT_SECRET (le frontend n'utilise que les ID tokens Firebase), et
// la réécriture doit viser la route réelle de la fonction (« /api »).
//
// Constat du 2026-10-30 : https://ka-farm.vercel.app/api renvoyait
// FUNCTION_INVOCATION_FAILED (garde JWT_SECRET au chargement du module) et
// /api/* renvoyait NOT_FOUND (destination de rewrite « /api/index.js »).

const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const JEST_TIMEOUT = 60000;

function bootInProduction(env) {
  const script =
    "import('./api/index.js')" +
    ".then(() => console.log('BOOT_OK'))" +
    ".catch((e) => console.log('BOOT_CRASH:' + e.message));";
  return spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: ROOT,
    env,
    encoding: "utf8",
    timeout: JEST_TIMEOUT - 5000,
  });
}

function productionEnv(overrides = {}) {
  const env = { ...process.env };
  delete env.JWT_SECRET;
  return {
    ...env,
    NODE_ENV: "production",
    VERCEL_ENV: "production",
    ...overrides,
  };
}

describe("api/index.js en production", () => {
  test(
    "démarre sans JWT_SECRET (authentification Firebase uniquement)",
    () => {
      const result = bootInProduction(productionEnv());
      expect(result.stderr).not.toMatch(/Refusing to start/);
      expect(result.stdout).toContain("BOOT_OK");
    },
    JEST_TIMEOUT
  );
});

describe("vercel.json", () => {
  const config = require("../vercel.json");

  test("réécrit /api/* vers la route réelle de la fonction", () => {
    const rewrite = config.rewrites.find((r) => r.source.startsWith("/api/"));
    expect(rewrite).toBeDefined();
    expect(rewrite.destination).toBe("/api");
    // Un chemin de fichier (« /api/index.js ») ne résout pas côté Vercel.
    expect(rewrite.destination).not.toMatch(/\.js$/);
  });
});
