// KA Farm - Firebase App & Auth (client SDK)
// ------------------------------------------------------------------
// ⚠️ 100% additif : ce module n'est encore importé NULLE PART (phase 2 de la
//    migration Firebase Auth). Il ne change donc RIEN au fonctionnement actuel.
//
// Rôle : centraliser l'initialisation Firebase côté client (App + Auth) à partir
//    de la config web publique (firebase-applet-config.json, projet ka-farm-prod).
//    La config web est publique par nature (clé API exposée côté client),
//    elle n'est PAS un secret serveur.
//
// Utilisation (export nommés recommandés) :
//    import { auth, app } from "../firebase/firebase.js";
//    const token = await getIdToken(auth);   // ID token à envoyer en Bearer
//
// Note App Check : Firebase v9+ émet un avertissement console si aucun provider
//    App Check n'est configuré (fpsOpen). Ce n'est pas bloquant : l'auth reste
//    fonctionnelle. L'activation d'App Check est hors scope de cette migration.
// ------------------------------------------------------------------

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Réinitialisation sûre : si une app Firebase existe déjà (ex. HMR, double
// import dans la même page), la réutiliser évite l'erreur
// "Firebase App named '[DEFAULT]' already exists".
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Instance Auth dédiée à cette app (single source de vérité pour le flux connexion).
const auth = getAuth(app);

export { app, auth, firebaseConfig };
export default auth;
