// Script pour générer le fichier .env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# GEMINI_API_KEY
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL
APP_URL="MY_APP_URL"

# API_KEY
API_KEY="your_api_key_here"

# ============================================
# CONFIGURATION SUPABASE
# ============================================

DB_HOST="db.sisyozcgbjecsrvpqpxj.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="96amadouka12@"

SUPABASE_URL="https://sisyozcgbjecsrvpqpxj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpc3lvemNnYmplY3NydnBxcHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTUzMDYsImV4cCI6MjA5ODQzMTMwNn0.Fb9wdDYvNbRr5-8LGRewlBkoRGSBgOkVa-Bjp8VBi0E"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpc3lvemNnYmplY3NydnBxcHhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg1NTMwNiwiZXhwIjoyMDk4NDMxMzA2fQ.q1Oev00-IGGLarHcvIBCDupv114GqxRgg3R_iMIgYtM"
`;

const envPath = path.join(__dirname, '.env');

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ Fichier .env créé avec succès !');
console.log('📍 Chemin:', envPath);
console.log('\n⚠️  IMPORTANT: Le fichier .env contient des informations sensibles.');
console.log('   Ne le commitez jamais dans Git (déjà dans .gitignore).');
