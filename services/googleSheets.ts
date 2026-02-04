
import { SheetRow } from '../types';

const SPREADSHEET_ID = '1qrBA6nc9ze_2PAI-Jjcnm5acNF--O-K4km6oIL6jXM4';
const SHEET_NAME = 'Dados Tratados';
const RANGE = 'I:T'; 

export async function fetchSpreadsheetData(): Promise<SheetRow[]> {
  /**
   * Resolvemos o erro 'API key not valid' migrando para o endpoint GViz.
   * Este endpoint permite leitura de planilhas compartilhadas (Anyone with the link can view)
   * sem a necessidade de uma API Key do Google Cloud vinculada ao serviço de Sheets,
   * o que evita conflitos com a chave process.env.API_KEY (geralmente destinada ao Gemini).
   */
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erro de conexão (${response.status}): Não foi possível acessar o servidor de documentos.`);
    }

    const text = await response.text();
    
    // O GViz retorna um formato JSONP-like que precisa de limpeza
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/);
    if (!match) {
      throw new Error("Formato de resposta inválido recebido da planilha.");
    }

    const json = JSON.parse(match[1]);
    
    if (json.status === 'error') {
      const errorMsg = json.errors?.[0]?.detailed_message || "Erro interno na consulta da planilha.";
      throw new Error(`Erro Google Sheets: ${errorMsg}`);
    }

    const table = json.table;
    if (!table || !table.rows) {
      return [];
    }

    /**
     * Mapeamento dos dados do GViz:
     * No GViz, cada linha tem uma propriedade 'c' que é um array de objetos de célula {v: valor, f: formatado}
     * Mapeamos as colunas I:T (0 a 11):
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
      const getVal = (idx: number) => (cells[idx] ? cells[idx].v : '');
      
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
        peso: String(getVal(11) || ''),
      };
    });
  } catch (error: any) {
    console.error("Erro na extração de dados (GViz):", error);
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Falha de rede ou CORS: Verifique se a planilha está compartilhada publicamente (Qualquer pessoa com o link pode visualizar).");
    }
    
    throw error;
  }
}
