
export interface SheetRow {
  id: string;
  timestamp: string;
  setor: string;
  funcao: string;
  turno: string;
  fase: string;
  dominios: string;
  itens: string;
  resposta: string;
  peso: string;
}

export type SortOrder = 'asc' | 'desc' | null;

export interface AppState {
  data: SheetRow[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}
