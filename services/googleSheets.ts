
import { SheetRow } from '../types';

const SPREADSHEET_ID = '1qrBA6nc9ze_2PAI-Jjcnm5acNF--O-K4km6oIL6jXM4';
const SHEET_NAME = 'Dados Tratados';
const RANGE = 'I:T'; 

export async function fetchSpreadsheetData(): Promise<SheetRow[]> {
  /**
   * Utilizamos o endpoint GViz para extração de dados.
   * Para evitar erros de "Failed to fetch" (CORS/Network):
   * 1. A planilha DEVE estar configurada como "Qualquer pessoa com o link pode ler".
   * 2. Removemos headers customizados para manter a requisição como "Simple Request", evitando preflight do CORS.
   */
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

  try {
    // Requisição simplificada sem cabeçalhos customizados para maximizar compatibilidade CORS
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Servidor retornou status ${response.status}. Verifique se a planilha é pública.`);
    }

    const text = await response.text();
    
    // O GViz retorna um formato JSONP que começa com google.visualization.Query.setResponse(...)
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/);
    if (!match) {
      throw new Error("Formato de resposta inesperado da planilha. Verifique as permissões de acesso.");
    }

    const json = JSON.parse(match[1]);
    
    if (json.status === 'error') {
      const errorMsg = json.errors?.[0]?.detailed_message || "Erro na consulta dos dados.";
      throw new Error(`Google Sheets: ${errorMsg}`);
    }

    const table = json.table;
    if (!table || !table.rows) {
      return [];
    }

    /**
     * Mapeamento dos dados do GViz:
     * Colunas I:T (Mapeadas como índices 0 a 11 na consulta)
     * index 0: ID
     * index 1: Timestamp
     * index 2: Setor
     * index 3: Função
     * index 4: Turno
     * index 5: Fase
     * index 7: Domínios
     * index 8: Itens
     * index 9: Resposta
     * index 11: Peso
     */
    return table.rows.slice(1).map((row: any) => {
      const cells = row.c;
      const getVal = (idx: number) => (cells[idx] && cells[idx].v !== null ? cells[idx].v : '');
      
      return {
        id: String(getVal(0) || ''),
        timestamp: String(getVal(1) || ''),
        setor: String(getVal(2) || ''),
        funcao: String(getVal(3) || ''),
        turno: String(getVal(4) || ''),
        fase: String(getVal(5) || ''),
        dominios: String(getVal(7) || ''),
        itens: String(getVal(8) || ''),
        resposta: String(getVal(9) || ''),
        peso: String(getVal(11) || '0'),
      };
    });
  } catch (error: any) {
    console.error("Erro Crítico no Fetch:", error);
    
    // Tratamento específico para o erro comum de CORS ou falta de compartilhamento público
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error("Acesso Negado: Certifique-se de que a planilha está compartilhada com 'Qualquer pessoa com o link pode ver'.");
    }
    
    throw error;
  }
}
