// KA Farm - Module discussion et messagerie avec pièce jointe photo et partage social
import { KAStorage } from '../storage.js';

export const DiscussionModule = {
  currentChatId: 'general', // 'general' ou 'direct'
  messages: [],
  currentUser: null,
  pollIntervalId: null,
  attachedImageBase64: null,

  init() {
    this.currentUser = KAStorage.getCurrentUser();
    if (!this.currentUser) {
      // Valeur par défaut
      this.currentUser = { email: 'contact@kafarm.sn', name: 'Amadou KA', role: 'Bureau' };
    }

    this.renderUserInfo();
    this.setupListeners();
    this.loadMessages();
    this.startPolling();
  },

  renderUserInfo() {
    const avatarEl = document.getElementById('active-user-avatar');
    const nameEl = document.getElementById('active-user-name');
    
    if (avatarEl && this.currentUser) {
      const initials = this.currentUser.name.split(' ').map(n => n[0]).join('');
      avatarEl.textContent = initials;
    }
    if (nameEl && this.currentUser) {
      nameEl.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
    }
  },

  setupListeners() {
    // Soumission du formulaire
    const form = document.getElementById('chat-send-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMessageSend();
      });
    }

    // Champ de recherche
    const searchInput = document.getElementById('chat-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.renderMessages();
      });
    }

    // Sélection de photo
    const fileInput = document.getElementById('chat-image-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleImageSelection(e);
      });
    }

    // Attacher les fonctions globales pour les handlers HTML
    window.selectChat = (chatId) => this.selectChat(chatId);
    window.showChatSidebar = () => this.showChatSidebar();
    window.shareActivity = (type) => this.shareActivity(type);
    window.clearImageAttachment = () => this.clearImageAttachment();
    window.openShareModal = (messageId) => this.openShareModal(messageId);
    window.closeShareModal = () => this.closeShareModal();
    window.generateAICaption = () => this.generateAICaption();
    window.toggleHashtag = (hashtag) => this.toggleHashtag(hashtag);
    window.shareToSocial = (platform) => this.shareToSocial(platform);
    window.shareNative = () => this.shareNative();
  },

  showChatSidebar() {
    const sidebar = document.getElementById('chat-sidebar');
    const pane = document.getElementById('chat-pane');
    if (sidebar && pane) {
      sidebar.classList.remove('hidden');
      pane.classList.add('hidden');
      pane.classList.remove('flex');
    }
  },

  handleImageSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille du fichier (limite 8 Mo)
    if (file.size > 8 * 1024 * 1024) {
      alert("Cette image est trop volumineuse (maximum 8 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.attachedImageBase64 = event.target.result;
      
      // Afficher l'aperçu
      const previewContainer = document.getElementById('image-preview-container');
      const previewImg = document.getElementById('image-preview-img');
      const previewFilename = document.getElementById('image-preview-filename');

      if (previewContainer && previewImg && previewFilename) {
        previewImg.src = event.target.result;
        previewFilename.textContent = file.name + ` (${Math.round(file.size / 1024)} KB)`;
        previewContainer.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  },

  clearImageAttachment() {
    this.attachedImageBase64 = null;
    const fileInput = document.getElementById('chat-image-input');
    if (fileInput) fileInput.value = '';

    const previewContainer = document.getElementById('image-preview-container');
    if (previewContainer) {
      previewContainer.classList.add('hidden');
    }
  },

  selectChat(chatId) {
    this.currentChatId = chatId;

    // Basculer la vue sur mobile
    const isMobile = window.innerWidth < 768; // md breakpoint is 768px
    if (isMobile) {
      const sidebar = document.getElementById('chat-sidebar');
      const pane = document.getElementById('chat-pane');
      if (sidebar && pane) {
        sidebar.classList.add('hidden');
        pane.classList.remove('hidden');
        pane.classList.add('flex');
      }
    }

    // Activer le style sur la barre latérale
    const genButton = document.getElementById('channel-general');
    const directButton = document.getElementById('channel-direct');
    const titleEl = document.getElementById('current-chat-title');
    const descEl = document.getElementById('current-chat-desc');

    if (chatId === 'general') {
      genButton?.classList.add('bg-[#0D2615]', 'border-[#1A4525]/40', 'text-white');
      genButton?.classList.remove('text-slate-450', 'dark:text-slate-400', 'hover:bg-[#081b0e]/50');
      directButton?.classList.remove('bg-[#0D2615]', 'border-[#1A4525]/40', 'text-white');
      directButton?.classList.add('text-slate-450', 'dark:text-slate-400', 'hover:bg-[#081b0e]/50');
      
      if (titleEl) titleEl.textContent = 'Conseil de Famille (Général)';
      if (descEl) descEl.textContent = 'Canal ouvert à tous les membres associés (Moussa, Aly, Amadou)';
    } else {
      directButton?.classList.add('bg-[#0D2615]', 'border-[#1A4525]/40', 'text-white');
      directButton?.classList.remove('text-slate-450', 'dark:text-slate-400', 'hover:bg-[#081b0e]/50');
      genButton?.classList.remove('bg-[#0D2615]', 'border-[#1A4525]/40', 'text-white');
      genButton?.classList.add('text-slate-450', 'dark:text-slate-400', 'hover:bg-[#081b0e]/50');

      if (titleEl) titleEl.textContent = 'Ligne Directe (Moussa ↔ Aly)';
      if (descEl) descEl.textContent = 'Discussions privées et opérationnelles entre les deux frères de KA Farm';
    }

    this.renderMessages();
  },

  async loadMessages() {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        this.messages = data;
        // Sauvegarder en localStorage pour cache et fallback hors ligne
        KAStorage.saveMessages(data);
      } else {
        // Fallback localStorage si l'API a un problème
        this.messages = KAStorage.getMessages();
      }
    } catch (err) {
      console.warn('API /api/messages unreachable, using localStorage fallback:', err);
      this.messages = KAStorage.getMessages();
    }

    this.renderMessages();
    this.updateLastMessagePreviews();
  },

  startPolling() {
    // Arrêter tout sondage existant
    if (this.pollIntervalId) clearInterval(this.pollIntervalId);
    
    // Sonder toutes les 3.5 secondes
    this.pollIntervalId = setInterval(() => {
      this.loadMessages();
    }, 3500);
  },

  renderMessages() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const searchQuery = document.getElementById('chat-search')?.value.toLowerCase() || '';

    // Filtrer les messages du chat actif
    let filtered = this.messages.filter(m => {
      if (this.currentChatId === 'general') {
        // Canal général : messages qui ne sont pas privés
        return !m.isPrivate;
      } else {
        // Canal direct : messages privés uniquement
        return m.isPrivate === true;
      }
    });

    // Appliquer la recherche si présente
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.text.toLowerCase().includes(searchQuery) ||
        m.senderName.toLowerCase().includes(searchQuery)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 space-y-3 text-center">
          <i data-lucide="message-square-dashed" class="h-10 w-10 opacity-30 text-emerald-500"></i>
          <p class="text-xs font-bold">Aucun message trouvé.</p>
          <p class="text-[10px] max-w-xs mx-auto">Saisissez un message ci-dessous pour démarrer l'échange avec vos associés.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(m => {
      const isMe = m.senderEmail.toLowerCase() === this.currentUser.email.toLowerCase();
      
      const timeStr = new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(m.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      
      let bubbleBg = '';
      let bubbleAlign = '';
      let textThemeColor = '';
      let avatarInitial = m.senderName ? m.senderName.split(' ').map(n => n[0]).join('') : 'KA';

      if (isMe) {
        bubbleAlign = 'justify-end';
        bubbleBg = 'bg-emerald-600 border border-emerald-500 text-white rounded-br-none';
        textThemeColor = 'text-emerald-300';
      } else {
        bubbleAlign = 'justify-start';
        bubbleBg = 'bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 text-slate-800 dark:text-slate-100 rounded-bl-none';
        textThemeColor = m.senderEmail.includes('moussa') ? 'text-amber-500' : 'text-[#819888]';
      }

      // Vérifier s'il s'agit d'une notification automatique ou carte de rapport
      const isNotification = m.text.startsWith('📢') || m.text.startsWith('💧') || m.text.startsWith('🥛') || m.text.startsWith('🌱');

      return `
        <div class="flex items-end gap-2.5 ${bubbleAlign} text-left animate-fadeIn">
          ${!isMe ? `
            <div class="h-8 w-8 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-[#819888] text-xs font-black flex items-center justify-center flex-shrink-0">
              ${avatarInitial}
            </div>
          ` : ''}
          <div class="max-w-[85%] sm:max-w-[70%] space-y-1">
            <div class="p-4.5 rounded-2xl ${bubbleBg} shadow-sm space-y-2">
              ${!isMe ? `
                <div class="flex items-center gap-1.5 pb-1 border-b border-[#143E23]/15">
                  <span class="text-[9px] font-black uppercase tracking-wider ${textThemeColor}">${m.senderName}</span>
                  <span class="text-[8px] px-1 bg-emerald-950/40 border border-[#143E23]/30 rounded text-emerald-400 font-bold">${m.senderEmail.includes('moussa') ? 'Terrain' : 'Bureau'}</span>
                </div>
              ` : ''}
              
              <p class="text-xs font-semibold leading-relaxed whitespace-pre-line ${isNotification ? 'italic text-emerald-100 font-black bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10' : ''}">${m.text}</p>
              
              ${m.image ? `
                <div class="relative rounded-2xl overflow-hidden border border-[#143E23]/20 shadow-inner group mt-2" onclick="window.openShareModal('${m.id}')">
                  <img src="${m.image}" class="max-h-56 w-full object-cover rounded-xl cursor-pointer hover:scale-[1.01] transition-all duration-300" alt="Photo de l'exploitation">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[9px] bg-emerald-600 text-white font-black px-2 py-1 rounded-lg flex items-center gap-1">
                      <i data-lucide="share-2" class="h-3 w-3"></i> Publier en Ligne
                    </span>
                  </div>
                </div>
                <!-- Interactive share option footer bar -->
                <div class="flex gap-2 pt-1.5">
                  <button type="button" onclick="event.stopPropagation(); window.openShareModal('${m.id}')" class="px-2.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/30 rounded-xl text-[9px] font-black text-emerald-400 flex items-center gap-1.5 cursor-pointer transition-all">
                    <i data-lucide="share-2" class="h-3 w-3"></i> Partager sur les Réseaux
                  </button>
                </div>
              ` : ''}
            </div>
            
            <div class="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase px-1.5 justify-end">
              <span>${dateStr}</span>
              <span>•</span>
              <span>${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Défilement automatique vers le bas
    container.scrollTop = container.scrollHeight;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  updateLastMessagePreviews() {
    const generalLast = document.getElementById('general-last-msg');
    const directLast = document.getElementById('direct-last-msg');
    
    const genMessages = this.messages.filter(m => !m.isPrivate);
    const directMessages = this.messages.filter(m => m.isPrivate === true);

    if (generalLast && genMessages.length > 0) {
      const last = genMessages[genMessages.length - 1];
      generalLast.textContent = `${last.senderName.split(' ')[0]}: ${last.text.substring(0, 30)}${last.text.length > 30 ? '...' : ''}`;
    }
    
    if (directLast && directMessages.length > 0) {
      const last = directMessages[directMessages.length - 1];
      directLast.textContent = `${last.senderName.split(' ')[0]}: ${last.text.substring(0, 30)}${last.text.length > 30 ? '...' : ''}`;
    }
  },

  async handleMessageSend() {
    const input = document.getElementById('chat-message-input');
    if (!input) return;

    const text = input.value.trim();
    const image = this.attachedImageBase64;
    
    if (!text && !image) return;

    input.value = '';
    this.clearImageAttachment();

    const payload = {
      id: 'msg-' + Date.now(),
      senderEmail: this.currentUser.email,
      senderName: this.currentUser.name,
      text: text,
      timestamp: new Date().toISOString(),
      isPrivate: this.currentChatId === 'direct',
      image: image || null
    };

    // Mise à jour optimiste du client
    this.messages.push(payload);
    this.renderMessages();
    this.updateLastMessagePreviews();

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        this.messages = data;
        KAStorage.saveMessages(data);
      } else {
        // Sauvegarde fallback en localStorage si API échoue
        KAStorage.saveMessages(this.messages);
      }
    } catch (err) {
      console.warn('POST /api/messages unreachable, saving locally:', err);
      KAStorage.saveMessages(this.messages);
    }

    this.renderMessages();
    this.updateLastMessagePreviews();
  },

  shareActivity(type) {
    let messageText = '';
    const name = this.currentUser.name;

    if (type === 'compost') {
      const stocks = KAStorage.getStocks();
      const compost = stocks.find(s => s.name.toLowerCase().includes('compost')) || { quantity: 350, unit: 'kg' };
      messageText = `🌱 SUIVI SOL & COMPOST :
Bonjour, ${name} signale que le stock de compost bio est actuellement de ${compost.quantity} ${compost.unit}. L'incorporation sur la planche horticole en cours se poursuit de manière optimale.`;
    } else if (type === 'irrigation') {
      messageText = `💧 RAPPORT IRRIGATION :
${name} confirme que le planning d'arrosage a bien été exécuté ce matin. La pression du système de goutte-à-goutte est stable à 1.2 bar sur toute l'exploitation.`;
    } else if (type === 'stock') {
      const stocks = KAStorage.getStocks();
      const feeds = stocks.filter(s => s.category === 'Alimentation');
      let details = feeds.map(f => `- ${f.name} : ${f.quantity} / ${f.maxQuantity} ${f.unit}`).join('\n');
      if (!details) details = '- Aucun stock d\'alimentation d\'élevage enregistré.';
      
      messageText = `📢 INVENTAIRE ALIMENTATION ÉLEVAGE :
Rapport partagé par ${name} :\n${details}\nLes niveaux sont vérifiés pour la ration quotidienne du cheptel.`;
    } else if (type === 'traite') {
      const production = KAStorage.getElevageProduction();
      const milkLogs = production.filter(p => p.type === 'Lait');
      const latestMilk = milkLogs.length > 0 ? milkLogs[milkLogs.length - 1] : { quantity: 150, unit: 'L', date: 'aujourd\'hui' };
      
      messageText = `🥛 BULLETIN DE PRODUCTION :
${name} partage le dernier rendement de traite laitière : ${latestMilk.quantity} ${latestMilk.unit} enregistrés le ${latestMilk.date}. Lait stocké en cuve de refroidissement pour livraison.`;
    }

    const input = document.getElementById('chat-message-input');
    if (input && messageText) {
      input.value = messageText;
      input.focus();
    }
  },

  // --- SOCIAL MEDIA SHARING MODAL CONTROLLER ---
  openShareModal(messageId) {
    const msg = this.messages.find(m => m.id === messageId);
    if (!msg) return;

    const modal = document.getElementById('social-share-modal');
    const modalImg = document.getElementById('share-modal-img');
    const modalCaption = document.getElementById('share-modal-caption');

    if (modal && modalImg && modalCaption) {
      modalImg.src = msg.image || '/assets/logo.png';
      modalCaption.value = msg.text || '';
      
      // Reset hashtag selections
      const hashtagBtns = document.querySelectorAll('.hashtag-btn');
      hashtagBtns.forEach(btn => {
        btn.classList.remove('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
        btn.classList.add('bg-[#051009]/60', 'text-slate-400', 'border-[#143E23]/40');
      });

      // Show modal with animation
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.querySelector('.transform').classList.remove('scale-95');
        modal.querySelector('.transform').classList.add('scale-100');
      }, 10);
    }
  },

  closeShareModal() {
    const modal = document.getElementById('social-share-modal');
    if (modal) {
      modal.querySelector('.transform').classList.add('scale-95');
      modal.querySelector('.transform').classList.remove('scale-100');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  },

  toggleHashtag(hashtag) {
    const captionArea = document.getElementById('share-modal-caption');
    if (!captionArea) return;

    let text = captionArea.value;
    
    // Find the hashtag button to toggle style
    const btns = Array.from(document.querySelectorAll('.hashtag-btn'));
    const btn = btns.find(b => b.textContent === hashtag);

    if (text.includes(hashtag)) {
      // Remove hashtag
      text = text.replace(new RegExp(`\\s*${hashtag}`, 'g'), '').trim();
      if (btn) {
        btn.classList.remove('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
        btn.classList.add('bg-[#051009]/60', 'text-slate-400', 'border-[#143E23]/40');
      }
    } else {
      // Add hashtag
      text = text + (text ? ' ' : '') + hashtag;
      if (btn) {
        btn.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
        btn.classList.remove('bg-[#051009]/60', 'text-slate-400', 'border-[#143E23]/40');
      }
    }

    captionArea.value = text;
  },

  async generateAICaption() {
    const captionArea = document.getElementById('share-modal-caption');
    const btn = document.getElementById('ai-generate-caption-btn');
    if (!captionArea || !btn) return;

    const originalText = captionArea.value.trim();
    if (!originalText) {
      alert("Veuillez saisir un début de texte ou une idée de publication pour l'améliorer.");
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="h-3.5 w-3.5 animate-spin"></i><span>Rédaction...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Rédige un post marketing très attractif et court pour mes réseaux sociaux d'agriculture à partir de cette légende existante : "${originalText}". Rends-le captivant pour attirer de futurs clients, utilise un ton chaleureux du Sénégal, ajoute des emojis horticoles adéquats et quelques expressions locales (comme 'Alhamdoulilah', 'Sama Mbaye'). Rends-le prêt à être partagé directement sur WhatsApp.`
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.text) {
          captionArea.value = result.text.trim();
        }
      } else {
        alert("Impossible de contacter le conseiller IA. Utilisation de la légende d'origine.");
      }
    } catch (err) {
      console.error("Gemini caption generation failed:", err);
      alert("Erreur technique lors de la génération IA.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  shareToSocial(platform) {
    const caption = document.getElementById('share-modal-caption')?.value || '';
    let url = '';

      // Créer le texte de partage personnalisé
    const textToShare = caption + "\n\n🌐 Suivez notre exploitation horticole KA Farm en direct !";

    // Copier dans le presse-papier pour partage facile
    navigator.clipboard.writeText(caption).catch(err => console.log("Clipboard error", err));

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(textToShare)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(textToShare)}`;
        break;
    }

    if (url) {
      // Message toast expliquant la copie
      const toast = document.createElement('div');
      toast.className = "fixed bottom-5 right-5 z-[100] bg-emerald-800 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl animate-bounce border border-emerald-500 flex items-center gap-2";
      toast.innerHTML = `<i data-lucide="copy-check" class="h-4 w-4"></i><span>Légende copiée ! Ouvrez le réseau pour coller et publier.</span>`;
      document.body.appendChild(toast);
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => toast.remove(), 4000);

      // Ouvrir la fenêtre de partage
      window.open(url, '_blank');
    }
  },

  async shareNative() {
    const caption = document.getElementById('share-modal-caption')?.value || '';
    const base64Data = document.getElementById('share-modal-img')?.src;

    if (!base64Data) return;

    if (!navigator.share) {
      alert("Le partage natif n'est pas supporté sur ce navigateur. La légende a été copiée, veuillez utiliser WhatsApp ou Facebook ci-dessus.");
      return;
    }

    try {
      // Convertir les données base64 en objet image
      const blob = await fetch(base64Data).then(r => r.blob());
      const file = new File([blob], "ka_farm_actualites.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'KA Farm - Actualités',
          text: caption
        });
      } else {
        await navigator.share({
          title: 'KA Farm - Actualités',
          text: caption
        });
      }
    } catch (err) {
      console.warn("Direct file sharing was cancelled or failed, falling back to text-only native sharing:", err);
      try {
        await navigator.share({
          title: 'KA Farm - Actualités',
          text: caption
        });
      } catch (innerErr) {
        console.log("Native sharing aborted completely", innerErr);
      }
    }
  }
};

// Démarrage automatique au chargement
document.addEventListener('DOMContentLoaded', () => {
  DiscussionModule.init();
});

// Écoute de mise à jour depuis la base
document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && e.detail.key === 'ka_farm_messages') {
    DiscussionModule.messages = e.detail.data;
    DiscussionModule.renderMessages();
  }
});
