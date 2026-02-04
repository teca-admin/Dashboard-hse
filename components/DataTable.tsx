
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Agrupamento dos dados por ID
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

  const headers: { label: string; key: keyof GroupedRow | 'actions'; width: string }[] = [
    { label: "Protocolo ID", key: "id", width: "10%" },
    { label: "Data/Hora", key: "timestamp", width: "15%" },
    { label: "Setor", key: "setor", width: "15%" },
    { label: "Função Responsável", key: "funcao", width: "18%" },
    { label: "Turno", key: "turno", width: "10%" },
    { label: "Qtd. Itens", key: "count", width: "10%" },
    { label: "Média Carga", key: "mediaPeso", width: "12%" },
    { label: "Ações", key: "actions", width: "10%" }
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

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => header.key !== 'actions' && requestSort(header.key as keyof GroupedRow)}
                  style={{ width: header.width }}
                  className={`px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] transition-colors ${header.key !== 'actions' ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{header.label}</span>
                    {header.key !== 'actions' && (
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
                <React.Fragment key={row.id}>
                  <tr 
                    className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${expandedId === row.id ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => toggleExpand(row.id)}
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                          expandedId === row.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {expandedId === row.id ? 'Fechar' : 'Detalhe'}
                        <svg className={`w-3 h-3 transition-transform duration-300 ${expandedId === row.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  {expandedId === row.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="px-8 py-6">
                        <div className="bg-white border border-slate-200 rounded-lg shadow-inner overflow-hidden animate-in slide-in-from-top-2 duration-300">
                          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Itens do Protocolo #{row.id}</span>
                             <span className="text-[9px] font-bold text-slate-400">{row.rawRows.length} Itens Respondidos</span>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse table-fixed">
                              <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                  <th className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest w-[20%]">Domínio</th>
                                  <th className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest w-[55%]">Pergunta / Item</th>
                                  <th className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest w-[15%] text-center">Resposta</th>
                                  <th className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest w-[10%] text-center">Peso</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {row.rawRows.map((item, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2 text-[9px] font-bold text-slate-700 truncate">{item.dominios}</td>
                                    <td className="px-4 py-2 text-[9px] text-slate-500 leading-tight italic">{item.itens}</td>
                                    <td className="px-4 py-2 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${
                                        item.resposta.toLowerCase().includes('sim') 
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                                      }`}>
                                        {item.resposta}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-center text-[9px] font-mono font-bold text-slate-400">{item.peso}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer da Tabela Unificada */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocolos Unificados: {sortedData.length}</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registros Totais: {data.length}</span>
        </div>
        <div className="flex items-center gap-2">
           <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
           </svg>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Clique em "Detalhe" para auditar os itens individuais</span>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
