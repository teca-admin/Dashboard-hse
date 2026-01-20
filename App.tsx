
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

  const [activeTab, setActiveTab] = useState<'dados' | 'dashboard'>('dashboard'); // Dashboard por padrão

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
    <div className="h-screen bg-[#f1f5f9] flex flex-col p-4 lg:px-8 lg:py-6 overflow-hidden">
      {/* Header Estilo Centro de Comando */}
      <header className="w-full max-w-[1600px] mx-auto mb-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl shadow-lg border border-white/10">
              <span className="text-white font-black text-xl tracking-tighter">SIA</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">INTELLIGENCE UNIT</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase tracking-widest">Ativo</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Monitoramento Estratégico
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input 
                type="text"
                placeholder="FILTRAR REGISTROS..."
                className="h-10 w-64 pl-10 pr-4 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-10 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 flex items-center gap-3 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <svg className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sincronizar
            </button>
          </div>
        </div>

        {/* InfoBar de Métricas - High-Tech */}
        <div className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <div className="flex gap-12 pl-4">
            <MetricBlock label="Registros Totais" value={filteredData.length} />
            <MetricBlock label="Unidades Ativas" value={metrics.uniqueSectors} />
            <MetricBlock label="Carga Acumulada" value={metrics.totalWeight} />
            <MetricBlock label="Índice Conform." value={`${metrics.positiveRate}%`} />
          </div>
          
          <div className="flex items-center gap-4 pr-2">
            <nav className="flex bg-slate-100 p-1 rounded-xl">
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
      <footer className="w-full max-w-[1600px] mx-auto mt-6 flex justify-between items-center shrink-0 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIA SYSTEM ENGINE 3.0</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">OPERADOR: #1092</span>
        </div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          Gerenciamento Analítico Ubuntu &copy; 2025
        </p>
      </footer>
    </div>
  );
};

const MetricBlock: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">{value}</span>
  </div>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-white text-blue-600 shadow-md' 
        : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    {label}
  </button>
);

export default App;
