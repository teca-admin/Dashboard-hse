
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

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
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
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const filteredData = useMemo(() => state.data, [state.data]);

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
    <div className="h-screen bg-white flex flex-col p-4 lg:px-8 lg:py-4 overflow-hidden">
      {/* Optimized Unified Executive Header */}
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

          {/* Unified KPI Metrics Section */}
          <div className="flex-1 flex justify-center gap-10">
            <HeaderMetric label="Amostragem" value={filteredData.length} sub="Registros" />
            <HeaderMetric label="Abrangência" value={metrics.uniqueSectors} sub="Unidades" />
            <HeaderMetric label="Impacto" value={metrics.totalWeight} sub="Carga Total" />
            <HeaderMetric label="Conformidade" value={`${metrics.positiveRate}%`} sub="Índice" highlight />
          </div>
          
          {/* Tab Navigation Controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Visão Analítica" />
            <NavBtn active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} label="Dataset" />
          </div>
        </div>
      </header>

      {/* Main Analytical Space - Larger due to header optimization */}
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
      <footer className="w-full max-w-[1700px] mx-auto mt-4 flex justify-between items-center shrink-0 px-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Safety Intelligence v3.5.2</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Atualização em Tempo Real Ativa</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold tracking-tight uppercase tracking-widest">
          SISTEMA DE SUPORTE À DECISÃO ESTRATÉGICA &copy; 2025
        </div>
      </footer>
    </div>
  );
};

const HeaderMetric: React.FC<{ label: string; value: string | number; sub: string; highlight?: boolean }> = ({ label, value, sub, highlight }) => (
  <div className="flex flex-col items-start min-w-[80px]">
    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-xl font-bold tracking-tighter tabular-nums ${highlight ? 'text-indigo-600' : 'text-slate-900'}`}>{value}</span>
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{sub}</span>
    </div>
  </div>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all ${
      active 
        ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' 
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

export default App;
