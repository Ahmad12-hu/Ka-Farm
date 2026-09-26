// KA Farm - API Client Service (Fullstack bridging layer)
// ------------------------------------------------------------------
// ✅ 100% additif : ce fichier est NOUVEAU et n'est importé nulle part
//    automatiquement. Le brancher est un choix opt-in (voir plus bas).
//
// Rôle : fournir une couche d'accès à l'API backend (`/api/*`) depuis le
//    frontend, avec TOUJOURS une dégradation gracieuse :
//    - si le serveur est absent / renvoie une erreur réseau → on ne plante pas,
//      on retourne `null` et le code local (localStorage) continue de marcher ;
//    - le token d'auth est envoyé SEULEMENT s'il existe (jamais inventé).
//
// Pour NE PAS casser le fonctionnement actuel, ce module n'intercepte rien :
// il expose des aides. Le frontend continue de fonctionner en local par défaut.
// ------------------------------------------------------------------

/**
 * Récupère un éventuel token d'authentification stocké localement.
 * Retourne `null` si aucun token n'est présent (mode local inchangé).
 * @returns {string|null}
 */
export function getAuthToken() {
  try {
    if (typeof localStorage === "undefined") return null;
    // Emplacements candidats (l'architecture cible documente `kafarm_token`).
    const token =
      localStorage.getItem("kafarm_token") ||
      localStorage.getItem("ka_farm_token");
    return token && typeof token === "string" && token.trim() ? token.trim() : null;
  } catch {
    return null; // Dégradation gracieuse : jamais d'erreur.
  }
}

/**
 * Effectue une requête fetch vers l'API avec gestion d'erreur sécurisée et
 * token optionnel.
 *
 * @param {string} path      chemin API, ex. "/api/crops"
 * @param {object} [options] options fetch (method, body, headers...)
 * @returns {Promise<object|null>} réponse JSON, ou `null` en cas d'échec
 *    réseau / non-2xx (le code appelant doit alors retomber sur le local).
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...(options.headers || {}) };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body !== "string") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutMs = options.timeoutMs || 15000;
    const timer = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

    const response = await fetch(path, {
      ...options,
      method,
      headers,
      signal: controller ? controller.signal : options.signal,
    });

    if (timer) clearTimeout(timer);

    // Non-2xx → on retourne null (pas de crash), le caller décide du fallback.
    if (!response.ok) {
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        /* réponse non-JSON (ex. 503) ignorée */
      }
      console.warn(`[APIClient] ${method} ${path} -> ${response.status}`, payload);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return { ok: true };
  } catch (err) {
    // Erreur réseau / timeout / hors-ligne : dégradation gracieuse.
    console.warn(`[APIClient] Échec ${method} ${path} (réseau) :`, err.message || err);
    return null;
  }
}

/**
 * Envoie une opération de synchronisation à l'API (`POST /api/sync`).
 * Best-effort : retourne `true`/`false` sans jamais lever d'exception.
 *
 * @param {object} action { type: 'SAVE'|'DELETE', collection, data, id?, enterpriseId? }
 * @returns {Promise<boolean>} succès
 */
export async function pushToServer(action) {
  try {
    const result = await apiFetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(action),
    });
    return !!result && result.ok === true;
  } catch {
    return false;
  }
}

/**
 * Helper pratique : lire une collection depuis le serveur avec fallback local.
 * @param {string} collection ex. "crops"
 * @param {*} fallback valeur locale à utiliser si le serveur est indisponible
 */
export async function fetchCollection(collection, fallback = []) {
  const data = await apiFetch(`/api/${encodeURIComponent(collection)}`);
  return Array.isArray(data) ? data : fallback;
}

// Export global (optionnel) pour un usage via <script> dans les pages MPA.
if (typeof window !== "undefined") {
  window.apiClient = {
    getAuthToken,
    apiFetch,
    pushToServer,
    fetchCollection,
  };
}