
import React, { useMemo } from 'react';
import { SheetRow } from '../types';

interface DashboardViewProps {
  data: SheetRow[];
  loading: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, loading }) => {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const sectorMap: Record<string, number> = {};
    data.forEach(row => {
      sectorMap[row.setor] = (sectorMap[row.setor] || 0) + 1;
    });
    const topSectors = Object.entries(sectorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const simCount = data.filter(r => r.resposta.toLowerCase() === 'sim').length;
    const naoCount = data.filter(r => r.resposta.toLowerCase() === 'não').length;
    const totalResp = simCount + naoCount;
    const conformityRate = totalResp > 0 ? (simCount / totalResp) * 100 : 0;

    const shiftWeightMap: Record<string, number> = {};
    data.forEach(row => {
      const p = parseFloat(row.peso.replace(',', '.')) || 0;
      shiftWeightMap[row.turno] = (shiftWeightMap[row.turno] || 0) + p;
    });

    return {
      topSectors,
      conformityRate,
      simCount,
      naoCount,
      shiftWeights: Object.entries(shiftWeightMap),
      totalEntries: data.length
    };
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-72 bg-white border border-slate-200 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 animate-in fade-in duration-700">
      
      {/* Conformidade Geral - Chart Minimalista */}
      <div className="lg:col-span-4 bg-white p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-12 text-center border-b border-slate-100 pb-3 w-full">KPI: Conformidade Operacional</h3>
        
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="78"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="88"
              cy="88"
              r="78"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 78}
              strokeDashoffset={2 * Math.PI * 78 * (1 - analytics.conformityRate / 100)}
              strokeLinecap="butt"
              className="text-slate-900 transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-900 tracking-tighter">{analytics.conformityRate.toFixed(1)}%</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Conforme</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 w-full pt-8 border-t border-slate-50 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{analytics.simCount}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aprovações</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-xl font-bold text-slate-900">{analytics.naoCount}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Não-Conf.</p>
          </div>
        </div>
      </div>

      {/* Volume por Setor - Barras Técnicas */}
      <div className="lg:col-span-8 bg-white p-10 border border-slate-200 shadow-sm">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border-b border-slate-100 pb-3">Análise de Volumetria Segmentada</h3>
        
        <div className="space-y-8">
          {analytics.topSectors.map(([name, count], idx) => {
            const percentage = (count / analytics.totalEntries) * 100;
            return (
              <div key={name} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                    <span className="text-slate-300 font-mono">0{idx + 1}</span>
                    {name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">{count} Registros</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carga Operacional por Turno - Cards Analíticos */}
      <div className="lg:col-span-12 bg-white p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
          <div>
            <h3 className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Monitoramento de Capacidade</h3>
            <p className="text-slate-900 text-xl font-bold uppercase tracking-tight">Carga Acumulada por Período</p>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 border border-slate-100">Atualização em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {analytics.shiftWeights.map(([shift, weight]) => (
            <div key={shift} className="bg-slate-50/50 p-8 border border-slate-100 hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Périodo: {shift}</span>
                <div className="w-1.5 h-1.5 bg-blue-600"></div>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-slate-900 tracking-tighter">{weight.toFixed(1)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Un. Peso</p>
              </div>
              <div className="mt-6 w-full h-[2px] bg-slate-200">
                <div className="h-full bg-slate-400 w-1/3 group-hover:bg-slate-900 transition-colors"></div>
              </div>
            </div>
          ))}

          {/* Card Resumo de Pontuação */}
          <div className="bg-slate-900 p-8 border border-slate-900 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block">Score Consolidado</span>
              <p className="text-white text-4xl font-bold tracking-tighter tabular-nums leading-none">
                {analytics.totalEntries * 10}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">Agregado Operacional</p>
            </div>
            <div className="h-[1px] w-full bg-slate-800 mt-8"></div>
            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-4">Nível de Performance: ALTA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
