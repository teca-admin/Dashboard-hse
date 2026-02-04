
import { SheetRow } from '../types';

const SPREADSHEET_ID = '1qrBA6nc9ze_2PAI-Jjcnm5acNF--O-K4km6oIL6jXM4';
const SHEET_NAME = 'Dados Tratados';
const RANGE = 'I:T'; 

/**
 * Converte a string de data do Google "Date(2025,9,4,17,31,47)" para "DD/MM/AAAA HH:MM"
 * Nota: No formato do Google, o mês é indexado em zero (0-11).
 */
function formatGoogleDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('Date')) return dateStr;

  try {
    const match = dateStr.match(/\d+/g);
    if (!match || match.length < 3) return dateStr;

    const year = match[0];
    const month = (parseInt(match[1]) + 1).toString().padStart(2, '0');
    const day = match[2].padStart(2, '0');
    const hours = (match[3] || '00').padStart(2, '0');
    const minutes = (match[4] || '00').padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Função para extrair dados da planilha com resiliência industrial.
 */
export async function fetchSpreadsheetData(): Promise<SheetRow[]> {
  const cacheBuster = `&tcb=${Date.now()}`;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}${cacheBuster}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Servidor Google indisponível (Status ${response.status}).`);
    }

    const text = await response.text();
    
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
    
    let jsonStr = "";
    if (!jsonMatch || !jsonMatch[1]) {
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error("Estrutura de dados corrompida na resposta.");
      jsonStr = text.substring(startIdx, endIdx + 1);
    } else {
      jsonStr = jsonMatch[1];
    }

    const json = JSON.parse(jsonStr);
    
    if (json.status === 'error') {
      throw new Error(`Google Sheets: ${json.errors?.[0]?.detailed_message || "Acesso negado à planilha."}`);
    }

    const table = json.table;
    if (!table || !table.rows) return [];

    return table.rows.map((row: any) => {
      const cells = row.c;
      const getVal = (idx: number) => {
        if (!cells || cells.length <= idx || !cells[idx]) return '';
        const cell = cells[idx];
        // Preferimos o valor formatado 'f' se disponível, caso contrário usamos o bruto 'v'
        return cell.f || (cell.v !== null && cell.v !== undefined ? String(cell.v) : '');
      };
      
      const rawTimestamp = getVal(1);
      
      return {
        id: getVal(0),
        timestamp: formatGoogleDate(rawTimestamp),
        setor: getVal(2),
        funcao: getVal(3),
        turno: getVal(4),
        fase: getVal(5),
        dominios: getVal(7),
        itens: getVal(8),
        resposta: getVal(9),
        peso: getVal(11) || '0',
      };
    }).filter((row: SheetRow) => row.id && row.id.trim() !== '' && row.id !== 'ID');
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Critical Sync Error:", error.name, error.message);
    
    if (error.name === 'AbortError') {
      throw new Error("Tempo Limite Excedido: A conexão com o Google Sheets está muito lenta.");
    }
    
    throw error;
  }
}
