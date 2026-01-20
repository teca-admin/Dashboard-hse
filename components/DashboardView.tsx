
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
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)] animate-pulse">
        <div className="col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 h-24 bg-slate-100 rounded-lg"></div>
          <div className="flex-1 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-slate-100 rounded-lg"></div>
          <div className="flex-1 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-320px)] min-h-[550px] animate-in fade-in zoom-in-95 duration-700 overflow-hidden p-1">
      
      {/* Bloco Esquerdo: Turnos e Domínio */}
      <div className="lg:col-span-8 flex flex-col gap-5 overflow-hidden">
        
        {/* Row superior: 3 Turnos (Visual Moderno) */}
        <div className="grid grid-cols-3 gap-5 h-28 shrink-0">
          <TurnoCard label="MATUTINO" sub="1º Turno" count={analytics.turno1} color="from-blue-600 to-blue-800" />
          <TurnoCard label="VESPERTINO" sub="2º Turno" count={analytics.turno2} color="from-indigo-600 to-indigo-800" />
          <TurnoCard label="NOTURNO" sub="3º Turno" count={analytics.turno3} color="from-slate-800 to-slate-950" />
        </div>

        {/* Card Dominio (Líder de Dados) */}
        <div className="flex-1 min-h-0">
          <ListCard 
            title="Distribuição por Domínio" 
            items={analytics.dominios} 
            barColor="bg-blue-500"
            icon="🌐"
          />
        </div>
      </div>

      {/* Bloco Direito: Setor e Função */}
      <div className="lg:col-span-4 flex flex-col gap-5 overflow-hidden">
        <div className="flex-1 min-h-0">
          <ListCard 
            title="Setores Ativos" 
            items={analytics.setores} 
            barColor="bg-emerald-500"
            icon="🏢"
          />
        </div>
        <div className="flex-1 min-h-0">
          <ListCard 
            title="Funções Operacionais" 
            items={analytics.funcoes} 
            barColor="bg-indigo-500"
            icon="👤"
          />
        </div>
      </div>

    </div>
  );
};

const TurnoCard: React.FC<{ label: string; sub: string; count: number; color: string }> = ({ label, sub, count, color }) => (
  <div className={`bg-gradient-to-br ${color} p-5 rounded-xl shadow-lg border border-white/10 flex flex-col justify-between relative overflow-hidden group`}>
    <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
    <div>
      <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{sub}</h4>
      <p className="text-[12px] font-bold text-white tracking-wider">{label}</p>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
        {count}
      </span>
      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-l border-white/20 pl-2 mb-1">Registros</span>
    </div>
  </div>
);

interface ListCardProps {
  title: string;
  items: { label: string; count: number; percentage: number }[];
  barColor: string;
  icon: string;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, barColor, icon }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col h-full overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">{title}</h3>
      </div>
      <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-400">
        RANKING
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-5">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={item.label} className="group relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-[9px] font-mono font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="text-[11px] font-bold text-slate-700 uppercase truncate" title={item.label}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[12px] font-black text-slate-900 tabular-nums">{item.count}</span>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.percentage.toFixed(0)}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all duration-1000 ease-out relative group-hover:brightness-110`}
              style={{ width: `${item.percentage}%` }}
            >
              <div className="absolute top-0 right-0 h-full w-2 bg-white/20 blur-sm"></div>
            </div>
          </div>
        </div>
      )) : (
        <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Sem Dados Disponíveis
        </div>
      )}
    </div>
    
    <div className="px-5 py-2.5 bg-slate-900 flex justify-between items-center shrink-0">
      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Data Insight Engine</span>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  </div>
);

export default DashboardView;
