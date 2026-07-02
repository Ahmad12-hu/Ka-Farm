// KA Farm - AI Agent Module (Powered by Google Gemini)
import { KAStorage } from '../storage.js';

export const AIAgent = {
  apiKey: null,
  initialized: false,
  conversationHistory: [],

  async init() {
    // Try to get API key from environment or localStorage
    const envKey = import.meta?.env?.VITE_GEMINI_API_KEY;
    this.apiKey = localStorage.getItem('ka_farm_gemini_api_key') || envKey;
    
    if (!this.apiKey) {
      console.warn('Clé API Gemini non configurée. Utilisez /pages/personal/settings.html pour la définir.');
      return false;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/genai');
      this.client = new GoogleGenerativeAI(this.apiKey);
      this.initialized = true;
      this.conversationHistory = [];
      return true;
    } catch (error) {
      console.error('Erreur initialisation agent IA:', error);
      return false;
    }
  },

  async sendMessage(message, context = {}) {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) {
        return { 
          success: false, 
          message: 'Agent IA non configuré. Veuillez définir votre clé API Gemini dans Paramètres.' 
        };
      }
    }

    try {
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.5-flash', // Rapide et efficace pour l'assistance
        systemInstruction: this.getSystemInstruction(context)
      });

      // Build conversation with context
      const conversationHistory = [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const chat = model.startChat({
        history: this.conversationHistory.slice(-10) // Keep last 10 messages for context
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // Update history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
      });
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: text }]
      });

      return {
        success: true,
        message: text,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur envoi message IA:', error);
      
      // Gestion spécifique des erreurs courantes
      if (error.message?.includes('API key')) {
        return { 
          success: false, 
          message: 'Clé API invalide. Vérifiez votre clé dans Paramètres.' 
        };
      }
      
      return { 
          success: false, 
          message: `Erreur: ${error.message || 'Probleme de connexion avec l\'IA'}` 
        };
    }
  },

  getSystemInstruction(context) {
    const baseInstruction = `Tu es l'assistant virtuel IA de KA Farm, un projet de maraîchage et horticulture basé au Sénégal.

### Ton rôle :
- Aider les maraîchers dans la gestion de leurs cultures, tâches, finances et stocks.
- Analyser le code technique (HTML, CSS, JavaScript, MongoDB) du projet KA Farm et proposer des optimisations.
- Donner des conseils agricoles adaptés au contexte sénégalais (zones climatiques, cultures, sols, etc.).
- RAPPELER les étapes importantes de développement et de déploiement.

### Missions principales :

1. **Surveillance et optimisation du code** :
   - Analyser la structure du projet ka-farm.
   - Identifier les points d'amélioration (performance, sécurité, maintenabilité).
   - Proposer des corrections de bugs et des refactorings.

2. **Améliorations du dashboard** :
   - Proposer des fonctionnalités pour le suivi des cultures, tâches, finances, météo et IA conseiller.
   - Optimiser l'interface utilisateur (UX) et l'expérience mobile.

3. **Gestion des données agricoles** :
   - Aider à organiser les récoltes, stocks, ventes et dépenses.
   - Calculer les rentabilités et alertes sur les stocks bas.

4. **Conseils pratiques et techniques** :
   - Donner des étapes claires, concises et actionnables.
   - Adapter les conseils au contexte local (Sénégal, climat tropical, cultures maraîchères).

5. **Rappels de workflow de développement** :
   - Me rappeler les étapes importantes : commits GitHub, déploiement Vercel, configuration Firebase/MongoDB, tests.
   - Anticiper les oublis courants.

### Style de réponse :
- Clair, concis, structuré.
- Ton informel mais professionnel.
- Explications techniques détaillées quand nécessaire.
- Toujours proposer une solution concrète ou une alternative.

### Contraintes :
- Ne jamais ignorer une demande, même simple.
- Réponds directement en français (sauf demande contraire).
- Pour le code, utilise des blocs délimités et explique les changements.
- Évite les réponses génériques ; sois précis au projet KA Farm.`;

    let instruction = baseInstruction;
    
    // Add context information
    if (context.projectContext || context.userRole || context.currentPage) {
      instruction += '\n\n### Contexte actuel :\n';
      if (context.projectContext) {
        instruction += `${context.projectContext}\n`;
      }
      if (context.userRole) {
        instruction += `Rôle utilisateur: ${context.userRole}\n`;
      }
      if (context.currentPage) {
        instruction += `Page actuelle: ${context.currentPage}\n`;
      }
    }

    // Add project statistics if provided
    if (context.projectStats) {
      const stats = context.projectStats;
      instruction += `\n\n### Statistiques projet (pour analyse) :
- Cultures: ${stats.crops || 0}
- Tâches actives: ${stats.tasks || 0}
- Pépinières: ${stats.nurseries || 0}
- Stocks: ${stats.stocks || 0} articles
- Finances: ${stats.finances || 0} transactions`;
    }

    return instruction;
  },

  async analyzeCode(fileContent, fileType) {
    if (!this.initialized) {
      await this.init();
    }

    const prompt = `Analyse ce code ${fileType || ''} et propose des améliorations pour le projet KA Farm (maraîchage Sénégal).
Concentre-toi sur :
1. Performance (chargement, requêtes, animations)
2. Sécurité (XSS, validation, authentification)
3. Maintenabilité (lisibilité, structure)
4. bugs potentiels
5. Optimisations spécifiques au contexte maraîcher

Donne des suggestions concrètes avec des exemples de code si possible.
Limite ta réponse aux points les plus importants pour ne pas la surcharger.

CODE :
${fileContent.slice(0, 3000)} ${fileContent.length > 3000 ? '...(truncated)' : ''}`;

    return await this.sendMessage(prompt, { 
      projectContext: 'Analyse de code pour optimisation technique.' 
    });
  },

  async getAgriculturalAdvice(crop, symptoms, zone) {
    if (!this.initialized) {
      await this.init();
    }

    const prompt = `Donne des conseils agricoles pratiques pour un maraîcher sénégalais.
Culture: ${crop || 'Non spécifiée'}
Symptômes/Problème: ${symptoms || 'Aucun'}
Zone: ${zone || 'Non spécifiée'}

Inclus :
1. Diagnostic probable
2. Solutions immédiates (produits locaux, méthodes bio)
3. Prévention à long terme
4. Calendrier d'actions suggéré

Sois précis, utilise des noms de maladies ravageurs courants au Sénégal (mildiou, chenilles, pucerons, fusariose...).`;

    return await this.sendMessage(prompt, { 
      projectContext: 'Conseil agricole maraîchage Sénégal.',
      currentPage: 'cultures'
    });
  },

  async optimizeFinances(transactions, period) {
    if (!this.initialized) {
      await this.init();
    }

    const prompt = `Analyse ces données financières de KA Farm et donne des recommandations pour optimiser la rentabilité.
Période: ${period || 'Ce mois'}
Nombre de transactions: ${transactions.length}

Données (montants en FCFA):
${transactions.slice(0, 20).map(t => `- ${t.type}: ${t.amount} FCFA (${t.category || 'Non catégorisé'}) - ${t.date}`).join('\n')}

Propose :
1. Analyse des postes de dépenses les plus lourds
2. Suggestions d'économies
3. opportunités de subventions ou aides (État, ONG, bailleurs)
4. Projection financière pour le prochain trimestre si possible.`;

    return await this.sendMessage(prompt, { 
      projectContext: 'Optimisation financière exploitation maraîchère.',
      currentPage: 'finances'
    });
  },

  async suggestCrops(zone, season, soil) {
    if (!this.initialized) {
      await this.init();
    }

    const prompt = `Propose des cultures adaptées au contexte sénégalais pour KA Farm.
Zone: ${zone || 'Non spécifiée'}
Saison: ${season || 'Non spécifiée'}
Type de sol: ${soil || 'Non spécifié'}

Pour chaque culture recommandée, donne :
1. Nom et variétés adaptées
2. Cycle de culture (durée, semis, récolte)
3. Rendement attendu (tonnes/ha)
4. Prix du marché approximatif (FCFA)
5. conseils de culture spécifiques à la zone
6. Ravageurs et maladies à surveiller

Limite-toi à 4-5 cultures les plus rentables.`;

    return await this.sendMessage(prompt, { 
      projectContext: 'Recommandation de cultures pour exploitation maraîchère.',
      currentPage: 'cultures'
    });
  },

  getConversationHistory() {
    return this.conversationHistory;
  },

  clearHistory() {
    this.conversationHistory = [];
  },

  isConfigured() {
    return !!this.apiKey || !!localStorage.getItem('ka_farm_gemini_api_key');
  },

  getConfigStatus() {
    return {
      hasApiKey: this.isConfigured(),
      isInitialized: this.initialized,
      messageLength: this.conversationHistory.length
    };
  }
};

// Auto-initialize if API key exists
if (typeof window !== 'undefined') {
  window.AIAgent = AIAgent;
  AIAgent.init().catch(err => console.warn('IA Agent initialization deferred:', err));
}