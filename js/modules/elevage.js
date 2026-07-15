// KA Farm - Training & Formation Module - Comprehensive Senegal-focused Agricultural Education
import { KAStorage } from '../storage.js';
import { ErrorHandler } from './error-handler.js';

export const TrainingModule = {
  currentLanguage: 'fr', // 'fr' or 'wo'
  selectedCrop: null,
  quizScore: 0,

  init() {
    KAStorage.init();
    this.setupEventListeners();
    this.applyLanguage(this.currentLanguage);
    this.loadCropGuides();
    this.loadQuiz();
  },

  setupEventListeners() {
    // Language toggle
    window.toggleLanguage = () => {
      this.currentLanguage = this.currentLanguage === 'fr' ? 'wo' : 'fr';
      this.applyLanguage(this.currentLanguage);
    };

    // Filter crops by search
    window.filterCropGuides = () => {
      const searchTerm = document.getElementById('crop-search-input')?.value.toLowerCase() || '';
      const tabs = document.querySelectorAll('.crop-guide-tab');
      
      tabs.forEach(tab => {
        const text = tab.textContent.toLowerCase();
        tab.style.display = text.includes(searchTerm) ? 'block' : 'none';
      });
    };

    // Chat form
    const chatForm = document.getElementById('training-chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendChatMessage();
      });
    }

    // Ask mentor questions from FAQ
    window.askMentorQuestion = (question) => {
      const input = document.getElementById('training-chat-input');
      if (input) {
        input.value = question;
        input.focus();
      }
    };

    // Quiz answer checker
    window.checkQuizAnswer = (questionIndex, selectedIndex, correctIndex) => {
      if (selectedIndex === correctIndex) {
        this.quizScore++;
        const badge = document.getElementById('quiz-score-badge');
        if (badge) {
          badge.textContent = `Score: ${this.quizScore}/3`;
          badge.classList.remove('hidden');
        }
        ErrorHandler.showToast('✓ Correct ! Excellent travail agricole !', 'success');
      } else {
        ErrorHandler.showToast('✗ Incorrect. Révisez les fiches techniques ci-dessus pour progresser.', 'error');
      }
    };
  },

  applyLanguage(lang) {
    if (lang === 'wo') {
      this.applyWolofLabels();
    } else {
      this.applyFrenchLabels();
    }
    
    const toggleBtn = document.getElementById('lang-toggle-text');
    if (toggleBtn) {
      toggleBtn.textContent = lang === 'fr' ? 'Français' : 'Wolof';
    }
  },

  applyFrenchLabels() {
    const labels = {
      'training-header-title': 'Guide & Formation Maraîchère',
      'training-header-subtitle': 'Académie KA Farm Sénégal',
      'training-header-desc': 'Itinéraires techniques détaillés, calendriers culturaux et diagnostics biologiques pour réussir vos cultures au Sénégal.',
      'crop-fiches-title': 'Fiches Techniques & Itinéraires',
      'crop-fiches-desc': 'Sélectionnez une culture pour charger son itinéraire technique sénégalais complet.',
      'principles-title': 'Principes de l\'Agriculture Biologique',
      'principles-desc': 'Les 4 piliers essentiels pour protéger les sols et maximiser le rendement horticole.',
      'quiz-title-text': 'Quiz Maraîcher Express',
      'quiz-desc-text': 'Testez vos compétences pratiques sur le maraîchage sahélien.',
      'ai-mentor-title': 'Conseiller Pédagogique IA',
      'ai-mentor-desc': 'Posez des questions spécifiques sur l\'enseignement agricole, les semis, maladies, et techniques du Sénégal.',
      'faq-title-label': 'Questions Fréquentes',
      'faq-desc-label': 'Conseils locaux essentiels les plus recherchés par nos producteurs.',
      'periods-title': '🗓️ Périodes Importantes'
    };

    Object.entries(labels).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  },

  applyWolofLabels() {
    const labels = {
      'training-header-title': 'Teere & Akool Maraîchère',
      'training-header-subtitle': 'Akool KA Farm Sénégal',
      'training-header-desc': 'Bayti yooni bu jëm, kalandar yu xobbal ak diagnose yu biologie ngir réussir jang yi ci Sénégal.',
      'crop-fiches-title': 'Yooni yi & Itinéraires',
      'crop-fiches-desc': 'Tànne jang bu bari ngir load bayti yu Sénégal.',
      'principles-title': 'Mbey yi gu Saba Biologie',
      'principles-desc': 'Jëm yi 4 bu mungul ngir jëkoor ndox ak max rendement.',
      'quiz-title-text': 'Test Maraîchère Express',
      'quiz-desc-text': 'Sayto ay jangal yi ci maraîchage.',
      'ai-mentor-title': 'Conseiller IA Akool',
      'ai-mentor-desc': 'Jot tur ay tur ci akool, semis, jëm, ak mbey yi gu Sénégal.',
      'faq-title-label': 'Tur yu Jege',
      'faq-desc-label': 'Conseils bu def yi neex ci nit yi sa jang.',
      'periods-title': '🗓️ Waxtu yu Ëpp'
    };

    Object.entries(labels).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  },

  loadCropGuides() {
    const container = document.getElementById('crop-tabs-container');
    if (!container) return;

    container.innerHTML = '';

    const crops = [
      { key: 'oignon', label: '🧅 Oignon' },
      { key: 'tomate', label: '🍅 Tomate' },
      { key: 'piment', label: '🌶️ Piment' },
      { key: 'gombo', label: '🌱 Gombo' },
      { key: 'chou', label: '🥬 Chou' },
      { key: 'aubergine', label: '🍆 Aubergine' },
      { key: 'carotte', label: '🥕 Carotte' },
      { key: 'laitue', label: '🥬 Laitue' },
      { key: 'compostage_bio', label: '🍃 Compost Bio' },
      { key: 'biopesticides_recettes', label: '🛡️ Biopesticides' },
      { key: 'goutte_a_goutte', label: '💧 Goutte-à-goutte' }
    ];

    crops.forEach((crop, index) => {
      const btn = document.createElement('button');
      btn.className = `crop-guide-tab px-4 py-2.5 text-xs font-black border-b-2 rounded-t-lg transition-all cursor-pointer ${
        index === 0 ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-emerald-500'
      }`;
      btn.textContent = crop.label;
      btn.onclick = () => this.selectCrop(crop.key);
      container.appendChild(btn);
    });

    // Load first crop by default
    this.selectCrop('oignon');
  },

  selectCrop(cropKey) {
    this.selectedCrop = cropKey;

    // Update tab styles
    document.querySelectorAll('.crop-guide-tab').forEach((tab, index) => {
      tab.classList.remove('border-emerald-500', 'text-emerald-500');
      tab.classList.add('border-transparent', 'text-slate-450', 'dark:text-slate-400');
    });

    const selectedTab = Array.from(document.querySelectorAll('.crop-guide-tab')).find(t => 
      t.textContent.toLowerCase().includes(cropKey.split('_').join(' '))
    );
    
    if (selectedTab) {
      selectedTab.classList.remove('border-transparent', 'text-slate-450', 'dark:text-slate-400');
      selectedTab.classList.add('border-emerald-500', 'text-emerald-500');
    }

    this.loadCropContent(cropKey);
  },

  loadCropContent(cropKey) {
    const content = this.getCropGuideContent(cropKey);
    const container = document.getElementById('crop-guide-content');
    
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <div>
          <h2 class="text-lg font-black text-slate-800 dark:text-white">${content.title}</h2>
          <p class="text-xs text-slate-400 mt-1"><strong>Variété:</strong> ${content.variety}</p>
          <p class="text-xs text-slate-400"><strong>Durée:</strong> ${content.cycle}</p>
        </div>

        <div class="space-y-3">
          ${content.steps.map(step => `
            <details class="group bg-slate-50 dark:bg-[#061109]/30 border border-slate-100 dark:border-[#143E23]/15 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary class="flex justify-between items-center p-4 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer select-none hover:bg-emerald-950/10">
                <span class="pr-2 text-left">${step.title}</span>
                <span class="transition group-open:rotate-180">
                  <i data-lucide="chevron-down" class="h-3.5 w-3.5 text-slate-400"></i>
                </span>
              </summary>
              <div class="p-4 pt-0 border-t border-slate-100 dark:border-[#143E23]/10 text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-semibold space-y-2">
                <p>${step.desc}</p>
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  getCropGuideContent(cropKey) {
    const guides = {
      oignon: {
        title: '🧅 Itinéraire Technique de l\'Oignon (Allium cepa)',
        variety: 'Variétés : Violet de Galmi, Mercedes F1, Safari',
        cycle: 'Durée totale : 130 - 150 jours (dont 40-50 jours de pépinière)',
        steps: [
          {
            title: '1. Étape de la Pépinière',
            desc: 'Semez de préférence d\'Octobre à Décembre. Utilisez un terreau riche en compost décomposé, semez en lignes espacées de 10 cm, couvrez d\'un voile léger. Arrosez 2 fois par jour.'
          },
          {
            title: '2. Repiquage',
            desc: 'Effectuer le repiquage des plants vigoureux de la taille d\'un crayon. Coupez légèrement le feuillage et les racines (habillage). Plantez à 10 cm d\'intervalle.'
          },
          {
            title: '3. Besoins en Eau & Fertilisation',
            desc: 'Besoin régulier mais sans stagnation. Arrêtez complètement l\'irrigation 15 jours avant la récolte pour durcir les bulbes.'
          },
          {
            title: '4. Ennemis & Traitements Naturels',
            desc: 'Thrips (ravageur principal) : pulvérisation préventive d\'extrait d\'ail dilué ou de savon noir liquide.'
          }
        ]
      },
      tomate: {
        title: '🍅 Itinéraire Technique de la Tomate (Solanum lycopersicum)',
        variety: 'Variétés : Mongal F1, Nadira, Xina, Fandango',
        cycle: 'Durée totale : 110 - 130 jours',
        steps: [
          {
            title: '1. Semis & Pépinière',
            desc: 'Idéal d\'Octobre à Février. Semis en lignes distantes de 10 cm sur terreau drainant. Protégez contre le soleil fort.'
          },
          {
            title: '2. Repiquage & Tuteurage',
            desc: 'Repiquez au stade 4-5 feuilles réelles. Installez rapidement des tuteurs solides en bambou.'
          },
          {
            title: '3. Taille & Irrigation',
            desc: 'Pincez ou supprimez les gourmands axillaires. Arrosez régulièrement sans asperger les feuilles.'
          },
          {
            title: '4. Maladies & Parasites',
            desc: 'Virus TYLCV transmis par l\'aleurode : utilisez des voiles non tissés et pulvérisez du Neem.'
          }
        ]
      },
      piment: {
        title: '🌶️ Itinéraire Technique du Piment (Capsicum frutescens)',
        variety: 'Variétés : Piment Antillais, Piment oiseau',
        cycle: 'Durée totale : 150 - 180 jours',
        steps: [
          {
            title: '1. Préparation du sol & Pépinière',
            desc: 'Demande un sol riche en compost. En pépinière, semez en surélevées protégées par un ombrage artificiel.'
          },
          {
            title: '2. Irrigation stricte',
            desc: 'Le piment a horreur de la sécheresse au moment de la floraison. Arrosez tous les 2 jours sous paillage.'
          },
          {
            title: '3. Fumage d\'entretien',
            desc: 'Apport de cendre de bois (potasse) toutes les 3 semaines après la floraison.'
          },
          {
            title: '4. Maladies & Lutte Biologique',
            desc: 'Virus de la mosaïque transmis par pucerons : retirez les plants atteints et pulvérisez du Neem.'
          }
        ]
      },
      gombo: {
        title: '🌱 Itinéraire Technique du Gombo (Abelmoschus esculentus)',
        variety: 'Variétés : Clemson Spineless, Koto, Kirène',
        cycle: 'Durée totale : 70 - 90 jours',
        steps: [
          {
            title: '1. Semis Direct',
            desc: 'Semez directement en poquets de 3 graines, espacés de 50 cm. Le gombo aime la chaleur.'
          },
          {
            title: '2. Démariage & Butter',
            desc: 'Après 15 jours, gardez le plant le plus vigoureux. Ramenez de la terre meuble au pied.'
          },
          {
            title: '3. Arrosages modérés',
            desc: 'Bien qu\'il résiste aux sécheresses courtes, un arrosage tous les 3 jours assure une fructification tendre.'
          },
          {
            title: '4. Altises & Oïdium',
            desc: 'Les altises font de petits trous. Utilisez un répulsif à base d\'ail piquant ou de cendres fines.'
          }
        ]
      },
      chou: {
        title: '🥬 Itinéraire Technique du Chou Pommé (Brassica oleracea)',
        variety: 'Variétés : KK Cross F1, Tropica Cross',
        cycle: 'Durée totale : 90 - 110 jours',
        steps: [
          {
            title: '1. Semis & pépinière',
            desc: 'Préfère les périodes fraîches (Novembre à Février). Semis léger, repiquage dès 4-5 feuilles.'
          },
          {
            title: '2. Fertilisation forte',
            desc: 'Très exigeant en matières organiques. Incorporez du compost riche 1 semaine avant repiquage.'
          },
          {
            title: '3. Irrigation abondante',
            desc: 'Le chou possède d\'énormes feuilles d\'évaporation. Arrosez généreusement le matin.'
          },
          {
            title: '4. Papillons & Chenilles',
            desc: 'Le ravageur le plus dévastateur. Pulvérisation préventive hebdomadaire de purin de Neem.'
          }
        ]
      },
      aubergine: {
        title: '🍆 Itinéraire Technique de l\'Aubergine (Solanum melongena)',
        variety: 'Variétés : Florida High Bush, Aubergine locale',
        cycle: 'Durée totale : 120 - 140 jours',
        steps: [
          {
            title: '1. Mise en pépinière',
            desc: 'La germination peut prendre jusqu\'à 10 jours. Maintenir la terre tiède et humide.'
          },
          {
            title: '2. Buttage indispensable',
            desc: 'Au fur et à mesure de la croissance, buttez la terre autour du pied.'
          },
          {
            title: '3. Taille & Ébourgeonnage',
            desc: 'Coupez les gourmands inutiles pour diriger la sève vers les aubergines principales.'
          },
          {
            title: '4. Ravageurs majeurs',
            desc: 'Les acariens créent des feuilles poussiéreuses. Pulvérisez de l\'eau savonneuse.'
          }
        ]
      },
      carotte: {
        title: '🥕 Itinéraire Technique de la Carotte (Daucus carota)',
        variety: 'Variétés : New Kuroda, Amazonia, Bahia',
        cycle: 'Durée totale : 90 - 110 jours',
        steps: [
          {
            title: '1. Préparation du Sol & Semis',
            desc: 'Exige un sol sableux très meuble et sans cailloux. Semez directement en lignes peu profondes.'
          },
          {
            title: '2. Éclaircissage',
            desc: 'Quand les feuilles atteignent 5 cm, éclaircissez pour laisser un plant tous les 5 cm.'
          },
          {
            title: '3. Fumure & Potasse',
            desc: 'Évitez l\'azote frais. Préférez un compost très mûr et ajoutez de la cendre de bois.'
          },
          {
            title: '4. Nématodes du Sol',
            desc: 'Des vers microscopiques créent des galles. Pratiquez une rotation stricte et plantez des oeillets d\'Inde.'
          }
        ]
      },
      laitue: {
        title: '🥬 Itinéraire Technique de la Laitue / Salade (Lactuca sativa)',
        variety: 'Variétés : Eden, Great Lakes, Blonde de Paris',
        cycle: 'Durée totale : 45 - 60 jours',
        steps: [
          {
            title: '1. Semis & Protection Thermique',
            desc: 'Les graines refusent de germer au-dessus de 30°C. Pépinière très fraîche et ombragée.'
          },
          {
            title: '2. Repiquage',
            desc: 'Repiquez après 20 jours à 25 cm d\'intervalle. Choisissez une fin d\'après-midi fraîche.'
          },
          {
            title: '3. Irrigation Intensive',
            desc: 'Racines très superficielles : arrosage biquotidien obligatoire. Sol toujours frais.'
          },
          {
            title: '4. Limaces & Pucerons',
            desc: 'Barrière de cendre ou de sciure fine autour des planches. Eau savonneuse douce contre pucerons.'
          }
        ]
      },
      compostage_bio: {
        title: '🍃 Fabrication de Compost Bio-Actif',
        variety: 'Type : Amendement organique aérobie accéléré',
        cycle: 'Durée de maturation : 45 à 60 jours',
        steps: [
          {
            title: '1. Choix & Dosage des Matières Premières',
            desc: 'Respectez le rapport C/N = 30. Mélangez 60% matières sèches, 30% herbes vertes, 10% fumier.'
          },
          {
            title: '2. Montage du Tas & Arrosage',
            desc: 'Montez en couches successives de 15-20 cm. Arrosez généreusement chaque couche.'
          },
          {
            title: '3. Phases de Température & Retournement',
            desc: 'Dès le 3ème jour, température atteint 55-65°C (phase thermophile). Retournez régulièrement.'
          },
          {
            title: '4. Signes de Maturité & Dosage Sol',
            desc: 'Après 6-8 semaines, tas refroidit et dégage une odeur de terre forestière. Appliquez 2-3 kg/m2.'
          }
        ]
      },
      biopesticides_recettes: {
        title: '🛡️ Recettes de Biopesticides & Purins Locaux',
        variety: 'Type : Préparations biologiques protectrices',
        cycle: 'Fréquence : Tous les 5 à 7 jours en préventif',
        steps: [
          {
            title: '1. Émulsion d\'Ail et Piment',
            desc: 'Écrasez 100g d\'ail et 100g de piments. Laissez macérer dans 1L d\'eau 24h. Filtrez.'
          },
          {
            title: '2. Purin de Feuilles de Neem',
            desc: 'Pilez 2 kg de feuilles fraîches de Neem. Laissez macérer dans 10L d\'eau 48h.'
          },
          {
            title: '3. Décoction de Cendre',
            desc: 'Tamisez 500g de cendre. Faites bouillir dans 5L d\'eau 20 min. Laissez refroidir.'
          },
          {
            title: '4. Macération d\'Oignon',
            desc: 'Hachez 200g d\'oignons. Laissez tremper dans 5L d\'eau 24h. Filtrez et appliquez pur.'
          }
        ]
      },
      goutte_a_goutte: {
        title: '💧 Optimisation du Système Goutte-à-Goutte',
        variety: 'Technologie : Micro-irrigation localisée',
        cycle: 'Fréquence : Quotidienne',
        steps: [
          {
            title: '1. Choix des Heures Critiques',
            desc: 'N\'arrosez jamais entre 10h et 16h car 45% de l\'eau s\'évapore. Privilégiez 6h-8h.'
          },
          {
            title: '2. Calcul du Volume Précis',
            desc: 'En saison fraîche : 30 min/jour (1L/plant). En saison chaude : 60 min/jour (2L/plant).'
          },
          {
            title: '3. Maintenance & Débouchage',
            desc: 'Eau calcaire bouche les orifices. Purgez vos lignes une fois par mois.'
          },
          {
            title: '4. Test de Pénétration',
            desc: 'Soulevez le paillis, enfoncez l\'index à 5-8 cm. Si terre fraîche s\'agglutine, bien arrosé.'
          }
        ]
      }
    };

    return guides[cropKey] || guides['oignon'];
  },

  loadQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const questions = [
      {
        question: 'Quelle pratique réduit drastiquement l\'évaporation de l\'eau sous le soleil du Sénégal ?',
        options: ['L\'arrosage intensif à midi', 'Le paillage épais des planches', 'Laisser le sol nu', 'Pulvériser du sel'],
        correct: 1
      },
      {
        question: 'Pourquoi est-il déconseillé de replanter du piment après une aubergine ?',
        options: ['Deux cultures qui se détestent', 'Ce sont toutes deux des Solanacées', 'Le piment refuse la terre noire', 'Aucune contre-indication'],
        correct: 1
      },
      {
        question: 'Quel traitement combat les chenilles du chou ?',
        options: ['De l\'urée chimique', 'Le purin de Neem', 'De l\'eau saline', 'Couper la pépinière'],
        correct: 1
      }
    ];

    container.innerHTML = questions.map((q, index) => `
      <div class="p-4 bg-slate-50 dark:bg-[#061109]/30 border border-slate-100 dark:border-[#143E23]/15 rounded-2xl space-y-3">
        <p class="font-bold text-slate-800 dark:text-white text-sm">Question ${index + 1}: ${q.question}</p>
        <div class="space-y-2">
          ${q.options.map((option, optIndex) => `
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="quiz-${index}" value="${optIndex}" class="w-4 h-4" onchange="window.checkQuizAnswer(${index}, ${optIndex}, ${q.correct})">
              <span class="text-xs text-slate-700 dark:text-slate-300">${option}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  sendChatMessage() {
    const input = document.getElementById('training-chat-input');
    const container = document.getElementById('training-chat-container');
    
    if (!input || !input.value || !container) return;

    const message = input.value;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'flex justify-end text-right';
    userMsg.innerHTML = `
      <div class="p-3 bg-emerald-600 text-white rounded-2xl rounded-tr-none max-w-[85%]">
        <p class="text-xs leading-relaxed">${message}</p>
      </div>
    `;
    container.appendChild(userMsg);

    // Add loading indicator
    const loader = document.createElement('div');
    loader.className = 'flex gap-3 items-start';
    loader.id = 'mentor-loader';
    loader.innerHTML = `
      <div class="h-6 w-6 bg-cyan-600 rounded-md flex items-center justify-center flex-shrink-0 text-white font-extrabold text-[10px]">AI</div>
      <div class="bg-slate-50 dark:bg-[#061109]/70 border border-emerald-950/20 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
        <div class="flex items-center gap-1">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.2s"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    `;
    container.appendChild(loader);
    container.scrollTop = container.scrollHeight;

    input.value = '';

    // Simulate AI response
    setTimeout(() => {
      loader.remove();

      const aiMsg = document.createElement('div');
      aiMsg.className = 'flex gap-3 items-start';
      aiMsg.innerHTML = `
        <div class="h-6 w-6 bg-cyan-600 rounded-md flex items-center justify-center flex-shrink-0 text-white font-extrabold text-[10px]">AI</div>
        <div class="bg-slate-50 dark:bg-[#061109]/70 border border-emerald-950/20 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">Merci pour votre question ! C'est une excellente question sur le maraîchage sénégalais. Basé sur mes connaissances, je vous recommande de consulter les fiches techniques ci-dessus pour des détails spécifiques à votre situation.</p>
        </div>
      `;
      container.appendChild(aiMsg);
      container.scrollTop = container.scrollHeight;
    }, 1500);
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  TrainingModule.init();
});
