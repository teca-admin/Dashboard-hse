
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
    { label: "Ref. ID", key: "id", width: "10%" },
    { label: "Data & Hora", key: "timestamp", width: "10%" },
    { label: "Setor", key: "setor", width: "10%" },
    { label: "Função", key: "funcao", width: "10%" },
    { label: "Turno", key: "turno", width: "10%" },
    { label: "Fase", key: "fase", width: "10%" },
    { label: "Domínios", key: "dominios", width: "10%" },
    { label: "Itens Desc.", key: "itens", width: "10%" },
    { label: "Status", key: "resposta", width: "10%" },
    { label: "Carga", key: "peso", width: "10%" }
  ];

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        
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
    <div className="w-full overflow-hidden bg-white border border-slate-200 shadow-xl">
      <div className="overflow-x-auto custom-scrollbar max-h-[65vh]">
        <table className="w-full text-center border-collapse min-w-[1100px] table-fixed align-middle">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900 border-b border-slate-800">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => requestSort(header.key)}
                  style={{ width: header.width }}
                  className="px-4 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-800 transition-colors text-center align-middle group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="group-hover:text-white transition-colors">{header.label}</span>
                    <span className="shrink-0 text-slate-600 group-hover:text-blue-500">
                      {sortConfig?.key === header.key ? (
                        sortConfig.direction === 'asc' ? '▲' : '▼'
                      ) : '◊'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-32 text-center align-middle bg-slate-50">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 flex items-center justify-center border border-slate-200">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Data Warehouse Vazio</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 group"
                >
                  <td className="px-4 py-4 text-[11px] font-bold text-slate-700 truncate align-middle text-center">{row.id}</td>
                  <td className="px-4 py-4 text-[10px] text-slate-500 font-medium truncate align-middle text-center">{row.timestamp}</td>
                  <td className="px-4 py-4 text-[11px] font-bold text-slate-800 truncate align-middle text-center uppercase tracking-tighter">{row.setor}</td>
                  <td className="px-4 py-4 text-[11px] text-slate-600 truncate align-middle text-center">{row.funcao}</td>
                  <td className="px-4 py-4 text-[11px] text-slate-600 align-middle text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-900 text-[10px] font-bold uppercase border border-slate-200">{row.turno}</span>
                  </td>
                  <td className="px-4 py-4 text-[11px] text-slate-500 truncate align-middle text-center uppercase">{row.fase}</td>
                  <td className="px-4 py-4 text-[11px] font-bold text-slate-900 truncate align-middle text-center tracking-tight">{row.dominios}</td>
                  <td className="px-4 py-4 text-[11px] text-slate-500 align-middle text-center" title={row.itens}>
                    <div className="truncate mx-auto max-w-[120px]">{row.itens}</div>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
                      row.resposta.toLowerCase() === 'sim' 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                        : row.resposta.toLowerCase() === 'não' 
                        ? 'text-rose-700 bg-rose-50 border border-rose-100' 
                        : 'text-slate-500 bg-slate-50 border border-slate-200'
                    }`}>
                      {row.resposta}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <span className="font-bold text-slate-900 text-[11px] bg-slate-50 px-2 py-1 border border-slate-100">
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
