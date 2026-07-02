import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
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

// Unique ID builder helper for each record in a collection
function getItemId(key, item) {
  if (item.id) return String(item.id);
  if (key === 'ka_farm_attendance' && item.employeeId && item.date) {
    return `${item.employeeId}_${item.date}`;
  }
  if (key === 'ka_farm_users' && item.email) {
    return item.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  // Fallback: stable hash or random
  return Math.random().toString(36).substring(2, 11);
}

// Order preservation sorting helper
function sortItems(key, items) {
  if (key === 'ka_farm_messages') {
    return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
  if (key === 'ka_farm_finances') {
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  if (key === 'ka_farm_crops' || key === 'ka_farm_tasks' || key === 'ka_farm_parcelles') {
    return items.sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
  }
  // Default sort by ID if available
  return items.sort((a, b) => {
    if (a.id && b.id) return String(a.id).localeCompare(String(b.id));
    return 0;
  });
}

export const KAFirebaseSync = {
  db,
  
  // Save an array collection to Firestore using individual documents
  async saveToCloud(key, value) {
    const collectionName = KEY_MAP[key];
    if (!collectionName) return;
    try {
      // Deep clone and clean the values to prevent Firestore serialization errors
      const sanitized = JSON.parse(JSON.stringify(value));
      if (!Array.isArray(sanitized)) return;

      console.log(`[Firebase Sync] Début de l'enregistrement de ${key} (${sanitized.length} éléments) dans la collection Firestore '${collectionName}'...`);
      
      const localIds = new Set();
      
      // 1. Upsert all current items to their own documents
      for (const item of sanitized) {
        const itemId = getItemId(key, item);
        localIds.add(itemId);
        await setDoc(doc(db, collectionName, itemId), item);
      }
      
      // 2. Query Firestore and delete any documents that no longer exist in the local array
      const querySnapshot = await getDocs(collection(db, collectionName));
      for (const docSnap of querySnapshot.docs) {
        if (!localIds.has(docSnap.id)) {
          console.log(`[Firebase Sync] Suppression de l'élément obsolète ${docSnap.id} de la collection '${collectionName}'`);
          await deleteDoc(doc(db, collectionName, docSnap.id));
        }
      }
      
      console.log(`[Firebase Sync] Synchronisation réussie de ${key} avec Firestore.`);
    } catch (error) {
      console.error(`[Firebase Sync] Erreur lors de la synchronisation de ${key} sur Firestore:`, error);
    }
  },

  // Initialize and pull/push data from/to cloud using true collection listeners
  async initSync(onUpdateCallback) {
    console.log("[Firebase Sync] Initialisation de la synchronisation en temps réel (vrais documents)...");
    
    Object.entries(KEY_MAP).forEach(([localKey, collectionName]) => {
      const collRef = collection(db, collectionName);
      
      // Real-time collection snapshot listener
      onSnapshot(collRef, async (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((doc) => {
            items.push(doc.data());
          });
          
          // Sort items to keep visual order clean
          const sortedItems = sortItems(localKey, items);
          
          const localDataStr = localStorage.getItem(localKey);
          const cloudDataStr = JSON.stringify(sortedItems);
          
          if (localDataStr !== cloudDataStr) {
            console.log(`[Firebase Sync] Mise à jour en temps réel de ${localKey} depuis la collection Firestore '${collectionName}'.`);
            localStorage.setItem(localKey, cloudDataStr);
            if (onUpdateCallback) {
              onUpdateCallback(localKey, sortedItems);
            }
          }
        } else {
          // Collection is empty on Firestore. Seed it with local default data!
          const localData = localStorage.getItem(localKey);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log(`[Firebase Sync] Collection '${collectionName}' vide sur Firestore. Remplissage initial avec ${parsed.length} éléments locaux...`);
                for (const item of parsed) {
                  const itemId = getItemId(localKey, item);
                  await setDoc(doc(db, collectionName, itemId), item);
                }
              }
            } catch (e) {
              console.error(`[Firebase Sync] Erreur lors du peuplement initial de la collection '${collectionName}':`, e);
            }
          }
        }
      }, (error) => {
        console.error(`[Firebase Sync] Erreur d'écoute en temps réel pour la collection '${collectionName}':`, error);
      });
    });
  }
};

