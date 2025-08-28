import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Image, 
  FileVideo, 
  FileAudio,
  File,
  X,
  Eye,
  Download,
  Lock,
  AlertTriangle,
  Plus,
  Stethoscope,
  Pill,
  RefreshCw,
  DollarSign,
  Scale,
  FileCheck,
  Heart,
  Activity
} from 'lucide-react';
import { DocumentCategory, NoteAttachment } from '@/types/renewal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoteAttachmentUploaderProps {
  attachments: Omit<NoteAttachment, 'id' | 'noteId' | 'uploadedAt' | 'filePath'>[];
  onAttachmentsChange: (attachments: Omit<NoteAttachment, 'id' | 'noteId' | 'uploadedAt' | 'filePath'>[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // en bytes
  allowedFileTypes?: string[];
  className?: string;
}

interface FileToUpload extends File {
  preview?: string;
}

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'informacion_medica', 
    label: 'Información Médica', 
    icon: <Stethoscope className="w-4 h-4" />,
    description: 'Historiales médicos, diagnósticos, informes médicos generales'
  },
  { 
    value: 'programacion_medicamentos', 
    label: 'Programación de Medicamentos', 
    icon: <Pill className="w-4 h-4" />,
    description: 'Horarios de medicamentos, dosis, tratamientos programados'
  },
  { 
    value: 'certificados_medicos', 
    label: 'Certificados Médicos', 
    icon: <FileCheck className="w-4 h-4" />,
    description: 'Certificados de discapacidad, aptitud médica, defunción'
  },
  { 
    value: 'estudios_clinicos', 
    label: 'Estudios Clínicos', 
    icon: <Activity className="w-4 h-4" />,
    description: 'Radiografías, análisis de sangre, resonancias, tomografías'
  },
  { 
    value: 'recetas_medicas', 
    label: 'Recetas Médicas', 
    icon: <Heart className="w-4 h-4" />,
    description: 'Prescripciones médicas, recetas de medicamentos'
  },
  { 
    value: 'renovaciones', 
    label: 'Renovaciones', 
    icon: <RefreshCw className="w-4 h-4" />,
    description: 'Documentos relacionados con renovaciones de póliza'
  },
  { 
    value: 'reembolsos', 
    label: 'Reembolsos', 
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Solicitudes de reembolso, comprobantes, facturas médicas'
  },
  { 
    value: 'indemnizaciones', 
    label: 'Indemnizaciones', 
    icon: <Scale className="w-4 h-4" />,
    description: 'Documentos de siniestros, indemnizaciones, reclamaciones'
  },
  { 
    value: 'comprobantes_pago', 
    label: 'Comprobantes de Pago', 
    icon: <FileText className="w-4 h-4" />,
    description: 'Recibos, facturas, comprobantes de gastos médicos'
  },
  { 
    value: 'documentos_legales', 
    label: 'Documentos Legales', 
    icon: <Scale className="w-4 h-4" />,
    description: 'Contratos, poderes, documentos legales relacionados'
  },
  { 
    value: 'otros', 
    label: 'Otros', 
    icon: <File className="w-4 h-4" />,
    description: 'Otros documentos no categorizados'
  }
];

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (fileType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
  if (fileType.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const NoteAttachmentUploader: React.FC<NoteAttachmentUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB por defecto
  allowedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
  className = ''
}) => {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newAttachment, setNewAttachment] = useState<{
    file: FileToUpload | null;
    category: DocumentCategory;
    description: string;
    esSensible: boolean;
    esPrivado: boolean;
    fechaDocumento: string;
    medicoTratante: string;
    numeroReceta: string;
    requiereAutorizacion: boolean;
  }>({
    file: null,
    category: 'otros',
    description: '',
    esSensible: false,
    esPrivado: false,
    fechaDocumento: '',
    medicoTratante: '',
    numeroReceta: '',
    requiereAutorizacion: false
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && attachments.length < maxFiles) {
      const file = acceptedFiles[0] as FileToUpload;
      
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
      
      setNewAttachment(prev => ({ ...prev, file }));
      setIsAddingFile(true);
    }
  }, [attachments.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false
  });

  const handleAddAttachment = () => {
    if (!newAttachment.file) return;

    const attachment: Omit<NoteAttachment, 'id' | 'noteId' | 'uploadedAt' | 'filePath'> = {
      fileName: `${Date.now()}_${newAttachment.file.name}`,
      originalName: newAttachment.file.name,
      fileSize: newAttachment.file.size,
      fileType: newAttachment.file.type,
      category: newAttachment.category,
      description: newAttachment.description,
      esSensible: newAttachment.esSensible,
      requiereAutorizacion: newAttachment.requiereAutorizacion,
      fechaDocumento: newAttachment.fechaDocumento || undefined,
      medicoTratante: newAttachment.medicoTratante || undefined,
      numeroReceta: newAttachment.numeroReceta || undefined,
      uploadedBy: 'Usuario Actual', // En implementación real vendría del contexto
      esPrivado: newAttachment.esPrivado,
      autorizadoPor: newAttachment.requiereAutorizacion ? [] : undefined
    };

    onAttachmentsChange([...attachments, attachment]);
    
    // Limpiar formulario
    setNewAttachment({
      file: null,
      category: 'otros',
      description: '',
      esSensible: false,
      esPrivado: false,
      fechaDocumento: '',
      medicoTratante: '',
      numeroReceta: '',
      requiereAutorizacion: false
    });
    setIsAddingFile(false);
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const getCategoryInfo = (category: DocumentCategory) => {
    return DOCUMENT_CATEGORIES.find(cat => cat.value === category) || DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1];
  };

  const isMedicalCategory = (category: DocumentCategory): boolean => {
    return ['informacion_medica', 'programacion_medicamentos', 'certificados_medicos', 'estudios_clinicos', 'recetas_medicas'].includes(category);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Archivos Adjuntos</h3>
          <Badge variant="outline">{attachments.length}/{maxFiles}</Badge>
        </div>
        {attachments.length < maxFiles && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingFile(true)}
            disabled={isAddingFile}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adjuntar Archivo
          </Button>
        )}
      </div>

      {/* Lista de archivos adjuntos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => {
            const categoryInfo = getCategoryInfo(attachment.category);
            return (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  {getFileIcon(attachment.fileType)}
                  {categoryInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                    {attachment.esSensible && (
                      <Badge variant="destructive" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Sensible
                      </Badge>
                    )}
                    {attachment.esPrivado && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryInfo.label}
                    </Badge>
                    {attachment.description && (
                      <span className="truncate">{attachment.description}</span>
                    )}
                  </div>
                  {(attachment.medicoTratante || attachment.numeroReceta || attachment.fechaDocumento) && (
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      {attachment.medicoTratante && <span>Dr. {attachment.medicoTratante}</span>}
                      {attachment.numeroReceta && <span> • Receta: {attachment.numeroReceta}</span>}
                      {attachment.fechaDocumento && (
                        <span> • {format(new Date(attachment.fechaDocumento), 'dd/MMM/yyyy', { locale: es })}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" title="Ver archivo">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Descargar">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveAttachment(index)}
                    className="text-red-600 hover:text-red-700"
                    title="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulario para agregar archivo */}
      {isAddingFile && (
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="space-y-4">
            {/* Zona de drag & drop */}
            {!newAttachment.file && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600">Suelta el archivo aquí...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Arrastra un archivo aquí o haz clic para seleccionar</p>
                    <p className="text-sm text-gray-500">
                      Máximo {formatFileSize(maxFileSize)} • Formatos: PDF, DOC, IMG, XLS
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Información del archivo seleccionado */}
            {newAttachment.file && (
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                {getFileIcon(newAttachment.file.type)}
                <div className="flex-1">
                  <p className="font-medium">{newAttachment.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(newAttachment.file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewAttachment(prev => ({ ...prev, file: null }))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Categoría del documento */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Categoría del Documento *</Label>
              <Select 
                value={newAttachment.category} 
                onValueChange={(value) => setNewAttachment(prev => ({ ...prev, category: value as DocumentCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Descripción</Label>
              <Textarea
                placeholder="Describe el contenido del documento..."
                value={newAttachment.description}
                onChange={(e) => setNewAttachment(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Campos específicos para documentos médicos */}
            {isMedicalCategory(newAttachment.category) && (
              <div className="space-y-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-sm font-medium">Información Médica Adicional</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Fecha del Documento</Label>
                    <Input
                      type="date"
                      value={newAttachment.fechaDocumento}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, fechaDocumento: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Médico Tratante</Label>
                    <Input
                      placeholder="Dr. Nombre Apellido"
                      value={newAttachment.medicoTratante}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, medicoTratante: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {newAttachment.category === 'recetas_medicas' && (
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Número de Receta</Label>
                    <Input
                      placeholder="Número de receta médica"
                      value={newAttachment.numeroReceta}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, numeroReceta: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Configuración de privacidad y seguridad */}
            <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Configuración de Privacidad</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="esSensible"
                    checked={newAttachment.esSensible}
                    onCheckedChange={(checked) => setNewAttachment(prev => ({ ...prev, esSensible: checked as boolean }))}
                  />
                  <Label htmlFor="esSensible" className="text-sm">
                    Información sensible/confidencial
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="esPrivado"
                    checked={newAttachment.esPrivado}
                    onCheckedChange={(checked) => setNewAttachment(prev => ({ ...prev, esPrivado: checked as boolean }))}
                  />
                  <Label htmlFor="esPrivado" className="text-sm">
                    Documento privado (acceso restringido)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiereAutorizacion"
                    checked={newAttachment.requiereAutorizacion}
                    onCheckedChange={(checked) => setNewAttachment(prev => ({ ...prev, requiereAutorizacion: checked as boolean }))}
                  />
                  <Label htmlFor="requiereAutorizacion" className="text-sm">
                    Requiere autorización para acceso
                  </Label>
                </div>
              </div>
              
              {(newAttachment.esSensible || newAttachment.esPrivado) && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Este documento será marcado con restricciones de acceso según la configuración seleccionada.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingFile(false);
                  setNewAttachment({
                    file: null,
                    category: 'otros',
                    description: '',
                    esSensible: false,
                    esPrivado: false,
                    fechaDocumento: '',
                    medicoTratante: '',
                    numeroReceta: '',
                    requiereAutorizacion: false
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddAttachment}
                disabled={!newAttachment.file}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Archivo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Información de ayuda */}
      {attachments.length === 0 && !isAddingFile && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No hay archivos adjuntos</p>
          <p className="text-xs">Haz clic en "Adjuntar Archivo" para comenzar</p>
        </div>
      )}
    </div>
  );
};
