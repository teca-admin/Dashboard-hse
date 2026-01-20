
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable from './components/DataTable';
import DashboardView from './components/DashboardView';
import { fetchSpreadsheetData } from './services/googleSheets';
import { SheetRow, AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    loading: true,
    error: null,
    searchTerm: '',
  });

  const [activeTab, setActiveTab] = useState<'dados' | 'dashboard'>('dados');

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchSpreadsheetData();
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message || "Erro na comunicação com o servidor de dados." 
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    return state.data.filter(row => {
      const searchString = `${row.id} ${row.setor} ${row.funcao} ${row.dominios} ${row.itens}`.toLowerCase();
      return searchString.includes(state.searchTerm.toLowerCase());
    });
  }, [state.data, state.searchTerm]);

  const metrics = useMemo(() => {
    const sectors = new Set(filteredData.map(r => r.setor));
    const totalWeight = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.peso.replace(',', '.')) || 0), 0);
    const positiveCount = filteredData.filter(r => r.resposta.toLowerCase() === 'sim').length;
    
    return {
      uniqueSectors: sectors.size,
      totalWeight: totalWeight.toFixed(2),
      positiveRate: filteredData.length > 0 ? ((positiveCount / filteredData.length) * 100).toFixed(1) : '0'
    };
  }, [filteredData]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col p-4 lg:px-8 lg:py-4 overflow-hidden">
      {/* Header Corporativo Refinado - Reduzido para compactação */}
      <header className="w-full max-w-[1600px] mx-auto mb-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 border-l-4 border-slate-900 pl-4">
          <div>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] block">Enterprise Analytics Portal</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase">
              Dashboard de Monitoramento
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text"
                placeholder="BUSCAR..."
                className="h-8 w-40 pl-8 pr-3 bg-white border border-slate-200 rounded-none text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:border-slate-900 shadow-sm"
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-8 px-4 bg-[#0f172a] text-white rounded-none text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 flex items-center gap-2 shadow-sm"
            >
              <svg className={`w-3 h-3 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              SYNC
            </button>
          </div>
        </div>

        {/* Barra de Informações Compactas */}
        <div className="w-full bg-[#0f172a] text-white px-4 py-2 flex items-center justify-start gap-x-8 shadow-sm mb-4 border-b border-slate-800 shrink-0">
          <CompactMetric label="Reg." value={filteredData.length} />
          <CompactMetric label="Setores" value={metrics.uniqueSectors} />
          <CompactMetric label="Peso" value={metrics.totalWeight} />
          <CompactMetric label="Conf." value={`${metrics.positiveRate}%`} />
          <div className="ml-auto flex items-center gap-2 bg-slate-800/50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-slate-700/50">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>

        {/* Navegação por Guias */}
        <nav className="flex items-center border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] transition-all relative ${
              activeTab === 'dados'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Dados
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] transition-all relative ${
              activeTab === 'dashboard'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Dashboard
          </button>
        </nav>
      </header>

      {/* Área Principal - Ocupa o resto do espaço */}
      <main className="w-full max-w-[1600px] mx-auto flex-grow overflow-hidden">
        {activeTab === 'dados' ? (
          <div className="h-full animate-in fade-in duration-300">
            <DataTable data={filteredData} loading={state.loading} />
          </div>
        ) : (
          <DashboardView data={state.data} loading={state.loading} />
        )}
      </main>

      {/* Footer Profissional - Compactado */}
      <footer className="w-full max-w-[1600px] mx-auto mt-4 pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SIA • 2025</span>
          <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest">ID: #1092</span>
        </div>
        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.15em]">
          Gerenciamento Analítico Ubuntu
        </p>
      </footer>
    </div>
  );
};

const CompactMetric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-baseline gap-1.5">
    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}:</span>
    <span className="text-[10px] font-bold tracking-tight text-white">{value}</span>
  </div>
);

export default App;
