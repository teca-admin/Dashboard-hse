
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
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 lg:p-10">
      {/* Header Corporativo Refinado */}
      <header className="w-full max-w-[1600px] mx-auto mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-l-4 border-slate-900 pl-6">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1 block">Enterprise Analytics Portal</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">
              Dashboard de Monitoramento
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-[10px] uppercase tracking-widest flex items-center gap-3">
              <span className="h-[1px] w-6 bg-slate-300"></span>
              Operação em Tempo Real
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="BUSCAR REGISTROS..."
                className="h-9 w-full md:w-60 pl-9 pr-4 bg-white border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-slate-900 transition-colors shadow-sm"
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-9 px-5 bg-[#0f172a] text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center gap-2 shadow-md"
            >
              <svg className={`w-3.5 h-3.5 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {state.loading ? '...' : 'SINCRONIZAR'}
            </button>
          </div>
        </div>

        {/* Barra de Informações Compactas Sinalizada com a cor #0f172a */}
        <div className="w-full bg-[#0f172a] text-white px-6 py-3 flex flex-wrap items-center justify-start gap-x-12 gap-y-3 shadow-sm mb-6 border-b border-slate-800">
          <CompactMetric label="Registros" value={filteredData.length} />
          <CompactMetric label="Setores" value={metrics.uniqueSectors} />
          <CompactMetric label="Peso Total" value={metrics.totalWeight} />
          <CompactMetric label="Conformidade" value={`${metrics.positiveRate}%`} />
          <div className="ml-auto flex items-center gap-2 bg-slate-800/50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-slate-700/50">
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
            Sinal Estável
          </div>
        </div>

        {/* Navegação por Guias */}
        <nav className="flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'dados'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Base de Dados
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'dashboard'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Análise Gráfica
          </button>
        </nav>
      </header>

      {/* Área Principal */}
      <main className="w-full max-w-[1600px] mx-auto flex-grow">
        {activeTab === 'dados' ? (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <DataTable data={filteredData} loading={state.loading} />
          </div>
        ) : (
          <DashboardView data={state.data} loading={state.loading} />
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="w-full max-w-[1600px] mx-auto mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SIA Portal • 2025</span>
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">ID Operador: #1092</span>
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Gerenciamento Analítico Ubuntu
        </p>
      </footer>
    </div>
  );
};

const CompactMetric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-bold tracking-tight text-white">{value}</span>
  </div>
);

export default App;
