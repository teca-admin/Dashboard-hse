
import { SheetRow } from '../types';

const SPREADSHEET_ID = '1qrBA6nc9ze_2PAI-Jjcnm5acNF--O-K4km6oIL6jXM4';
const SHEET_NAME = 'Dados Tratados';
const RANGE = 'I:T'; 

/**
 * Função para extrair dados da planilha com maior resiliência.
 */
export async function fetchSpreadsheetData(): Promise<SheetRow[]> {
  // Adicionamos um timestamp (tcb) para evitar que o navegador ou o Google retornem dados em cache
  const cacheBuster = `&tcb=${Date.now()}`;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}${cacheBuster}`;

  try {
    const response = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      credentials: 'omit' 
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        throw new Error("Acesso Negado: A planilha não foi encontrada ou não está compartilhada publicamente.");
      }
      throw new Error(`Erro de rede: O servidor do Google retornou status ${response.status}.`);
    }

    const text = await response.text();
    
    // Extração robusta do JSON
    // O Google retorna: google.visualization.Query.setResponse({ ... });
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("Formato de resposta inválido: Não foi possível localizar o objeto de dados na resposta.");
    }

    const jsonStr = text.substring(startIdx, endIdx + 1);
    const json = JSON.parse(jsonStr);
    
    if (json.status === 'error') {
      const errorMsg = json.errors?.[0]?.detailed_message || json.errors?.[0]?.message || "Erro na consulta do Google Sheets.";
      throw new Error(`Google Sheets: ${errorMsg}`);
    }

    const table = json.table;
    if (!table || !table.rows) {
      console.warn("Tabela ou linhas não encontradas no JSON.");
      return [];
    }

    /**
     * Mapeamento dos dados do GViz (I:T):
     * index 0: ID (Col I)
     * index 1: Timestamp (Col J)
     * index 2: Setor (Col K)
     * index 3: Função (Col L)
     * index 4: Turno (Col M)
     * index 5: Fase (Col N)
     * index 7: Domínios (Col P)
     * index 8: Itens (Col Q)
     * index 9: Resposta (Col R)
     * index 11: Peso (Col T)
     */
    return table.rows.map((row: any) => {
      const cells = row.c;
      const getVal = (idx: number) => {
        if (!cells || !cells[idx]) return '';
        const cell = cells[idx];
        return cell.v !== null && cell.v !== undefined ? cell.v : (cell.f || '');
      };
      
      return {
        id: String(getVal(0)),
        timestamp: String(getVal(1)),
        setor: String(getVal(2)),
        funcao: String(getVal(3)),
        turno: String(getVal(4)),
        fase: String(getVal(5)),
        dominios: String(getVal(7)),
        itens: String(getVal(8)),
        resposta: String(getVal(9)),
        peso: String(getVal(11) || '0'),
      };
    }).filter((row: SheetRow) => row.id && row.id !== 'ID'); // Filtra cabeçalhos se existirem
    
  } catch (error: any) {
    console.error("Erro de Sincronização:", error);
    
    // Tratamento de erros de conexão/CORS
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error("Falha de Conexão: Não foi possível contactar o servidor. Verifique sua internet ou se o link da planilha é público.");
    }
    
    throw error;
  }
}
