import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Plus, 
  File, 
  Image, 
  FileCheck,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentToUpload {
  id: string;
  file: File;
  title: string;
  category: DocumentCategory;
  description?: string;
}

export type DocumentCategory = 
  | 'caratula-poliza'
  | 'certificado-poliza'
  | 'identificacion-contratante'
  | 'identificacion-asegurado'
  | 'comprobante-domicilio'
  | 'comprobante-ingresos'
  | 'otros';

interface PolicyDocumentUploaderProps {
  documents: DocumentToUpload[];
  onDocumentsChange: (documents: DocumentToUpload[]) => void;
  className?: string;
}

const documentCategories: { value: DocumentCategory; label: string; description: string }[] = [
  {
    value: 'caratula-poliza',
    label: 'Carátula de Póliza',
    description: 'Documento principal de la póliza emitida por la aseguradora'
  },
  {
    value: 'certificado-poliza',
    label: 'Certificado de Póliza',
    description: 'Certificado oficial de la cobertura'
  },
  {
    value: 'identificacion-contratante',
    label: 'Identificación del Contratante',
    description: 'INE, pasaporte o identificación oficial del contratante'
  },
  {
    value: 'identificacion-asegurado',
    label: 'Identificación del Asegurado',
    description: 'INE, pasaporte o identificación oficial del asegurado'
  },
  {
    value: 'comprobante-domicilio',
    label: 'Comprobante de Domicilio',
    description: 'Recibo de servicios, estado de cuenta bancario, etc.'
  },
  {
    value: 'comprobante-ingresos',
    label: 'Comprobante de Ingresos',
    description: 'Recibos de nómina, estados financieros, etc.'
  },
  {
    value: 'otros',
    label: 'Otros Documentos',
    description: 'Documentos adicionales relevantes para la póliza'
  }
];

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }
  if (type === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const PolicyDocumentUploader: React.FC<PolicyDocumentUploaderProps> = ({
  documents,
  onDocumentsChange,
  className
}) => {
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('otros');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && isAddingDocument) {
      const file = acceptedFiles[0];
      
      // Validar tamaño del archivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }

      // Si no hay título, usar el nombre del archivo sin extensión
      const defaultTitle = newDocTitle || file.name.replace(/\.[^/.]+$/, '');
      
      const newDocument: DocumentToUpload = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        title: defaultTitle,
        category: newDocCategory,
        description: newDocDescription
      };

      onDocumentsChange([...documents, newDocument]);
      
      // Limpiar formulario
      setNewDocTitle('');
      setNewDocDescription('');
      setIsAddingDocument(false);
    }
  }, [isAddingDocument, newDocTitle, newDocCategory, newDocDescription, documents, onDocumentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: !isAddingDocument
  });

  const removeDocument = (documentId: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== documentId));
  };

  const updateDocumentTitle = (documentId: string, newTitle: string) => {
    onDocumentsChange(
      documents.map(doc => 
        doc.id === documentId ? { ...doc, title: newTitle } : doc
      )
    );
  };

  const updateDocumentCategory = (documentId: string, newCategory: DocumentCategory) => {
    onDocumentsChange(
      documents.map(doc => 
        doc.id === documentId ? { ...doc, category: newCategory } : doc
      )
    );
  };

  const getCategoryInfo = (category: DocumentCategory) => {
    return documentCategories.find(cat => cat.value === category);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Documentos de la Póliza
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({documents.length} documento{documents.length !== 1 ? 's' : ''})
          </span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddingDocument(!isAddingDocument)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Documento
        </Button>
      </div>

      {/* Formulario para agregar documento */}
      {isAddingDocument && (
        <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
            Nuevo Documento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="doc-category">Categoría del Documento *</Label>
              <Select value={newDocCategory} onValueChange={(value) => setNewDocCategory(value as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="doc-title">Título del Documento</Label>
              <Input
                id="doc-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Ej: INE Juan Pérez (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no especificas un título, se usará el nombre del archivo
              </p>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="doc-description">Descripción (Opcional)</Label>
            <Input
              id="doc-description"
              value={newDocDescription}
              onChange={(e) => setNewDocDescription(e.target.value)}
              placeholder="Descripción adicional del documento"
            />
          </div>

          {/* Zona de drop */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive 
                ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/50' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className={cn(
              "w-10 h-10 mx-auto mb-2",
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            )} />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {isDragActive 
                ? 'Suelta el archivo aquí' 
                : 'Arrastra y suelta un archivo aquí, o haz clic para seleccionar'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formatos: PDF, JPG, PNG, DOCX (máx. 10MB)
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingDocument(false);
                setNewDocTitle('');
                setNewDocDescription('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Documentos Adjuntos
          </h4>
          
          {documents.map((document) => {
            const categoryInfo = getCategoryInfo(document.category);
            
            return (
              <div
                key={document.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                {/* Icono del archivo */}
                <div className="flex-shrink-0">
                  {getFileIcon(document.file)}
                </div>

                {/* Información del documento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Input
                      value={document.title}
                      onChange={(e) => updateDocumentTitle(document.id, e.target.value)}
                      className="h-8 text-sm font-medium"
                      placeholder="Título del documento"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {document.file.name}
                    </span>
                    <span>{formatFileSize(document.file.size)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {categoryInfo?.label}
                    </span>
                  </div>
                </div>

                {/* Selector de categoría */}
                <div className="flex-shrink-0 w-48">
                  <Select 
                    value={document.category} 
                    onValueChange={(value) => updateDocumentCategory(document.id, value as DocumentCategory)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map(category => (
                        <SelectItem key={category.value} value={category.value} className="text-xs">
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Botón eliminar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(document.id)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Mensaje informativo si no hay documentos */}
      {documents.length === 0 && !isAddingDocument && (
        <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            No hay documentos adjuntos
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Haz clic en "Agregar Documento" para adjuntar archivos importantes
          </p>
        </div>
      )}

      {/* Información adicional */}
      {documents.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Los documentos se guardarán cuando se cree la póliza</li>
              <li>Asegúrate de que todos los documentos sean legibles</li>
              <li>Los archivos deben ser menores a 10MB cada uno</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
