
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
  conformidade: number; // Porcentagem de "Sim"
}

type SortConfig = {
  key: keyof GroupedRow;
  direction: 'asc' | 'desc';
} | null;

const DataTable: React.FC<DataTableProps> = ({ data, loading }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

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
          conformidade: 0
        };
      }

      const g = groups[row.id];
      const pesoVal = parseFloat(row.peso.replace(',', '.')) || 0;
      const isConforme = row.resposta.toLowerCase().includes('sim');

      g.count += 1;
      g.mediaPeso += pesoVal;
      if (isConforme) g.conformidade += 1;
    });

    // Finaliza os cálculos de média
    return Object.values(groups).map(g => ({
      ...g,
      mediaPeso: g.mediaPeso / g.count,
      conformidade: (g.conformidade / g.count) * 100
    }));
  }, [data]);

  const headers: { label: string; key: keyof GroupedRow; width: string }[] = [
    { label: "Protocolo ID", key: "id", width: "10%" },
    { label: "Data/Hora", key: "timestamp", width: "15%" },
    { label: "Setor", key: "setor", width: "15%" },
    { label: "Função Responsável", key: "funcao", width: "15%" },
    { label: "Turno", key: "turno", width: "8%" },
    { label: "Qtd. Itens", key: "count", width: "10%" },
    { label: "Média Carga", key: "mediaPeso", width: "10%" },
    { label: "Conformidade GERAL", key: "conformidade", width: "17%" }
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

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1100px] table-fixed">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => requestSort(header.key)}
                  style={{ width: header.width }}
                  className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-colors"
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
                <td colSpan={8} className="px-6 py-32 text-center bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum protocolo identificado</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
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
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-tight ${
                          row.conformidade >= 80 ? 'text-emerald-600' : row.conformidade >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {row.conformidade.toFixed(1)}% Conformidade
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${
                            row.conformidade >= 80 ? 'bg-emerald-500' : row.conformidade >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${row.conformidade}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
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
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registros Totais (Itens): {data.length}</span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Escala de Performance:</span>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Alta (+80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Média (+50%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Crítica (-50%)</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
