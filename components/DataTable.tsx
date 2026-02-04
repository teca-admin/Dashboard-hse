
import React, { useState, useMemo, useEffect } from 'react';
import { SheetRow } from '../types.ts';
import { SkeletonRow } from './SkeletonRow.tsx';

interface DataTableProps {
  data: SheetRow[];
  loading: boolean;
}

interface GroupedRow {
  id: string;
  timestamp: string;
  setor: string;
  funcao: string;
  turno: string;
  fase: string;
  count: number;
  mediaPeso: number;
  rawRows: SheetRow[];
}

type SortConfig = {
  key: keyof GroupedRow;
  direction: 'asc' | 'desc';
} | null;

const DataTable: React.FC<DataTableProps> = ({ data, loading }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedRow, setSelectedRow] = useState<GroupedRow | null>(null);
  
  // Estado para o filtro interno do modal
  const [modalFilterDominio, setModalFilterDominio] = useState<string | null>(null);

  // Agrupamento dos dados por ID para consolidar os registros originais
  const groupedData = useMemo(() => {
    const groups: Record<string, GroupedRow> = {};

    data.forEach(row => {
      if (!groups[row.id]) {
        groups[row.id] = {
          id: row.id,
          timestamp: row.timestamp,
          setor: row.setor,
          funcao: row.funcao,
          turno: row.turno,
          fase: row.fase,
          count: 0,
          mediaPeso: 0,
          rawRows: []
        };
      }

      const g = groups[row.id];
      const pesoVal = parseFloat(row.peso.replace(',', '.')) || 0;
      
      g.count += 1;
      g.mediaPeso += pesoVal;
      g.rawRows.push(row);
    });

    return Object.values(groups).map(g => ({
      ...g,
      mediaPeso: g.mediaPeso / g.count
    }));
  }, [data]);

  const headers: { label: string; key: keyof GroupedRow; width: string }[] = [
    { label: "Protocolo ID", key: "id", width: "10%" },
    { label: "Data/Hora", key: "timestamp", width: "15%" },
    { label: "Setor", key: "setor", width: "15%" },
    { label: "Função Responsável", key: "funcao", width: "30%" },
    { label: "Turno", key: "turno", width: "10%" },
    { label: "Itens", key: "count", width: "10%" },
    { label: "Média Carga", key: "mediaPeso", width: "10%" }
  ];

  const sortedData = useMemo(() => {
    let sortableData = [...groupedData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [groupedData, sortConfig]);

  const requestSort = (key: keyof GroupedRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const openReport = (row: GroupedRow) => {
    setModalFilterDominio(null); // Resetar filtro ao abrir novo
    setSelectedRow(row);
  };

  const closeReport = () => {
    setSelectedRow(null);
  };

  // Lógica de filtragem interna do modal
  const modalItemsFiltered = useMemo(() => {
    if (!selectedRow) return [];
    if (!modalFilterDominio) return selectedRow.rawRows;
    return selectedRow.rawRows.filter(r => r.dominios === modalFilterDominio);
  }, [selectedRow, modalFilterDominio]);

  // Cálculo da Média de Carga Filtrada para o Modal
  const modalFilteredAverage = useMemo(() => {
    if (modalItemsFiltered.length === 0) return 0;
    const sum = modalItemsFiltered.reduce((acc, curr) => {
      const val = parseFloat(curr.peso.replace(',', '.')) || 0;
      return acc + val;
    }, 0);
    return sum / modalItemsFiltered.length;
  }, [modalItemsFiltered]);

  // Extrair domínios únicos do protocolo selecionado para o filtro do modal
  const uniqueDominiosInModal = useMemo(() => {
    if (!selectedRow) return [];
    const dominios = new Set<string>();
    selectedRow.rawRows.forEach(r => dominios.add(r.dominios));
    return Array.from(dominios).sort();
  }, [selectedRow]);

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in duration-500 relative">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => requestSort(header.key)}
                  style={{ width: header.width }}
                  className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] transition-colors cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span>{header.label}</span>
                    <span className="shrink-0 text-slate-300">
                      {sortConfig?.key === header.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : (
                        <svg className="w-2.5 h-2.5 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 12l5 5 5-5H5zM5 8l5-5 5 5H5z" />
                        </svg>
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-32 text-center bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum protocolo identificado</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => openReport(row)}
                >
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-900 tabular-nums font-mono border-l-2 border-transparent group-hover:border-indigo-500">{row.id}</td>
                  <td className="px-6 py-4 text-[9px] text-slate-500 font-medium">{row.timestamp}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-800 uppercase tracking-tight truncate" title={row.setor}>{row.setor}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-600 truncate" title={row.funcao}>{row.funcao}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-bold uppercase rounded border border-slate-200">{row.turno}</span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{row.count} itens</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-indigo-600 tabular-nums">
                    {row.mediaPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer da Tabela Principal */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocolos: {sortedData.length}</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Itens Auditados: {data.length}</span>
        </div>
        <div className="flex items-center gap-2">
           <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Clique em qualquer linha para auditoria individual</span>
        </div>
      </div>

      {/* MODAL DE RELATÓRIO FULL-SCREEN E ULTRA-COMPACTO */}
      {selectedRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-2 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeReport}></div>
          
          {/* Modal Content - Full Size Optimized */}
          <div className="relative bg-white w-full max-w-[98vw] h-[96vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header Profissional */}
            <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.3em]">Relatório de Auditoria HSE</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold rounded uppercase border border-indigo-100">Protocolo #{selectedRow.id}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Visão Detalhada de Itens</h2>
                </div>
              </div>
              
              <button 
                onClick={closeReport}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Sub-Header (Grid de Resumo + Filtro de Domínio Interno) */}
            <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 gap-8">
               <div className="flex flex-1 gap-10">
                 <div>
                   <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Data da Ocorrência</span>
                   <p className="text-xs font-bold text-slate-800">{selectedRow.timestamp}</p>
                 </div>
                 <div>
                   <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Unidade / Setor</span>
                   <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{selectedRow.setor}</p>
                 </div>
                 <div>
                   <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Turno</span>
                   <p className="text-xs font-bold text-slate-800">{selectedRow.turno}</p>
                 </div>
                 <div className="text-left border-l border-slate-100 pl-10">
                   <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Média de Carga {modalFilterDominio ? '(Filtrada)' : ''}</span>
                   <p className="text-sm font-extrabold text-indigo-600 tabular-nums">
                     {modalFilteredAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                   </p>
                 </div>
               </div>

               {/* SELETOR DE FILTRO DE DOMÍNIO INTERNO */}
               <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Filtrar Domínio:</span>
                  </div>
                  <select 
                    value={modalFilterDominio || ''}
                    onChange={(e) => setModalFilterDominio(e.target.value || null)}
                    className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer min-w-[200px]"
                  >
                    <option value="">TODOS OS DOMÍNIOS ({uniqueDominiosInModal.length})</option>
                    {uniqueDominiosInModal.map(dom => (
                      <option key={dom} value={dom}>{dom.toUpperCase()}</option>
                    ))}
                  </select>
                  {modalFilterDominio && (
                    <button 
                      onClick={() => setModalFilterDominio(null)}
                      className="p-1.5 hover:bg-white hover:text-rose-500 text-slate-400 rounded-lg transition-all"
                      title="Limpar filtro"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
               </div>
            </div>

            {/* Modal Body - Tabela de Itens Ultra-Compacta */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] w-[18%]">Domínio</th>
                    <th className="px-8 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] w-[58%]">Descrição do Item Respondido</th>
                    <th className="px-8 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] w-[14%] text-center">Resposta</th>
                    <th className="px-8 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] w-[10%] text-center">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modalItemsFiltered.length > 0 ? modalItemsFiltered.map((item, i) => (
                    <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-8 py-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter line-clamp-1 ${modalFilterDominio ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {item.dominios}
                        </span>
                      </td>
                      <td className="px-8 py-1.5">
                        <p className="text-[11px] text-slate-600 leading-none italic font-medium">{item.itens}</p>
                      </td>
                      <td className="px-8 py-1.5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {item.resposta}
                        </span>
                      </td>
                      <td className="px-8 py-1.5 text-center">
                        <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">{item.peso}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                           </svg>
                           <span className="text-[10px] font-bold uppercase tracking-widest">Nenhum item encontrado para este domínio</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer Otimizado */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Itens Totais: {selectedRow.rawRows.length}</span>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Exibindo: {modalItemsFiltered.length}</span>
                    {modalFilterDominio && (
                      <span className="text-[9px] font-medium text-slate-400 italic"> - Filtrado por "{modalFilterDominio}"</span>
                    )}
                  </div>
               </div>
               <button 
                onClick={closeReport}
                className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
               >
                 Fechar Relatório
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
