import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Paperclip, 
  Upload, 
  X, 
  FileText, 
  Image, 
  File, 
  AlertTriangle,
  Lock,
  Eye,
  Download,
  Trash2,
  Plus
} from 'lucide-react';

// Tipos para archivos adjuntos
export interface NoteAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: string;
  uploadedBy?: string;
  originalName: string;
  fileType: string;
  category: string;
  description?: string;
  esSensible: boolean;
  // Campos específicos para documentos médicos
  medicoTratante?: string;
  numeroReceta?: string;
  fechaDocumento?: string;
  // Campos para otros tipos de documentos
  numeroPoliza?: string;
  fechaEmision?: string;
  monto?: number;
  moneda?: string;
}

interface NoteAttachmentUploaderProps {
  attachments: Omit<NoteAttachment, 'id' | 'uploadedAt' | 'filePath'>[];
  onAttachmentsChange: (attachments: Omit<NoteAttachment, 'id' | 'uploadedAt' | 'filePath'>[]) => void;
  className?: string;
}

const CATEGORIES = {
  'identificacion_oficial': 'Identificación Oficial',
  'comprobante_domicilio': 'Comprobante de Domicilio',
  'informacion_medica': 'Información Médica',
  'programacion_medicamentos': 'Programación de Medicamentos',
  'certificados_medicos': 'Certificados Médicos',
  'estudios_clinicos': 'Estudios Clínicos',
  'recetas_medicas': 'Recetas Médicas',
  'comprobante_pago': 'Comprobante de Pago',
  'poliza_anterior': 'Póliza Anterior',
  'endoso': 'Endoso',
  'carta_autorizacion': 'Carta de Autorización',
  'otro': 'Otro'
};

const SENSITIVE_CATEGORIES = [
  'informacion_medica',
  'programacion_medicamentos', 
  'certificados_medicos',
  'estudios_clinicos',
  'recetas_medicas'
];

export const NoteAttachmentUploader: React.FC<NoteAttachmentUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        
        const newAttachment: Omit<NoteAttachment, 'id' | 'uploadedAt' | 'filePath'> = {
          fileName: file.name,
          fileUrl: fileData,
          fileSize: file.size,
          mimeType: file.type,
          originalName: file.name,
          fileType: file.type,
          category: 'otro',
          description: '',
          esSensible: false,
          uploadedBy: 'Usuario Actual' // En implementación real vendría del contexto
        };

        onAttachmentsChange([...attachments, newAttachment]);
      };
      
      reader.readAsDataURL(file);
    });

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const updateAttachment = (index: number, updates: Partial<NoteAttachment>) => {
    const newAttachments = attachments.map((attachment, i) => 
      i === index ? { ...attachment, ...updates } : attachment
    );
    onAttachmentsChange(newAttachments);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4 text-green-600" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-600" />;
    } else {
      return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-3 block">
        Archivos Adjuntos ({attachments.length})
      </Label>

      {/* Zona de carga */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Subiendo...' : 'Seleccionar Archivos'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
      </div>

      {/* Lista de archivos adjuntos */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-3">
          {attachments.map((attachment, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icono del archivo */}
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(attachment.fileType)}
                  </div>

                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-sm truncate">{attachment.originalName}</p>
                      {attachment.esSensible && (
                        <Badge variant="outline" className="text-xs border-red-400 text-red-700">
                          <Lock className="w-3 h-3 mr-1" />
                          Sensible
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      {formatFileSize(attachment.fileSize)} • {attachment.fileType}
                    </div>

                    {/* Campos editables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Categoría</Label>
                        <Select
                          value={attachment.category}
                          onValueChange={(value) => {
                            updateAttachment(index, { 
                              category: value,
                              esSensible: SENSITIVE_CATEGORIES.includes(value)
                            });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORIES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Descripción (opcional)</Label>
                        <Input
                          value={attachment.description || ''}
                          onChange={(e) => updateAttachment(index, { description: e.target.value })}
                          placeholder="Descripción del documento"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Campos específicos para documentos médicos */}
                    {SENSITIVE_CATEGORIES.includes(attachment.category) && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            Información Médica Confidencial
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Médico Tratante</Label>
                            <Input
                              value={attachment.medicoTratante || ''}
                              onChange={(e) => updateAttachment(index, { medicoTratante: e.target.value })}
                              placeholder="Dr. Nombre"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Número de Receta</Label>
                            <Input
                              value={attachment.numeroReceta || ''}
                              onChange={(e) => updateAttachment(index, { numeroReceta: e.target.value })}
                              placeholder="Número de receta"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fecha del Documento</Label>
                            <Input
                              type="date"
                              value={attachment.fechaDocumento || ''}
                              onChange={(e) => updateAttachment(index, { fechaDocumento: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Campos específicos para comprobantes de pago */}
                    {attachment.category === 'comprobante_pago' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Información de Pago
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Número de Póliza</Label>
                            <Input
                              value={attachment.numeroPoliza || ''}
                              onChange={(e) => updateAttachment(index, { numeroPoliza: e.target.value })}
                              placeholder="Número de póliza"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Monto</Label>
                            <Input
                              type="number"
                              value={attachment.monto || ''}
                              onChange={(e) => updateAttachment(index, { monto: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Moneda</Label>
                            <Select
                              value={attachment.moneda || 'MXN'}
                              onValueChange={(value) => updateAttachment(index, { moneda: value })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MXN">MXN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" title="Ver archivo">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Descargar">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Información sobre archivos sensibles */}
      {attachments.some(a => a.esSensible) && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Archivos con Información Sensible</p>
              <p>
                Los archivos marcados como sensibles contienen información médica confidencial 
                y están protegidos con medidas de seguridad adicionales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};