
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
    <div className="h-screen bg-white flex flex-col p-4 lg:px-8 lg:py-6 overflow-hidden">
      {/* Executive Header */}
      <header className="w-full max-w-[1700px] mx-auto mb-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl shadow-xl shadow-slate-200">
              <span className="text-white font-bold text-xl tracking-tighter">S</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">HSE Strategic Intelligence</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Live System</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                Gestão de Segurança do Trabalho
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Pesquisar inteligência..."
                className="h-10 w-64 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-10 px-6 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              {state.loading ? 'Atualizando...' : 'Sincronizar'}
              <svg className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corporate KPI Bar */}
        <div className="w-full flex items-center justify-between mt-6 shrink-0">
          <div className="flex gap-12">
            <MetricBlock label="Volume de Amostragem" value={filteredData.length} sub="Registros Totais" />
            <MetricBlock label="Abrangência Setorial" value={metrics.uniqueSectors} sub="Unidades Ativas" />
            <MetricBlock label="Impacto Acumulado" value={metrics.totalWeight} sub="Carga de Trabalho" />
            <MetricBlock label="Conformidade Geral" value={`${metrics.positiveRate}%`} sub="Índice de Segurança" highlight />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Visão Analítica" />
            <NavBtn active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} label="Dataset Detalhado" />
          </div>
        </div>
      </header>

      {/* Main Analytical Space */}
      <main className="w-full max-w-[1700px] mx-auto flex-grow min-h-0 overflow-hidden">
        {activeTab === 'dados' ? (
          <div className="h-full">
            <DataTable data={filteredData} loading={state.loading} />
          </div>
        ) : (
          <div className="h-full">
            <DashboardView data={state.data} loading={state.loading} />
          </div>
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="w-full max-w-[1700px] mx-auto mt-6 flex justify-between items-center shrink-0 px-2 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Safety Intelligence v3.5.2</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Servidor Operacional: Cluster-Alpha</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-medium tracking-tight">
          SISTEMA DE SUPORTE À DECISÃO ESTRATÉGICA &copy; 2025
        </div>
      </footer>
    </div>
  );
};

const MetricBlock: React.FC<{ label: string; value: string | number; sub: string; highlight?: boolean }> = ({ label, value, sub, highlight }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className={`text-2xl font-bold tracking-tighter tabular-nums ${highlight ? 'text-indigo-600' : 'text-slate-900'}`}>{value}</span>
      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{sub}</span>
    </div>
  </div>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    {label}
  </button>
);

export default App;
