
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

  const [activeTab, setActiveTab] = useState<'dados' | 'dashboard'>('dashboard');

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
      totalWeight: totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      positiveRate: filteredData.length > 0 ? ((positiveCount / filteredData.length) * 100).toFixed(1) : '0'
    };
  }, [filteredData]);

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col p-2 lg:px-4 lg:py-3 overflow-hidden">
      {/* Header Compacto e Técnico */}
      <header className="w-full max-w-[1600px] mx-auto mb-3 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 flex items-center justify-center rounded-sm shadow-md border border-slate-700">
              <span className="text-white font-black text-sm tracking-tighter">SIA</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.25em]">INTELLIGENCE UNIT</span>
                <span className="px-1.5 py-0 bg-emerald-500 text-white text-[7px] font-black rounded-sm uppercase tracking-widest">Ativo</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                Monitoramento Estratégico
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative group">
              <input 
                type="text"
                placeholder="FILTRAR DATASET..."
                className="h-8 w-48 pl-8 pr-3 bg-white border border-slate-300 rounded-sm text-[8px] font-bold uppercase tracking-wider focus:outline-none focus:border-blue-600 shadow-sm transition-all"
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-8 px-4 bg-blue-600 text-white rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <svg className={`w-3.5 h-3.5 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              SINCRONIZAR
            </button>
          </div>
        </div>

        {/* InfoBar de Métricas - Cantos Retos e Visual Limpo */}
        <div className="w-full bg-white rounded-sm p-2 flex items-center justify-between shadow-md border border-slate-200 mb-3 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-600"></div>
          <div className="flex gap-10 pl-4">
            <MetricBlock label="Registros" value={filteredData.length} />
            <MetricBlock label="Unidades" value={metrics.uniqueSectors} />
            <MetricBlock label="Carga" value={metrics.totalWeight} />
            <MetricBlock label="Índice Conf." value={`${metrics.positiveRate}%`} />
          </div>
          
          <div className="flex items-center gap-2 pr-1">
            <nav className="flex bg-slate-100 p-0.5 rounded-sm">
              <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
              <NavBtn active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} label="Dados" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1600px] mx-auto flex-grow overflow-hidden">
        {activeTab === 'dados' ? (
          <div className="h-full animate-in slide-in-from-right-10 duration-500">
            <DataTable data={filteredData} loading={state.loading} />
          </div>
        ) : (
          <DashboardView data={state.data} loading={state.loading} />
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full max-w-[1600px] mx-auto mt-3 flex justify-between items-center shrink-0 px-1 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-none bg-emerald-500"></div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SIA ENGINE v3.5.2</span>
          </div>
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">OP: #1092-A</span>
        </div>
        <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">
          UBUNTU ANALYTICS &copy; 2025
        </p>
      </footer>
    </div>
  );
};

const MetricBlock: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col gap-0">
    <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    <span className="text-sm font-black text-slate-900 tracking-tight tabular-nums font-mono">{value}</span>
  </div>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    {label}
  </button>
);

export default App;
