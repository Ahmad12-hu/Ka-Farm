// KA Farm - Crops & Nurseries Module (With Sanitary Diagnostics)
import { KAStorage } from '../storage.js';

let liveStream = null;
let currentSanitaryBase64 = '';

export const CropsModule = {
  init() {
    this.renderCrops();
    this.renderNurseries();
    this.renderTreatments();
    this.setupListeners();
  },

  renderCrops() {
    const container = document.getElementById('crops-container');
    if (!container) return;

    const crops = KAStorage.getCrops();

    if (crops.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-400">
          <p class="text-xs font-bold">Aucune culture enregistrée.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = crops.map(crop => {
      // Water badge
      const isDry = crop.waterStatus === 'Besoin d\'eau';
      const waterColor = isDry ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      const waterIcon = isDry ? 'droplet-off' : 'droplet';
      
      // Fertilization badge
      const fertNeed = crop.fertilizerStatus !== 'OK';
      const fertColor = fertNeed ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      
      // Sanitary status from recent photo or default sain
      const photos = crop.photos || [];
      let statusLabel = '🟢 Sain';
      let statusBadge = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      
      if (photos.length > 0) {
        const lastPhoto = photos[0];
        if (lastPhoto.status === 'Surveiller') {
          statusLabel = '🟡 À surveiller';
          statusBadge = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        } else if (lastPhoto.status === 'Alerte') {
          statusLabel = '🔴 Alerte / Maladie';
          statusBadge = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        }
      }

      return `
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white">${crop.name}</h3>
              <p class="text-[10px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${crop.field}</p>
            </div>
            <button onclick="window.deleteCrop('${crop.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>

          <!-- Status Row -->
          <div class="flex flex-wrap gap-2">
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-100 dark:border-[#143E23]/30 bg-slate-50 dark:bg-emerald-950/20 text-slate-600 dark:text-emerald-400">
              📊 ${crop.status}
            </span>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadge}">
              🛡️ ${statusLabel}
            </span>
          </div>

          <!-- Parameters Details -->
          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-[#143E23]/10 text-[11px] font-semibold">
            <div class="space-y-1">
              <p class="text-[9px] text-slate-400 uppercase tracking-wider">État hydrique</p>
              <button onclick="window.toggleWaterStatus('${crop.id}')" class="w-full flex items-center justify-between px-2 py-1 rounded border cursor-pointer transition-colors ${waterColor}">
                <span>${crop.waterStatus}</span>
                <i data-lucide="${waterIcon}" class="h-3 w-3"></i>
              </button>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] text-slate-400 uppercase tracking-wider">Nutriments</p>
              <button onclick="window.toggleFertStatus('${crop.id}')" class="w-full flex items-center justify-between px-2 py-1 rounded border cursor-pointer transition-colors ${fertColor}">
                <span class="truncate">${crop.fertilizerStatus}</span>
                <i data-lucide="leaf" class="h-3 w-3"></i>
              </button>
            </div>
          </div>

          <!-- Dates -->
          <div class="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-extrabold">
            <span>📅 Semis: ${crop.sowingDate}</span>
            <span>🎯 Récolte: ${crop.harvestDate}</span>
          </div>

          <!-- Diagnostic Action -->
          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex gap-2">
            <button onclick="window.openSanitaryDiagnostics('${crop.id}')" class="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#061109]/35 dark:hover:bg-[#061109]/65 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-[#143E23]/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="camera" class="h-3.5 w-3.5"></i> Diagnostic Sanitaire (${photos.length})
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  },

  renderNurseries() {
    const container = document.getElementById('nurseries-container');
    if (!container) return;

    const nurseries = KAStorage.getNurseries();

    if (nurseries.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-450">
          <p class="text-xs font-bold">Aucune pépinière enregistrée.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = nurseries.map(n => {
      let statusColor = 'bg-[#061109]/40 border-slate-100 text-slate-600 dark:text-slate-400';
      if (n.status === 'Prêt pour repiquage') {
        statusColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      }

      return `
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white">${n.name}</h3>
              <p class="text-[10px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${n.cropType} • Est. ${n.quantityEst} plants</p>
            </div>
            <button onclick="window.deleteNursery('${n.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] font-semibold">
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}">
              🌱 ${n.status}
            </span>
            <span class="text-[10px] text-[#819888] font-bold">❤️ ${n.healthStatus}</span>
          </div>

          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex gap-2">
            <button onclick="window.nextNurseryStatus('${n.id}')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="arrow-right-circle" class="h-3.5 w-3.5"></i> Évoluer le stade
            </button>
          </div>

          <div class="pt-2 text-[10px] text-slate-400 font-extrabold flex justify-between">
            <span>📅 Semis: ${n.sowingDate}</span>
            <span>📍 Repiquage: ${n.plannedTransplantDate}</span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupListeners() {
    // Delete crop
    window.deleteCrop = (id) => {
      if (!confirm('Voulez-vous supprimer cette culture ?')) return;
      const crops = KAStorage.getCrops().filter(c => c.id !== id);
      KAStorage.saveCrops(crops);
      this.renderCrops();
    };

    // Toggle water status
    window.toggleWaterStatus = (id) => {
      const crops = KAStorage.getCrops();
      const idx = crops.findIndex(c => c.id === id);
      if (idx !== -1) {
        crops[idx].waterStatus = crops[idx].waterStatus === 'Optimale' ? 'Besoin d\'eau' : 'Optimale';
        KAStorage.saveCrops(crops);
        this.renderCrops();
      }
    };

    // Toggle fertilizer status
    window.toggleFertStatus = (id) => {
      const crops = KAStorage.getCrops();
      const idx = crops.findIndex(c => c.id === id);
      if (idx !== -1) {
        const states = ['OK', 'Besoin d\'azote', 'Besoin de potasse'];
        const curIdx = states.indexOf(crops[idx].fertilizerStatus);
        crops[idx].fertilizerStatus = states[(curIdx + 1) % states.length];
        KAStorage.saveCrops(crops);
        this.renderCrops();
      }
    };

    // Delete nursery
    window.deleteNursery = (id) => {
      if (!confirm('Voulez-vous supprimer cette pépinière ?')) return;
      const nurseries = KAStorage.getNurseries().filter(n => n.id !== id);
      KAStorage.saveNurseries(nurseries);
      this.renderNurseries();
    };

    // Nursery status evolution
    window.nextNurseryStatus = (id) => {
      const nurseries = KAStorage.getNurseries();
      const idx = nurseries.findIndex(n => n.id === id);
      if (idx !== -1) {
        const states = ['Semis', 'Levée', 'Prêt pour repiquage'];
        const curIdx = states.indexOf(nurseries[idx].status);
        if (curIdx < states.length - 1) {
          nurseries[idx].status = states[curIdx + 1];
        } else {
          // If already Ready, we can transplant it to crops!
          if (confirm('Cette pépinière est prête. Voulez-vous la repiquer et l\'ajouter aux planches de cultures actives ?')) {
            const crops = KAStorage.getCrops();
            const newCrop = {
              id: `C-${Date.now()}`,
              name: nurseries[idx].name,
              field: 'Parcelle Ouest - Nouvelle planche',
              sowingDate: nurseries[idx].sowingDate,
              harvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'Croissance',
              waterStatus: 'Optimale',
              fertilizerStatus: 'OK',
              photos: []
            };
            crops.unshift(newCrop);
            KAStorage.saveCrops(crops);
            
            // Remove nursery
            const updatedNurseries = nurseries.filter(n => n.id !== id);
            KAStorage.saveNurseries(updatedNurseries);
            
            alert('Pépinière transplantée avec succès dans la Parcelle Ouest !');
            this.renderCrops();
            this.renderNurseries();
            return;
          }
        }
        KAStorage.saveNurseries(nurseries);
        this.renderNurseries();
      }
    };

    // Crop submission
    const cropForm = document.getElementById('shared-crop-form');
    if (cropForm) {
      cropForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('form-crop-name').value;
        const field = document.getElementById('form-crop-field').value;
        const sowing = document.getElementById('form-crop-sowing').value;
        const harvest = document.getElementById('form-crop-harvest').value;

        if (!name || !field || !sowing || !harvest) return;

        const crops = KAStorage.getCrops();
        crops.unshift({
          id: `C-${Date.now()}`,
          name,
          field,
          sowingDate: sowing,
          harvestDate: harvest,
          status: 'Semis',
          waterStatus: 'Optimale',
          fertilizerStatus: 'OK',
          photos: []
        });

        KAStorage.saveCrops(crops);
        this.renderCrops();
        cropForm.reset();
        
        // Hide modal
        document.getElementById('crop-form-modal').classList.add('hidden');
        alert('Nouvelle planche de culture enregistrée !');
      });
    }

    // Nursery submission
    const nurseryForm = document.getElementById('shared-nursery-form');
    if (nurseryForm) {
      nurseryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('form-nursery-name').value;
        const cropType = document.getElementById('form-nursery-crop').value;
        const qty = parseInt(document.getElementById('form-nursery-qty').value);
        const sowing = document.getElementById('form-nursery-sowing').value;
        const transplant = document.getElementById('form-nursery-transplant').value;

        if (!name || !cropType || !qty || !sowing || !transplant) return;

        const nurseries = KAStorage.getNurseries();
        nurseries.unshift({
          id: `PEP-${Date.now()}`,
          name,
          cropType,
          sowingDate: sowing,
          plannedTransplantDate: transplant,
          quantityEst: qty,
          status: 'Semis',
          healthStatus: 'Excellent'
        });

        KAStorage.saveNurseries(nurseries);
        this.renderNurseries();
        nurseryForm.reset();
        
        // Hide modal
        document.getElementById('nursery-form-modal').classList.add('hidden');
        alert('Nouvelle pépinière planifiée !');
      });
    }

    // SANITARY COMPONENT ATTACHMENTS FOR CAMERA
    window.openSanitaryDiagnostics = (cropId) => {
      this.openSanitaryModal(cropId);
    };

    window.closeSanitaryModal = () => {
      document.getElementById('sanitary-modal').classList.add('hidden');
      this.stopLiveCamera();
    };

    window.startLiveCamera = () => {
      this.startLiveCamera();
    };

    window.captureLivePhoto = () => {
      this.captureLivePhoto();
    };

    window.resetSanitaryPhoto = () => {
      this.resetSanitaryPhoto();
    };

    window.handleSanitaryFile = (input) => {
      this.handleSanitaryFile(input);
    };

    window.saveSanitaryRecord = (event) => {
      this.saveSanitaryRecord(event);
    };

    window.deleteSanitaryRecord = (cropId, recordId) => {
      this.deleteSanitaryRecord(cropId, recordId);
    };

    // TREATMENT & DAR BINDINGS
    window.openTreatmentModal = () => {
      const modal = document.getElementById('treatment-modal');
      const cropSelect = document.getElementById('form-treat-crop');
      const dateInput = document.getElementById('form-treat-date');
      const productInput = document.getElementById('form-treat-product');
      const notesInput = document.getElementById('form-treat-notes');
      
      if (productInput) productInput.value = '';
      if (notesInput) notesInput.value = '';

      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      if (cropSelect) {
        const crops = KAStorage.getCrops();
        if (crops.length === 0) {
          cropSelect.innerHTML = `<option value="">-- Aucune culture active --</option>`;
        } else {
          cropSelect.innerHTML = crops.map(c => `<option value="${c.id}">${c.name} (${c.field})</option>`).join('');
        }
      }

      // reset category and DAR to bio defaults
      const catSelect = document.getElementById('form-treat-category');
      if (catSelect) {
        catSelect.value = 'bio-phytosanitaire';
        window.onTreatmentCategoryChange('bio-phytosanitaire');
      }

      if (modal) modal.classList.remove('hidden');
    };

    window.onTreatmentCategoryChange = (category) => {
      const darInput = document.getElementById('form-treat-dar');
      const label = document.getElementById('dar-suggest-label');
      if (!darInput) return;

      if (category === 'bio-phytosanitaire') {
        darInput.value = 3;
        if (label) label.textContent = 'Conseillé: 1-3j';
      } else if (category === 'chimique-phytosanitaire') {
        darInput.value = 7;
        if (label) label.textContent = 'Conseillé: 7-14j';
      } else if (category === 'bio-engrais' || category === 'chimique-engrais') {
        darInput.value = 0;
        if (label) label.textContent = 'Conseillé: 0j';
      }
    };

    window.saveTreatmentRecord = (event) => {
      event.preventDefault();
      
      const cropId = document.getElementById('form-treat-crop').value;
      const category = document.getElementById('form-treat-category').value;
      const productName = document.getElementById('form-treat-product').value;
      const dateApplied = document.getElementById('form-treat-date').value;
      const dar = parseInt(document.getElementById('form-treat-dar').value) || 0;
      const notes = document.getElementById('form-treat-notes').value;

      if (!cropId || !productName || !dateApplied) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const crops = KAStorage.getCrops();
      const targetCrop = crops.find(c => c.id === cropId);
      const cropName = targetCrop ? targetCrop.name : 'Culture inconnue';

      const treatments = this.getTreatments();
      const newTreatment = {
        id: `TREAT-${Date.now()}`,
        cropId,
        cropName,
        category,
        productName,
        dateApplied,
        dar,
        notes
      };

      treatments.unshift(newTreatment);
      localStorage.setItem('ka_farm_treatments', JSON.stringify(treatments));

      // Hide modal
      document.getElementById('treatment-modal').classList.add('hidden');
      
      // Notify & Render
      alert('Traitement enregistré et DAR planifié !');
      this.renderTreatments();
    };

    window.deleteTreatment = (id) => {
      if (!confirm('Voulez-vous supprimer ce traitement du registre ?')) return;
      const treatments = this.getTreatments().filter(t => t.id !== id);
      localStorage.setItem('ka_farm_treatments', JSON.stringify(treatments));
      this.renderTreatments();
    };
  },

  // ==================== SANITARY MODULE METHODS ====================
  openSanitaryModal(cropId) {
    const modal = document.getElementById('sanitary-modal');
    const cropIdInput = document.getElementById('sanitary-crop-id');
    const titleSpan = document.getElementById('sanitary-modal-title');
    
    const crops = KAStorage.getCrops();
    const crop = crops.find(c => c.id === cropId);
    if (!crop) return;
    
    cropIdInput.value = cropId;
    titleSpan.textContent = `Diagnostic Sanitaire - ${crop.name} (${crop.field})`;
    
    if (modal) modal.classList.remove('hidden');
    
    const form = document.getElementById('sanitary-form');
    if (form) form.reset();
    
    this.resetSanitaryPhoto();
    this.stopLiveCamera();
    this.renderSanitaryHistory(crop);
  },

  renderSanitaryHistory(crop) {
    const historyDiv = document.getElementById('sanitary-history');
    if (!historyDiv) return;
    
    const photos = crop.photos || [];
    if (photos.length === 0) {
      historyDiv.innerHTML = `
        <div class="text-center py-8 text-slate-400 dark:text-slate-500">
          <span class="text-3xl">📋</span>
          <p class="text-[11px] font-bold mt-2">Aucun historique sanitaire pour cette culture.</p>
          <p class="text-[9px] text-slate-450 mt-1">Prenez ou importez une photo à droite pour diagnostiquer.</p>
        </div>
      `;
      return;
    }
    
    historyDiv.innerHTML = photos.map((photo) => {
      let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      let statusLabel = '🟢 Sain';
      if (photo.status === 'Surveiller') {
        badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        statusLabel = '🟡 À surveiller';
      } else if (photo.status === 'Alerte') {
        badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        statusLabel = '🔴 Alerte / Maladie';
      }
      
      return `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-emerald-950/30 rounded-2xl flex gap-3 items-start">
          <img src="${photo.imageUrl}" alt="Diagnostic" class="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-emerald-950 flex-shrink-0 cursor-pointer" onclick="window.viewFullSizePhoto('${photo.imageUrl}')">
          <div class="flex-grow space-y-1 text-left min-w-0">
            <div class="flex justify-between items-start">
              <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}">${statusLabel}</span>
              <button onclick="window.deleteSanitaryRecord('${crop.id}', '${photo.id}')" class="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer">
                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
              </button>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold">${photo.date}</p>
            <p class="text-xs text-slate-700 dark:text-slate-300 font-semibold break-words leading-relaxed">${photo.notes || 'Aucune observation.'}</p>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  async startLiveCamera() {
    const video = document.getElementById('sanitary-video');
    const placeholder = document.getElementById('sanitary-placeholder');
    const controls = document.getElementById('sanitary-camera-controls');
    const preview = document.getElementById('sanitary-preview');
    
    if (preview) preview.classList.add('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      liveStream = stream;
      if (video) {
        video.srcObject = stream;
        video.classList.remove('hidden');
        video.play();
      }
      if (controls) controls.classList.remove('hidden');
    } catch (err) {
      console.warn('getUserMedia failed', err);
      alert("Accès caméra direct indisponible. Veuillez utiliser le bouton 'Importer' pour charger une photo existante ou prendre un cliché via votre smartphone.");
      if (placeholder) placeholder.classList.remove('hidden');
    }
  },

  stopLiveCamera() {
    const video = document.getElementById('sanitary-video');
    const controls = document.getElementById('sanitary-camera-controls');
    const placeholder = document.getElementById('sanitary-placeholder');
    
    if (liveStream) {
      liveStream.getTracks().forEach(track => track.stop());
      liveStream = null;
    }
    
    if (video) {
      video.pause();
      video.srcObject = null;
      video.classList.add('hidden');
    }
    
    if (controls) controls.classList.add('hidden');
  },

  captureLivePhoto() {
    const video = document.getElementById('sanitary-video');
    const canvas = document.getElementById('sanitary-canvas');
    
    if (!video || !canvas) return;
    
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    
    this.stopLiveCamera();
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this.compressAndStore(dataUrl);
  },

  handleSanitaryFile(input) {
    if (!input.files || !input.files[0]) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.compressAndStore(e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  },

  compressAndStore(rawBase64) {
    const preview = document.getElementById('sanitary-preview');
    const placeholder = document.getElementById('sanitary-placeholder');
    const resetBtn = document.getElementById('sanitary-reset-preview-btn');
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const max_size = 600;
      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
      currentSanitaryBase64 = compressedDataUrl;
      
      if (preview) {
        preview.src = compressedDataUrl;
        preview.classList.remove('hidden');
      }
      if (placeholder) placeholder.classList.add('hidden');
      if (resetBtn) resetBtn.classList.remove('hidden');
    };
    img.src = rawBase64;
  },

  resetSanitaryPhoto() {
    const preview = document.getElementById('sanitary-preview');
    const placeholder = document.getElementById('sanitary-placeholder');
    const resetBtn = document.getElementById('sanitary-reset-preview-btn');
    const fileInput = document.getElementById('sanitary-file-input');
    
    currentSanitaryBase64 = '';
    if (fileInput) fileInput.value = '';
    
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (resetBtn) resetBtn.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
  },

  saveSanitaryRecord(event) {
    event.preventDefault();
    const cropId = document.getElementById('sanitary-crop-id').value;
    const status = document.getElementById('sanitary-status-select').value;
    const notes = document.getElementById('sanitary-notes').value;
    
    if (!currentSanitaryBase64) {
      alert("Veuillez d'abord capturer ou importer une photo.");
      return;
    }
    
    const crops = KAStorage.getCrops();
    const cropIdx = crops.findIndex(c => c.id === cropId);
    if (cropIdx === -1) return;
    
    const now = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('fr-FR', options);
    
    const newRecord = {
      id: `SAN-${Date.now()}`,
      date: formattedDate,
      imageUrl: currentSanitaryBase64,
      status: status,
      notes: notes
    };
    
    if (!crops[cropIdx].photos) {
      crops[cropIdx].photos = [];
    }
    
    crops[cropIdx].photos.unshift(newRecord);
    
    KAStorage.saveCrops(crops);
    this.renderCrops();
    this.renderSanitaryHistory(crops[cropIdx]);
    this.resetSanitaryPhoto();
    
    const notesTextarea = document.getElementById('sanitary-notes');
    if (notesTextarea) notesTextarea.value = '';

    alert('Diagnostic sanitaire enregistré avec succès !');
  },

  deleteSanitaryRecord(cropId, recordId) {
    if (!confirm("Veuillez confirmer la suppression de ce diagnostic.")) return;
    
    const crops = KAStorage.getCrops();
    const cropIdx = crops.findIndex(c => c.id === cropId);
    if (cropIdx === -1) return;
    
    crops[cropIdx].photos = (crops[cropIdx].photos || []).filter(p => p.id !== recordId);
    
    KAStorage.saveCrops(crops);
    this.renderCrops();
    this.renderSanitaryHistory(crops[cropIdx]);
  },

  getTreatments() {
    const defaultTreatments = [
      {
        id: 'TREAT-1',
        cropId: 'C-101',
        cropName: 'Tomate Mongal F1',
        category: 'bio-phytosanitaire',
        productName: 'Purin de Neem (Insecticide bio)',
        dateApplied: '2026-06-25',
        dar: 3,
        notes: 'Traitement foliaire contre la mouche blanche.'
      },
      {
        id: 'TREAT-2',
        cropId: 'C-102',
        cropName: 'Oignon Rouge de Galmi',
        category: 'bio-engrais',
        productName: 'Compost Organique Bio',
        dateApplied: '2026-06-15',
        dar: 0,
        notes: 'Amendement de fond mélangé lors du sarclage.'
      },
      {
        id: 'TREAT-3',
        cropId: 'C-104',
        cropName: 'Chou Cabus',
        category: 'chimique-phytosanitaire',
        productName: 'Décis (Insecticide chimique)',
        dateApplied: '2026-06-23',
        dar: 7,
        notes: 'Traitement curatif suite à l\'alerte sur les chenilles.'
      }
    ];

    const saved = localStorage.getItem('ka_farm_treatments');
    if (!saved) {
      localStorage.setItem('ka_farm_treatments', JSON.stringify(defaultTreatments));
      return defaultTreatments;
    }
    return JSON.parse(saved);
  },

  renderTreatments() {
    const container = document.getElementById('treatments-container');
    if (!container) return;

    const treatments = this.getTreatments();

    if (treatments.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-450">
          <p class="text-xs font-bold">Aucun traitement ou fertilisation enregistré.</p>
        </div>
      `;
      return;
    }

    const categoryNames = {
      'bio-phytosanitaire': '🌿 Phytosanitaire Bio',
      'chimique-phytosanitaire': '⚠️ Chimique (Pesticide)',
      'bio-engrais': '🟤 Amendement Organique',
      'chimique-engrais': '🧪 Engrais Minéral'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    container.innerHTML = treatments.map(t => {
      const applied = new Date(t.dateApplied);
      applied.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - applied.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const daysRemaining = t.dar - diffDays;
      const isDARActive = daysRemaining > 0;

      // Status Styling
      const borderClass = isDARActive
        ? 'border-rose-100 dark:border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10'
        : 'border-emerald-100 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10';

      const badgeColor = isDARActive
        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

      const badgeText = isDARActive
        ? `⏳ DAR ACTIF: ${daysRemaining} j restant${daysRemaining > 1 ? 's' : ''}`
        : `✅ SAIN & SÉCURISÉ`;

      const instructionText = isDARActive
        ? `<p class="text-[10px] text-rose-500 font-extrabold flex items-center gap-1">🚫 RÉCOLTE INTERDITE (DAR en cours)</p>`
        : `<p class="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">🟢 PRÊT POUR LE MARCHÉ SÉNÉGALAIS 🇸🇳</p>`;

      const categoryLabel = categoryNames[t.category] || t.category;

      return `
        <div class="p-5 border rounded-3xl space-y-4 text-left shadow-sm flex flex-col justify-between ${borderClass}">
          <div class="space-y-3">
            <div class="flex justify-between items-start gap-2">
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}">
                  ${badgeText}
                </span>
                <h3 class="text-sm font-black text-slate-800 dark:text-white mt-2">${t.productName}</h3>
                <p class="text-[10px] text-[#819888] font-extrabold uppercase tracking-wider mt-0.5">🌱 ${t.cropName}</p>
              </div>
              <button onclick="window.deleteTreatment('${t.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>

            <!-- Parameters Details -->
            <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 space-y-2 text-[11px] font-semibold">
              <div class="flex justify-between">
                <span class="text-slate-400">Type de produit:</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold">${categoryLabel}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Appliqué le:</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold font-mono">${t.dateApplied}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Délai requis (DAR):</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold font-mono">${t.dar} jour${t.dar > 1 ? 's' : ''}</span>
              </div>
            </div>

            ${t.notes ? `
            <div class="p-2.5 bg-white/40 dark:bg-black/20 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
              "${t.notes}"
            </div>
            ` : ''}
          </div>

          <!-- Bottom Warning/Safe Badge -->
          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex items-center justify-between">
            ${instructionText}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};

// Global image viewer helper
window.viewFullSizePhoto = (imgUrl) => {
  const viewer = document.createElement('div');
  viewer.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out';
  viewer.innerHTML = `
    <div class="relative max-w-3xl max-h-[90vh]">
      <img src="${imgUrl}" class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10">
      <p class="text-center text-xs text-white/60 mt-3 font-semibold">Cliquez n'importe où pour fermer</p>
    </div>
  `;
  viewer.onclick = () => viewer.remove();
  document.body.appendChild(viewer);
};

// Start crops module
document.addEventListener('DOMContentLoaded', () => {
  CropsModule.init();
});
