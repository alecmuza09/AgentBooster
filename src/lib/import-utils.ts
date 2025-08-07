import Papa from "papaparse";
import { ImportableEntityType, PolizaImport, ReciboImport, ValidationError, DuplicateInfo, ImportResult } from "@/types/import";
import { importPolicies, importRecibos } from "@/data/policies";

// Requeridos mínimos para polizas; campos extra son opcionales si existen
const POLIZAS_REQUIRED_COLUMNS = [
  "No poliza",
  "Cliente id",
  "Cliente",
  "Aseguradora",
  "Ramo",
  // Requerimos al menos UNA pareja de vigencias (total o recibo). Se valida aparte
  // Fechas
  // Monto
  "Total",
  // Estado
  "Estatus mov",
];
// Para recibos pedimos además las vigencias específicas y número de recibo
const RECIBOS_REQUIRED_COLUMNS = [
  ...POLIZAS_REQUIRED_COLUMNS,
  "Recibo",
  "Fec_vig_de",
  "Fec_vig_a",
];

// Aliases por columna (aceptamos varias variantes de encabezado)
const HEADER_ALIASES: Record<string, string[]> = {
  "No poliza": ["No poliza", "No póliza", "Poliza", "Póliza", "No_poliza"],
  "Cliente id": ["Cliente id", "ClienteID", "Cliente Id", "Id Cliente"],
  "Cliente": ["Cliente", "Nombre Cliente", "Asegurado"],
  "Aseguradora": ["Aseguradora", "Compañía", "Compania"],
  "Ramo": ["Ramo", "SubRamo", "Sub Ramo"],
  "Inciso": ["Inciso"],
  "Concepto": ["Concepto", "Referencia"],
  "Modelo": ["Modelo"],
  "No. Serie": ["No. Serie", "No Serie", "Numero Serie", "Número de Serie", "Serie"],
  "Clave de Agente": ["Clave de Agente", "Cve agente", "Cve Agente", "Clave Agente"],
  "Fecha vigencia total de póliza de": ["Fecha vigencia total de póliza de", "Fec vig de"],
  "Fecha vigencia total de póliza a": ["Fecha vigencia total de póliza a", "Fec vig a"],
  "Fecha vigencia del recibo de": ["Fecha vigencia del recibo de", "Fec vig de", "Fec_vig_de"],
  "Fecha vigencia del recibo a": ["Fecha vigencia del recibo a", "Fec vig a", "Fec_vig_a"],
  "Prima Neta": ["Prima Neta", "Prima"],
  "Derecho": ["Derecho"],
  "Recargo": ["Recargo"],
  "Total": ["Total", "Total TC"],
  "Tipo de Cargo": ["Tipo de Cargo", "Tipo Cargo", "Tipo de Pago", "Forma Pago"],
  "Fecha de Registro": ["Fecha de Registro", "Fec Registro", "Fec Creación", "Fec Creacion"],
  "Recibo": ["Recibo"],
  "Fec_vig_de": ["Fec_vig_de", "Fec vig de"],
  "Fec_vig_a": ["Fec_vig_a", "Fec vig a"],
};

const normalize = (s: string): string => {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\._]/g, ' ')
    .replace(/\s+/g, ' ');
};

const findHeader = (headers: string[], alias: string): string | null => {
  const needle = normalize(alias);
  const found = headers.find(h => normalize(h) === needle);
  return found || null;
};

const hasAnyHeader = (headers: string[], canonical: string): boolean => {
  const aliases = HEADER_ALIASES[canonical] || [canonical];
  return aliases.some(a => !!findHeader(headers, a));
};

const getField = (row: any, canonical: string): any => {
  const aliases = HEADER_ALIASES[canonical] || [canonical];
  for (const a of aliases) {
    const key = Object.keys(row).find(k => normalize(k) === normalize(a));
    if (key && row[key] !== undefined) return row[key];
  }
  return undefined;
};

export const processCSVFile = <T>(file: File, fileType: ImportableEntityType): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error("Error parsing CSV file"));
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};

export const validateFileStructure = (headers: string[], tipo: ImportableEntityType): { isValid: boolean, missing: string[] } => {
  const requiredColumns = tipo === 'polizas' ? POLIZAS_REQUIRED_COLUMNS : RECIBOS_REQUIRED_COLUMNS;
  const missing: string[] = [];

  for (const col of requiredColumns) {
    if (!hasAnyHeader(headers, col)) missing.push(col);
  }

  // Para pólizas: validar que haya al menos una pareja de vigencias válida
  if (tipo === 'polizas') {
    const hasTotal = hasAnyHeader(headers, 'Fecha vigencia total de póliza de') && hasAnyHeader(headers, 'Fecha vigencia total de póliza a');
    const hasRecibo = hasAnyHeader(headers, 'Fecha vigencia del recibo de') && hasAnyHeader(headers, 'Fecha vigencia del recibo a');
    if (!hasTotal && !hasRecibo) {
      missing.push('Fec vig de', 'Fec vig a');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
};

const isValidDate = (dateStr: string) => {
    const s = String(dateStr || '').trim();
    if (!s) return false;
    // dd/mm/yyyy o dd-mm-yyyy
    let m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (m) {
        const d = +m[1], mo = +m[2], y = +(m[3].length === 2 ? `20${m[3]}` : m[3]);
        const date = new Date(y, mo - 1, d);
        return date && date.getFullYear() === y && (date.getMonth()+1) === mo && date.getDate() === d;
    }
    // yyyy-mm-dd o yyyy/mm/dd
    m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if (m) {
        const y = +m[1], mo = +m[2], d = +m[3];
        const date = new Date(y, mo - 1, d);
        return date && date.getFullYear() === y && (date.getMonth()+1) === mo && date.getDate() === d;
    }
    // formatos con hora al inicio tipo "25 13:59-04-10"
    m = s.match(/^(\d{2})\s+\d{1,2}:\d{2}[\-\/](\d{1,2})[\-\/](\d{1,2})$/);
    if (m) {
        const y = +(`20${m[1]}`), mo = +m[2], d = +m[3];
        const date = new Date(y, mo - 1, d);
        return date && date.getFullYear() === y && (date.getMonth()+1) === mo && date.getDate() === d;
    }
    return false;
}

export const validateRowData = (row: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredChecks: { [key: string]: (val: any) => boolean } = {
        "No poliza": val => typeof val === 'string' && val.trim() !== '',
        "Cliente id": val => String(val || '').trim() !== '',
        "Cliente": val => String(val || '').trim() !== '',
        "Aseguradora": val => String(val || '').trim() !== '',
        "Ramo": val => String(val || '').trim() !== '',
        // Fechas: validaremos que exista al menos una pareja válida más abajo
        "Total": val => !isNaN(Number(val)) && Number(val) > 0,
        "Estatus mov": val => ['Vigente', 'Cancelada', 'Vencida'].includes(val),
    };

    for (const field of Object.keys(requiredChecks)) {
        const value = getField(row, field);
        if (!requiredChecks[field](value)) {
            errors.push({
                row: rowIndex,
                field,
                value,
                message: `Valor inválido para ${field}.`
            });
        }
    }

    // Fechas: aceptar cualquier pareja válida
    const totalDe = getField(row, 'Fecha vigencia total de póliza de');
    const totalA = getField(row, 'Fecha vigencia total de póliza a');
    const reciboDe = getField(row, 'Fecha vigencia del recibo de');
    const reciboA = getField(row, 'Fecha vigencia del recibo a');
    const hasTotal = totalDe && totalA && isValidDate(totalDe) && isValidDate(totalA);
    const hasRecibo = reciboDe && reciboA && isValidDate(reciboDe) && isValidDate(reciboA);
    if (!hasTotal && !hasRecibo) {
      errors.push({ row: rowIndex, field: 'Vigencia', value: `${totalDe}/${totalA} | ${reciboDe}/${reciboA}`, message: 'Faltan fechas de vigencia válidas (total o recibo).'});
    }
  
  return errors;
};

export const detectDuplicates = (data: any[], keyField: string = "No poliza"): DuplicateInfo[] => {
    const seen = new Map<string, number>();
    const duplicates: DuplicateInfo[] = [];

    data.forEach((row, index) => {
        const key = getField(row, keyField);
        if (seen.has(key)) {
            const firstIndex = seen.get(key)!;
            // Mark first occurrence if not already marked
            if (firstIndex !== -1) {
                duplicates.push({
                    row: firstIndex,
                    poliza: key,
                    message: `Este es el primer registro de una póliza duplicada.`,
                });
                seen.set(key, -1); // Mark as reported
            }
             duplicates.push({
                row: index + 1,
                poliza: key,
                message: `Póliza duplicada. El primer registro está en la fila ${firstIndex}.`,
            });
        } else {
            seen.set(key, index + 1);
        }
    });

    return duplicates;
};

export const importData = async (validData: any[], type: ImportableEntityType): Promise<ImportResult> => {
    try {
        if (type === 'polizas') {
            await importPolicies(validData as PolizaImport[]);
        } else if (type === 'recibos') {
            await importRecibos(validData as ReciboImport[]);
        }
        
        return {
            totalRows: validData.length,
            successRows: validData.length,
            errorRows: 0,
            errors: [],
            duplicates: [],
        };
    } catch (error: any) {
        console.error("Error en importData:", error);
        // Podríamos devolver un error más específico aquí
        throw error;
    }
};
