
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
          <div className="grid grid-cols-3 gap-4 h-24 bg-white border border-slate-100"></div>
          <div className="flex-1 bg-white border border-slate-100"></div>
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-white border border-slate-100"></div>
          <div className="flex-1 bg-white border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-320px)] min-h-[500px] animate-in fade-in duration-500 overflow-hidden">
      
      {/* Bloco Esquerdo: Turnos e Domínio (Proporção maior) */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
        
        {/* Row superior: 3 Turnos (Compactos) */}
        <div className="grid grid-cols-3 gap-4 h-24 shrink-0">
          <TurnoCard label="1º TURNO" count={analytics.turno1} />
          <TurnoCard label="2º TURNO" count={analytics.turno2} />
          <TurnoCard label="3º TURNO" count={analytics.turno3} />
        </div>

        {/* Card Dominio (Ocupa o resto do espaço vertical) */}
        <div className="flex-1 min-h-0">
          <ListCard 
            title="DOMÍNIO" 
            items={analytics.dominios} 
            accentColor="border-l-blue-600" 
            fullHeight
          />
        </div>
      </div>

      {/* Bloco Direito: Setor e Função (Compactados) */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 min-h-0">
          <ListCard 
            title="SETOR" 
            items={analytics.setores} 
            accentColor="border-l-slate-900" 
            fullHeight
          />
        </div>
        <div className="flex-1 min-h-0">
          <ListCard 
            title="FUNÇÃO" 
            items={analytics.funcoes} 
            accentColor="border-l-blue-500" 
            fullHeight
          />
        </div>
      </div>

    </div>
  );
};

const TurnoCard: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className="bg-[#2563eb] px-4 py-3 shadow-sm border border-blue-500/20 flex flex-col justify-center">
    <h4 className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.15em] mb-1">{label}</h4>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-white tracking-tighter tabular-nums">
        {count}
      </span>
      <span className="text-[8px] font-bold text-blue-200 uppercase">Reg.</span>
    </div>
  </div>
);

interface ListCardProps {
  title: string;
  items: { label: string; count: number; percentage: number }[];
  accentColor: string;
  fullHeight?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, accentColor, fullHeight }) => (
  <div className={`bg-white border border-slate-200 shadow-sm flex flex-col border-l-4 ${accentColor} ${fullHeight ? 'h-full' : ''} overflow-hidden`}>
    <div className="px-4 py-2.5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
      <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-[0.15em]">{title}</h3>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
        <span className="text-[8px] font-bold text-slate-400 tabular-nums uppercase">Dataset</span>
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.label} className="group">
            <div className="flex justify-between items-end mb-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate max-w-[70%]" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-slate-900 tabular-nums">{item.count}</span>
                <span className="text-[8px] font-medium text-slate-400">{item.percentage.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-none overflow-hidden">
              <div 
                className="h-full bg-slate-900 transition-all duration-700 ease-out opacity-70 group-hover:opacity-100"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="px-4 py-1.5 bg-slate-50/30 border-t border-slate-50 text-right shrink-0">
      <span className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.1em]">Analytics Engine 2.5</span>
    </div>
  </div>
);

export default DashboardView;
