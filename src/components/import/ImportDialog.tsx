import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePolizasImport } from "@/hooks/usePolizasImport";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../LoadingSpinner";
import { ValidationSummary } from "./ValidationSummary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PreviewTable } from "./PreviewTable";
import { ImportResult } from "@/types/import";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDialog = ({ isOpen, onClose }: ImportDialogProps) => {
  const {
    importState,
    fileType,
    setFileType,
    handleFileDrop,
    handleImport,
    reset,
    progress,
    previewData,
    validationErrors,
    systemError,
    importResult
  } = usePolizasImport();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: importState !== "idle" && importState !== 'error',
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const isProcessing = importState === 'uploading' || importState === 'validating' || importState === 'importing';
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Importar Pólizas y Recibos</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de archivo y arrástralo para iniciar la importación.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
          <RadioGroup
            defaultValue="polizas"
            onValueChange={(value) => setFileType(value as any)}
            className="flex gap-4"
            disabled={isProcessing}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="polizas" id="r-polizas" />
              <Label htmlFor="r-polizas">Archivo de Pólizas (Report)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recibos" id="r-recibos" />
              <Label htmlFor="r-recibos">Archivo de Recibos</Label>
            </div>
          </RadioGroup>

          {systemError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de Importación</AlertTitle>
              <AlertDescription>{systemError}</AlertDescription>
            </Alert>
          )}

          {(importState === 'idle' || importState === 'error') && (
             <div
                {...getRootProps()}
                className={cn(
                  "flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer",
                  isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <p className="text-gray-500 dark:text-gray-400">
                  Arrastra tu archivo CSV aquí o haz clic para seleccionar.
                </p>
              </div>
          )}
         
         {isProcessing && (
            <div className="flex flex-col items-center justify-center h-48">
              <LoadingSpinner />
              <p className="mt-2">{importState}...</p>
            </div>
          )}

          {importState === 'preview' && previewData && (
              <div>
                  { (previewData.length > 0) &&
                    <ValidationSummary 
                      totalRows={previewData.length}
                      errorCount={validationErrors.length}
                      errors={validationErrors}
                    />
                  }
                  <h3 className="font-semibold my-2">Previsualización de Datos</h3>
                  <PreviewTable data={previewData} errors={validationErrors} />
              </div>
          )}

          {importState === 'completed' && importResult && (
            <div className="flex flex-col items-center justify-center h-48">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Importación Completada</h2>
              <p>{importResult.successRows} de {importResult.totalRows} registros importados con éxito.</p>
              {importResult.errorRows > 0 && (
                <p className="text-red-500">{importResult.errorRows} registros tuvieron errores.</p>
              )}
            </div>
          )}

        </div>

        <DialogFooter>
          {importState !== 'completed' ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={importState !== 'preview'} isLoading={importState === 'importing'}>
                Importar {previewData ? previewData.length - new Set(validationErrors.map(e=>e.row)).size : 0} registros
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
