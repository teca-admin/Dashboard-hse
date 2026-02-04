
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
    const turnoComercial = data.filter(r => r.turno.toUpperCase().includes('COMERCIAL')).length;

    return {
      turno1,
      turno2,
      turno3,
      turnoComercial,
      dominios: getCountMap('dominios'),
      setores: getCountMap('setor'),
      funcoes: getCountMap('funcao'),
      total: data.length
    };
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-6 h-full animate-pulse">
        <div className="col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-6 h-32 bg-slate-50 rounded-2xl"></div>
          <div className="flex-1 bg-slate-50 rounded-2xl"></div>
        </div>
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-slate-50 rounded-2xl"></div>
          <div className="flex-1 bg-slate-50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 overflow-hidden pb-2">
      
      {/* Coluna Principal: Turnos e Performance por Domínio */}
      <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
        
        {/* Indicadores de Turno Profissionais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-auto lg:h-32 shrink-0">
          <TurnoCard label="Equipe Matutina" sub="Operação Turno 01" count={analytics.turno1} color="indigo" />
          <TurnoCard label="Equipe Vespertina" sub="Operação Turno 02" count={analytics.turno2} color="slate" />
          <TurnoCard label="Equipe Noturna" sub="Operação Turno 03" count={analytics.turno3} color="zinc" />
          <TurnoCard label="Equipe Comercial" sub="Administrativo / Apoio" count={analytics.turnoComercial} color="emerald" />
        </div>

        {/* Gráfico de Barras Verticais de Domínios */}
        <div className="flex-1 min-h-0">
          <VerticalBarCard 
            title="Performance por Domínio de Segurança" 
            items={analytics.dominios} 
            barColor="bg-indigo-500"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
          />
        </div>
      </div>

      {/* Coluna Lateral: Contexto Operacional */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title="Distribuição Setorial" 
            items={analytics.setores} 
            barColor="bg-emerald-500"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title="Hierarquia de Funções" 
            items={analytics.funcoes} 
            barColor="bg-indigo-400"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          />
        </div>
      </div>

    </div>
  );
};

const TurnoCard: React.FC<{ label: string; sub: string; count: number; color: 'indigo' | 'slate' | 'zinc' | 'emerald' }> = ({ label, sub, count, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-600 shadow-indigo-200',
    slate: 'bg-slate-800 shadow-slate-200',
    zinc: 'bg-zinc-700 shadow-zinc-200',
    emerald: 'bg-emerald-600 shadow-emerald-200'
  };

  return (
    <div className={`${colorStyles[color]} p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden`}>
      <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
      <div>
        <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">{sub}</h4>
        <p className="text-sm font-semibold text-white tracking-tight">{label}</p>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-4xl font-bold text-white tracking-tighter tabular-nums drop-shadow-lg">
          {count}
        </span>
        <div className="flex items-center gap-2 mb-1.5 opacity-60">
          <span className="text-[9px] font-bold text-white uppercase tracking-widest border-l border-white/20 pl-2">Análises</span>
        </div>
      </div>
    </div>
  );
};

interface ListCardProps {
  title: string;
  items: { label: string; count: number; percentage: number }[];
  barColor: string;
  icon: React.ReactNode;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, barColor, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{title}</h3>
      </div>
      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Dataset</span>
    </div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-5">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={item.label}>
          <div className="flex justify-between items-end mb-1.5">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-200">{ (idx + 1).toString().padStart(2, '0') }</span>
              <span className="text-xs font-semibold text-slate-600 truncate tracking-tight" title={item.label}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-slate-900 tabular-nums">{item.count}</span>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.percentage.toFixed(0)}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} rounded-full`}
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      )) : (
        <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          Nenhum dado processado
        </div>
      )}
    </div>
  </div>
);

const VerticalBarCard: React.FC<ListCardProps> = ({ title, items, barColor, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
    
    <div className="flex-1 px-8 py-8 flex items-end justify-around gap-6 overflow-hidden">
      {items.length > 0 ? items.map((item) => (
        <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end max-w-[80px]">
          <div className="relative flex-1 w-full flex flex-col justify-end">
             {/* Static percentage label above bar if needed, or keeping it strictly static as requested */}
             <div className="text-center mb-1">
               <span className="text-[10px] font-mono font-bold text-slate-300">{item.count}</span>
             </div>
             
             {/* Styled Vertical Bar */}
             <div 
               className={`w-full ${barColor} rounded-t-xl shadow-lg shadow-indigo-100 relative overflow-hidden`}
               style={{ height: `${item.percentage}%`, minHeight: '8px' }}
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
             </div>
          </div>
          
          {/* Executive Label below bar */}
          <div className="mt-4 w-full flex flex-col items-center">
            <div className="h-[40px] flex items-start justify-center text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight leading-tight line-clamp-2" title={item.label}>
                  {item.label}
                </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 border-t border-slate-50 pt-1 w-full justify-center">
               <span className="text-[10px] font-bold text-slate-900 tabular-nums">{item.percentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Aguardando processamento analítico
        </div>
      )}
    </div>
    
    <div className="px-6 py-3 bg-slate-50/50 flex justify-center items-center border-t border-slate-50">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Visualização Estratégica Estrutural</span>
    </div>
  </div>
);

export default DashboardView;
