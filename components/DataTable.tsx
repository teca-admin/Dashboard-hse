
import React, { useState, useMemo } from 'react';
import { SheetRow } from '../types';
import { SkeletonRow } from './SkeletonRow';

interface DataTableProps {
  data: SheetRow[];
  loading: boolean;
}

type SortConfig = {
  key: keyof SheetRow;
  direction: 'asc' | 'desc';
} | null;

const DataTable: React.FC<DataTableProps> = ({ data, loading }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const headers: { label: string; key: keyof SheetRow; width: string }[] = [
    { label: "ID", key: "id", width: "10%" },
    { label: "Carimbo de data/hora", key: "timestamp", width: "10%" },
    { label: "Setor", key: "setor", width: "10%" },
    { label: "Função", key: "funcao", width: "10%" },
    { label: "Turno", key: "turno", width: "10%" },
    { label: "Fase", key: "fase", width: "10%" },
    { label: "Dominíos", key: "dominios", width: "10%" },
    { label: "Itens", key: "itens", width: "10%" },
    { label: "Resposta", key: "resposta", width: "10%" },
    { label: "Peso", key: "peso", width: "10%" }
  ];

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        
        // Handle numeric values for peso
        const isNumeric = sortConfig.key === 'peso';
        if (isNumeric) {
          const numA = parseFloat(valA.toString().replace(',', '.')) || 0;
          const numB = parseFloat(valB.toString().replace(',', '.')) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: keyof SheetRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
      <div className="overflow-x-auto custom-scrollbar max-h-[75vh]">
        <table className="w-full text-center border-collapse min-w-[1200px] table-fixed align-middle">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => requestSort(header.key)}
                  style={{ width: header.width }}
                  className="px-4 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group text-center align-middle"
                >
                  <div className="flex items-center justify-center gap-2 overflow-hidden">
                    <span className="truncate">{header.label}</span>
                    <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortConfig?.key === header.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '⇅'}
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
                <td colSpan={10} className="px-6 py-20 text-center align-middle">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-500 font-medium">Nenhum registro encontrado com estes critérios.</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-blue-50/30 transition-colors duration-150 group"
                >
                  <td className="px-4 py-4 text-xs font-semibold text-slate-700 truncate align-middle text-center">{row.id}</td>
                  <td className="px-4 py-4 text-xs text-slate-500 font-mono whitespace-nowrap truncate align-middle text-center">{row.timestamp}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-800 truncate align-middle text-center">{row.setor}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 italic truncate align-middle text-center">{row.funcao}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 align-middle text-center">
                    <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 inline-block w-full max-w-[80px] truncate">{row.turno}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 truncate align-middle text-center">{row.fase}</td>
                  <td className="px-4 py-4 text-xs font-medium text-blue-600 truncate align-middle text-center">{row.dominios}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 align-middle text-center" title={row.itens}>
                    <div className="truncate mx-auto">{row.itens}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-center align-middle">
                    <span className={`inline-flex items-center justify-center w-full max-w-[80px] py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      row.resposta.toLowerCase() === 'sim' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : row.resposta.toLowerCase() === 'não' 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {row.resposta}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-center align-middle">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg inline-block w-full max-w-[60px] truncate">
                      {row.peso}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
