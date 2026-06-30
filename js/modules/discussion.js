// KA Farm - Discussion and Messaging Module
import { KAStorage } from '../storage.js';

export const DiscussionModule = {
  currentChatId: 'general', // 'general' or 'direct'
  messages: [],
  currentUser: null,
  pollIntervalId: null,

  init() {
    this.currentUser = KAStorage.getCurrentUser();
    if (!this.currentUser) {
      // Public/visitor fallback: allow guest browsing without blocking access
      this.currentUser = { email: 'guest@kafarm.sn', name: 'Visiteur', role: 'Invité', isGuest: true };
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
    // Form submission
    const form = document.getElementById('chat-send-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMessageSend();
      });
    }

    // Search input
    const searchInput = document.getElementById('chat-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.renderMessages();
      });
    }

    // Attach global functions to window
    window.selectChat = (chatId) => this.selectChat(chatId);
    window.shareActivity = (type) => this.shareActivity(type);
  },

  selectChat(chatId) {
    this.currentChatId = chatId;

    // Toggle active styles on sidebar
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
        // Save to local storage for caching/offline fallback
        KAStorage.saveMessages(data);
      } else {
        // Fallback to localStorage if API has any issues
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
    // Clear any existing poll
    if (this.pollIntervalId) clearInterval(this.pollIntervalId);
    
    // Poll every 3.5 seconds
    this.pollIntervalId = setInterval(() => {
      this.loadMessages();
    }, 3500);
  },

  renderMessages() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const searchQuery = document.getElementById('chat-search')?.value.toLowerCase() || '';

    // Filter messages for current active chat
    let filtered = this.messages.filter(m => {
      if (this.currentChatId === 'general') {
        // General channel displays messages that are NOT private direct messages
        return !m.isPrivate;
      } else {
        // Direct channel displays private messages
        return m.isPrivate === true;
      }
    });

    // Apply search query if typed
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

      // Check if message is a shared automated notification / report card
      const isNotification = m.text.startsWith('📢') || m.text.startsWith('💧') || m.text.startsWith('🥛') || m.text.startsWith('🌱');

      return `
        <div class="flex items-end gap-2.5 ${bubbleAlign} text-left animate-fadeIn">
          ${!isMe ? `
            <div class="h-8 w-8 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-[#819888] text-xs font-black flex items-center justify-center flex-shrink-0">
              ${avatarInitial}
            </div>
          ` : ''}
          <div class="max-w-[85%] sm:max-w-[70%] space-y-1">
            <div class="p-4.5 rounded-2xl ${bubbleBg} shadow-sm space-y-1.5">
              ${!isMe ? `
                <div class="flex items-center gap-1.5 pb-1 border-b border-[#143E23]/15">
                  <span class="text-[9px] font-black uppercase tracking-wider ${textThemeColor}">${m.senderName}</span>
                  <span class="text-[8px] px-1 bg-emerald-950/40 border border-[#143E23]/30 rounded text-emerald-400 font-bold">${m.senderEmail.includes('moussa') ? 'Terrain' : 'Bureau'}</span>
                </div>
              ` : ''}
              
              <p class="text-xs font-semibold leading-relaxed whitespace-pre-line ${isNotification ? 'italic text-emerald-100 font-black bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10' : ''}">${m.text}</p>
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

    // Auto-scroll chat to bottom
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
    if (!text) return;

    input.value = '';

    const payload = {
      id: 'msg-' + Date.now(),
      senderEmail: this.currentUser.email,
      senderName: this.currentUser.name,
      text: text,
      timestamp: new Date().toISOString(),
      isPrivate: this.currentChatId === 'direct'
    };

    // Optimistic client update
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
        // Fallback save to localStorage if API fails
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
  }
};

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
  DiscussionModule.init();
});

// Live update listener from cloud database
document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && e.detail.key === 'ka_farm_messages') {
    DiscussionModule.messages = e.detail.data;
    DiscussionModule.renderMessages();
  }
});
