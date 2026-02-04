
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
    { label: "Ocorrência", key: "timestamp", width: "12%" },
    { label: "Unidade/Setor", key: "setor", width: "12%" },
    { label: "Função Responsável", key: "funcao", width: "12%" },
    { label: "Turno", key: "turno", width: "8%" },
    { label: "Fase Processo", key: "fase", width: "10%" },
    { label: "Domínio", key: "dominios", width: "10%" },
    { label: "Descrição Item", key: "itens", width: "10%" },
    { label: "Conformidade", key: "resposta", width: "10%" },
    { label: "Carga", key: "peso", width: "6%" }
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
    <div className="w-full h-full flex flex-col bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => requestSort(header.key)}
                  style={{ width: header.width }}
                  className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]"
                >
                  <div className="flex items-center gap-2">
                    <span>{header.label}</span>
                    <span className="shrink-0 text-slate-300">
                      {sortConfig?.key === header.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-32 text-center bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 00-2-2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum registro encontrado</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="border-transparent border-l-4"
                >
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-900 tabular-nums font-mono">{row.id}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-500 font-medium">{row.timestamp}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-800 uppercase tracking-tight">{row.setor}</td>
                  <td className="px-6 py-4 text-[10.5px] text-slate-600 truncate leading-tight">{row.funcao}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-md border border-slate-200">{row.turno}</span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500 font-semibold uppercase tracking-tight">{row.fase}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-900 truncate">{row.dominios}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-500" title={row.itens}>
                    <div className="truncate max-w-[150px]">{row.itens}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      row.resposta.toLowerCase() === 'sim' 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                        : row.resposta.toLowerCase() === 'não' 
                        ? 'text-rose-700 bg-rose-50 border border-rose-100' 
                        : 'text-slate-500 bg-slate-50 border border-slate-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${row.resposta.toLowerCase() === 'sim' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {row.resposta}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-900 text-[11px] tabular-nums font-mono">
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
