import React, { useState, useCallback } from 'react';
import { Modal } from './Modal'; // Asumiendo que el componente Modal base existe
import { Policy } from '../pages/Policies'; // Importar tipo Policy
import { UploadCloud, File, X, Loader, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy: Policy; // Póliza a la que se asocian los documentos
}

interface UploadedFile {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, policy }) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            addFiles(Array.from(event.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const filesToAdd: UploadedFile[] = newFiles.map(file => ({
             file,
             id: `${file.name}-${file.lastModified}`,
             status: 'pending'
        }));
        // Evitar duplicados básicos por id
        setFiles(prevFiles => {
            const existingIds = new Set(prevFiles.map(f => f.id));
            return [...prevFiles, ...filesToAdd.filter(f => !existingIds.has(f.id))];
        });
    };

    const removeFile = (idToRemove: string) => {
        setFiles(prevFiles => prevFiles.filter(f => f.id !== idToRemove));
    };

    // --- Handlers Drag & Drop ---
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            addFiles(Array.from(event.dataTransfer.files));
            event.dataTransfer.clearData();
        }
    }, []);

    // --- Simulación de Carga --- 
    const handleUpload = () => {
        if (files.filter(f => f.status === 'pending').length === 0) return;

        // Marcar archivos como 'uploading'
        setFiles(prevFiles => prevFiles.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

        // Simular la carga con un timeout
        setTimeout(() => {
            setFiles(prevFiles => prevFiles.map(f => {
                if (f.status === 'uploading') {
                    // Simular éxito/error aleatorio
                    const success = Math.random() > 0.3; 
                    return {
                        ...f,
                        status: success ? 'success' : 'error',
                        errorMessage: success ? undefined : 'Error simulado en la carga.'
                    };
                }
                return f;
            }));
        }, 1500); // Simular 1.5 segundos de carga
    };

    const allPendingUploaded = files.every(f => f.status === 'success' || f.status === 'error');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Subir Documentos para Póliza ${policy.policyNumber}`}>
            <div className="space-y-4">
                {/* Zona de Drag & Drop */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={clsx(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragging 
                            ? 'border-primary bg-primary-50 dark:border-primary-dark dark:bg-gray-700' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                    )}
                 >
                     <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="file-upload-input"
                     />
                    <label htmlFor="file-upload-input" className="cursor-pointer">
                        <UploadCloud className={`w-12 h-12 mx-auto ${isDragging ? 'text-primary dark:text-primary-dark' : 'text-gray-400 dark:text-gray-500'}`} />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Archivos soportados: PDF, JPG, PNG, DOCX (max 10MB)</p>
                    </label>
                 </div>

                {/* Lista de Archivos a Subir */} 
                {files.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto border dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Archivos a subir ({files.length}):</h4>
                        {files.map(uploadedFile => (
                            <div key={uploadedFile.id} className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50 text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <File className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="truncate text-gray-800 dark:text-gray-200" title={uploadedFile.file.name}>{uploadedFile.file.name}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     {uploadedFile.status === 'pending' && (
                                         <button onClick={() => removeFile(uploadedFile.id)} className="text-gray-400 hover:text-red-500 p-0.5" title="Eliminar">
                                            <X className="w-4 h-4" />
                                         </button>
                                    )}
                                     {uploadedFile.status === 'uploading' && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
                                     {uploadedFile.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                     {uploadedFile.status === 'error' && (
                                        <span title={uploadedFile.errorMessage}> 
                                             <XCircle className="w-4 h-4 text-red-500" />
                                         </span>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Información de Asociación (solo lectura aquí) */} 
                <div className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                    <p><strong>Cliente Asociado:</strong> {policy.clientName}</p>
                     {/* Añadir más detalles si es necesario */} 
                 </div>

                {/* Botones de Acción del Modal */} 
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                     <button onClick={onClose} className="btn-secondary px-4 py-2">Cancelar</button>
                    <button 
                        onClick={handleUpload} 
                        disabled={files.length === 0 || allPendingUploaded || files.some(f => f.status === 'uploading')}
                         className={clsx(
                            "btn-primary px-4 py-2 flex items-center gap-1",
                             (files.length === 0 || allPendingUploaded || files.some(f => f.status === 'uploading')) && "opacity-50 cursor-not-allowed"
                         )}
                     >
                         {files.some(f => f.status === 'uploading') && <Loader className="w-4 h-4 animate-spin mr-1" />}
                        Subir {files.filter(f => f.status === 'pending').length > 0 ? `(${files.filter(f => f.status === 'pending').length}) Archivo(s)` : 'Archivos'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Clases auxiliares (asumiendo que existen)
// .btn-primary { ... }
// .btn-secondary { ... } 