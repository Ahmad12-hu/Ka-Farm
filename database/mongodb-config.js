// KA-FARM - Configuration MongoDB
// Utilisation de Mongoose pour MongoDB

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kafarm_db';

// Options de connexion
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
};

// Test de connexion
export async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Connexion MongoDB réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    return false;
  }
}

// Connexion à la base de données
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('📊 Connecté à MongoDB:', MONGODB_URI);
    
    // Écouter les événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connecté à MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur Mongoose:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose déconnecté de MongoDB');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error;
  }
}

// Déconnexion propre
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('📊 Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error.message);
  }
}

// Export de l'instance mongoose
export default mongoose;
