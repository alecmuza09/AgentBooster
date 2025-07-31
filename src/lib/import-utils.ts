import Papa from "papaparse";
import { ImportableEntityType, PolizaImport, ReciboImport, ValidationError, DuplicateInfo, ImportResult } from "@/types/import";
import { importPolicies, importRecibos } from "@/data/policies";

const POLIZAS_REQUIRED_COLUMNS = ["No poliza", "Cliente id", "Cliente", "Aseguradora", "Ramo", "Fec vig de", "Fec vig a", "Prima", "Total", "Estatus mov"];
const RECIBOS_REQUIRED_COLUMNS = [...POLIZAS_REQUIRED_COLUMNS.filter(c => c !== 'Fec vig de' && c !== 'Fec vig a'), "Recibo", "Fec_vig_de", "Fec_vig_a"];

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
  const missing = requiredColumns.filter(col => !headers.includes(col));
  return {
    isValid: missing.length === 0,
    missing,
  };
};

const isValidDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(+year, +month - 1, +day);
    return date && (date.getMonth() + 1) === +month;
}

export const validateRowData = (row: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredChecks: { [key: string]: (val: any) => boolean } = {
        "No poliza": val => typeof val === 'string' && val.trim() !== '',
        "Cliente id": val => !isNaN(Number(val)) && Number(val) > 0,
        "Cliente": val => typeof val === 'string' && val.trim() !== '',
        "Aseguradora": val => typeof val === 'string' && val.trim() !== '',
        "Ramo": val => typeof val === 'string' && val.trim() !== '',
        "Fec vig de": val => isValidDate(val),
        "Fec vig a": val => isValidDate(val),
        "Prima": val => !isNaN(Number(val)) && Number(val) > 0,
        "Total": val => !isNaN(Number(val)) && Number(val) > 0,
        "Estatus mov": val => ['Vigente', 'Cancelada', 'Vencida'].includes(val),
    };

    for (const field of Object.keys(requiredChecks)) {
        if (!requiredChecks[field](row[field])) {
            errors.push({
                row: rowIndex,
                field,
                value: row[field],
                message: `Valor inválido para ${field}.`
            });
        }
    }
  
  return errors;
};

export const detectDuplicates = (data: any[], keyField: string = "No poliza"): DuplicateInfo[] => {
    const seen = new Map<string, number>();
    const duplicates: DuplicateInfo[] = [];

    data.forEach((row, index) => {
        const key = row[keyField];
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
