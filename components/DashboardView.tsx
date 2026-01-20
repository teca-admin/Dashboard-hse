
import React, { useMemo } from 'react';
import { SheetRow } from '../types';

interface DashboardViewProps {
  data: SheetRow[];
  loading: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, loading }) => {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    // Setores mais frequentes
    const sectorMap: Record<string, number> = {};
    data.forEach(row => {
      sectorMap[row.setor] = (sectorMap[row.setor] || 0) + 1;
    });
    const topSectors = Object.entries(sectorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Distribuição de conformidade (Sim vs Não)
    const simCount = data.filter(r => r.resposta.toLowerCase() === 'sim').length;
    const naoCount = data.filter(r => r.resposta.toLowerCase() === 'não').length;
    const totalResp = simCount + naoCount;
    const conformityRate = totalResp > 0 ? (simCount / totalResp) * 100 : 0;

    // Peso por Turno
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in">
      
      {/* Conformidade Geral */}
      <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
        
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6 relative">Conformidade Geral</h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - analytics.conformityRate / 100)}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-slate-900">{analytics.conformityRate.toFixed(1)}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Média Global</span>
          </div>
        </div>

        <div className="mt-8 flex justify-between w-full border-t border-slate-50 pt-6">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-600">{analytics.simCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sim</p>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div className="text-center">
            <p className="text-2xl font-black text-rose-500">{analytics.naoCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Não</p>
          </div>
        </div>
      </div>

      {/* Top 5 Setores */}
      <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8">Volumetria por Setor (Top 5)</h3>
        
        <div className="space-y-6">
          {analytics.topSectors.map(([name, count], idx) => {
            const percentage = (count / analytics.totalEntries) * 100;
            return (
              <div key={name} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-[10px] text-slate-500">#{idx + 1}</span>
                    {name}
                  </span>
                  <span className="text-xs font-black text-slate-400 uppercase">{count} registros</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out delay-150 group-hover:bg-blue-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição de Pesos por Turno */}
      <div className="lg:col-span-12 bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-800">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Distribuição de Carga</h3>
            <p className="text-white text-lg font-bold">Peso Acumulado por Turno</p>
          </div>
          <div className="flex items-center gap-2">
            {analytics.shiftWeights.map(([shift]) => (
              <div key={shift} className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{shift}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {analytics.shiftWeights.map(([shift, weight]) => (
            <div key={shift} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Turno</span>
              </div>
              <p className="text-slate-400 text-sm font-bold mb-1">{shift}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{weight.toFixed(1)}</p>
                <p className="text-xs font-bold text-blue-500">kg/un</p>
              </div>
              <div className="mt-4 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3"></div>
              </div>
            </div>
          ))}

          {/* Card Resumo Adicional */}
          <div className="md:col-span-3 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl flex flex-col justify-between group shadow-lg shadow-blue-600/20">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Global</span>
            </div>
            <div>
              <p className="text-blue-100/70 text-xs font-bold mb-1 uppercase tracking-wider">Total de Pontos</p>
              <p className="text-4xl font-black text-white group-hover:translate-x-1 transition-transform">{analytics.totalEntries * 10}</p>
              <p className="text-[10px] text-blue-100/50 mt-2 font-medium">Cálculo baseado em amostragem atual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
