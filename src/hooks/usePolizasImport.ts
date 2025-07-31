import { useState, useCallback } from "react";
import {
  ImportState,
  ImportableEntityType,
  ValidationError,
  DuplicateInfo,
  ImportResult,
  ImportOptions,
  ImportError,
} from "@/types/import";
import { processCSVFile, validateFileStructure, validateRowData, detectDuplicates, importData } from "@/lib/import-utils";

const defaultOptions: ImportOptions = {
  skipDuplicates: false,
  updateExisting: false,
  validateOnly: false,
  batchSize: 100,
  dateFormat: 'DD/MM/YYYY',
  decimalSeparator: '.',
};

export const usePolizasImport = (options: Partial<ImportOptions> = {}) => {
  const importOptions = { ...defaultOptions, ...options };

  const [importState, setImportState] = useState<ImportState>('idle');
  const [fileType, setFileType] = useState<ImportableEntityType>('polizas');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [systemError, setSystemError] = useState<string | null>(null);

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportState('uploading');
    setProgress(0);
    setValidationErrors([]);
    setDuplicates([]);
    setImportResult(null);
    setSystemError(null);

    try {
      setImportState('uploading');
      const data = await processCSVFile<any>(selectedFile, fileType);
      
      setImportState('validating');
      const headers = Object.keys(data[0]);
      const structureValidation = validateFileStructure(headers, fileType);

      if (!structureValidation.isValid) {
        throw new Error(`Columnas faltantes: ${structureValidation.missing.join(", ")}`);
      }

      const allErrors: ValidationError[] = [];
      data.forEach((row, index) => {
        const rowErrors = validateRowData(row, index + 1);
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors);
        }
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
      }

      const duplicateErrors = detectDuplicates(data).map(d => ({...d, field: 'No poliza', value: d.poliza, message: d.message}));
      if (duplicateErrors.length > 0) {
        setDuplicates(duplicateErrors);
        setValidationErrors(prev => [...prev, ...duplicateErrors]);
      }
      
      setPreviewData(data);
      setImportState('preview');
      setProgress(100);

    } catch (error: any) {
      console.error(error);
      setSystemError(error.message || "Ocurrió un error inesperado.");
      setImportState('error');
    }
  }, [fileType, importOptions]);

  const handleImport = useCallback(async () => {
    if (!previewData) return;

    setImportState('importing');
    setProgress(0);
    
    try {
      const validRows = previewData.filter((row, index) => {
        return !validationErrors.find(error => error.row === index + 1);
      });

      if (validRows.length > 0) {
        const result = await importData(validRows, fileType);
        setImportResult(result);
      } else {
        setImportResult({
          totalRows: 0,
          successRows: 0,
          errorRows: 0,
          errors: [],
          duplicates: [],
        });
      }
      
      await new Promise(res => setTimeout(res, 1000));
      setImportState('completed');
      setProgress(100);
    } catch (error: any) {
        console.error(error)
        setSystemError(error.message || "Error durante la importación.")
        setImportState('error');
    }

  }, [previewData, importOptions, validationErrors, fileType]);

  const reset = () => {
    setImportState('idle');
    setFile(null);
    setPreviewData(null);
    setValidationErrors([]);
    setDuplicates([]);
    setImportResult(null);
    setProgress(0);
    setSystemError(null);
  };

  return {
    importState,
    fileType,
    setFileType,
    file,
    previewData,
    validationErrors,
    duplicates,
    importResult,
    progress,
    systemError,
    handleFileDrop,
    handleImport,
    reset,
  };
};
