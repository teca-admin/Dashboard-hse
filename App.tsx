
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      const data = await fetchSpreadsheetData();
      setState(prev => ({ ...prev, data, loading: false, error: null }));
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
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="h-screen bg-white flex flex-col p-4 lg:px-8 lg:py-4 overflow-hidden">
      {/* Optimized Unified Executive Header - Clean Version */}
      <header className="w-full max-w-[1700px] mx-auto mb-4 shrink-0 border-b border-slate-100 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-lg shadow-lg shadow-slate-200">
              <span className="text-white font-bold text-lg tracking-tighter">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.3em]">HSE Strategic Intelligence</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                Gestão de Segurança
              </h1>
            </div>
          </div>

          {/* Versão simplificada: Sem botões de navegação */}
          <div className="hidden lg:flex items-center gap-3">
             <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Painel Analítico Estratégico</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Analytical Space */}
      <main className="w-full max-w-[1700px] mx-auto flex-grow min-h-0 overflow-hidden">
        {state.error ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl max-w-lg text-center shadow-sm animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-2 uppercase tracking-wider">Falha na Sincronização</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                {state.error}
              </p>
              <button 
                onClick={() => loadData()}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <DashboardView data={state.data} loading={state.loading} />
          </div>
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="w-full max-w-[1700px] mx-auto mt-4 flex justify-between items-center shrink-0 px-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Safety Intelligence v3.5.2</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Atualização em Tempo Real Ativa</span>
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
