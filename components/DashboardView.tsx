
import React, { useMemo } from 'react';
import { SheetRow } from '../types';

interface DashboardViewProps {
  data: SheetRow[];
  loading: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, loading }) => {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const getCountMap = (key: keyof SheetRow) => {
      const map: Record<string, number> = {};
      data.forEach(row => {
        const val = row[key] || 'N/D';
        map[val] = (map[val] || 0) + 1;
      });
      return Object.entries(map)
        .map(([label, count]) => ({ label, count, percentage: (count / data.length) * 100 }))
        .sort((a, b) => b.count - a.count);
    };

    const turno1 = data.filter(r => r.turno.includes('1')).length;
    const turno2 = data.filter(r => r.turno.includes('2')).length;
    const turno3 = data.filter(r => r.turno.includes('3')).length;

    return {
      turno1,
      turno2,
      turno3,
      dominios: getCountMap('dominios'),
      setores: getCountMap('setor'),
      funcoes: getCountMap('funcao'),
      total: data.length
    };
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-3 h-full animate-pulse">
        <div className="col-span-8 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3 h-20 bg-slate-100 rounded-sm"></div>
          <div className="flex-1 bg-slate-100 rounded-sm"></div>
        </div>
        <div className="col-span-4 flex flex-col gap-3">
          <div className="flex-1 bg-slate-100 rounded-sm"></div>
          <div className="flex-1 bg-slate-100 rounded-sm"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0 overflow-hidden pb-1">
      
      {/* Bloco Esquerdo: Turnos e Domínio */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0">
        
        {/* Row superior: 3 Turnos */}
        <div className="grid grid-cols-3 gap-3 h-24 shrink-0">
          <TurnoCard label="MATUTINO" sub="Turno 01" count={analytics.turno1} color="from-blue-700 to-blue-900" />
          <TurnoCard label="VESPERTINO" sub="Turno 02" count={analytics.turno2} color="from-indigo-700 to-indigo-900" />
          <TurnoCard label="NOTURNO" sub="Turno 03" count={analytics.turno3} color="from-slate-800 to-slate-950" />
        </div>

        {/* Card Dominio - Ocupa o restante da altura da coluna esquerda */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title="Distribuição por Domínio" 
            items={analytics.dominios} 
            barColor="bg-blue-600"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />}
          />
        </div>
      </div>

      {/* Bloco Direito: Setor e Função */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title="Setores Ativos" 
            items={analytics.setores} 
            barColor="bg-emerald-600"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title="Funções Operacionais" 
            items={analytics.funcoes} 
            barColor="bg-indigo-600"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
          />
        </div>
      </div>

    </div>
  );
};

const TurnoCard: React.FC<{ label: string; sub: string; count: number; color: string }> = ({ label, sub, count, color }) => (
  <div className={`bg-gradient-to-br ${color} p-4 rounded-sm shadow-md border border-white/5 flex flex-col justify-between relative overflow-hidden group transition-all hover:scale-[1.01]`}>
    <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
    <div>
      <h4 className="text-[8px] font-bold text-white/40 uppercase tracking-[0.25em]">{sub}</h4>
      <p className="text-[10px] font-semibold text-white tracking-widest">{label}</p>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-white tracking-tighter tabular-nums drop-shadow-sm font-mono">
        {count}
      </span>
      <span className="text-[7px] font-semibold text-white/30 uppercase tracking-widest border-l border-white/10 pl-2 mb-1">UNIDADES</span>
    </div>
  </div>
);

interface ListCardProps {
  title: string;
  items: { label: string; count: number; percentage: number }[];
  barColor: string;
  icon: React.ReactNode;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, barColor, icon }) => (
  <div className="bg-white rounded-sm border border-slate-200 shadow-lg flex flex-col h-full overflow-hidden">
    <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40 shrink-0">
      <div className="flex items-center gap-2.5">
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        <h3 className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="px-1.5 py-0.5 bg-slate-100 rounded-sm text-[7px] font-mono font-semibold text-slate-400 border border-slate-200 uppercase tracking-widest">
        DATASET_INDEX
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-4">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={item.label} className="group relative">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[8px] font-mono font-semibold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase truncate tracking-tight" title={item.label}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-900 tabular-nums font-mono">{item.count}</span>
              <span className="text-[7px] font-semibold text-slate-400 bg-slate-50 px-1 py-0.5 rounded-sm border border-slate-100">{item.percentage.toFixed(0)}%</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-none overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all duration-700 ease-out relative group-hover:brightness-105`}
              style={{ width: `${item.percentage}%` }}
            >
              <div className="absolute top-0 right-0 h-full w-2 bg-white/20 blur-sm"></div>
            </div>
          </div>
        </div>
      )) : (
        <div className="h-full flex items-center justify-center text-[8px] font-semibold text-slate-300 uppercase tracking-widest">
          Sem Dados de Processamento
        </div>
      )}
    </div>
    
    <div className="px-4 py-1.5 bg-slate-900 flex justify-between items-center shrink-0 mt-auto">
      <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.3em]">INTELLIGENCE UNIT v3.5</span>
      <div className="flex gap-1.5">
        <div className="w-1 h-1 bg-blue-500 rounded-none animate-pulse"></div>
        <div className="w-1 h-1 bg-emerald-500 rounded-none animate-pulse delay-75"></div>
        <div className="w-1 h-1 bg-amber-500 rounded-none animate-pulse delay-150"></div>
      </div>
    </div>
  </div>
);

export default DashboardView;
