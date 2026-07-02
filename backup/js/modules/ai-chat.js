// KA Farm - AI Chat Interface Module
import { AIAgent } from './ai-agent.js';
import { KAStorage } from '../storage.js';

export const AIChat = {
  isOpen: false,
  isTyping: false,

  init() {
    this.injectChatButton();
    this.injectChatWindow();
    this.setupListeners();
    
    // Check if AI is configured
    this.updateConfigStatus();
  },

  injectChatButton() {
    if (document.getElementById('ai-chat-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'ai-chat-fab';
    fab.className = 'fixed bottom-20 right-4 z-40 h-14 w-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95';
    fab.innerHTML = '<i data-lucide="message-square" class="h-6 w-6"></i>';
    fab.onclick = () => this.toggleChat();
    document.body.appendChild(fab);

    if (window.lucide) window.lucide.createIcons();
  },

  injectChatWindow() {
    if (document.getElementById('ai-chat-window')) return;

    const chatWindow = document.createElement('div');
    chatWindow.id = 'ai-chat-window';
    chatWindow.className = 'fixed bottom-24 right-4 z-40 w-[calc(100%-2rem)] sm:w-96 h-[500px] bg-white dark:bg-[#0B2112] border border-slate-200 dark:border-[#143E23]/60 rounded-3xl shadow-2xl hidden flex-col';
    
    chatWindow.innerHTML = `
      <!-- Header -->
      <div class="p-4 bg-emerald-600 text-white rounded-t-3xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
            <i data-lucide="bot" class="h-5 w-5"></i>
          </div>
          <div>
            <p class="text-xs font-black">KA Farm Assistant IA</p>
            <p class="text-[9px] text-emerald-100 font-bold">Conseiller Maraîcher Intelligent</p>
          </div>
        </div>
        <button onclick="window.AIChat.toggleChat()" class="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>

      <!-- Messages Container -->
      <div id="ai-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 text-left">
        <!-- Welcome Message -->
        <div class="ai-message flex gap-2">
          <div class="h-7 w-7 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <i data-lucide="bot" class="h-4 w-4"></i>
          </div>
          <div class="bg-slate-50 dark:bg-[#061109] border border-slate-100 dark:border-[#143E23]/20 rounded-2xl rounded-tl-none p-3 max-w-[85%]">
            <p class="text-[11px] text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
              🌱 Bonjour ! Je suis l'assistant IA de <strong>KA Farm</strong>. Je peux vous aider avec :
            </p>
            <ul class="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1.5 space-y-0.5 list-disc list-inside">
              <li>Conseils agricoles (cultures, maladies, saisons)</li>
              <li>Optimisation des finances et rentabilité</li>
              <li>Analyse de code et améliorations techniques</li>
              <li>Rappels de workflow (Git, Vercel, Firebase)</li>
            </ul>
            <p class="text-[10px] text-slate-500 dark:text-slate-500 mt-1.5 italic">
              Posez-moi n'importe quelle question !
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div id="ai-quick-actions" class="px-4 pb-2 flex gap-2 overflow-x-auto">
        <button class="quick-action-btn whitespace-nowrap px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full transition-all">
          💡 Conseils cultures
        </button>
        <button class="quick-action-btn whitespace-nowrap px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black rounded-full transition-all">
          📊 Optimiser finances
        </button>
        <button class="quick-action-btn whitespace-nowrap px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-full transition-all">
          🔧 Améliorer le code
        </button>
        <button class="quick-action-btn whitespace-nowrap px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full transition-all">
          🌦️ Conseil météo
        </button>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-slate-100 dark:border-[#143E23]/20">
        <div class="flex gap-2">
          <textarea 
            id="ai-chat-input" 
            placeholder="Votre question..." 
            class="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#061109] border border-slate-200 dark:border-[#143E23]/40 rounded-xl text-xs outline-none focus:border-emerald-500/50 resize-none"
            rows="1"
            onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); window.AIChat.sendMessage()}"
          ></textarea>
          <button id="ai-chat-send" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center justify-center">
            <i data-lucide="send" class="h-4 w-4"></i>
          </button>
        </div>
        <p id="ai-chat-status" class="text-[9px] text-slate-400 mt-1.5 hidden"></p>
      </div>
    `;

    document.body.appendChild(chatWindow);

    if (window.lucide) window.lucide.createIcons();

    // Setup quick actions
    setTimeout(() => {
      document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const actionText = btn.textContent.trim();
          document.getElementById('ai-chat-input').value = this.getQuickActionPrompt(actionText);
          this.sendMessage();
        });
      });
    }, 100);
  },

  getQuickActionPrompt(action) {
    const prompts = {
      'Conseils cultures': 'Donne-moi des conseils pour mes cultures maraîchères au Sénégal.',
      'Optimiser finances': 'Analyse mes données financières et propose des améliorations.',
      'Améliorer le code': 'Examine le code du projet KA Farm et propose des optimisations.',
      'Conseil météo': 'Donne un conseil horticole basé sur la météo actuelle.'
    };
    return prompts[action] || action;
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('ai-chat-window');
    const fab = document.getElementById('ai-chat-fab');
    
    if (this.isOpen) {
      window.classList.remove('hidden');
      window.classList.add('flex');
      fab.classList.add('scale-0');
      setTimeout(() => document.getElementById('ai-chat-input')?.focus(), 100);
    } else {
      window.classList.add('hidden');
      window.classList.remove('flex');
      fab.classList.remove('scale-0');
    }
  },

  setupListeners() {
    const sendBtn = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    if (input) {
      // Auto-resize textarea
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
      });
    }
  },

  async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input?.value.trim();
    
    if (!message || this.isTyping) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Add user message to chat
    this.addMessage(message, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    // Get context from current page and project stats
    const context = this.getContext();

    try {
      const response = await AIAgent.sendMessage(message, context);
      
      // Remove typing indicator
      this.hideTypingIndicator();

      if (response.success) {
        this.addMessage(response.message, 'ai');
      } else {
        this.addMessage(response.message, 'ai', true);
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('❌ Désolé, une erreur est survenue. Veuillez réessayer.', 'ai', true);
    }
  },

  addMessage(text, sender, isError = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message flex gap-2 ${sender === 'user' ? 'flex-row-reverse' : ''}`;

    const avatar = sender === 'user' 
      ? '<div class="h-7 w-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 font-black text-[10px]">Moi</div>'
      : '<div class="h-7 w-7 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0"><i data-lucide="bot" class="h-4 w-4"></i></div>';

    const bubbleClass = sender === 'user'
      ? 'bg-emerald-600 text-white rounded-tr-none'
      : isError 
        ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-200 rounded-tl-none'
        : 'bg-slate-50 dark:bg-[#061109] border border-slate-100 dark:border-[#143E23]/20 text-slate-700 dark:text-slate-200 rounded-tl-none';

    messageDiv.innerHTML = `
      ${avatar}
      <div class="${bubbleClass} rounded-2xl p-3 max-w-[85%]">
        <p class="text-[11px] font-semibold leading-relaxed whitespace-pre-wrap">${this.escapeHtml(text)}</p>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (window.lucide) window.lucide.createIcons();
  },

  showTypingIndicator() {
    this.isTyping = true;
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.className = 'ai-message flex gap-2';
    typingDiv.innerHTML = `
      <div class="h-7 w-7 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <i data-lucide="bot" class="h-4 w-4"></i>
      </div>
      <div class="bg-slate-50 dark:bg-[#061109] border border-slate-100 dark:border-[#143E23]/20 rounded-2xl rounded-tl-none p-3">
        <div class="flex gap-1">
          <div class="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
          <div class="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (window.lucide) window.lucide.createIcons();
  },

  hideTypingIndicator() {
    this.isTyping = false;
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  },

  getContext() {
    const currentUser = KAStorage.getCurrentUser();
    const currentPage = window.location.pathname;
    
    // Gather project statistics
    const crops = KAStorage.getCrops() || [];
    const tasks = KAStorage.getTasks() || [];
    const nurseries = KAStorage.getNurseries() || [];
    const stocks = KAStorage.getStocks() || [];
    const finances = KAStorage.getFinances() || [];

    return {
      projectContext: 'Projet KA Farm - Maraîchage & Horticulture au Sénégal.',
      userRole: currentUser?.role || 'Utilisateur',
      currentPage: currentPage,
      projectStats: {
        crops: crops.length,
        tasks: tasks.filter(t => !t.completed).length,
        nurseries: nurseries.length,
        stocks: stocks.length,
        finances: finances.length
      }
    };
  },

  updateConfigStatus() {
    const statusEl = document.getElementById('ai-chat-status');
    if (!statusEl) return;

    if (!AIAgent.isConfigured()) {
      statusEl.textContent = '⚠️ Configurez votre clé API Gemini dans Paramètres pour activer l\'IA.';
      statusEl.classList.remove('hidden');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.AIChat = AIChat;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AIChat.init());
} else {
  AIChat.init();
}