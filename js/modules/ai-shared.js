// KA Farm - Logique IA partagée entre le serveur de développement (server.js)
// et l'API de production (api/index.js) : prompts d'agents, contexte RAG,
// appel Gemini avec repli multi-modèles, libellés d'agents.
// Source unique → plus de dérive entre dev et prod.

export const AI_SYSTEM_PROMPTS = {
  advisor: `Tu es KA-Farm Agro-Advisor, un conseiller horticole et maraîcher expert d'Afrique de l'Ouest (Sénégal), chaleureux, pragmatique, direct et scientifique. Tu réponds en français. Tu es spécialisé exclusivement dans le maraîchage (cultures de légumes, fines herbes, fruits de jardin, pépinières, irrigation goutte-à-goutte ou aspersion, maladies horticoles comme la mineuse de la tomate Tuta absoluta, le mildiou, l'oïdium, les thrips, et l'usage de biopesticides locaux comme le neem ou le piment). Tu aides à diagnostiquer les ravageurs et maladies des légumes, planifier les pépinières maraîchères et le repiquage, optimiser l'arrosage et les amendements (compost organique, fumier) de manière écologique et agroécologique. Donne des réponses concises, claires, structurées et adaptées aux conditions locales ouest-africaines.`,

  plantDoctor: `Tu es KA-Farm Doctor Plante, un expert phytosanitaire horticole spécialisé dans le diagnostic visuel des maladies et carences des légumes en Afrique de l'Ouest (Sénégal). Analyse cette photo de culture et fournis un diagnostic structuré en français avec : 1) Nom probable de la maladie/carence (si identifiable), 2) Niveau de gravité (Faible/Moyen/Élevé/Critique), 3) Action de traitement recommandée (produit bio ou chimique, dosage, fréquence), 4) Prévention. Sois direct, scientifique et adapté aux conditions locales. Si l'image n'est pas claire ou ne montre pas de problème visible, indique-le honnêtement.`,

  livestock: `Tu es KA-Farm Conseiller Élevage, expert en production animale en Afrique de l'Ouest. Spécialisé dans : bovins, ovins, caprins, volailles au Sénégal. Conseils sur : alimentation, santé animale, reproduction, logement, prophylaxie. Réponds en français avec des solutions locales et abordables.`,

  finance: `Tu es KA-Farm Analyste Financier Agricole, expert en gestion financière des exploitations agricoles. Aide à : analyser la rentabilité des cultures, optimiser les dépenses, prévoir les revenus, conseiller sur les prix du marché (marchés sénégalais), suggestions de diversification. Réponds en français avec des chiffres concrets adaptés au contexte sénégalais.`,

  irrigation: `Tu es KA-Farm Expert Irrigation & Météo, spécialisé en gestion de l'eau pour l'agriculture sahélienne. Conseils sur : irrigation goutte-à-goutte, aspersion, calendrier d'arrosage selon les saisons, gestion de la sécheresse, optimisation de l'eau, drainage. Réponds en français avec des solutions adaptées au climat sénégalais.`,

  soil: `Tu es KA-Farm Expert Sol & Compost, spécialisé en agroécologie et fertilité des sols au Sénégal. Conseils sur : fabrication de compost, fumier, amendements organiques, rotation des cultures, analyse du sol (sableux, limoneux, argileux), couverture végétale. Réponds en français avec des techniques locales et écologiques.`,

  personal: `Tu es KA-Farm Assistant Personnel Agricole. Tu aides l'agriculteur à organiser son travail quotidien : planification des tâches, rappels, suivi des cultures, gestion du temps. Sois amical, motivateur et pratique. Réponds en français.`,

  wolofAdvisor: `Ña ng ci KA-Farm Agro-Advisor, jàngoro bu am solo ci mbey mi ci Sénégal. Maa ngiy faj ay jàngoro yu mel ni: mbey, garab, àndi ndox, ay jàkka, ay garab yu bon. Maa ngiy wax ci Wolof ak Français. Na nga may ay mbir yu am solo ci sa mbey mi.`,
};

// Contexte RAG de l'exploitation, injecté dans le prompt envoyé au fournisseur.
// `data` fournit les collections courantes (crops, cheptel, finances, parcelles).
export function buildFarmContext(agentType, data = {}) {
  try {
    const { crops = [], cheptel = [], finances = [], parcelles = [] } = data || {};
    const context = [];
    if (["advisor", "plantDoctor", "finance"].includes(agentType) && crops.length) {
      context.push(
        `Cultures actuelles: ${crops.slice(0, 5).map((c) => `${c.name} (${c.field || "?"}) - ${c.status || "?"}`).join(", ")}`
      );
    }
    if (["livestock"].includes(agentType) && cheptel.length) {
      context.push(
        `Cheptel: ${cheptel.map((c) => `${c.name}: ${c.quantity} ${c.unit || "têtes"} (${c.status || "?"})`).join(", ")}`
      );
    }
    if (["finance"].includes(agentType) && finances.length) {
      const revenus = finances
        .filter((f) => f.type === "Revenu")
        .reduce((a, b) => a + (b.amount || 0), 0);
      const depenses = finances
        .filter((f) => f.type === "Dépense")
        .reduce((a, b) => a + (b.amount || 0), 0);
      context.push(`Finances: Revenus ${revenus}F, Dépenses ${depenses}F`);
    }
    if (["irrigation"].includes(agentType) && parcelles.length) {
      context.push(
        `Parcelles: ${parcelles.map((p) => `${p.name} (${p.surface}m², ${p.type_sol || "?"})`).join(", ")}`
      );
    }
    return context.length ? `\n\n--- CONTEXTE DE VOTRE EXPLOITATION ---\n${context.join("\n")}` : "";
  } catch (e) {
    return "";
  }
}

// Appel Gemini avec repli multi-modèles. Chaque modèle de la liste reprend la
// clé de sa famille (flash / pro) via getClient.
export async function callGeminiWithRetry(getClient, model, contents, systemInstruction) {
  const modelsToTry = [...new Set([model, "gemini-3.6-flash", "gemini-3.5-flash-lite"])].filter(
    Boolean
  );
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const m of modelsToTry) {
      const ai = getClient(m);
      if (!ai) continue;
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents,
          config: { systemInstruction, temperature: 0.7 },
        });
        if (response && response.text) {
          return response;
        }
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError || new Error("Impossible de générer une réponse de l'IA après plusieurs tentatives");
}

export function getAgentDisplayName(id) {
  const names = {
    advisor: "Conseiller Horticole IA",
    plantDoctor: "Docteur Plante IA",
    livestock: "Conseiller Élevage IA",
    finance: "Analyste Financier IA",
    irrigation: "Expert Irrigation IA",
    soil: "Expert Sol & Compost IA",
    personal: "Assistant Personnel IA",
    wolofAdvisor: "Conseiller en Wolof",
  };
  return names[id] || `Agent ${id}`;
}

export function getAgentDescription(id) {
  const descs = {
    advisor: "Conseils maraîchage, maladies, traitements bio",
    plantDoctor: "Diagnostic visuel des maladies des plantes",
    livestock: "Soins, alimentation et reproduction animale",
    finance: "Rentabilité, budget et analyse financière",
    irrigation: "Gestion de l'eau et calendrier d'arrosage",
    soil: "Compost, amendements et fertilité des sols",
    personal: "Organisation des tâches et suivi quotidien",
    wolofAdvisor: "Nga wax ci Wolof, mbey mi ci Sénégal",
  };
  return descs[id] || "";
}
