import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId provided in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const KEY_MAP = {
  'ka_farm_crops': 'crops',
  'ka_farm_nurseries': 'nurseries',
  'ka_farm_stocks': 'stocks',
  'ka_farm_tasks': 'tasks',
  'ka_farm_finances': 'finances',
  'ka_farm_parcelles': 'parcelles',
  'ka_farm_users': 'users',
  'ka_farm_employees': 'employees',
  'ka_farm_attendance': 'attendance',
  'ka_farm_employee_payments': 'employee_payments',
  'ka_farm_cheptel': 'cheptel',
  'ka_farm_elevage_production': 'elevage_production',
  'ka_farm_elevage_health': 'elevage_health',
  'ka_farm_messages': 'messages'
};

export const KAFirebaseSync = {
  db,
  
  // Save a key-value collection to Firestore
  async saveToCloud(key, value) {
    const docId = KEY_MAP[key];
    if (!docId) return;
    try {
      // Filter out any undefined or empty fields to prevent Firestore serialization errors
      const sanitized = JSON.parse(JSON.stringify(value));
      await setDoc(doc(db, "app_data", docId), { data: sanitized, updatedAt: new Date().toISOString() });
      console.log(`[Firebase Sync] Enregistrement réussi de ${key} sur Firestore.`);
    } catch (error) {
      console.error(`[Firebase Sync] Erreur lors de l'enregistrement de ${key} sur Firestore:`, error);
    }
  },

  // Initialize and pull/push data from/to cloud
  async initSync(onUpdateCallback) {
    console.log("[Firebase Sync] Initialisation de la synchronisation en temps réel...");
    
    Object.entries(KEY_MAP).forEach(([localKey, docId]) => {
      const docRef = doc(db, "app_data", docId);
      
      // Real-time snapshot listener
      onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data().data;
          const localDataStr = localStorage.getItem(localKey);
          const cloudDataStr = JSON.stringify(cloudData);
          
          if (localDataStr !== cloudDataStr) {
            console.log(`[Firebase Sync] Mise à jour de ${localKey} depuis le cloud.`);
            localStorage.setItem(localKey, cloudDataStr);
            if (onUpdateCallback) {
              onUpdateCallback(localKey, cloudData);
            }
          }
        } else {
          // Document does not exist in Firestore yet, seed it with the local defaults
          const localData = localStorage.getItem(localKey);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              await setDoc(docRef, { data: parsed, updatedAt: new Date().toISOString() });
              console.log(`[Firebase Sync] Initialisation du document ${docId} sur Firestore avec les données locales.`);
            } catch (e) {
              console.error(`[Firebase Sync] Erreur d'initialisation de ${localKey} sur Firestore:`, e);
            }
          }
        }
      }, (error) => {
        console.error(`[Firebase Sync] Erreur d'écoute pour le document ${docId}:`, error);
      });
    });
  }
};
