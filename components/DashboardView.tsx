
import React, { useMemo, useState } from 'react';
import { SheetRow } from '../types';

interface DashboardViewProps {
  data: SheetRow[];
  loading: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, loading }) => {
  // Estados para controlar os filtros ativos
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);
  const [selectedDominio, setSelectedDominio] = useState<string | null>(null);

  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const parsePeso = (p: string) => parseFloat(p.replace(',', '.')) || 0;

    // Função para calcular médias globais dos turnos (sempre baseada no dataset completo)
    const getGlobalTurnoAverage = (turnoPattern: string) => {
      const filtered = data.filter(r => r.turno.toUpperCase().includes(turnoPattern.toUpperCase()));
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, curr) => acc + parsePeso(curr.peso), 0);
      return sum / filtered.length;
    };

    // 1. Dados filtrados apenas pelo Turno (para o gráfico de domínios)
    const dataFilteredByTurno = selectedTurno 
      ? data.filter(r => r.turno.toUpperCase().includes(selectedTurno.toUpperCase()))
      : data;

    // 2. Dados filtrados por Turno E Domínio (para as listas laterais)
    const dataFilteredByBoth = selectedDominio
      ? dataFilteredByTurno.filter(r => r.dominios === selectedDominio)
      : dataFilteredByTurno;

    const getAverageMap = (source: SheetRow[], key: keyof SheetRow) => {
      const sumMap: Record<string, number> = {};
      const countMap: Record<string, number> = {};
      
      source.forEach(row => {
        const category = row[key] || 'N/D';
        const pesoVal = parsePeso(row.peso);
        sumMap[category] = (sumMap[category] || 0) + pesoVal;
        countMap[category] = (countMap[category] || 0) + 1;
      });

      const entries = Object.entries(sumMap).map(([label, sum]) => {
        const count = countMap[label];
        const average = count > 0 ? sum / count : 0;
        return { label, average };
      });

      const maxAverage = Math.max(...entries.map(e => e.average), 0.01);

      return entries
        .map(({ label, average }) => ({
          label,
          count: average,
          displayValue: average.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          percentage: (average / maxAverage) * 100
        }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      turno1: getGlobalTurnoAverage('1'),
      turno2: getGlobalTurnoAverage('2'),
      turno3: getGlobalTurnoAverage('3'),
      turnoComercial: getGlobalTurnoAverage('COMERCIAL'),
      dominios: getAverageMap(dataFilteredByTurno, 'dominios'),
      setores: getAverageMap(dataFilteredByBoth, 'setor'),
      funcoes: getAverageMap(dataFilteredByBoth, 'funcao'),
      total: data.length
    };
  }, [data, selectedTurno, selectedDominio]);

  const handleToggleTurno = (turno: string) => {
    setSelectedTurno(prev => prev === turno ? null : turno);
  };

  const handleToggleDominio = (dominio: string) => {
    setSelectedDominio(prev => prev === dominio ? null : dominio);
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0 overflow-hidden pb-1">
      
      {/* Coluna Principal */}
      <div className="lg:col-span-8 flex flex-col gap-5 h-full min-h-0">
        
        {/* Cards de Turno */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 h-auto lg:h-28 shrink-0 p-1">
          <TurnoCard 
            label="Equipe Matutina" 
            sub="Média Turno 01" 
            count={analytics.turno1} 
            isActive={selectedTurno === '1'} 
            onClick={() => handleToggleTurno('1')}
          />
          <TurnoCard 
            label="Equipe Vespertina" 
            sub="Média Turno 02" 
            count={analytics.turno2} 
            isActive={selectedTurno === '2'} 
            onClick={() => handleToggleTurno('2')}
          />
          <TurnoCard 
            label="Equipe Noturna" 
            sub="Média Turno 03" 
            count={analytics.turno3} 
            isActive={selectedTurno === '3'} 
            onClick={() => handleToggleTurno('3')}
          />
          <TurnoCard 
            label="Equipe Comercial" 
            sub="Média Comercial" 
            count={analytics.turnoComercial} 
            isActive={selectedTurno === 'COMERCIAL'} 
            onClick={() => handleToggleTurno('COMERCIAL')}
          />
        </div>

        {/* Gráfico de Médias por Domínio - Agora interativo */}
        <div className="flex-1 min-h-0">
          <VerticalBarCard 
            title={`Média de Carga por Domínio ${selectedTurno ? `(Filtro Turno)` : ''}`} 
            items={analytics.dominios} 
            barColor="bg-indigo-500"
            activeItem={selectedDominio}
            onItemClick={handleToggleDominio}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
          />
        </div>
      </div>

      {/* Coluna Lateral */}
      <div className="lg:col-span-4 flex flex-col gap-5 h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title={`Média Setorial ${selectedDominio ? `(${selectedDominio})` : ''}`} 
            items={analytics.setores} 
            barColor="bg-emerald-500"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ListCard 
            title={`Média Funcional ${selectedDominio ? `(${selectedDominio})` : ''}`} 
            items={analytics.funcoes} 
            barColor="bg-indigo-400"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          />
        </div>
      </div>

    </div>
  );
};

const TurnoCard: React.FC<{ label: string; sub: string; count: number; isActive: boolean; onClick: () => void }> = ({ label, sub, count, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-xl shadow-lg border transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-left group active:scale-95 ${
        isActive 
          ? 'bg-indigo-600 border-indigo-400 ring-2 ring-indigo-300 ring-offset-2' 
          : 'bg-slate-900 border-white/10 hover:bg-slate-800'
      }`}
    >
      <div className={`absolute right-0 top-0 w-20 h-20 rounded-full -mr-10 -mt-10 transition-colors duration-500 ${
        isActive ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'
      }`}></div>
      
      <div>
        <h4 className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5 transition-colors ${
          isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-300'
        }`}>{sub}</h4>
        <p className="text-xs font-bold text-white tracking-tight">{label}</p>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <span className="text-2xl font-bold text-white tracking-tighter tabular-nums drop-shadow-md">
          {count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div className="flex items-center gap-1.5 mb-1 opacity-80">
          <span className={`text-[8px] font-bold uppercase tracking-widest border-l pl-1.5 ${
            isActive ? 'border-white/40 text-white' : 'border-slate-700 text-slate-400'
          }`}>
            Média
          </span>
        </div>
      </div>
    </button>
  );
};

interface ListCardProps {
  title: string;
  items: { label: string; count: number; percentage: number; displayValue?: string }[];
  barColor: string;
  icon: React.ReactNode;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, barColor, icon }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-slate-200 rounded text-slate-700">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">{title}</h3>
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-4">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={item.label}>
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[9px] font-bold text-slate-400">{ (idx + 1).toString().padStart(2, '0') }</span>
              <span className="text-xs font-bold text-slate-800 truncate tracking-tight" title={item.label}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {item.displayValue || item.count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
        <div className="h-full flex items-center justify-center text-center px-8">
           <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-slate-50 rounded-full mb-2 flex items-center justify-center text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Nenhum dado sob este filtro</span>
           </div>
        </div>
      )}
    </div>
  </div>
);

interface VerticalBarCardProps extends ListCardProps {
    onItemClick?: (label: string) => void;
    activeItem?: string | null;
}

const VerticalBarCard: React.FC<VerticalBarCardProps> = ({ title, items, barColor, icon, onItemClick, activeItem }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Selecione para filtrar</span>
      </div>
    </div>
    
    <div className="flex-1 px-8 py-6 flex items-end justify-around gap-6 overflow-hidden">
      {items.length > 0 ? items.map((item) => {
        const isActive = activeItem === item.label;
        const isAnythingActive = activeItem !== null && activeItem !== undefined;
        
        return (
          <button 
            key={item.label} 
            onClick={() => onItemClick?.(item.label)}
            className={`flex-1 flex flex-col items-center h-full justify-end max-w-[80px] animate-in slide-in-from-bottom-2 duration-300 group transition-all outline-none`}
          >
            <div className="relative flex-1 w-full flex flex-col justify-end">
               <div className={`text-center mb-1 transition-all ${isActive ? 'scale-110' : ''}`}>
                 <span className={`text-[11px] font-bold tabular-nums ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>
                   {item.displayValue || item.count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
               </div>
               
               <div 
                 className={`w-full rounded-t-xl shadow-lg relative overflow-hidden transition-all duration-300 border-2 ${
                   isActive 
                    ? 'bg-indigo-600 border-indigo-300 shadow-indigo-200' 
                    : isAnythingActive 
                        ? 'bg-slate-200 border-transparent opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0'
                        : `${barColor} border-transparent shadow-indigo-100/50 group-hover:brightness-110`
                 }`}
                 style={{ height: `${item.percentage}%`, minHeight: '12px' }}
               >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"></div>
                  <div className={`absolute top-0 left-0 w-full h-1 ${isActive ? 'bg-white/40' : 'bg-white/30'}`}></div>
               </div>
            </div>
            
            <div className="mt-3 w-full flex flex-col items-center">
              <div className="h-[36px] flex items-start justify-center text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-tight leading-tight line-clamp-2 transition-colors ${
                    isActive ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'
                  }`} title={item.label}>
                    {item.label}
                  </span>
              </div>
              <div className={`mt-1 flex items-center gap-1.5 border-t pt-1 w-full justify-center transition-colors ${
                isActive ? 'border-indigo-300' : 'border-slate-200'
              }`}>
                 <span className={`text-[11px] font-extrabold tabular-nums transition-colors ${
                   isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-indigo-500'
                 }`}>Média</span>
              </div>
            </div>
          </button>
        );
      }) : (
        <div className="w-full h-full flex items-center justify-center text-center">
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full mb-3 flex items-center justify-center text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Não há dados suficientes para gerar este gráfico no filtro selecionado</span>
           </div>
        </div>
      )}
    </div>
    
    <div className="px-6 py-2.5 bg-slate-50 flex justify-center items-center border-t border-slate-100">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Analytics Estratégico Baseado em Médias</span>
    </div>
  </div>
);

export default DashboardView;
