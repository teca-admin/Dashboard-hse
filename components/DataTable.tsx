
import React, { useState, useMemo } from 'react';
import { SheetRow } from '../types';
import { SkeletonRow } from './SkeletonRow';

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

  // Agrupamento dos dados por ID para consolidar os 4690 registros originais
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

  const headers: { label: string; key: keyof GroupedRow | 'detail'; width: string }[] = [
    { label: "Protocolo ID", key: "id", width: "10%" },
    { label: "Data/Hora", key: "timestamp", width: "15%" },
    { label: "Setor", key: "setor", width: "15%" },
    { label: "Função Responsável", key: "funcao", width: "20%" },
    { label: "Turno", key: "turno", width: "10%" },
    { label: "Itens", key: "count", width: "10%" },
    { label: "Média Carga", key: "mediaPeso", width: "10%" },
    { label: "Detalhe", key: "detail", width: "10%" }
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
    setSelectedRow(row);
  };

  const closeReport = () => {
    setSelectedRow(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in duration-500 relative">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => header.key !== 'detail' && requestSort(header.key as keyof GroupedRow)}
                  style={{ width: header.width }}
                  className={`px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] transition-colors ${header.key !== 'detail' ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{header.label}</span>
                    {header.key !== 'detail' && (
                      <span className="shrink-0 text-slate-300">
                        {sortConfig?.key === header.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          <svg className="w-2.5 h-2.5 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 12l5 5 5-5H5zM5 8l5-5 5 5H5z" />
                          </svg>
                        )}
                      </span>
                    )}
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
                <td colSpan={8} className="px-6 py-32 text-center bg-slate-50/20">
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
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openReport(row); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white hover:shadow-lg active:scale-95"
                    >
                      Detalhe
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
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
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Utilize o botão DETALHE para auditoria individual de itens</span>
        </div>
      </div>

      {/* MODAL DE RELATÓRIO FULL-SCREEN E COMPACTO */}
      {selectedRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 lg:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeReport}></div>
          
          {/* Modal Content - Full Size */}
          <div className="relative bg-white w-full max-w-[96vw] h-[94vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header Compacto */}
            <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Relatório Executivo HSE</span>
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-extrabold rounded uppercase border border-indigo-100">Protocolo #{selectedRow.id}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Auditoria Detalhada de Itens</h2>
                </div>
              </div>
              
              <button 
                onClick={closeReport}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Resumo do Protocolo Compacto */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-5 gap-4 shrink-0">
               <div>
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Data/Hora</span>
                 <p className="text-[10px] font-bold text-slate-800">{selectedRow.timestamp}</p>
               </div>
               <div>
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Setor</span>
                 <p className="text-[10px] font-bold text-slate-800 truncate">{selectedRow.setor}</p>
               </div>
               <div>
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Responsável</span>
                 <p className="text-[10px] font-bold text-slate-800 truncate">{selectedRow.funcao}</p>
               </div>
               <div>
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Turno</span>
                 <p className="text-[10px] font-bold text-slate-800">{selectedRow.turno}</p>
               </div>
               <div className="text-right">
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Média de Carga</span>
                 <p className="text-xs font-extrabold text-indigo-600">{selectedRow.mediaPeso.toFixed(2)} pts</p>
               </div>
            </div>

            {/* Modal Body - Tabela de Itens Ultra-Compacta */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest w-[18%]">Domínio</th>
                    <th className="px-6 py-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest w-[60%]">Descrição do Item Respondido</th>
                    <th className="px-6 py-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest w-[14%] text-center">Resposta</th>
                    <th className="px-6 py-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest w-[8%] text-center">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedRow.rawRows.map((item, i) => (
                    <tr key={i} className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-6 py-1.5">
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded uppercase tracking-tighter line-clamp-1 border border-slate-200/50">
                          {item.dominios}
                        </span>
                      </td>
                      <td className="px-6 py-1.5">
                        <p className="text-[10px] text-slate-700 leading-tight italic font-medium">{item.itens}</p>
                      </td>
                      <td className="px-6 py-1.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight border ${
                          item.resposta.toLowerCase().includes('sim') || item.resposta.toLowerCase().includes('frequentemente')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${item.resposta.toLowerCase().includes('sim') || item.resposta.toLowerCase().includes('frequentemente') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {item.resposta}
                        </span>
                      </td>
                      <td className="px-6 py-1.5 text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 tabular-nums">{item.peso}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer Compacto */}
            <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Protocolo Consolidado</span>
                    <div className="h-3 w-[1px] bg-slate-200"></div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total de Itens: {selectedRow.rawRows.length}</span>
                  </div>
               </div>
               <button 
                onClick={closeReport}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-md active:scale-95"
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
