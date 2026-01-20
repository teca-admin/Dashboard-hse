
import { SheetRow } from '../types';

const SPREADSHEET_ID = '1qrBA6nc9ze_2PAI-Jjcnm5acNF--O-K4km6oIL6jXM4';
const SHEET_NAME = 'Dados Tratados';
const RANGE = 'I:T'; 

export async function fetchSpreadsheetData(): Promise<SheetRow[]> {
  /**
   * Seguindo a solicitação direta para corrigir o erro de chave inválida,
   * utilizamos a chave de API fornecida para este recurso específico.
   */
  const apiKey = 'AIzaSyC447Ol31lWqCDman2ZW7vabfwRMdaYDYU';

  /**
   * A construção da URL requer codificação precisa do nome da aba e do intervalo.
   * Nomes com espaços devem estar entre aspas simples para a API do Sheets.
   */
  const fullRange = `'${SHEET_NAME}'!${RANGE}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(fullRange)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Sheets API Response Error:", errorData);
      throw new Error(errorData.error?.message || "Erro na autenticação ou busca de dados da planilha.");
    }

    const result = await response.json();
    const rows = result.values || [];

    if (rows.length === 0) return [];

    /**
     * Mapeamento rigoroso das colunas I até T (12 colunas):
     * 0:ID, 1:Timestamp, 2:Setor, 3:Função, 4:Turno, 5:Fase, 
     * 6:ItensNum (Excluído), 7:Domínios, 8:Itens, 9:Resposta, 10:PesoFiltro (Excluído), 11:Peso
     */
    return rows.slice(1).map((row: any[]) => ({
      id: row[0] || '',
      timestamp: row[1] || '',
      setor: row[2] || '',
      funcao: row[3] || '',
      turno: row[4] || '',
      fase: row[5] || '',
      dominios: row[7] || '',
      itens: row[8] || '',
      resposta: row[9] || '',
      peso: row[11] || '',
    }));
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw error;
  }
}
