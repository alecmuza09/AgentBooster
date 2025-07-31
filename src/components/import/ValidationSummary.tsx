import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ValidationError } from "@/types/import";

interface ValidationSummaryProps {
  totalRows: number;
  errorCount: number;
  errors: ValidationError[];
}

export const ValidationSummary = ({ totalRows, errorCount, errors }: ValidationSummaryProps) => {
  const successRows = totalRows - new Set(errors.map(e => e.row)).size;

  if (errorCount === 0) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-200">Validación Exitosa</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Se validaron {totalRows} registros y todos son correctos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validación completada con errores</AlertTitle>
      <AlertDescription>
        <p>
          Se encontraron {errorCount} errores en {new Set(errors.map(e => e.row)).size} de {totalRows} filas.
        </p>
        <p>
          <strong>Registros Válidos:</strong> {successRows} | <strong>Registros con Errores:</strong> {new Set(errors.map(e => e.row)).size}
        </p>
         <p className="mt-2 text-xs">
          Revise la tabla de previsualización para ver los errores resaltados.
        </p>
      </AlertDescription>
    </Alert>
  );
};
