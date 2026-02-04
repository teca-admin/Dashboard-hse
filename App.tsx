
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DashboardView from './components/DashboardView';
import DataTable from './components/DataTable';
import { fetchSpreadsheetData } from './services/googleSheets';
import { SheetRow, AppState, GlobalFilters } from './types';

type ViewType = 'analytics' | 'details';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    loading: true,
    error: null,
    searchTerm: '',
    filters: {
      dominio: null,
      setor: null,
      turno: null,
      funcao: null
    }
  });

  const [activeView, setActiveView] = useState<ViewType>('analytics');
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground && state.data.length === 0) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      const data = await fetchSpreadsheetData();
      setState(prev => ({ 
        ...prev, 
        data, 
        loading: false, 
        error: null 
      }));
      retryCount.current = 0;
    } catch (err: any) {
      if (!isBackground && retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setTimeout(() => loadData(), 2000);
        return;
      }
      if (isBackground) return;
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message || "Falha técnica na comunicação com o servidor de dados." 
      }));
    }
  }, [state.data.length]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 45000);
    return () => clearInterval(interval);
  }, [loadData]);

  const setFilter = (key: keyof GlobalFilters, value: string | null) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: prev.filters[key] === value ? null : value
      }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: { dominio: null, setor: null, turno: null, funcao: null }
    }));
  };

  // Dados filtrados globais para consumo dos componentes
  const filteredData = useMemo(() => {
    return state.data.filter(row => {
      const matchDominio = !state.filters.dominio || row.dominios === state.filters.dominio;
      const matchSetor = !state.filters.setor || row.setor === state.filters.setor;
      const matchTurno = !state.filters.turno || row.turno.toUpperCase().includes(state.filters.turno.toUpperCase());
      const matchFuncao = !state.filters.funcao || row.funcao === state.filters.funcao;
      return matchDominio && matchSetor && matchTurno && matchFuncao;
    });
  }, [state.data, state.filters]);

  const hasActiveFilters = Object.values(state.filters).some(v => v !== null);

  return (
    <div className="h-screen bg-white flex flex-col p-4 lg:px-8 lg:py-4 overflow-hidden">
      <header className="w-full max-w-[1700px] mx-auto mb-2 shrink-0 border-b border-slate-100 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Brand & Title (Esquerda) */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-lg shadow-lg shadow-slate-200">
              <span className="text-white font-bold text-lg tracking-tighter">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.3em]">HSE Strategic Intelligence</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                  <span className={`w-1 h-1 bg-emerald-500 rounded-full ${state.loading ? 'animate-ping' : 'animate-pulse'}`}></span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">{state.loading ? 'Sincronizando' : 'Live'}</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Gestão de Segurança</h1>
            </div>
          </div>

          {/* Guias de Navegação (Agora na Direita) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Painel Analítico
            </button>
            <button 
              onClick={() => setActiveView('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Registros Detalhados
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="w-full max-w-[1700px] mx-auto mb-3 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Filtros Ativos:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(state.filters).map(([key, value]) => value && (
              <div key={key} className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full shadow-sm">
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">{key}:</span>
                <span className="text-[10px] font-bold">{value}</span>
                <button onClick={() => setFilter(key as keyof GlobalFilters, null)} className="ml-1 hover:text-indigo-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button 
              onClick={clearFilters}
              className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:underline px-2"
            >
              Limpar Tudo
            </button>
          </div>
        </div>
      )}

      <main className="w-full max-w-[1700px] mx-auto flex-grow min-h-0 overflow-hidden">
        {state.error && state.data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-white border border-slate-200 p-10 rounded-2xl max-w-lg text-center shadow-2xl">
              <h3 className="text-slate-900 font-extrabold text-xl mb-3 uppercase tracking-wider">Falha na Sincronização</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">{state.error}</p>
              <button onClick={() => loadData()} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em]">Tentar Novamente</button>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {activeView === 'analytics' ? (
              <DashboardView 
                data={state.data} 
                filters={state.filters} 
                onFilterChange={setFilter}
                loading={state.loading && state.data.length === 0} 
              />
            ) : (
              <div className="h-full pb-4">
                <DataTable data={filteredData} loading={state.loading && state.data.length === 0} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full max-w-[1700px] mx-auto mt-4 flex justify-between items-center shrink-0 px-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Safety Intelligence v3.5.4</span>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${state.loading ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              {state.loading ? 'Atualizando dados...' : 'Atualização em Tempo Real Ativa'}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold tracking-tight uppercase tracking-widest">
          SISTEMA DE SUPORTE À DECISÃO ESTRATÉGICA &copy; 2026
        </div>
      </footer>
    </div>
  );
};

export default App;
