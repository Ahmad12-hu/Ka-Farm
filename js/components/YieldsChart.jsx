import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Sprout, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Award, 
  Database,
  BarChart2,
  LineChart as LineIcon,
  AreaChart as AreaIcon
} from 'lucide-react';

const YIELD_HISTORY_DATA = [
  { month: 'Juillet 2025', 'Tomate': 2.4, 'Oignon': 1.8, 'Chou': 3.0, 'Piment': 0.8 },
  { month: 'Août 2025', 'Tomate': 2.8, 'Oignon': 2.0, 'Chou': 2.5, 'Piment': 0.9 },
  { month: 'Septembre 2025', 'Tomate': 2.1, 'Oignon': 3.2, 'Chou': 2.0, 'Piment': 0.6 },
  { month: 'Octobre 2025', 'Tomate': 1.8, 'Oignon': 4.5, 'Chou': 1.8, 'Piment': 0.5 },
  { month: 'Novembre 2025', 'Tomate': 3.2, 'Oignon': 6.0, 'Chou': 3.6, 'Piment': 1.1 },
  { month: 'Décembre 2025', 'Tomate': 5.0, 'Oignon': 7.5, 'Chou': 5.2, 'Piment': 1.5 },
  { month: 'Janvier 2026', 'Tomate': 6.2, 'Oignon': 6.8, 'Chou': 6.0, 'Piment': 2.0 },
  { month: 'Février 2026', 'Tomate': 5.8, 'Oignon': 4.8, 'Chou': 5.8, 'Piment': 1.8 },
  { month: 'Mars 2026', 'Tomate': 7.0, 'Oignon': 3.5, 'Chou': 7.0, 'Piment': 2.2 },
  { month: 'Avril 2026', 'Tomate': 8.5, 'Oignon': 2.5, 'Chou': 4.5, 'Piment': 2.5 },
  { month: 'Mai 2026', 'Tomate': 7.8, 'Oignon': 2.0, 'Chou': 3.6, 'Piment': 2.1 },
  { month: 'Juin 2026', 'Tomate': 6.5, 'Oignon': 2.8, 'Chou': 3.0, 'Piment': 1.4 }
];

const CROP_CONFIGS = {
  'Tomate': { color: '#EF4444', name: 'Tomate Mongal F1', emoji: '🍅' },
  'Oignon': { color: '#F59E0B', name: 'Oignon Rouge de Gandiol', emoji: '🧅' },
  'Chou': { color: '#10B981', name: 'Chou Cabus KK-Cross', emoji: '🥬' },
  'Piment': { color: '#EC4899', name: 'Piment Oiseau', emoji: '🌶️' }
};

export function YieldsChart() {
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar' | 'line'
  const [activeCrop, setActiveCrop] = useState('all'); // 'all' | 'Tomate' | 'Oignon' | 'Chou' | 'Piment'
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Listen for theme changes from the parent app frame
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Compute stats
  const totalProduction = YIELD_HISTORY_DATA.reduce((acc, curr) => {
    if (activeCrop === 'all') {
      return acc + curr['Tomate'] + curr['Oignon'] + curr['Chou'] + curr['Piment'];
    }
    return acc + curr[activeCrop];
  }, 0);

  const averageProduction = totalProduction / YIELD_HISTORY_DATA.length;

  const maxMonth = YIELD_HISTORY_DATA.reduce((max, curr) => {
    const val = activeCrop === 'all' 
      ? curr['Tomate'] + curr['Oignon'] + curr['Chou'] + curr['Piment']
      : curr[activeCrop];
    const maxVal = activeCrop === 'all'
      ? max.item['Tomate'] + max.item['Oignon'] + max.item['Chou'] + max.item['Piment']
      : max.item[activeCrop];
    return val > maxVal ? { item: curr, val } : max;
  }, { item: YIELD_HISTORY_DATA[0], val: 0 });

  // Calculate top performing crop
  const cropTotals = { Tomate: 0, Oignon: 0, Chou: 0, Piment: 0 };
  YIELD_HISTORY_DATA.forEach(d => {
    cropTotals.Tomate += d.Tomate;
    cropTotals.Oignon += d.Oignon;
    cropTotals.Chou += d.Chou;
    cropTotals.Piment += d.Piment;
  });

  const leaderCrop = Object.entries(cropTotals).reduce((lead, curr) => {
    return curr[1] > lead[1] ? curr : lead;
  }, ['Tomate', 0]);

  // Color variables depending on theme
  const gridColor = isDark ? 'rgba(20, 62, 35, 0.15)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#A4C4AF' : '#64748B';

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white dark:bg-[#06130B] border border-slate-150 dark:border-[#143E23]/60 rounded-2xl shadow-xl text-left space-y-2">
          <p className="text-[10px] text-slate-400 dark:text-[#819888] font-black uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry) => {
              const conf = CROP_CONFIGS[entry.name];
              return (
                <div key={entry.name} className="flex items-center justify-between gap-6">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="text-sm">{conf?.emoji}</span>
                    {conf?.name || entry.name}
                  </span>
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-white" style={{ color: entry.color }}>
                    {entry.value.toFixed(1)} T
                  </span>
                </div>
              );
            })}
            {payload.length > 1 && (
              <div className="pt-1.5 mt-1.5 border-t border-slate-50 dark:border-[#143E23]/25 flex items-center justify-between text-xs font-black">
                <span className="text-slate-500 dark:text-[#819888]">Production Totale</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {payload.reduce((sum, entry) => sum + entry.value, 0).toFixed(1)} T
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-left space-y-6 hover-lift">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-50 dark:border-slate-800/10">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest">Analyses & Rendements</span>
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-500" /> Historique des Rendements Maraîchers (12 derniers mois)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Évolution mensuelle des volumes récoltés (en tonnes) pour les parcelles du terroir sénégalais.
          </p>
        </div>

        {/* Chart type & filter selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-slate-50 dark:bg-[#061109]/40 p-1 rounded-xl border border-slate-100 dark:border-[#143E23]/30">
            <button 
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${chartType === 'area' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              title="Graphique en aires"
            >
              <AreaIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${chartType === 'bar' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              title="Graphique en barres"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${chartType === 'line' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              title="Graphique en courbes"
            >
              <LineIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Crop filter */}
          <select 
            value={activeCrop} 
            onChange={(e) => setActiveCrop(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-[#143E23]/30 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
          >
            <option value="all">Toutes les cultures</option>
            <option value="Tomate">🍅 Tomate Mongal F1</option>
            <option value="Oignon">🧅 Oignon Rouge</option>
            <option value="Chou">🥬 Chou Cabus</option>
            <option value="Piment">🌶️ Piment Oiseau</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-[#061109]/30 p-3.5 rounded-2xl border border-slate-100 dark:border-[#143E23]/10 flex flex-col justify-between">
          <p className="text-[9px] font-black text-slate-400 dark:text-[#819888] uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Production Cumulée
          </p>
          <div className="mt-1">
            <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{totalProduction.toFixed(1)} T</span>
            <p className="text-[9px] text-[#819888] font-bold mt-0.5">Sur 12 mois d'activité</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#061109]/30 p-3.5 rounded-2xl border border-slate-100 dark:border-[#143E23]/10 flex flex-col justify-between">
          <p className="text-[9px] font-black text-slate-400 dark:text-[#819888] uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-emerald-500" /> Moyenne Mensuelle
          </p>
          <div className="mt-1">
            <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{averageProduction.toFixed(1)} T</span>
            <p className="text-[9px] text-[#819888] font-bold mt-0.5">Par mois d'exploitation</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#061109]/30 p-3.5 rounded-2xl border border-slate-100 dark:border-[#143E23]/10 flex flex-col justify-between">
          <p className="text-[9px] font-black text-slate-400 dark:text-[#819888] uppercase tracking-wider flex items-center gap-1">
            <Award className="h-3 w-3 text-emerald-500" /> Pic de Rendement
          </p>
          <div className="mt-1">
            <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{maxMonth.val.toFixed(1)} T</span>
            <p className="text-[9px] text-[#819888] font-bold mt-0.5 truncate" title={maxMonth.item.month}>{maxMonth.item.month}</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#061109]/30 p-3.5 rounded-2xl border border-slate-100 dark:border-[#143E23]/10 flex flex-col justify-between">
          <p className="text-[9px] font-black text-slate-400 dark:text-[#819888] uppercase tracking-wider flex items-center gap-1">
            <Database className="h-3 w-3 text-emerald-500" /> Culture Dominante
          </p>
          <div className="mt-1">
            <span className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1">
              <span>{CROP_CONFIGS[leaderCrop[0]]?.emoji}</span>
              <span className="truncate">{leaderCrop[0]}</span>
            </span>
            <p className="text-[9px] text-[#819888] font-bold mt-0.5 font-mono">{leaderCrop[1].toFixed(1)} T récoltées</p>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full h-[260px] sm:h-[320px] bg-slate-50/50 dark:bg-[#061109]/15 p-4 rounded-3xl border border-slate-100/75 dark:border-[#143E23]/20 relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={YIELD_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(CROP_CONFIGS).map(([key, value]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={value.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={value.color} stopOpacity={0.0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} unit="T" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#143E23' : '#CBD5E1', strokeWidth: 1 }} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide ml-1">{CROP_CONFIGS[value]?.emoji} {value}</span>}
              />
              {activeCrop === 'all' ? (
                Object.entries(CROP_CONFIGS).map(([key, value]) => (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    name={key}
                    stroke={value.color} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill={`url(#gradient-${key})`} 
                  />
                ))
              ) : (
                <Area 
                  type="monotone" 
                  dataKey={activeCrop} 
                  name={activeCrop}
                  stroke={CROP_CONFIGS[activeCrop].color} 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill={`url(#gradient-${activeCrop})`} 
                />
              )}
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={YIELD_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} unit="T" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(20, 62, 35, 0.1)' : 'rgba(241, 245, 249, 0.5)' }} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide ml-1">{CROP_CONFIGS[value]?.emoji} {value}</span>}
              />
              {activeCrop === 'all' ? (
                Object.entries(CROP_CONFIGS).map(([key, value]) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    name={key}
                    fill={value.color} 
                    radius={[6, 6, 0, 0]}
                  />
                ))
              ) : (
                <Bar 
                  dataKey={activeCrop} 
                  name={activeCrop}
                  fill={CROP_CONFIGS[activeCrop].color} 
                  radius={[6, 6, 0, 0]}
                />
              )}
            </BarChart>
          ) : (
            <LineChart data={YIELD_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} unit="T" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#143E23' : '#CBD5E1', strokeWidth: 1 }} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide ml-1">{CROP_CONFIGS[value]?.emoji} {value}</span>}
              />
              {activeCrop === 'all' ? (
                Object.entries(CROP_CONFIGS).map(([key, value]) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    name={key}
                    stroke={value.color} 
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={activeCrop} 
                  name={activeCrop}
                  stroke={CROP_CONFIGS[activeCrop].color} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Mount the component when document is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('yields-chart-react-root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <>
        <YieldsChart />
        <Analytics />
      </>
    );
  }
});
