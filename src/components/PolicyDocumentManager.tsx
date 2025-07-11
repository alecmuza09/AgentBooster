import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Policy, PolicyDocument, PolicyDocumentVersion } from '@/types/policy';
import { createDocument, createDocumentVersion } from '@/data/policies';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UploadCloud, FileText, Trash2, Plus, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type DocumentRole = 'contratante' | 'asegurado' | 'dueñoFinal' | 'contactoPago' | 'general';

interface PolicyDocumentManagerProps {
  policy: Policy;
  onDocumentsChange: (documents: PolicyDocument[]) => void;
}

// --- Componente para un solo Documento y sus Versiones ---
const DocumentCard: React.FC<{
  document: PolicyDocument;
  onNewVersion: (documentId: string, file: File) => void;
}> = ({ document, onNewVersion }) => {
  const [showVersions, setShowVersions] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onNewVersion(document.id, acceptedFiles[0]);
    }
  }, [document.id, onNewVersion]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const latestVersion = document.versions.sort((a, b) => b.version - a.version)[0];

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold">{document.title}</p>
            <p className="text-xs text-gray-500">
              {document.role} - Última versión: v{latestVersion.version} ({latestVersion.fileName})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowVersions(!showVersions)}>
                <History className="w-4 h-4 mr-2" />
                {showVersions ? 'Ocultar' : 'Ver'} Historial
            </Button>
            <div {...getRootProps()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" title="Subir nueva versión">
                <input {...getInputProps()} />
                <UploadCloud className="w-5 h-5"/>
            </div>
        </div>
      </div>
      {showVersions && (
        <ul className="mt-3 space-y-1 pl-9">
          {document.versions.map(v => (
            <li key={v.version} className="text-xs flex justify-between items-center gap-2">
              <span>v{v.version}: {v.fileName}</span>
              <span className="text-gray-400">{format(new Date(v.uploadedAt), 'dd/MM/yyyy')}</span>
              {v.fileUrl && (
                <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Ver/Descargar</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


// --- Componente Principal ---
export const PolicyDocumentManager: React.FC<PolicyDocumentManagerProps> = ({ policy, onDocumentsChange }) => {
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocRole, setNewDocRole] = useState<DocumentRole>('general');
    const [isCreating, setIsCreating] = useState(false);
    
    const handleCreateDocument = async () => {
        if (!newDocTitle) return;
        setIsCreating(true);
        try {
            const newDocContainer = await createDocument(policy.id, newDocTitle, newDocRole);
            const newDocForUI = { ...newDocContainer, versions: [] };
            onDocumentsChange([...policy.documents, newDocForUI]);
            setNewDocTitle('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleNewVersion = async (documentId: string, file: File) => {
        const docIndex = policy.documents.findIndex(d => d.id === documentId);
        if (docIndex === -1) return;

        const doc = policy.documents[docIndex];
        const newVersionNumber = doc.versions.length > 0 ? Math.max(...doc.versions.map(v => v.version)) + 1 : 1;
        
        try {
            const newVersionData = await createDocumentVersion(documentId, file, newVersionNumber);
            
            const updatedDocs = [...policy.documents];
            updatedDocs[docIndex].versions.push(newVersionData);
            onDocumentsChange(updatedDocs);

        } catch (error) {
            console.error("Failed to upload new version:", error);
        }
    };

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-xl font-bold">Gestión de Documentos</h2>
                <p className="text-sm text-gray-500">Crea un documento y luego añade versiones.</p>
            </div>
            {/* Formulario para crear un nuevo tipo de documento */}
            <div className="flex items-end gap-3 p-4 border rounded-lg dark:border-gray-700">
                <div className="flex-grow">
                    <label htmlFor="new-doc-title" className="text-sm font-medium">Título del Nuevo Documento</label>
                    <Input id="new-doc-title" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="Ej: INE, Comprobante de Domicilio..." />
                </div>
                <div>
                     <label htmlFor="new-doc-role" className="text-sm font-medium">Rol</label>
                     <Select onValueChange={(value: DocumentRole) => setNewDocRole(value)} defaultValue="general">
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="contratante">Contratante</SelectItem>
                            <SelectItem value="asegurado">Asegurado</SelectItem>
                            <SelectItem value="dueñoFinal">Dueño Final</SelectItem>
                            <SelectItem value="contactoPago">Contacto para Pago</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCreateDocument} disabled={isCreating}>{isCreating ? 'Creando...' : 'Crear Documento'}</Button>
            </div>

            {/* Lista de documentos existentes */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold border-t pt-4">Documentos de la Póliza</h3>
                {policy.documents.length === 0 ? (
                    <p className="text-sm text-gray-500">Aún no hay documentos para esta póliza.</p>
                ) : (
                    <div className="space-y-3">
                        {policy.documents.map(doc => (
                            <DocumentCard key={doc.id} document={doc} onNewVersion={handleNewVersion} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 