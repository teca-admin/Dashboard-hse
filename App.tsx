
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
      {/* Header Corporativo */}
      <header className="w-full max-w-[1600px] mx-auto mb-10 border-l-4 border-slate-900 pl-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2 block">Enterprise Analytics Portal</span>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase">
              Dashboard de Monitoramento
            </h1>
            <p className="text-slate-400 mt-3 font-medium text-xs uppercase tracking-widest flex items-center gap-3">
              <span className="h-[1px] w-8 bg-slate-300"></span>
              Base Operacional Integrada
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'dados' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  placeholder="FILTRAR REGISTROS..."
                  className="h-11 w-full md:w-72 pl-10 pr-4 bg-white border border-slate-200 rounded-none text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-slate-900 transition-colors shadow-sm"
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            )}

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-11 px-6 bg-slate-900 text-white rounded-none text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center gap-3 shadow-md"
            >
              <svg className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {state.loading ? 'ATUALIZANDO' : 'SINCRONIZAR'}
            </button>
          </div>
        </div>

        {/* Navegação por Guias - Estilo Sóbrio */}
        <nav className="mt-12 flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'dados'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Base de Dados
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'dashboard'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-white'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Visão Dashboard
          </button>
        </nav>
      </header>

      {/* Área Principal */}
      <main className="w-full max-w-[1600px] mx-auto flex-grow">
        {activeTab === 'dados' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Total Amostral" value={filteredData.length} desc="Registros Ativos" />
              <MetricCard label="Segmentos" value={metrics.uniqueSectors} desc="Setores Mapeados" />
              <MetricCard label="Carga Nominal" value={metrics.totalWeight} desc="Peso Consolidado" />
              <MetricCard label="SLA Conformidade" value={`${metrics.positiveRate}%`} desc="Taxa de Aprovação" />
            </div>
            <DataTable data={filteredData} loading={state.loading} />
          </div>
        ) : (
          <DashboardView data={state.data} loading={state.loading} />
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="w-full max-w-[1600px] mx-auto mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-900"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SIA Engine v4.0.2</span>
          </div>
          <span className="h-4 w-[1px] bg-slate-200 hidden md:block"></span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Acesso Restrito • Logs Monitorados</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Copyright &copy; {new Date().getFullYear()} • Inteligência Administrativa
        </p>
      </footer>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; desc: string }> = ({ label, value, desc }) => {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-none shadow-sm hover:border-blue-200 transition-colors group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900 tracking-tighter">{value}</p>
      </div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 border-t border-slate-50 pt-3 group-hover:text-blue-500 transition-colors">{desc}</p>
    </div>
  );
};

export default App;
