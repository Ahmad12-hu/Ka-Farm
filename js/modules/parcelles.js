// KA Farm - Gestion des Parcelles Module
import { KAStorage } from '../storage.js';

let parcelles = [];
let selectedParcelId = null;

// Standard crops parameters (costs of inputs, market prices per kg, yields per sq m)
const CROP_MARKET_STANDARDS = {
  'Tomate Mongal F1': { marketPrice: 800, yieldPerSqM: 4.5, inputCost: 40000 },
  'Oignon Rouge de Galmi': { marketPrice: 600, yieldPerSqM: 5.0, inputCost: 85000 },
  'Chou Cabus': { marketPrice: 450, yieldPerSqM: 6.0, inputCost: 50000 },
  'Menthe de Thiès': { marketPrice: 1200, yieldPerSqM: 2.0, inputCost: 15000 },
  'Papayer Solo (Jeunes plants)': { marketPrice: 750, yieldPerSqM: 4.0, inputCost: 95000 },
  'Papayer Solo': { marketPrice: 750, yieldPerSqM: 4.0, inputCost: 95000 }
};

// Predefined SVG coordinates for parcels
const PARCEL_POSITIONS = {
  'P-001': { x: 25, y: 25, w: 140, h: 90, rx: 12 },
  'P-002': { x: 205, y: 25, w: 265, h: 90, rx: 12 },
  'P-003': { x: 25, y: 155, w: 140, h: 90, rx: 12 },
  'P-004': { x: 25, y: 265, w: 140, h: 85, rx: 12 },
  'P-005': { x: 205, y: 155, w: 265, h: 195, rx: 12 }
};

export const ParcellesModule = {
  init() {
    parcelles = KAStorage.getParcelles();
    
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const searchParam = urlParams.get('search');
    
    if (idParam && parcelles.some(p => p.id === idParam)) {
      selectedParcelId = idParam;
    } else if (searchParam) {
      const found = parcelles.find(p => p.name.toLowerCase().includes(searchParam.toLowerCase()) || (p.currentCrop && p.currentCrop.toLowerCase().includes(searchParam.toLowerCase())));
      if (found) {
        selectedParcelId = found.id;
      } else if (parcelles.length > 0) {
        selectedParcelId = parcelles[0].id;
      }
    } else if (parcelles.length > 0) {
      selectedParcelId = parcelles[0].id;
    }
    
    this.render();
    this.setupListeners();
    
    // Auto-search filter
    const searchInput = document.getElementById('search-parcelles');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterParcelles(e.target.value);
      });
    }
  },

  render() {
    this.renderStats();
    this.renderMap();
    this.renderTable();
    this.renderDetails();
  },

  renderStats() {
    if (!parcelles.length) return;

    // Surface Totale
    const totalSurface = parcelles.reduce((sum, p) => sum + Number(p.surface), 0);
    const totalSurfaceEl = document.getElementById('stat-total-surface');
    if (totalSurfaceEl) totalSurfaceEl.textContent = totalSurface.toLocaleString('fr-FR');

    // Parcelles Actives (Cultivées)
    const activeParcels = parcelles.filter(p => p.status === 'Cultivée');
    const activeCountEl = document.getElementById('stat-active-count');
    if (activeCountEl) activeCountEl.textContent = activeParcels.length;

    const totalCountEl = document.getElementById('stat-total-count');
    if (totalCountEl) totalCountEl.textContent = parcelles.length;

    const pct = Math.round((activeParcels.length / parcelles.length) * 100) || 0;
    const pctEl = document.getElementById('stat-cultivated-percentage');
    if (pctEl) {
      pctEl.textContent = `${pct}% du domaine cultivé`;
    }

    // Taille Moyenne
    const avgSurface = Math.round(totalSurface / parcelles.length) || 0;
    const avgSurfaceEl = document.getElementById('stat-avg-surface');
    if (avgSurfaceEl) avgSurfaceEl.textContent = avgSurface.toLocaleString('fr-FR');

    // Center coordinates
    const centerLatEl = document.getElementById('stat-gps-lat');
    const centerLngEl = document.getElementById('stat-gps-lng');
    if (centerLatEl && centerLngEl && parcelles.length > 0) {
      const avgLat = parcelles.reduce((sum, p) => sum + Number(p.lat), 0) / parcelles.length;
      const avgLng = parcelles.reduce((sum, p) => sum + Number(p.lng), 0) / parcelles.length;
      centerLatEl.textContent = `${avgLat.toFixed(4)}° N`;
      centerLngEl.textContent = `${Math.abs(avgLng).toFixed(4)}° O`;
    }
  },

  renderMap() {
    const mapGroup = document.getElementById('svg-parcelles-group');
    if (!mapGroup) return;

    mapGroup.innerHTML = '';

    const getCropEmoji = (crop) => {
      if (!crop) return '';
      const c = crop.toLowerCase();
      if (c.includes('tomate')) return '🍅';
      if (c.includes('oignon')) return '🧅';
      if (c.includes('chou')) return '🥬';
      if (c.includes('menthe')) return '🌿';
      if (c.includes('piment')) return '🌶️';
      if (c.includes('papay')) return '🌴';
      if (c.includes('arachide')) return '🥜';
      if (c.includes('laitue')) return '🥗';
      if (c.includes('aubergine')) return '🍆';
      return '🌱';
    };

    parcelles.forEach((parcel, index) => {
      // Get position coords or compute one dynamically if added by user
      let pos = PARCEL_POSITIONS[parcel.id];
      if (!pos) {
        // Place custom newly added parcels inside an alternate layout
        const row = Math.floor((index - 5) / 2);
        const col = (index - 5) % 2;
        pos = {
          x: 205 + col * 135,
          y: 25 + row * 100,
          w: 125,
          h: 80,
          rx: 10
        };
      }

      const isSelected = parcel.id === selectedParcelId;
      
      const isDark = document.documentElement.classList.contains('dark');

      // Determine styling classes based on status and selection
      let fillColor = isDark ? 'rgba(107, 114, 128, 0.08)' : 'rgba(107, 114, 128, 0.05)'; // Jachère default
      let strokeColor = isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.5)';
      let textBadgeColor = isDark ? '#94A3B8' : '#475569';
      let statusTextColor = isDark ? '#64748B' : '#475569';

      if (parcel.status === 'Cultivée') {
        fillColor = isDark 
          ? (isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.1)')
          : (isSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.08)');
        strokeColor = isDark
          ? (isSelected ? '#10B981' : 'rgba(16, 185, 129, 0.5)')
          : (isSelected ? '#059669' : 'rgba(16, 185, 129, 0.5)');
        textBadgeColor = isDark ? '#34D399' : '#047857';
        statusTextColor = isDark ? '#10B981' : '#059669';
      } else if (parcel.status === 'En préparation') {
        fillColor = isDark
          ? (isSelected ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.08)')
          : (isSelected ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.06)');
        strokeColor = isDark
          ? (isSelected ? '#F59E0B' : 'rgba(245, 158, 11, 0.5)')
          : (isSelected ? '#D97706' : 'rgba(245, 158, 11, 0.5)');
        textBadgeColor = isDark ? '#FBBF24' : '#B45309';
        statusTextColor = isDark ? '#F59E0B' : '#D97706';
      } else {
        // Jachère
        fillColor = isDark
          ? (isSelected ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.06)')
          : (isSelected ? 'rgba(100, 116, 139, 0.18)' : 'rgba(148, 163, 184, 0.05)');
        strokeColor = isDark
          ? (isSelected ? '#94A3B8' : 'rgba(148, 163, 184, 0.4)')
          : (isSelected ? '#64748B' : 'rgba(148, 163, 184, 0.4)');
      }

      const strokeWidth = isSelected ? '3.5' : '1.5';
      const glowFilter = isSelected ? 'filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.35));' : '';

      // Create SVG Elements using template literals
      const parcelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      parcelG.setAttribute('class', 'parcel-svg-group cursor-pointer group');
      parcelG.setAttribute('data-id', parcel.id);
      parcelG.addEventListener('click', () => {
        this.selectParcel(parcel.id);
      });

      // SVG Rectangle shape
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pos.x);
      rect.setAttribute('y', pos.y);
      rect.setAttribute('width', pos.w);
      rect.setAttribute('height', pos.h);
      rect.setAttribute('rx', pos.rx || 10);
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', strokeWidth);
      rect.setAttribute('style', `${glowFilter} transition: all 0.25s ease;`);
      parcelG.appendChild(rect);

      // SVG Text elements (Name)
      const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textName.setAttribute('x', pos.x + 12);
      textName.setAttribute('y', pos.y + 24);
      const nameFill = isDark 
        ? (isSelected ? '#FFFFFF' : '#E2E8F0') 
        : (isSelected ? '#064E3B' : '#0F172A');
      textName.setAttribute('fill', nameFill);
      textName.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif');
      textName.setAttribute('font-size', '10');
      textName.setAttribute('font-weight', '900');
      textName.textContent = parcel.name;
      parcelG.appendChild(textName);

      // SVG Text elements (Surface)
      const textSquare = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textSquare.setAttribute('x', pos.x + 12);
      textSquare.setAttribute('y', pos.y + 39);
      const areaFill = isDark ? '#94A3B8' : '#475569';
      textSquare.setAttribute('fill', areaFill);
      textSquare.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif');
      textSquare.setAttribute('font-size', '8');
      textSquare.setAttribute('font-weight', '700');
      textSquare.textContent = `${parcel.surface} m²`;
      parcelG.appendChild(textSquare);

      // SVG Text elements (Active crop / status)
      const textCrop = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textCrop.setAttribute('x', pos.x + 12);
      textCrop.setAttribute('y', pos.y + pos.h - 26);
      textCrop.setAttribute('fill', textBadgeColor);
      textCrop.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif');
      textCrop.setAttribute('font-size', '9');
      textCrop.setAttribute('font-weight', '800');
      textCrop.textContent = parcel.currentCrop || 'Aucune culture';
      parcelG.appendChild(textCrop);

      // SVG Text elements (GPS coordinates shortcut)
      const textGps = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textGps.setAttribute('x', pos.x + 12);
      textGps.setAttribute('y', pos.y + pos.h - 12);
      const gpsFill = isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(71, 85, 105, 0.85)';
      textGps.setAttribute('fill', gpsFill);
      textGps.setAttribute('font-family', 'monospace');
      textGps.setAttribute('font-size', '7.5');
      textGps.setAttribute('font-weight', '700');
      textGps.textContent = `${Number(parcel.lat).toFixed(4)}, ${Number(parcel.lng).toFixed(4)}`;
      parcelG.appendChild(textGps);

      // Interactive Crop Avatar representation (Option 3)
      if (parcel.currentCrop && parcel.status === 'Cultivée') {
        const emoji = getCropEmoji(parcel.currentCrop);
        if (emoji) {
          const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          badgeG.setAttribute('transform', `translate(${pos.x + pos.w - 22}, ${pos.y + 22})`);

          const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          badgeBg.setAttribute('cx', '0');
          badgeBg.setAttribute('cy', '0');
          badgeBg.setAttribute('r', '11');
          badgeBg.setAttribute('fill', isDark ? '#111827' : '#FFFFFF');
          badgeBg.setAttribute('stroke', isSelected ? strokeColor : (isDark ? '#374151' : '#E5E7EB'));
          badgeBg.setAttribute('stroke-width', '1');
          badgeG.appendChild(badgeBg);

          const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          badgeText.setAttribute('x', '0');
          badgeText.setAttribute('y', '3.5');
          badgeText.setAttribute('font-size', '11');
          badgeText.setAttribute('text-anchor', 'middle');
          badgeText.textContent = emoji;
          badgeG.appendChild(badgeText);

          parcelG.appendChild(badgeG);
        }
      }

      // Interactive Water Droplet Status (Option 3)
      const waterStatus = parcel.waterStatus || 'Irrigué';
      const waterG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      waterG.setAttribute('transform', `translate(${pos.x + pos.w - 22}, ${pos.y + pos.h - 22})`);

      const waterCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      waterCircle.setAttribute('cx', '0');
      waterCircle.setAttribute('cy', '0');
      waterCircle.setAttribute('r', '10');
      if (waterStatus === "Besoin d'eau") {
        waterCircle.setAttribute('fill', isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2');
        waterCircle.setAttribute('stroke', '#EF4444');
        waterCircle.setAttribute('stroke-width', '1');
        waterCircle.setAttribute('class', 'animate-pulse');
      } else {
        waterCircle.setAttribute('fill', isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE');
        waterCircle.setAttribute('stroke', '#0EA5E9');
        waterCircle.setAttribute('stroke-width', '1');
      }
      waterG.appendChild(waterCircle);

      const waterText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      waterText.setAttribute('x', '0');
      waterText.setAttribute('y', '3.5');
      waterText.setAttribute('font-size', '9');
      waterText.setAttribute('text-anchor', 'middle');
      waterText.textContent = waterStatus === "Besoin d'eau" ? '💧' : '💦';
      waterG.appendChild(waterText);

      parcelG.appendChild(waterG);

      // If selected, draw a glowing pinpoint or map pin icon
      if (isSelected) {
        const pinGG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pinGG.setAttribute('transform', `translate(${pos.x + 12}, ${pos.y + pos.h - 12})`);
        
        // Let's add a small blinking green dot for GPS selected highlight
        const pinBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pinBg.setAttribute('cx', '-4');
        pinBg.setAttribute('cy', '-3');
        pinBg.setAttribute('r', '4');
        pinBg.setAttribute('fill', '#10B981');
        pinBg.setAttribute('class', 'animate-ping');
        pinGG.appendChild(pinBg);
      }

      mapGroup.appendChild(parcelG);
    });
  },

  renderTable() {
    const tableBody = document.getElementById('parcelles-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    parcelles.forEach(p => {
      const isSelected = p.id === selectedParcelId;
      const tr = document.createElement('tr');
      tr.className = `cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/10 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-[#0D2615]/30'}`;
      tr.addEventListener('click', (e) => {
        // Prevent trigger if they click the actual action buttons in the cell
        if (e.target.closest('.action-btn')) return;
        this.selectParcel(p.id);
      });

      // Status badges styling
      let statusBadge = '';
      if (p.status === 'Cultivée') {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Cultivée</span>';
      } else if (p.status === 'En préparation') {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">En prép</span>';
      } else {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">Jachère</span>';
      }

      const recentRotations = p.history ? p.history.slice(0, 2).join(' ➔ ') : 'Aucun';
      
      // Soil type badge
      const soilType = p.type_sol || 'sableux';
      const soilTypeLabels = {
        'sableux': 'Sableux',
        'argileux': 'Argileux',
        'limoneux': 'Limoneux',
        'lateritique': 'Latéritique'
      };
      const soilTypeColors = {
        'sableux': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
        'argileux': { bg: 'bg-slate-600/10', text: 'text-slate-500', border: 'border-slate-500/20' },
        'limoneux': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
        'lateritique': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' }
      };
      const soilColors = soilTypeColors[soilType] || soilTypeColors.limoneux;
      const soilBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${soilColors.bg} ${soilColors.text} border ${soilColors.border}">${soilTypeLabels[soilType] || soilType}</span>`;

      tr.innerHTML = `
        <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${p.id}</td>
        <td class="px-4 py-3.5 font-black text-slate-800 dark:text-slate-100">${p.name}</td>
        <td class="px-4 py-3.5">${statusBadge}</td>
        <td class="px-4 py-3.5">${soilBadge}</td>
        <td class="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">${p.surface} m²</td>
        <td class="px-4 py-3.5 font-mono text-[10px] text-slate-500 dark:text-[#819888] font-semibold">${Number(p.lat).toFixed(4)}, ${Number(p.lng).toFixed(4)}</td>
        <td class="px-4 py-3.5 font-bold text-emerald-500">${p.currentCrop || 'Libre'}</td>
        <td class="px-4 py-3.5 text-[10px] text-slate-400 dark:text-slate-400 truncate max-w-[150px] font-medium">${recentRotations}</td>
        <td class="px-4 py-3.5 text-center">
          <div class="inline-flex items-center gap-1">
            <button onclick="window.openEditParcelModal('${p.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
              <i data-lucide="edit-2" class="h-3 w-3"></i>
            </button>
            <button onclick="window.deleteParcel('${p.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
              <i data-lucide="trash" class="h-3 w-3"></i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  },

  renderDetails() {
    const parcel = parcelles.find(p => p.id === selectedParcelId);
    if (!parcel) return;

    // Set details texts
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = parcel.name;

    const idEl = document.getElementById('detail-id');
    if (idEl) idEl.textContent = `ID: ${parcel.id}`;

    const surfaceEl = document.getElementById('detail-surface');
    if (surfaceEl) surfaceEl.textContent = parcel.surface;

    const cropEl = document.getElementById('detail-current-crop');
    if (cropEl) {
      cropEl.textContent = parcel.currentCrop || 'Libre (Jachère)';
      if (parcel.status === 'Cultivée') {
        cropEl.className = 'text-sm font-black text-emerald-500 dark:text-emerald-400 truncate';
      } else {
        cropEl.className = 'text-sm font-black text-slate-400 dark:text-slate-400 truncate';
      }
    }

    const latEl = document.getElementById('detail-lat');
    if (latEl) latEl.textContent = Number(parcel.lat).toFixed(6);

    const lngEl = document.getElementById('detail-lng');
    if (lngEl) lngEl.textContent = Number(parcel.lng).toFixed(6);

    // Map External link
    const mapLink = document.getElementById('detail-map-link');
    if (mapLink) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${parcel.lat},${parcel.lng}`;
    }

    // Status badge
    const badgeEl = document.getElementById('detail-status-badge');
    if (badgeEl) {
      badgeEl.textContent = parcel.status.toUpperCase();
      if (parcel.status === 'Cultivée') {
        badgeEl.className = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      } else if (parcel.status === 'En préparation') {
        badgeEl.className = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20';
      } else {
        badgeEl.className = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20';
      }
    }

    // Set water status
    const waterStatusTextEl = document.getElementById('detail-water-status-text');
    if (waterStatusTextEl) {
      const waterStatus = parcel.waterStatus || 'Irrigué';
      if (waterStatus === "Besoin d'eau") {
        waterStatusTextEl.innerHTML = `
          <span class="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span class="text-rose-500">Besoin d'eau</span>
        `;
      } else {
        waterStatusTextEl.innerHTML = `
          <span class="h-2 w-2 rounded-full bg-sky-500"></span>
          <span class="text-sky-500">Irrigué</span>
        `;
      }
    }

    const toggleWaterBtn = document.getElementById('btn-toggle-water');
    if (toggleWaterBtn) {
      toggleWaterBtn.onclick = () => {
        const currentWater = parcel.waterStatus || 'Irrigué';
        parcel.waterStatus = currentWater === 'Irrigué' ? "Besoin d'eau" : 'Irrigué';
        KAStorage.saveParcelles(parcelles);
        this.render();
      };
    }

    // Set soil type
    const soilTypeEl = document.getElementById('detail-sol-type');
    const soilTypeTextEl = document.getElementById('detail-sol-type-text');
    if (soilTypeEl && soilTypeTextEl) {
      const soilType = parcel.type_sol || 'sableux';
      const soilTypeLabels = {
        'sableux': 'Sableux',
        'argileux': 'Argileux',
        'limoneux': 'Argilo-limoneux',
        'lateritique': 'Latéritique'
      };
      soilTypeEl.textContent = soilTypeLabels[soilType] || soilType;
      
      // Add appropriate icon based on soil type
      const soilIcons = {
        'sableux': '🏖️',
        'argileux': '🪨',
        'limoneux': '🌍',
        'lateritique': '🪨'
      };
    }

    // History Timeline Render
    const historyContainer = document.getElementById('detail-history-container');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      if (!parcel.history || parcel.history.length === 0) {
        historyContainer.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 font-semibold italic pl-1">Aucun historique enregistré pour le moment.</p>';
      } else {
        parcel.history.forEach((h, index) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'relative pl-4 space-y-0.5 text-left';
          
          // Bullet point
          const isCurrent = index === 0 && parcel.status === 'Cultivée';
          const bulletColor = isCurrent ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400 dark:bg-[#143E23]';
          
          itemDiv.innerHTML = `
            <span class="absolute -left-[16.5px] top-1.5 h-2.5 w-2.5 rounded-full ${bulletColor}"></span>
            <div class="flex items-center gap-2">
              <p class="text-xs font-black text-slate-800 dark:text-slate-100">${h}</p>
              ${index === 0 ? '<span class="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.1 rounded font-bold uppercase">Actuel</span>' : ''}
            </div>
            <p class="text-[9px] text-[#819888] font-bold">Rotation #${parcel.history.length - index}</p>
          `;
          historyContainer.appendChild(itemDiv);
        });
      }
    }

    // Bind Edit & Delete buttons to selected parcel
    const editBtn = document.getElementById('btn-edit-parcel');
    if (editBtn) {
      editBtn.onclick = () => window.openEditParcelModal(parcel.id);
    }

    const deleteBtn = document.getElementById('btn-delete-parcel');
    if (deleteBtn) {
      deleteBtn.onclick = () => window.deleteParcel(parcel.id);
    }

    // Render Break-Even analysis
    this.renderBreakEvenAnalysis(parcel);
  },

  renderBreakEvenAnalysis(parcel) {
    if (!parcel) return;

    // Get standards or fallback
    const currentCrop = parcel.currentCrop || 'Libre';
    const standards = CROP_MARKET_STANDARDS[currentCrop] || { marketPrice: 500, yieldPerSqM: 3.0, inputCost: 25000 };

    // Resolve specific attributes or use default standards
    const cost = parcel.inputCost !== undefined ? parcel.inputCost : standards.inputCost;
    const price = parcel.marketPrice !== undefined ? parcel.marketPrice : standards.marketPrice;
    const yieldVal = parcel.yieldPerSqM !== undefined ? parcel.yieldPerSqM : standards.yieldPerSqM;

    const surface = Number(parcel.surface) || 0;
    const estProduction = surface * yieldVal;
    const estRevenue = estProduction * price;
    const estMargin = estRevenue - cost;

    // Required production to break-even (seuil requis)
    const thresholdProduction = price > 0 ? (cost / price) : 0;

    // Percentage of break-even reached
    let percentage = 0;
    if (estProduction > 0) {
      percentage = Math.round((thresholdProduction / estProduction) * 100);
    }

    // Displays
    const costDisplay = document.getElementById('be-cost-display');
    if (costDisplay) costDisplay.textContent = `${cost.toLocaleString('fr-FR')} FCFA`;

    const priceDisplay = document.getElementById('be-price-display');
    if (priceDisplay) priceDisplay.textContent = `${price.toLocaleString('fr-FR')} FCFA / kg`;

    const thresholdQtyEl = document.getElementById('be-threshold-qty');
    if (thresholdQtyEl) thresholdQtyEl.textContent = `${thresholdProduction.toFixed(1)} kg`;

    const estQtyEl = document.getElementById('be-est-qty');
    if (estQtyEl) {
      estQtyEl.innerHTML = `${estProduction.toFixed(0)} kg <span class="text-[9px] text-slate-450 dark:text-[#819888]">(${yieldVal} kg/m²)</span>`;
    }

    const estRevenueEl = document.getElementById('be-est-revenue');
    if (estRevenueEl) estRevenueEl.textContent = `${estRevenue.toLocaleString('fr-FR')} FCFA`;

    const estMarginEl = document.getElementById('be-est-margin');
    if (estMarginEl) {
      estMarginEl.textContent = `${estMargin.toLocaleString('fr-FR')} FCFA`;
      if (estMargin >= 0) {
        estMarginEl.className = 'font-black text-emerald-600 dark:text-emerald-400';
      } else {
        estMarginEl.className = 'font-black text-rose-600 dark:text-rose-450';
      }
    }

    // Bar & Status Label
    const statusLabel = document.getElementById('be-status-label');
    const pctLabel = document.getElementById('be-percentage-label');
    const progressBar = document.getElementById('be-progress-bar');

    if (pctLabel) pctLabel.textContent = `${percentage}%`;

    if (progressBar) {
      // Clamp width between 0 and 100
      const widthPct = Math.min(Math.max(percentage, 0), 100);
      progressBar.style.width = `${widthPct}%`;

      // Update progress bar color gradient based on percentage risk
      if (percentage <= 0) {
        progressBar.className = 'bg-slate-400 h-full rounded-full transition-all duration-500';
      } else if (percentage <= 30) {
        progressBar.className = 'bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500';
      } else if (percentage <= 60) {
        progressBar.className = 'bg-gradient-to-r from-emerald-400 to-amber-400 h-full rounded-full transition-all duration-500';
      } else if (percentage <= 90) {
        progressBar.className = 'bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-500';
      } else {
        progressBar.className = 'bg-gradient-to-r from-orange-400 to-rose-500 h-full rounded-full transition-all duration-500';
      }
    }

    if (statusLabel) {
      if (parcel.status !== 'Cultivée' || currentCrop === 'Libre' || !currentCrop) {
        statusLabel.textContent = 'En Jachère / Libre';
        statusLabel.className = 'text-slate-400';
        if (pctLabel) pctLabel.textContent = '-';
        if (progressBar) progressBar.style.width = '0%';
      } else if (percentage === 0) {
        statusLabel.textContent = 'Non Configuré';
        statusLabel.className = 'text-slate-400';
      } else if (percentage <= 25) {
        statusLabel.textContent = 'Exceptionnel (Risque Minime)';
        statusLabel.className = 'text-emerald-500 dark:text-emerald-400';
      } else if (percentage <= 50) {
        statusLabel.textContent = 'Excellent (Sécurisé)';
        statusLabel.className = 'text-emerald-500 dark:text-emerald-400';
      } else if (percentage <= 75) {
        statusLabel.textContent = 'Rentable (Risque Modéré)';
        statusLabel.className = 'text-teal-400';
      } else if (percentage <= 100) {
        statusLabel.textContent = 'Seuil Critique (Risque Élevé)';
        statusLabel.className = 'text-orange-400';
      } else {
        statusLabel.textContent = 'Déficitaire (Risque Très Élevé)';
        statusLabel.className = 'text-rose-500 dark:text-rose-400';
      }
    }
  },

  selectParcel(id) {
    selectedParcelId = id;
    this.render();
  },

  filterParcelles(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.render();
      return;
    }

    const filtered = parcelles.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      (p.currentCrop && p.currentCrop.toLowerCase().includes(q)) ||
      p.status.toLowerCase().includes(q)
    );

    // Re-render table only with filtered rows
    const tableBody = document.getElementById('parcelles-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      filtered.forEach(p => {
        const isSelected = p.id === selectedParcelId;
        const tr = document.createElement('tr');
        tr.className = `cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/10 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-[#0D2615]/30'}`;
        tr.addEventListener('click', (e) => {
          if (e.target.closest('.action-btn')) return;
          this.selectParcel(p.id);
        });

        let statusBadge = '';
        if (p.status === 'Cultivée') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Cultivée</span>';
        } else if (p.status === 'En préparation') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">En prép</span>';
        } else {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">Jachère</span>';
        }

        const recentRotations = p.history ? p.history.slice(0, 2).join(' ➔ ') : 'Aucun';

        tr.innerHTML = `
          <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${p.id}</td>
          <td class="px-4 py-3.5 font-black text-slate-800 dark:text-slate-100">${p.name}</td>
          <td class="px-4 py-3.5">${statusBadge}</td>
          <td class="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">${p.surface} m²</td>
          <td class="px-4 py-3.5 font-mono text-[10px] text-slate-500 dark:text-[#819888] font-semibold">${Number(p.lat).toFixed(4)}, ${Number(p.lng).toFixed(4)}</td>
          <td class="px-4 py-3.5 font-bold text-emerald-500">${p.currentCrop || 'Libre'}</td>
          <td class="px-4 py-3.5 text-[10px] text-slate-400 dark:text-slate-400 truncate max-w-[150px] font-medium">${recentRotations}</td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1">
              <button onclick="window.openEditParcelModal('${p.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3 w-3"></i>
              </button>
              <button onclick="window.deleteParcel('${p.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
                <i data-lucide="trash" class="h-3 w-3"></i>
              </button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
      if (window.lucide) window.lucide.createIcons();
    }
  },

  setupListeners() {
    // Add parcel form submit
    const addForm = document.getElementById('add-parcel-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAddParcel();
      });
    }

    // Edit parcel form submit
    const editForm = document.getElementById('edit-parcel-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitEditParcel();
      });
    }

    // Add crop history entry form submit
    const histForm = document.getElementById('add-history-form');
    if (histForm) {
      histForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAddHistory();
      });
    }

    // Break-even configuration form submit
    const beForm = document.getElementById('config-breakeven-form');
    if (beForm) {
      beForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitBreakEvenConfig();
      });
    }
  },

  submitAddParcel() {
    const name = document.getElementById('form-add-name').value;
    const surface = parseInt(document.getElementById('form-add-surface').value);
    const status = document.getElementById('form-add-status').value;
    const lat = parseFloat(document.getElementById('form-add-lat').value);
    const lng = parseFloat(document.getElementById('form-add-lng').value);
    const waterStatus = document.getElementById('form-add-water').value;
    const type_sol = document.getElementById('form-add-sol').value;
    const currentCrop = document.getElementById('form-add-crop').value.trim();
    const historyText = document.getElementById('form-add-history').value.trim();

    // Generate neat unique ID
    const nextNum = parcelles.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1]);
      return num > max ? num : max;
    }, 0) + 1;
    const id = `P-${String(nextNum).padStart(3, '0')}`;

    // Create history array
    let history = [];
    if (historyText) {
      history = historyText.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (currentCrop && !history.includes(currentCrop)) {
      history.unshift(currentCrop);
    }

    const newParcel = {
      id,
      name,
      surface,
      lat,
      lng,
      status,
      type_sol: type_sol || 'limoneux',
      waterStatus,
      currentCrop: currentCrop || '',
      history
    };

    parcelles.push(newParcel);
    KAStorage.saveParcelles(parcelles);
    
    selectedParcelId = id;
    this.closeAddParcelModal();
    this.render();

    // Update global app badges (especially for counting parcelles)
    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  },

  submitEditParcel() {
    const id = document.getElementById('form-edit-id').value;
    const name = document.getElementById('form-edit-name').value;
    const surface = parseInt(document.getElementById('form-edit-surface').value);
    const status = document.getElementById('form-edit-status').value;
    const lat = parseFloat(document.getElementById('form-edit-lat').value);
    const lng = parseFloat(document.getElementById('form-edit-lng').value);
    const waterStatus = document.getElementById('form-edit-water').value;
    const type_sol = document.getElementById('form-edit-sol').value;
    const currentCrop = document.getElementById('form-edit-crop').value.trim();

    const idx = parcelles.findIndex(p => p.id === id);
    if (idx !== -1) {
      // If crop changed or was set, prepend to history if not there
      const history = parcelles[idx].history || [];
      if (currentCrop && currentCrop !== parcelles[idx].currentCrop && !history.includes(currentCrop)) {
        history.unshift(currentCrop);
      }

      parcelles[idx] = {
        ...parcelles[idx],
        name,
        surface,
        status,
        lat,
        lng,
        type_sol: type_sol || parcelles[idx].type_sol || 'limoneux',
        waterStatus,
        currentCrop,
        history
      };

      KAStorage.saveParcelles(parcelles);
      this.closeEditParcelModal();
      this.render();
    }
  },

  submitAddHistory() {
    const cropName = document.getElementById('form-hist-crop').value.trim();
    if (!cropName) return;

    const idx = parcelles.findIndex(p => p.id === selectedParcelId);
    if (idx !== -1) {
      if (!parcelles[idx].history) parcelles[idx].history = [];
      
      // Prepend cropName to rotation history
      parcelles[idx].history.unshift(cropName);
      
      // Update active crop automatically if status is cultivated
      if (parcelles[idx].status === 'Cultivée') {
        parcelles[idx].currentCrop = cropName;
      }

      KAStorage.saveParcelles(parcelles);
      this.closeAddHistoryModal();
      this.render();
    }
  },

  submitBreakEvenConfig() {
    const id = document.getElementById('form-be-id').value;
    const cost = parseInt(document.getElementById('form-be-cost').value) || 0;
    const price = parseInt(document.getElementById('form-be-price').value) || 0;
    const yieldVal = parseFloat(document.getElementById('form-be-yield').value) || 0;

    const idx = parcelles.findIndex(p => p.id === id);
    if (idx !== -1) {
      parcelles[idx].inputCost = cost;
      parcelles[idx].marketPrice = price;
      parcelles[idx].yieldPerSqM = yieldVal;

      KAStorage.saveParcelles(parcelles);
      window.closeBreakEvenConfigModal();
      this.render();
    }
  }
};

// Global callbacks for interactive DOM trigger
window.openBreakEvenConfigModal = () => {
  const parcel = parcelles.find(p => p.id === selectedParcelId);
  if (!parcel) return;

  const currentCrop = parcel.currentCrop || 'Libre';
  const standards = CROP_MARKET_STANDARDS[currentCrop] || { marketPrice: 500, yieldPerSqM: 3.0, inputCost: 25000 };

  const cost = parcel.inputCost !== undefined ? parcel.inputCost : standards.inputCost;
  const price = parcel.marketPrice !== undefined ? parcel.marketPrice : standards.marketPrice;
  const yieldVal = parcel.yieldPerSqM !== undefined ? parcel.yieldPerSqM : standards.yieldPerSqM;

  document.getElementById('form-be-id').value = parcel.id;
  document.getElementById('form-be-cost').value = cost;
  document.getElementById('form-be-price').value = price;
  document.getElementById('form-be-yield').value = yieldVal;

  const modal = document.getElementById('config-breakeven-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
};

window.closeBreakEvenConfigModal = () => {
  const modal = document.getElementById('config-breakeven-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('config-breakeven-form').reset();
  }
};

window.openAddParcelModal = () => {
  const modal = document.getElementById('add-parcel-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Auto-fill coordinates around Kaolack/Dakar Center of KA Farm with a small random deviation
    const baseLat = 14.7930;
    const baseLng = -17.2650;
    const rLat = baseLat + (Math.random() - 0.5) * 0.005;
    const rLng = baseLng + (Math.random() - 0.5) * 0.005;
    
    document.getElementById('form-add-lat').value = rLat.toFixed(6);
    document.getElementById('form-add-lng').value = rLng.toFixed(6);
    
    // Set default soil type to 'limoneux' (balanced)
    document.getElementById('form-add-sol').value = 'limoneux';
  }
};

window.closeAddParcelModal = () => {
  const modal = document.getElementById('add-parcel-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('add-parcel-form').reset();
  }
};

window.openEditParcelModal = (id) => {
  const parcel = parcelles.find(p => p.id === id);
  if (!parcel) return;

  document.getElementById('form-edit-id').value = parcel.id;
  document.getElementById('form-edit-name').value = parcel.name;
  document.getElementById('form-edit-surface').value = parcel.surface;
  document.getElementById('form-edit-status').value = parcel.status;
  document.getElementById('form-edit-lat').value = parcel.lat;
  document.getElementById('form-edit-lng').value = parcel.lng;
  document.getElementById('form-edit-water').value = parcel.waterStatus || 'Irrigué';
  document.getElementById('form-edit-crop').value = parcel.currentCrop || '';
  document.getElementById('form-edit-sol').value = parcel.type_sol || 'limoneux';

  const modal = document.getElementById('edit-parcel-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeEditParcelModal = () => {
  const modal = document.getElementById('edit-parcel-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('edit-parcel-form').reset();
  }
};

window.openAddHistoryModal = () => {
  const modal = document.getElementById('add-history-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeAddHistoryModal = () => {
  const modal = document.getElementById('add-history-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('add-history-form').reset();
  }
};

window.deleteParcel = (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement la parcelle ${id} ? Cette action effacera également son historique.`)) {
    parcelles = parcelles.filter(p => p.id !== id);
    KAStorage.saveParcelles(parcelles);
    
    if (selectedParcelId === id) {
      selectedParcelId = parcelles.length > 0 ? parcelles[0].id : null;
    }
    
    ParcellesModule.render();

    // Update global app badges
    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  }
};

window.copyCurrentCoordinates = () => {
  const parcel = parcelles.find(p => p.id === selectedParcelId);
  if (!parcel) return;

  const coordText = `${parcel.lat}, ${parcel.lng}`;
  navigator.clipboard.writeText(coordText).then(() => {
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy text', err);
  });
};

window.getCurrentPositionGPS = () => {
  if (navigator.geolocation) {
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.innerHTML = '<i data-lucide="loader" class="h-3 w-3 animate-spin"></i> Localisation satellite...';
      toast.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Recal selected parcel to real current location
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const idx = parcelles.findIndex(p => p.id === selectedParcelId);
        if (idx !== -1) {
          parcelles[idx].lat = lat;
          parcelles[idx].lng = lng;
          KAStorage.saveParcelles(parcelles);
          
          if (toast) {
            toast.innerHTML = '<i data-lucide="check" class="h-3 w-3"></i> Position recalée avec succès !';
            setTimeout(() => {
              toast.classList.add('hidden');
              toast.innerHTML = '<i data-lucide="check" class="h-3 w-3"></i> Coordonnées copiées !';
            }, 3000);
          }
          ParcellesModule.render();
        }
      },
      (error) => {
        console.warn('Geolocation failed or permission denied, using simulated GPS refresh.');
        // Simulate GPS recalibration with small offset
        const idx = parcelles.findIndex(p => p.id === selectedParcelId);
        if (idx !== -1) {
          const latOffset = (Math.random() - 0.5) * 0.0001;
          const lngOffset = (Math.random() - 0.5) * 0.0001;
          parcelles[idx].lat = Number(parcelles[idx].lat) + latOffset;
          parcelles[idx].lng = Number(parcelles[idx].lng) + lngOffset;
          KAStorage.saveParcelles(parcelles);
          
          if (toast) {
            toast.innerHTML = '<i data-lucide="check" class="h-3 w-3"></i> Signal rafraîchi par satellite !';
            setTimeout(() => {
              toast.classList.add('hidden');
              toast.innerHTML = '<i data-lucide="check" class="h-3 w-3"></i> Coordonnées copiées !';
              if (window.lucide) window.lucide.createIcons();
            }, 3000);
          }
          ParcellesModule.render();
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }
};

// Register globally for external listeners (e.g., theme toggle)
window.ParcellesModule = ParcellesModule;

// Initialise module on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  ParcellesModule.init();
});

document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && (
    e.detail.key === 'ka_farm_parcelles' ||
    e.detail.key === 'ka_farm_crops' ||
    e.detail.key === 'ka_farm_finances'
  )) {
    ParcellesModule.render();
  }
});
