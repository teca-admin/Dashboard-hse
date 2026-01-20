
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
        error: err.message || "Não foi possível conectar à base de dados." 
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
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col p-2 md:p-4 lg:p-6">
      {/* Top Banner - Header Section */}
      <header className="w-full mx-auto mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                Sistema de Monitoramento
              </h1>
              <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Painel Operacional • Dados Atualizados
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'dados' && (
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Pesquisar registros..."
                  className="h-11 w-full md:w-80 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-300"
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            <button 
              onClick={loadData}
              disabled={state.loading}
              className="h-11 px-5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <svg className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {state.loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200/60 w-fit">
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dados'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Dados Operacionais
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
        </div>
      </header>

      {/* Error Message */}
      {state.error && (
        <div className="w-full mx-auto mb-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-rose-700 animate-slide-up shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold">Falha na Conexão</p>
              <p className="text-xs opacity-80">{state.error}</p>
            </div>
            <button 
              onClick={loadData}
              className="ml-auto text-xs font-black uppercase tracking-widest bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full mx-auto flex-grow animate-fade-in transition-all">
        {activeTab === 'dados' ? (
          <>
            {/* Operational Metrics for the Data Tab */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
              <MetricCard label="Registros Totais" value={filteredData.length} icon="📊" color="blue" />
              <MetricCard label="Setores Ativos" value={metrics.uniqueSectors} icon="🏢" color="purple" />
              <MetricCard label="Carga de Peso" value={metrics.totalWeight} icon="⚖️" color="amber" />
              <MetricCard label="Conformidade" value={`${metrics.positiveRate}%`} icon="✅" color="emerald" />
            </div>
            <DataTable data={filteredData} loading={state.loading} />
          </>
        ) : (
          <DashboardView data={state.data} loading={state.loading} />
        )}
      </main>

      {/* Corporate Footer */}
      <footer className="w-full mx-auto mt-8 py-6 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Database Engine • v2.0 • Google Sheets Connected
          </p>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          Monitoramento Administrativo &copy; {new Date().getFullYear()} • Precisão Analítica Ubuntu
        </p>
      </footer>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({ label, value, icon, color }) => {
  const colorMap: any = {
    blue: 'border-blue-100 bg-blue-50/20 text-blue-700',
    purple: 'border-purple-100 bg-purple-50/20 text-purple-700',
    amber: 'border-amber-100 bg-amber-50/20 text-amber-700',
    emerald: 'border-emerald-100 bg-emerald-50/20 text-emerald-700',
  };

  return (
    <div className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colorMap[color] || 'bg-slate-50'}`}>
        {icon}
      </div>
    </div>
  );
};

export default App;
