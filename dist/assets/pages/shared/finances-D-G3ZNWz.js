import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as x}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";const w={marketsData:{tomate:{sandiara:450,mbour:500,dakar:650,"saint-louis":400},oignon:{sandiara:500,mbour:550,dakar:600,"saint-louis":450},piment:{sandiara:1200,mbour:1300,dakar:1600,"saint-louis":1100},gombo:{sandiara:700,mbour:800,dakar:950,"saint-louis":650}},selectedMarket:"mbour",init(){this.renderFinances(),this.setupListeners(),this.calculateCompost(),this.initMarketSimulator()},renderFinances(){const m=document.getElementById("finances-table-body");if(!m)return;const g=x.getFinances(),{totalRevenu:u,totalDepense:i,solde:p}=x.getFinanceStats(),t=document.getElementById("finances-total-revenu"),s=document.getElementById("finances-total-depense"),l=document.getElementById("finances-total-solde");if(t&&(window.animateValue?window.animateValue(t,0,u,900):t.textContent=u.toLocaleString("fr-FR")+" F"),s&&(window.animateValue?window.animateValue(s,0,i,900):s.textContent=i.toLocaleString("fr-FR")+" F"),l&&(window.animateValue?window.animateValue(l,0,p,1100):l.textContent=p.toLocaleString("fr-FR")+" F",p>=0?l.className="text-xl md:text-2xl font-black text-emerald-500 font-mono":l.className="text-xl md:text-2xl font-black text-rose-500 font-mono"),g.length===0){m.innerHTML=`
        <tr>
          <td colspan="5" class="text-center py-10 text-slate-400">
            Aucun flux financier enregistré.
          </td>
        </tr>
      `;return}m.innerHTML=g.map(n=>{const d=n.type==="Revenu",o=d?"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20":"bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",e=d?"text-emerald-500 font-bold":"text-rose-500 font-bold",a=d?"+":"-";return`
        <tr class="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-[#061109]/30 transition-colors">
          <td class="py-3.5 text-slate-850 dark:text-slate-100 font-black">${n.description}</td>
          <td class="py-3.5">
            <span class="px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${o}">${n.type}</span>
          </td>
          <td class="py-3.5 text-slate-500 font-bold">${n.category}</td>
          <td class="py-3.5 text-slate-450 font-semibold">${n.date}</td>
          <td class="py-3.5 ${e} font-black font-mono">${a}${n.amount.toLocaleString("fr-FR")} F</td>
          <td class="py-3.5 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.shareFinanceWhatsApp('${n.id}')" class="text-emerald-500 hover:text-emerald-400 p-1 rounded-lg transition-colors cursor-pointer" title="Partager le reçu sur WhatsApp">
                <i data-lucide="message-circle" class="h-4 w-4"></i>
              </button>
              <button onclick="window.deleteFinance('${n.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `}).join(""),window.lucide&&window.lucide.createIcons(),this.renderMargins()},renderMargins(){const m=document.getElementById("parcel-margins-table-body"),g=document.getElementById("crop-margins-table-body");if(!m&&!g)return;const u=x.getFinances(),i=[{id:"P-001",name:"Parcelle Nord"},{id:"P-002",name:"Parcelle Est"},{id:"P-003",name:"Parcelle Sud"},{id:"P-004",name:"Zone Ombragée"},{id:"P-005",name:"Parcelle Ouest"}],p=i.map(e=>{let a=0,r=0;return u.forEach(c=>{(c.parcelId===e.id||!c.parcelId&&c.description.toLowerCase().includes(e.name.toLowerCase().split(" ")[1]||"impossible_match"))&&(c.type==="Revenu"?a+=c.amount:c.type==="Dépense"&&(r+=c.amount))}),{name:e.name,rev:a,exp:r,net:a-r}});let t=0,s=0;u.forEach(e=>{i.some(r=>e.parcelId===r.id||e.description.toLowerCase().includes(r.name.toLowerCase().split(" ")[1]||"impossible_match"))||(e.type==="Revenu"?t+=e.amount:e.type==="Dépense"&&(s+=e.amount))}),(t>0||s>0)&&p.push({name:"Hors parcelles / Général",rev:t,exp:s,net:t-s}),m&&(m.innerHTML=p.map(e=>{const a=e.net>=0?"text-emerald-500":"text-rose-500",r=e.net>=0?"+":"";return`
          <tr class="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/25 transition-colors">
            <td class="py-2.5 text-slate-800 dark:text-slate-200 font-extrabold">${e.name}</td>
            <td class="py-2.5 text-slate-600 dark:text-slate-400 font-mono">${e.rev.toLocaleString("fr-FR")} F</td>
            <td class="py-2.5 text-slate-600 dark:text-slate-400 font-mono">${e.exp.toLocaleString("fr-FR")} F</td>
            <td class="py-2.5 text-right font-black font-mono ${a}">${r}${e.net.toLocaleString("fr-FR")} F</td>
          </tr>
        `}).join(""));const l=["Tomate Mongal F1","Oignon Rouge de Galmi","Menthe de Thiès","Chou Cabus","Piment Oiseau"],n=l.map(e=>{let a=0,r=0;return u.forEach(c=>{(c.cropName===e||!c.cropName&&c.description.toLowerCase().includes(e.toLowerCase().split(" ")[0]))&&(c.type==="Revenu"?a+=c.amount:c.type==="Dépense"&&(r+=c.amount))}),{name:e,rev:a,exp:r,net:a-r}});let d=0,o=0;u.forEach(e=>{l.some(r=>e.cropName===r||e.description.toLowerCase().includes(r.toLowerCase().split(" ")[0]))||(e.type==="Revenu"?d+=e.amount:e.type==="Dépense"&&(o+=e.amount))}),(d>0||o>0)&&n.push({name:"Autres / Élevage",rev:d,exp:o,net:d-o}),g&&(g.innerHTML=n.map(e=>{const a=e.net>=0?"text-emerald-500":"text-rose-500",r=e.net>=0?"+":"";return`
          <tr class="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/25 transition-colors">
            <td class="py-2.5 text-slate-800 dark:text-slate-200 font-extrabold">${e.name}</td>
            <td class="py-2.5 text-slate-600 dark:text-slate-400 font-mono">${e.rev.toLocaleString("fr-FR")} F</td>
            <td class="py-2.5 text-slate-600 dark:text-slate-400 font-mono">${e.exp.toLocaleString("fr-FR")} F</td>
            <td class="py-2.5 text-right font-black font-mono ${a}">${r}${e.net.toLocaleString("fr-FR")} F</td>
          </tr>
        `}).join(""))},calculateCompost(){const m=document.getElementById("compost-carbon-input"),g=document.getElementById("compost-nitrogen-input");if(!m||!g)return;const u=parseFloat(m.value)||0,i=parseFloat(g.value)||0,p=document.getElementById("compost-result-box"),t=document.getElementById("compost-ratio-text"),s=document.getElementById("compost-status-label"),l=document.getElementById("compost-advice-text");if(!p)return;if(u===0&&i===0){p.classList.add("hidden");return}p.classList.remove("hidden");let n=0;if(u+i>0&&(n=(u*60+i*15)/(u+i)),n=Math.round(n*10)/10,t&&(t.textContent=`C/N ≈ ${n} : 1`),n>=25&&n<=35)s.textContent="🟢 ÉQUILIBRÉ (Idéal)",s.className="inline-block text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20",l.textContent="Votre mélange de compostage est optimal. L'échauffement thermique sera excellent pour détruire les graines de mauvaises herbes. Arrosez régulièrement le tas de compost.";else if(n<25){s.textContent="🟡 EXCES D'AZOTE (Trop humide / Odorants)",s.className="inline-block text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20";const d=Math.round((i*25-i*15)/35);l.textContent=`Votre tas est trop riche en azote. Il risque de se tasser et de dégager de mauvaises odeurs d'ammoniac. Ajoutez environ ${d} kg de matières carbonées sèches (paille sèche, feuilles mortes ou copeaux de bois) pour l'équilibrer.`}else{s.textContent="🟤 EXCES DE CARBONE (Décomposition lente)",s.className="inline-block text-[10px] font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20";const d=Math.round((u*60-u*30)/15);l.textContent=`Votre tas est trop sec et carboné. La décomposition sera extrêmement lente par manque d'azote pour les bactéries. Ajoutez environ ${d} kg de matières azotées (fientes de poule, bouse de vache, herbe verte ou déchets de cuisine humides).`}},setupListeners(){window.shareFinanceWhatsApp=i=>{const t=x.getFinances().find(o=>o.id===i);if(!t)return;const s=t.parcelId?`
*Parcelle :* ${t.parcelId}`:"",l=t.cropName?`
*Culture :* ${t.cropName}`:"",n=`*📋 REÇU DE COMPTABILITÉ - KA FARM*
----------------------------------------
*Réf :* ${t.id}
*Date :* ${t.date}
*Description :* ${t.description}
*Type :* ${t.type}
*Rubrique :* ${t.category}
*Montant :* ${t.amount.toLocaleString("fr-FR")} FCFA${s}${l}
----------------------------------------
_KA Farm - Sénégal • Maraîchage horticole_`,d=`https://api.whatsapp.com/send?text=${encodeURIComponent(n)}`;window.open(d,"_blank")},window.exportFinancesCSV=()=>{const i=x.getFinances();if(i.length===0){alert("Aucune transaction à exporter !");return}const p=["ID","Description","Type de Flux","Rubrique","Date","Montant (FCFA)"],t=i.map(o=>[o.id,`"${o.description.replace(/"/g,'""')}"`,o.type,o.category,o.date,o.amount]),s="\uFEFF"+[p.join(","),...t.map(o=>o.join(","))].join(`
`),l=new Blob([s],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(l),d=document.createElement("a");d.setAttribute("href",n),d.setAttribute("download",`ka_farm_bilan_financier_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(d),d.click(),document.body.removeChild(d)},window.exportFinancesPDF=()=>{const i=x.getFinances(),{totalRevenu:p,totalDepense:t,solde:s}=x.getFinanceStats(),l=localStorage.getItem("ka_farm_zone")||"Dakar (Sénégal)",n=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),d="print-report-area";let o=document.getElementById(d);o&&o.remove(),o=document.createElement("div"),o.id=d,o.className="hidden";const e=i.map(a=>{const r=a.type==="Revenu",c=r?"+":"-",y=r?"color: #10b981; font-weight: bold;":"color: #ef4444; font-weight: bold;";return`
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 10px 0; text-align: left; font-weight: 600; color: #1e293b;">${a.description}</td>
            <td style="padding: 10px 0; text-align: left;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: ${r?"#ecfdf5":"#fef2f2"}; color: ${r?"#065f46":"#991b1b"}; border: 1px solid ${r?"#a7f3d0":"#fca5a5"};">${a.type.toUpperCase()}</span></td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${a.category}</td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${a.date}</td>
            <td style="padding: 10px 0; text-align: right; font-family: monospace; ${y}">${c}${a.amount.toLocaleString("fr-FR")} F</td>
          </tr>
        `}).join("");o.innerHTML=`
        <style>
          @media print {
            body > *:not(#${d}) {
              display: none !important;
            }
            #${d} {
              display: block !important;
              background: white !important;
              color: black !important;
              font-family: 'Inter', system-ui, sans-serif !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
          .report-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            background: #f8fafc;
            position: relative;
            z-index: 10;
          }
          .print-watermark {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-8deg);
            width: 480px;
            height: 480px;
            opacity: 0.038;
            pointer-events: none;
            z-index: 1;
          }
        </style>
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; position: relative; min-height: 1000px;">
          <!-- Elegant Background Watermark -->
          <div class="print-watermark">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
              <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#059669" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#059669" stroke-width="0.6" stroke-linejoin="round" fill="none"/>
              <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M59 46 H71" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M65 46 V39" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
              <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
              <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" letter-spacing="1.2">FARM</text>
            </svg>
          </div>

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; position: relative; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <!-- High-Fidelity Logo -->
              <div style="width: 55px; height: 55px; flex-shrink: 0;">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                  <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#059669" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                  <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#059669" stroke-width="0.6" stroke-linejoin="round" fill="none"/>
                  <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M59 46 H71" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M65 46 V39" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
                  <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
                  <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" letter-spacing="1.2">FARM</text>
                </svg>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">KA FARM SÉNÉGAL</h1>
                <p style="margin: 3px 0 0 0; font-size: 10px; text-transform: uppercase; font-weight: 850; color: #059669; letter-spacing: 1px;">Exploitation Maraîchère & Agro-écologique Familiale</p>
              </div>
            </div>
            <div style="text-align: right; position: relative; z-index: 10;">
              <span style="font-size: 8px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 4px 8px; border-radius: 9999px; text-transform: uppercase;">Rapport d'Activité Officiel</span>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b;">Généré le <strong>${n}</strong></p>
            </div>
          </div>

          <!-- Title -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #1e293b; text-transform: uppercase;">Bilan Financier d'Exploitation</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">Présenté pour dossiers de financement, coopératives horticoles et banques partenaires</p>
          </div>

          <!-- Metadata info Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 11px;">
            <div class="report-card" style="border: 1px solid #cbd5e1;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Détails de l'Exploitation</h4>
              <p style="margin: 4px 0;">📍 <strong>Zone de culture :</strong> ${l}</p>
              <p style="margin: 4px 0;">🔑 <strong>Exploitant Principal :</strong> Famille KA (Amadou Coumbaka)</p>
              <p style="margin: 4px 0;">🌍 <strong>Localisation :</strong> Sénégal (Maraîchage & Élevage)</p>
            </div>
            <div class="report-card" style="border: 1px solid #cbd5e1;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Statut Comptable</h4>
              <p style="margin: 4px 0;">📊 <strong>Type de compte :</strong> Trésorerie d'exploitation directe</p>
              <p style="margin: 4px 0;">💵 <strong>Devise de calcul :</strong> Franc CFA (XOF)</p>
              <p style="margin: 4px 0;">⚖️ <strong>Conformité :</strong> Modèle d'évaluation standard coopérative</p>
            </div>
          </div>

          <!-- Summary widgets -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #a7f3d0; background: #f0fdf4; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #047857; letter-spacing: 0.5px;">Total Revenus (Entrées)</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">+${p.toLocaleString("fr-FR")} F</p>
            </div>
            <div style="border: 1px solid #fca5a5; background: #fef2f2; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #b91c1c; letter-spacing: 0.5px;">Total Dépenses (Sorties)</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace;">-${t.toLocaleString("fr-FR")} F</p>
            </div>
            <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #334155; letter-spacing: 0.5px;">Solde Net Trésorerie</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: ${s>=0?"#10b981":"#dc2626"}; font-family: monospace;">${s.toLocaleString("fr-FR")} F</p>
            </div>
          </div>

          <!-- Table -->
          <h3 style="font-size: 11px; text-transform: uppercase; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Grand Livre & Historique des Échanges</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #64748b;">
                <th style="padding: 8px 0; text-align: left;">Désignation / Libellé</th>
                <th style="padding: 8px 0; text-align: left;">Type</th>
                <th style="padding: 8px 0; text-align: left;">Rubrique</th>
                <th style="padding: 8px 0; text-align: left;">Date</th>
                <th style="padding: 8px 0; text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${e||'<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Aucune transaction comptabilisée</td></tr>'}
            </tbody>
          </table>

          <!-- Footer signatures -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; font-size: 10px;">
            <div style="text-align: left; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Pour l'Exploitation Agricole KA Farm</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Visa & Signature de l'exploitant</p>
              <p style="margin: 0; font-weight: 850; color: #0f172a;">Amadou Coumbaka</p>
            </div>
            <div style="text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Pour la Coopérative / Institution Partenaire</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Mention "Reçu et certifié conforme"</p>
              <div style="display: inline-block; border: 1px solid #10b981; color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: 900; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">KA FARM VERIFIED</div>
            </div>
          </div>
        </div>
      `,document.body.appendChild(o),setTimeout(()=>{window.print(),setTimeout(()=>{o.remove()},1e3)},300)},window.deleteFinance=i=>{if(!confirm("Voulez-vous supprimer cette ligne de comptabilité ?"))return;const p=x.getFinances().filter(t=>t.id!==i);x.saveFinances(p),this.renderFinances()};const m=document.getElementById("shared-finance-form");m&&m.addEventListener("submit",i=>{i.preventDefault();const p=document.getElementById("form-fin-desc").value,t=document.getElementById("form-fin-type").value,s=document.getElementById("form-fin-cat").value,l=parseFloat(document.getElementById("form-fin-amount").value),n=document.getElementById("form-fin-date").value,d=document.getElementById("form-fin-parcel").value,o=document.getElementById("form-fin-crop").value;if(!p||!l||!n)return;const e=x.getFinances();e.unshift({id:`F-${Date.now()}`,description:p,type:t,category:s,amount:l,date:n,parcelId:d||void 0,cropName:o||void 0}),x.saveFinances(e),this.renderFinances(),m.reset();const a=new Date().toISOString().split("T")[0];document.getElementById("form-fin-date").value=a,document.getElementById("finance-modal").classList.add("hidden"),alert("Flux de trésorerie enregistré avec succès !")});const g=document.getElementById("compost-carbon-input"),u=document.getElementById("compost-nitrogen-input");if(g&&u){const i=()=>this.calculateCompost();g.addEventListener("input",i),u.addEventListener("input",i)}},initMarketSimulator(){window.updateMarketCalculations=()=>this.updateMarketCalculations(),window.setSimSelectedMarket=m=>{this.selectedMarket=m,this.updateMarketCalculations()},this.updateMarketCalculations()},renderMarkets(){const m=document.getElementById("markets-comparison-grid");if(!m)return;const g=document.getElementById("market-crop-select").value||"tomate",u=this.marketsData[g],i={sandiara:"Sandiara",mbour:"Mbour",dakar:"Dakar (Samba)","saint-louis":"St-Louis"};m.innerHTML=Object.entries(u).map(([p,t])=>{const s=p===this.selectedMarket,l=s?"border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-sm scale-[1.01]":"border-slate-100 dark:border-[#143E23]/20 bg-slate-50/50 dark:bg-[#061109]/30 hover:border-[#143E23]/50",n=s?'<span class="absolute top-2.5 right-2.5 flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>':"";return`
        <div onclick="window.setSimSelectedMarket('${p}')" class="relative cursor-pointer border rounded-2xl p-3.5 transition-all flex flex-col justify-between text-left space-y-1.5 ${l}">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">${i[p]}</span>
            ${n}
          </div>
          <p class="text-base font-black text-slate-800 dark:text-white font-mono">${t} F <span class="text-[9px] font-bold text-slate-400">/ kg</span></p>
        </div>
      `}).join("")},updateMarketCalculations(){const m=parseFloat(document.getElementById("cost-seeds").value)||0,g=parseFloat(document.getElementById("cost-fertilizers").value)||0,u=parseFloat(document.getElementById("cost-fuel").value)||0,i=parseFloat(document.getElementById("cost-labor").value)||0,p=parseFloat(document.getElementById("cost-others").value)||0,t=parseFloat(document.getElementById("param-yield").value)||500,s=document.getElementById("yield-display");s&&(s.textContent=`${t} kg`);const l=m+g+u+i+p,n=t>0?Math.round(l/t):0,d=document.getElementById("market-crop-select").value||"tomate",o=this.marketsData[d][this.selectedMarket],a=t*o-l,r=l>0?Math.round(a/l*100):0,c=document.getElementById("calc-total-cost"),y=document.getElementById("calc-cost-per-kg"),v=document.getElementById("calc-net-profit"),k=document.getElementById("calc-roi");c&&(c.textContent=`${l.toLocaleString("fr-FR")} F`),y&&(y.textContent=`${n.toLocaleString("fr-FR")} F / kg`),v&&(v.textContent=(a>=0?"+":"")+`${a.toLocaleString("fr-FR")} F`,v.className=a>=0?"text-lg font-black text-emerald-500 font-mono":"text-lg font-black text-rose-500 font-mono"),k&&(k.textContent=`ROI: ${r>=0?"+":""}${r}%`,k.className=r>=0?"text-[9px] text-emerald-500 font-extrabold uppercase":"text-[9px] text-rose-500 font-extrabold uppercase");const f=document.getElementById("profit-advice-title"),h=document.getElementById("profit-advice-desc"),b=document.getElementById("profit-indicator-icon");f&&h&&b&&(a<0?(f.textContent="Risque de Perte (Rentabilité Critique)",f.className="text-xs font-extrabold text-rose-500",h.textContent=`Le prix de revient au kg (${n} F) est supérieur au prix du marché (${o} F). Réduisez vos coûts d'engrais/carburant ou ciblez un marché plus rémunérateur comme Dakar.`,b.className="p-2 bg-rose-500/10 text-rose-500 rounded-lg",b.innerHTML='<i data-lucide="alert-triangle" class="h-5 w-5"></i>'):r<20?(f.textContent="Marge Faible (Seuil de Vigilance)",f.className="text-xs font-extrabold text-amber-500",h.textContent=`Marge fragile de ${r}%. Pour améliorer la rentabilité, tentez de vendre en direct sans co-intermédiaires, ou stockez les légumes quelques jours si les cours remontent.`,b.className="p-2 bg-amber-500/10 text-amber-500 rounded-lg",b.innerHTML='<i data-lucide="help-circle" class="h-5 w-5"></i>'):(f.textContent="Rentabilité Excellente (Marge Forte)",f.className="text-xs font-extrabold text-emerald-500",h.textContent=`Excellent profit prévisionnel de +${r}% avec un prix de vente à ${o} F/kg. Ce cycle s'annonce très viable, vous pouvez planifier de nouvelles parcelles !`,b.className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg",b.innerHTML='<i data-lucide="check-circle" class="h-5 w-5"></i>')),this.renderMarkets(),window.lucide&&window.lucide.createIcons()}};document.addEventListener("DOMContentLoaded",()=>{w.init()});document.addEventListener("ka_data_updated",m=>{m.detail&&m.detail.key==="ka_farm_finances"&&w.renderFinances()});
