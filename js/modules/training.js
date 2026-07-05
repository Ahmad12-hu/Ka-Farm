// KA Farm - Training & Formation Module
import { KAStorage } from '../storage.js';

export const TrainingModule = {
  currentLanguage: 'FR',
  currentCropGuide: 'compostage_bio',
  currentQuizIdx: 0,
  userQuizAnswers: [],
  
  CROP_GUIDES_FR: {
    compostage_bio: {
      title: "🍃 Masterclass : Fabrication de Compost Bio-Actif KA-Farm",
      variety: "Type : Amendement organique aérobie accéléré",
      cycle: "Durée de maturation : 45 à 60 jours en tas couvert",
      steps: [
        {
          title: "1. Choix & Dosage des Matières Premières",
          desc: "Respectez le rapport Carbone/Azote (C/N = 30). Mélangez 60% de matières carbonées sèches (paille de riz, tiges de mil sèches concassées, herbes sèches, copeaux fins) avec 30% de matières azotées fraîches (déchets de récolte verts, feuilles fraîches de Neem) et 10% de fumier animal bien sec (mouton, cheval ou poules) pour activer la flore bactérienne."
        },
        {
          title: "2. Montage du Tas & Arrosage Initial",
          desc: "Montez le composteur ou le tas en couches successives de 15 à 20 cm en alternant matières sèches, matières vertes et fumier. Arrosez généreusement chaque couche. Réalisez le 'test du poignet' : serrez une poignée de mélange, elle doit être humide comme une éponge essorée sans couler à flots. Couvrez d'une bâche ou de paille pour maintenir la chaleur."
        },
        {
          title: "3. Phases de Température & Retournement",
          desc: "Dès le 3ème jour, la température doit atteindre 55°C à 65°C (phase thermophile). Cela détruit les graines de mauvaises herbes et les champignons pathogènes. Retournez le tas entièrement tous les 10 à 15 jours pour apporter de l'oxygène. Si le tas refroidit ou sèche, ré-humidifiez-le légèrement lors du retournement."
        },
        {
          title: "4. Signes de Maturité & Dosage Sol",
          desc: "Après 6-8 semaines, le tas refroidit définitivement, s'affaisse et dégage une odeur de terre forestière saine. Sa texture est homogène et grumeleuse. Appliquez 2 à 3 kg de ce compost mûr par mètre carré de planche maraîchère à incorporer sur les 10 premiers centimètres du sol lors de la préparation des planches."
        }
      ]
    },
    biopesticides_recettes: {
      title: "🛡️ Guide Pratique : Recettes de Biopesticides & Purins Locaux",
      variety: "Type : Préparations biologiques protectrices",
      cycle: "Fréquence : Tous les 5 à 7 jours en préventif, 3 jours en curatif",
      steps: [
        {
          title: "1. Émulsion d'Ail et Piment (Insecticide Universel)",
          desc: "Écrasez finement 100g de gousses d'ail et 100g de piments rouges très piquants du Sénégal. Laissez macérer dans 1 litre d'eau de pluie pendant 24 heures. Filtrez soigneusement. Ajoutez 10 ml de savon noir ou de savon de Marseille liquide (pour coller aux feuilles). Diluez cette solution dans 9 litres d'eau claire. Vaporisez le soir contre les pucerons, aleurodes et thrips."
        },
        {
          title: "2. Purin de Feuilles de Neem (Anti-Mineuse de la Tomate)",
          desc: "Pilez 2 kg de feuilles vertes fraîches de Neem (Azadirachta indica). Laissez macérer dans 10 litres d'eau de puits pendant 48 heures dans un récipient en plastique (pas de métal). Filtrez le liquide à l'aide d'un linge fin. Pulvérisez pur sur les tomates, choux et aubergines. Le Neem contient de l'Azadirachtine qui bloque la croissance des chenilles."
        },
        {
          title: "3. Décoction de Cendre de Bois (Anti-Altises & Apport Potasse)",
          desc: "Tamisez 500g de cendre de bois pure non traitée. Faites bouillir la cendre dans 5 litres d'eau pendant 20 minutes. Laissez refroidir complètement puis filtrez. Diluez avec 5 litres d'eau froide. Ce produit élimine les altises (petits coléoptères qui trouent le gombo) et renforce le plant grâce au potassium soluble."
        },
        {
          title: "4. Macération d'Oignon (Fongicide Préventif)",
          desc: "Hachez 200g d'oignons rouges entiers (avec la peau). Laissez tremper dans 5 litres d'eau tiède pendant 24 heures. Filtrez et appliquez pur en vaporisation hebdomadaire. Aide à prévenir l'apparition des maladies cryptogamiques précoces comme le mildiou, la rouille ou l'oïdium sur vos jeunes planches."
        }
      ]
    },
    goutte_a_goutte: {
      title: "💧 Manuel d'Optimisation du Système Goutte-à-Goutte",
      variety: "Technologie : Micro-irrigation localisée sous paillage",
      cycle: "Fréquence : Quotidienne (ajustée selon l'évapotranspiration)",
      steps: [
        {
          title: "1. Choix des Heures Critiques",
          desc: "N'arrosez jamais en milieu de journée (entre 10h et 16h) car plus de 45% de l'eau s'évapore avant de pénétrer le sol. Privilégiez un arrosage matinal (6h-8h) pour hydrater les plants avant la chaleur ou un arrosage en fin d'après-midi (17h-18h). Attention : sur la tomate, évitez l'arrosage nocturne humide pour limiter le mildiou."
        },
        {
          title: "2. Calcul du Volume Précis d'Eau",
          desc: "Pour des goutteurs de 2L/h espacés de 30 cm : En saison fraîche (Décembre - Janvier), 30 minutes par jour suffisent (soit 1 Litre d'eau par plant). En saison sèche chaude (Mars - Mai), passez à 1 heure ou 1 heure 15 minutes d'arrosage (soit 2 à 2.5 Litres d'eau par plant) pour combler le déficit hydrique important."
        },
        {
          title: "3. Maintenance & Débouchage des Goutteurs",
          desc: "L'eau des forages au Sénégal contient du calcaire et des oxydes de fer qui bouchent les orifices des gaines. Purgez vos lignes d'irrigation une fois par mois en ouvrant les bouchons d'extrémité pour évacuer les dépôts de limon. Pour déboucher un goutteur, plongez la buse dans du vinaigre ou de l'eau légèrement acide."
        },
        {
          title: "4. Test de Pénétration (Méthode de l'Index)",
          desc: "Le paillage limite l'évaporation mais cache la terre. Soulevez le paillis et enfoncez votre index à 5-8 cm de profondeur. Si la terre est fraîche et s'agglutine au doigt sans boue, l'irrigation est parfaite. Si elle s'effrite en poussière, augmentez la durée. Si de l'eau stagne, réduisez immédiatement pour éviter l'asphyxie racinaire."
        }
      ]
    },
    oignon: {
      title: "🧅 Itinéraire Technique de l'Oignon (Allium cepa)",
      variety: "Variétés : Violet de Galmi, Mercedes F1, Safari",
      cycle: "Durée totale : 130 - 150 jours (dont 40-50 jours de pépinière)",
      steps: [
        {
          title: "1. Étape de la Pépinière",
          desc: "Semez de préférence d'Octobre à Décembre. Utilisez un terreau riche en compost décomposé, semez en lignes espacées de 10 cm, couvrez d'un voile léger. Arrosez 2 fois par jour modérément jusqu'à levée (4 à 6 jours)."
        },
        {
          title: "2. Repiquage",
          desc: "Effectuer le repiquage des plants vigoureux de la taille d'un crayon. Coupez légèrement le feuillage et les racines (habillage). Plantez à 10 cm d'intervalle en lignes espacées de 15 à 20 cm."
        },
        {
          title: "3. Besoins en Eau & Fertilisation",
          desc: "Besoin régulier mais sans stagnation (sensible au pourrissement). Arrêtez complètement l'irrigation 15 jours avant la récolte pour durcir les bulbes et prolonger la conservation."
        },
        {
          title: "4. Ennemis & Traitements Naturels",
          desc: "Thrips (ravageur principal qui décolore les feuilles) : pulvérisation préventive d'extrait d'ail dilué ou de savon noir liquide. Mildiou : pulvériser de la bouillie bordelaise diluée à la pépinière."
        }
      ]
    },
    piment: {
      title: "🌶️ Itinéraire Technique du Piment (Capsicum frutescens)",
      variety: "Variétés : Piment Antillais (Gros piment), Piment oiseau (Petit)",
      cycle: "Durée totale : 150 - 180 jours (Cycle long)",
      steps: [
        {
          title: "1. Préparation du sol & Pépinière",
          desc: "Demande un sol riche en compost de fond. En pépinière, semez en pépinières surélevées protégées du soleil brûlant par un ombrage artificiel. Repiquez après 45 jours."
        },
        {
          title: "2. Irrigation stricte",
          desc: "Le piment a horreur de la sécheresse au moment de la floraison. Arrosez tous les 2 jours sous paillage d'herbes sèches pour stabiliser l'humidité racinaire."
        },
        {
          title: "3. Fumage d'entretien",
          desc: "Apport de cendre de bois (potasse) toutes les 3 semaines après la floraison pour fortifier l'écorce des piments et décupler la saveur piquante."
        },
        {
          title: "4. Maladies & Lutte Biologique",
          desc: "Virus de la mosaïque (transmis par pucerons) : retirez immédiatement les plants atteints. Pulvérisez une solution d'huile de Neem diluée à l'eau de pluie pour éloigner les pucerons vecteurs."
        }
      ]
    },
    chou: {
      title: "🥬 Itinéraire Technique du Chou Pommé (Brassica oleracea)",
      variety: "Variétés : KK Cross F1, Tropica Cross",
      cycle: "Durée totale : 90 - 110 jours après repiquage",
      steps: [
        {
          title: "1. Semis & pépinière",
          desc: "Préfère les périodes fraîches (Novembre à Février). Semis léger à la volée. Repiquage dès que les plants ont 4 à 5 feuilles réelles."
        },
        {
          title: "2. Fertilisation forte",
          desc: "Très exigeant en matières organiques et en azote. Incorporez du compost riche en fientes de volailles 1 semaine avant le repiquage. Un sol riche prévient les feuilles jaunies."
        },
        {
          title: "3. Irrigation abondante",
          desc: "Le chou possède d'énormes feuilles d'évaporation. Arroser généreusement mais de préférence tôt le matin pour ne pas laisser les chenilles proliférer à la tombée de la nuit."
        },
        {
          title: "4. Protection contre les ravageurs",
          desc: "Chenilles (piérides du chou) : ramassage manuel des chenilles et application de Bacillus thuringiensis (Bt) biologique. Altises : pulvérisation de cendre de bois."
        }
      ]
    },
    tomate: {
      title: "🍅 Itinéraire Technique de la Tomate (Solanum lycopersicum)",
      variety: "Variétés : Mongal F1, Rio Grande, Cobra",
      cycle: "Durée totale : 120 - 140 jours après repiquage",
      steps: [
        {
          title: "1. Pépinière et repiquage",
          desc: "Semis en pépinière ombragée 30-40 jours avant repiquage. Repiquage sur planches surélevées avec espacement 50cm entre lignes et 40cm sur la ligne. Tuteurage immédiat après repiquage."
        },
        {
          title: "2. Taille et palissage",
          desc: "Supprimez les gourmands (pousses axillaires) régulièrement. Palissez sur tuteurs individuels ou fil de fer. Maintenez 2 à 3 tiges principales par plant."
        },
        {
          title: "3. Irrigation et fertilisation",
          desc: "Arrosage régulier mais éviter l'humidité foliaire (risque de mildiou). Fertilisation azotée au début, puis potassique à la floraison/fructification."
        },
        {
          title: "4. Lutte contre les maladies",
          desc: "Mildiou : traitement préventif à la bouillie bordelaise. Mineuse (Tuta absoluta) : pièges à phéromones et huile de Neem. Virus : élimination des plants malades."
        }
      ]
    },
    gombo: {
      title: "🥬 Itinéraire Technique du Gombo (Abelmoschus esculentus)",
      variety: "Variétés : Clemson Spineless, Emerald",
      cycle: "Durée totale : 60 - 90 jours",
      steps: [
        {
          title: "1. Semis direct",
          desc: "Semis direct en place à 2-3 cm de profondeur. Espacement 30cm entre plants et 50cm entre lignes. Levée en 5-7 jours."
        },
        {
          title: "2. Entretien cultural",
          desc: "Désherbage régulier les premières semaines. Buttage léger pour soutenir les plants. Paillage recommandé."
        },
        {
          title: "3. Irrigation",
          desc: "Besoin en eau modéré mais régulier. Arrosage au pied éviter l'humidité foliaire qui favorise les maladies."
        },
        {
          title: "4. Récolte",
          desc: "Récolte tous les 2-3 jours lorsque les fruits sont jeunes (5-8 cm). Récolte tardive = fruits fibreux."
        }
      ]
    }
  },

  QUIZ_QUESTIONS: [
    {
      question: "Quelle est la durée optimale de maturation du compost bio-actif ?",
      options: ["15-20 jours", "45-60 jours", "90-120 jours", "6 mois"],
      correct: 1,
      explanation: "Le compost bio-actif nécessite 45 à 60 jours pour atteindre une maturation complète avec destruction des pathogènes et stabilisation de la matière organique."
    },
    {
      question: "Quel est le rapport Carbone/Azote (C/N) idéal pour le compostage ?",
      options: ["10:1", "20:1", "30:1", "50:1"],
      correct: 2,
      explanation: "Le rapport C/N de 30:1 est optimal : 60% de matières carbonées sèches, 30% de matières azotées fraîches, et 10% d'activateur (fumier)."
    },
    {
      question: "À quelle fréquence faut-il retourner le tas de compost ?",
      options: ["Tous les jours", "Tous les 10-15 jours", "Une fois par mois", "Jamais"],
      correct: 1,
      explanation: "Le retournement tous les 10-15 jours apporte l'oxygène nécessaire à la décomposition aérobie et uniformise la température du tas."
    }
  ],

  init() {
    this.setupListeners();
    this.renderCropTabs();
    this.selectCropGuide('compostage_bio');
    this.renderQuizQuestion();
    this.setupChat();
  },

  setupListeners() {
    window.toggleLanguage = () => this.toggleLanguage();
    window.filterCropGuides = () => this.filterCropGuides();
    window.selectCropGuide = (id) => this.selectCropGuide(id);
    window.submitQuizAnswer = (idx) => this.submitQuizAnswer(idx);
    window.nextQuizQuestion = () => this.nextQuizQuestion();
    window.restartQuiz = () => this.restartQuiz();
    window.askMentorQuestion = (text) => this.askMentorQuestion(text);
  },

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'FR' ? 'WO' : 'FR';
    const langText = document.getElementById('lang-toggle-text');
    if (langText) {
      langText.textContent = this.currentLanguage === 'FR' ? 'Français' : 'Wolof';
    }
    this.updateUIText();
  },

  updateUIText() {
    // Update UI text based on language
    const isWO = this.currentLanguage === 'WO';
    
    const updates = {
      'training-header-title': isWO ? 'Daara Bi & Liggéey' : 'Guide & Formation Maraîchère',
      'training-header-desc': isWO ? 'Yoon yi ak wergu-yaram yi ngir man a doxal sama tool ci Senegaal.' : 'Itinéraires techniques détaillés, calendriers culturaux et diagnostics biologiques pour réussir vos cultures au Sénégal.',
      // Add more translations as needed
    };

    Object.entries(updates).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  },

  renderCropTabs() {
    const container = document.getElementById('crop-tabs-container');
    if (!container) return;

    container.innerHTML = Object.keys(this.CROP_GUIDES_FR).map(key => {
      const guide = this.CROP_GUIDES_FR[key];
      const isActive = key === this.currentCropGuide;
      return `
        <button onclick="window.selectCropGuide('${key}')" 
                class="px-3 py-1.5 text-[10px] font-black rounded-lg whitespace-nowrap transition-all cursor-pointer
                       ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-[#061109]/50 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10'}">
          ${guide.title.split(':')[0]}
        </button>
      `;
    }).join('');
  },

  selectCropGuide(id) {
    this.currentCropGuide = id;
    this.renderCropTabs();
    this.renderCropContent();
  },

  renderCropContent() {
    const container = document.getElementById('crop-guide-content');
    if (!container) return;

    const data = this.CROP_GUIDES_FR[this.currentCropGuide];
    if (!data) return;

    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#143E23]/20">
          <div>
            <h4 class="text-base font-black text-slate-800 dark:text-white leading-tight">${data.title}</h4>
            <div class="flex flex-wrap gap-2 pt-1.5">
              <span class="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/15">${data.variety}</span>
              <span class="text-[9px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/15">${data.cycle}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${data.steps.map(step => `
              <div class="p-4 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-[#143E23]/15 rounded-2xl text-left space-y-1">
                <h5 class="text-xs font-black text-emerald-500 uppercase tracking-wider">${step.title}</h5>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">${step.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  filterCropGuides() {
    const searchInput = document.getElementById('crop-search-input');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const container = document.getElementById('crop-tabs-container');
    if (!container) return;

    const filteredKeys = Object.keys(this.CROP_GUIDES_FR).filter(key => {
      const guide = this.CROP_GUIDES_FR[key];
      return guide.title.toLowerCase().includes(query) || 
             guide.variety.toLowerCase().includes(query);
    });

    container.innerHTML = filteredKeys.map(key => {
      const guide = this.CROP_GUIDES_FR[key];
      const isActive = key === this.currentCropGuide;
      return `
        <button onclick="window.selectCropGuide('${key}')" 
                class="px-3 py-1.5 text-[10px] font-black rounded-lg whitespace-nowrap transition-all cursor-pointer
                       ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-[#061109]/50 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10'}">
          ${guide.title.split(':')[0]}
        </button>
      `;
    }).join('');
  },

  renderQuizQuestion() {
    const quizBox = document.getElementById('quiz-container');
    if (!quizBox) return;

    if (this.currentQuizIdx >= this.QUIZ_QUESTIONS.length) {
      this.showQuizResults(quizBox);
      return;
    }

    const q = this.QUIZ_QUESTIONS[this.currentQuizIdx];
    quizBox.innerHTML = `
      <div class="space-y-3.5 animate-fadeIn text-xs">
        <div class="flex items-start gap-2">
          <span class="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] font-black uppercase">Q${this.currentQuizIdx + 1}</span>
          <p class="font-extrabold text-slate-800 dark:text-slate-200">${q.question}</p>
        </div>

        <div class="grid grid-cols-1 gap-2 pl-3 sm:pl-7">
          ${q.options.map((opt, optIdx) => `
            <button onclick="window.submitQuizAnswer(${optIdx})" class="w-full text-left p-3 bg-slate-50 dark:bg-[#061109]/30 hover:bg-slate-100 dark:hover:bg-[#11321C] border border-slate-150 dark:border-[#1A4525] rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  showQuizResults(quizBox) {
    let correctCount = 0;
    this.QUIZ_QUESTIONS.forEach((q, idx) => {
      if (this.userQuizAnswers[idx] === q.correct) correctCount++;
    });

    const badge = document.getElementById('quiz-score-badge');
    if (badge) {
      badge.textContent = `Score: ${correctCount}/${this.QUIZ_QUESTIONS.length}`;
      badge.classList.remove('hidden');
    }

    quizBox.innerHTML = `
      <div class="p-6 bg-[#0B2112]/50 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-fadeIn">
        <span class="text-3xl">🏆</span>
        <div class="space-y-1">
          <h4 class="text-sm font-black text-white uppercase tracking-wider">Formation validée avec succès !</h4>
          <p class="text-xs text-slate-400">Vous avez obtenu une note de <strong class="text-emerald-400">${correctCount} sur ${this.QUIZ_QUESTIONS.length}</strong> sur les itinéraires techniques sénégalais.</p>
        </div>
        <p class="text-[10px] text-[#819888] italic font-semibold max-w-md mx-auto leading-relaxed">Continuez de vous renseigner et sollicitez notre Conseiller IA en cas de doute sur une planche !</p>
        <button onclick="window.restartQuiz()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all">
          Recommencer le Quiz
        </button>
      </div>
    `;
  },

  submitQuizAnswer(selectedIdx) {
    const q = this.QUIZ_QUESTIONS[this.currentQuizIdx];
    this.userQuizAnswers.push(selectedIdx);

    const quizBox = document.getElementById('quiz-container');
    const isCorrect = selectedIdx === q.correct;

    quizBox.innerHTML = `
      <div class="space-y-4 animate-fadeIn">
        <div class="p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} space-y-2">
          <p class="text-xs font-black ${isCorrect ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1.5">
            <i data-lucide="${isCorrect ? 'check-circle' : 'alert-circle'}" class="h-4 w-4"></i>
            ${isCorrect ? 'Félicitations ! Réponse correcte.' : 'Réponse erronée.'}
          </p>
          <p class="text-[11px] text-slate-300 font-semibold leading-relaxed">${q.explanation}</p>
        </div>
        
        <button onclick="window.nextQuizQuestion()" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1">
          Question suivante <i data-lucide="arrow-right" class="h-3 w-3"></i>
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  },

  nextQuizQuestion() {
    this.currentQuizIdx++;
    this.renderQuizQuestion();
  },

  restartQuiz() {
    this.currentQuizIdx = 0;
    this.userQuizAnswers = [];
    const badge = document.getElementById('quiz-score-badge');
    if (badge) badge.classList.add('hidden');
    this.renderQuizQuestion();
  },

  setupChat() {
    const chatForm = document.getElementById('training-chat-form');
    const chatInput = document.getElementById('training-chat-input');
    const chatContainer = document.getElementById('training-chat-container');
    
    if (!chatForm || !chatInput || !chatContainer) return;

    this.chatHistory = [];

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = chatInput.value.trim();
      if (!question) return;

      chatInput.value = '';

      // Add user message
      const userBubble = document.createElement('div');
      userBubble.className = 'flex justify-end text-right';
      userBubble.innerHTML = `
        <div class="p-3 bg-emerald-600 text-white rounded-2xl rounded-tr-none ml-12 font-medium">
          ${question}
        </div>
      `;
      chatContainer.appendChild(userBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      this.chatHistory.push({ role: 'user', text: question });

      // Show loading
      const loadingId = `load-${Date.now()}`;
      const loader = document.createElement('div');
      loader.id = loadingId;
      loader.className = 'flex justify-start text-left animate-pulse';
      const redactLabel = this.currentLanguage === 'FR' ? 'Rédaction' : 'Liggéey';
      const redactDesc = this.currentLanguage === 'FR' ? 'Le mentor horticole étudie votre question...' : 'Mentor bi ngi saytu sa laaj...';
      loader.innerHTML = `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/70 border border-slate-100 dark:border-emerald-950/20 text-slate-500 rounded-2xl rounded-tl-none mr-12 flex items-center gap-2">
          <span class="text-[9px] font-black uppercase tracking-wider text-cyan-400">🤖 ${redactLabel}</span>
          <p class="text-xs font-bold italic">${redactDesc}</p>
        </div>
      `;
      chatContainer.appendChild(loader);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        let instructionContext = `Tu es le Mentor d'Apprentissage Horticole de KA Farm au Sénégal. Ton rôle est d'éduquer, enseigner et former l'utilisateur de manière extrêmement pratique et bienveillante sur la culture maraîchère locale. Reste rigoureusement focalisé sur les techniques agricoles du Sénégal (compostage, gestion de l'eau, intrants bio, calendrier des récoltes). Sois concis, utilise des listes à puces claires et évite le jargon complexe. Limite ta réponse à 120-150 mots maximum. Si l'utilisateur pose une question totalement hors-sujet, rappelle-lui gentiment que tu es là pour sa formation horticole. Les cultures supportées sont : oignon, piment, chou, aubergine, tomate, gombo, carotte, laitue, pomme de terre, patate douce, menthe, pastèque, navet, poivron.`;

        if (this.currentLanguage === 'WO') {
          instructionContext += ` CRITIQUE : Rédige TOUTES tes réponses obligatoirement en Wolof (langue locale sénégalaise) écrit phonétiquement ou de manière familière pour que les producteurs locaux te comprennent directement. Utilise des mots simples et un ton chaleureux sénégalais. Teranga !`;
        }

        const completePrompt = `${instructionContext}\n\nQuestion de l'apprenant : ${question}`;

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: completePrompt,
            history: this.chatHistory.slice(0, -1)
          })
        });

        const data = await response.json();
        const loaderEl = document.getElementById(loadingId);
        if (loaderEl) loaderEl.remove();

        if (data.error) throw new Error(data.error);

        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex justify-start text-left';
        const mentorTitle = this.currentLanguage === 'FR' ? 'Mentorat Horticole' : 'Daara Mbey';
        aiBubble.innerHTML = `
          <div class="p-3 bg-slate-50 dark:bg-[#061109]/70 border border-slate-100 dark:border-emerald-950/20 text-slate-800 dark:text-slate-300 rounded-2xl rounded-tl-none mr-12 leading-relaxed">
            <span class="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">🎓 ${mentorTitle}</span>
            <p>${data.text.replace(/\n/g, '<br>')}</p>
          </div>
        `;
        chatContainer.appendChild(aiBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        this.chatHistory.push({ role: 'advisor', text: data.text });
      } catch (err) {
        const loaderEl = document.getElementById(loadingId);
        if (loaderEl) loaderEl.remove();

        const errorBubble = document.createElement('div');
        errorBubble.className = 'flex justify-start text-left';
        const errorLabel = this.currentLanguage === 'FR' ? 'Erreur' : 'Njuumte';
        const errorDesc = this.currentLanguage === 'FR' ? 'Désolé, impossible de joindre le mentor. Vérifiez votre clé API Gemini ou votre connexion réseau.' : 'Désolé, mënul joxe tontu bi. Saytul sa connexion wala clé API.';
        errorBubble.innerHTML = `
          <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl rounded-tl-none mr-12 leading-relaxed">
            <span class="text-[9px] font-black uppercase tracking-wider block mb-1">❌ ${errorLabel}</span>
            <p>${errorDesc}</p>
          </div>
        `;
        chatContainer.appendChild(errorBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  },

  askMentorQuestion(questionText) {
    const chatInput = document.getElementById('training-chat-input');
    const chatForm = document.getElementById('training-chat-form');
    if (!chatInput) return;
    
    chatInput.value = questionText;
    chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      chatInput.focus();
      if (chatForm) {
        chatForm.requestSubmit();
      }
    }, 150);
  }
};

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
  TrainingModule.init();
});
