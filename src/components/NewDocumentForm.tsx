import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client } from '../types/client';
import { Lead } from '../types/lead';
import { UploadCloud, File as FileIcon, X, Search, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// Esquema de validación para el formulario
const documentSchema = z.object({
  entity: z.object({
    id: z.string().min(1, 'Debes seleccionar un cliente o prospecto.'),
    name: z.string(),
    type: z.enum(['client', 'lead']),
  }),
  documentType: z.string().min(1, 'El tipo de documento es requerido.'),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface NewDocumentFormProps {
  onClose: () => void;
  onDocumentUploaded: () => void; // Para notificar al padre y refrescar datos
}

interface UploadedFile {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}

export const NewDocumentForm: React.FC<NewDocumentFormProps> = ({ onClose, onDocumentUploaded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entities, setEntities] = useState<(Client | Lead)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string; type: 'client' | 'lead' } | null>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<DocumentFormData>({
        resolver: zodResolver(documentSchema),
    });

    // Cargar clientes y prospectos
    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            try {
                const [clientsRes, leadsRes] = await Promise.all([
                    fetch('/api/clients'),
                    fetch('/api/prospects'),
                ]);
                const clients = await clientsRes.json();
                const leads = await leadsRes.json();
                setEntities([...clients, ...leads]);
            } catch (error) {
                console.error("Error fetching entities:", error);
                setServerError("No se pudieron cargar los clientes y prospectos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEntities();
    }, []);

    const filteredEntities = searchTerm
        ? entities.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleSelectEntity = (entity: Client | Lead) => {
        const entityType = 'status' in entity ? 'lead' : 'client'; // Los leads tienen 'status'
        setSelectedEntity({ id: entity.id, name: entity.name, type: entityType });
        setValue('entity', { id: entity.id, name: entity.name, type: entityType });
        setSearchTerm('');
    };
    
    // Lógica para manejar archivos (añadir, quitar, drag-drop)
    const addFiles = (newFiles: File[]) => {
        const filesToAdd: UploadedFile[] = newFiles.map(file => ({
             file,
             id: `${file.name}-${file.lastModified}`,
             status: 'pending'
        }));
        setFiles(prev => [...prev, ...filesToAdd.filter(f => !prev.some(pf => pf.id === f.id))]);
    };
    
    const removeFile = (id: string) => setFiles(p => p.filter(f => f.id !== id));

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            addFiles(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    }, []);

    // Envío del formulario
    const handleFormSubmit = async (data: DocumentFormData) => {
        if (files.length === 0) {
            setServerError("Debes agregar al menos un archivo.");
            return;
        }
        setServerError(null);
        
        // Aquí iría la lógica de subida de archivos al backend
        // Por ahora, simularemos la subida
        setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));
        
        console.log("Subiendo documentos para:", data.entity);
        console.log("Tipo de documento:", data.documentType);

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular red

        setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
        
        await new Promise(resolve => setTimeout(resolve, 500));

        onDocumentUploaded();
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Buscador de Entidad */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar Cliente o Prospecto <span className="text-red-500">*</span>
                </label>
                {selectedEntity ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedEntity.name}</span>
                        <button type="button" onClick={() => { setSelectedEntity(null); setValue('entity', {} as any); }} className="text-gray-500 hover:text-red-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Escribe para buscar..."
                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md"
                        />
                        {isLoading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
                        {filteredEntities.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredEntities.map(entity => (
                                    <li
                                        key={entity.id}
                                        onClick={() => handleSelectEntity(entity)}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {entity.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                 {errors.entity?.id && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.entity.id.message}</p>}
            </div>

            {/* Tipo de Documento */}
            <div className="space-y-2">
                <label htmlFor="documentType" className="block text-sm font-medium">Tipo de Documento <span className="text-red-500">*</span></label>
                <Controller
                    name="documentType"
                    control={control}
                    render={({ field }) => (
                         <select {...field} className="w-full text-sm border rounded-md p-1.5">
                            <option value="">Seleccionar tipo...</option>
                            <option value="INE">INE/Identificación Oficial</option>
                            <option value="Comprobante Domicilio">Comprobante de Domicilio</option>
                            <option value="Acta Nacimiento">Acta de Nacimiento</option>
                            <option value="Poliza">Póliza Firmada</option>
                            <option value="Otro">Otro</option>
                        </select>
                    )}
                />
                 {errors.documentType && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.documentType.message}</p>}
            </div>

            {/* Zona de Arrastrar y Soltar */}
             <div 
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={clsx("border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    isDragging ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                )}
             >
                <input type="file" multiple className="hidden" id="file-upload" onChange={(e) => addFiles(Array.from(e.target.files || []))} />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Arrastra archivos o haz clic para seleccionar</p>
                </label>
             </div>

            {/* Lista de Archivos */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="w-5 h-5 text-gray-500" />
                                <span className="truncate">{f.file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {f.status === 'pending' && <button type="button" onClick={() => removeFile(f.id)}><X className="w-4 h-4 text-red-500" /></button>}
                                {f.status === 'uploading' && <Loader className="w-4 h-4 animate-spin" />}
                                {f.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {serverError && <div className="flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5" /><p>{serverError}</p></div>}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Subiendo...' : 'Subir Documentos'}
                </button>
            </div>
        </form>
    );
}; 