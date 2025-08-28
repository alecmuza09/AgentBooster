import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { NoteAttachmentUploader } from './NoteAttachmentUploader';
import { 
  History, 
  Calendar, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Clock,
  RefreshCw,
  Heart,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  Bell,
  CheckCircle,
  Paperclip,
  Download,
  Lock
} from 'lucide-react';
import { 
  PolicyHistory, 
  PolicyVigencia, 
  PolicyRenewal, 
  PolicyNote, 
  RenewalAlert,
  NoteType,
  RenewalStatus,
  NoteAttachment,
  RENEWAL_ALERT_CONFIG
} from '../types/renewal';
import { Policy } from '../types/policy';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PolicyHistoryModuleProps {
  policy: Policy;
  onUpdatePolicy?: (updatedPolicy: Policy) => void;
}

// Componente para mostrar una vigencia
const VigenciaCard: React.FC<{ 
  vigencia: PolicyVigencia;
  isActive: boolean;
  onAddNote?: (vigenciaId: string) => void;
}> = ({ vigencia, isActive, onAddNote }) => {
  const duracionDias = differenceInDays(
    parseISO(vigencia.fechaFin), 
    parseISO(vigencia.fechaInicio)
  );

  return (
    <Card className={`mb-4 ${isActive ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Shield className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <CardTitle className="text-base">
                Vigencia #{vigencia.vigenciaNumber}
                {isActive && <Badge className="ml-2 bg-green-600">Activa</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {duracionDias} días de cobertura
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNote?.(vigencia.id)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Nota
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Período de Vigencia</Label>
            <p className="font-medium">
              {format(parseISO(vigencia.fechaInicio), 'dd/MM/yyyy', { locale: es })} - 
              {format(parseISO(vigencia.fechaFin), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Prima Total</Label>
            <p className="font-medium">${vigencia.total.toLocaleString('es-MX')}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Suma Asegurada</Label>
            <p className="font-medium">${vigencia.sumaAsegurada.toLocaleString('es-MX')}</p>
          </div>
        </div>

        {vigencia.cambios && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Cambios en esta vigencia:
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {vigencia.cambios.motivoCambio}
            </p>
          </div>
        )}

        {vigencia.notas && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {vigencia.notas}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para mostrar una renovación
const RenewalCard: React.FC<{ 
  renewal: PolicyRenewal;
  onProcessRenewal?: (renewalId: string) => void;
}> = ({ renewal, onProcessRenewal }) => {
  const getStatusColor = (status: RenewalStatus) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusLabel = (status: RenewalStatus) => {
    switch (status) {
      case 'processed': return 'Procesada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Card className="mb-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <RefreshCw className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                Renovación #{renewal.numeroRenovacion}
                {renewal.esPrimerRenovacion && <Badge className="ml-2 bg-blue-600">Primera</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {renewal.renewalType === 'vida_renewal' && '💜 Producto VIDA'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(renewal.status)}>
              {getStatusLabel(renewal.status)}
            </Badge>
            {renewal.status === 'pending' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onProcessRenewal?.(renewal.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Procesar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Vencimiento Anterior</Label>
            <p className="font-medium">
              {format(parseISO(renewal.fechaVencimientoAnterior), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Nueva Vigencia</Label>
            <p className="font-medium">
              {format(parseISO(renewal.fechaInicioNueva), 'dd/MM/yyyy', { locale: es })} - 
              {format(parseISO(renewal.fechaFinNueva), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        </div>

        {renewal.cambiosPrima && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Cambio en prima: ${renewal.cambiosPrima.toLocaleString('es-MX')}
            </p>
          </div>
        )}

        {renewal.motivosRenovacion && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {renewal.motivosRenovacion}
            </p>
          </div>
        )}

        {renewal.alertas.length > 0 && (
          <div className="mt-3">
            <Label className="text-xs text-gray-500 mb-2 block">Alertas Activas</Label>
            <div className="flex flex-wrap gap-2">
              {renewal.alertas.filter(a => a.isActive).map(alert => (
                <Badge 
                  key={alert.id} 
                  variant="outline" 
                  className={`text-xs ${alert.isPersistent ? 'border-red-400 text-red-700' : 'border-yellow-400 text-yellow-700'}`}
                >
                  {alert.isPersistent && <Bell className="w-3 h-3 mr-1" />}
                  {alert.message}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para mostrar una nota
const NoteCard: React.FC<{ 
  note: PolicyNote;
  onEditNote?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
}> = ({ note, onEditNote, onDeleteNote }) => {
  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'renewal': return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case 'payment': return <Zap className="w-4 h-4 text-green-600" />;
      case 'client_contact': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'internal': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNoteTypeColor = (type: NoteType) => {
    switch (type) {
      case 'renewal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'payment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'client_contact': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alert': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'internal': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getNoteTypeIcon(note.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm">{note.titulo}</h4>
                <Badge className={getNoteTypeColor(note.type)} variant="outline">
                  {note.type}
                </Badge>
                {note.esImportante && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {note.contenido}
              </p>
              
              {/* Mostrar archivos adjuntos si los hay */}
              {note.tieneArchivosAdjuntos && note.attachments && note.attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Archivos Adjuntos ({note.attachments.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {note.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {attachment.fileType.startsWith('image/') ? (
                              <FileText className="w-4 h-4 text-green-600" />
                            ) : attachment.fileType === 'application/pdf' ? (
                              <FileText className="w-4 h-4 text-red-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-600" />
                            )}
                            {attachment.esSensible && (
                              <Lock className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{attachment.originalName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{attachment.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{Math.round(attachment.fileSize / 1024)} KB</span>
                              {attachment.description && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{attachment.description}</span>
                                </>
                              )}
                            </div>
                            {/* Información médica adicional */}
                            {(attachment.medicoTratante || attachment.numeroReceta || attachment.fechaDocumento) && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {attachment.medicoTratante && <span>Dr. {attachment.medicoTratante}</span>}
                                {attachment.numeroReceta && <span> • Receta: {attachment.numeroReceta}</span>}
                                {attachment.fechaDocumento && (
                                  <span> • {format(new Date(attachment.fechaDocumento), 'dd/MMM/yyyy', { locale: es })}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" title="Ver archivo">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Descargar">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mostrar categorías especiales */}
                  {note.attachments.some(a => ['informacion_medica', 'programacion_medicamentos', 'certificados_medicos', 'estudios_clinicos', 'recetas_medicas'].includes(a.category)) && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-1 text-green-700 dark:text-green-300 text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Contiene información médica confidencial</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{format(parseISO(note.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                <span>Por: {note.creadoPor}</span>
                {note.tieneArchivosAdjuntos && (
                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-700">
                    <Paperclip className="w-3 h-3 mr-1" />
                    {note.attachments?.length || 0} archivo{(note.attachments?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                )}
                {note.esRecordatorio && !note.recordatorioCompletado && (
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                    <Clock className="w-3 h-3 mr-1" />
                    Recordatorio
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditNote?.(note.id)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteNote?.(note.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal
export const PolicyHistoryModule: React.FC<PolicyHistoryModuleProps> = ({ 
  policy, 
  onUpdatePolicy 
}) => {
  const [activeTab, setActiveTab] = useState<'vigencias' | 'renovaciones' | 'notas'>('vigencias');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    titulo: '',
    contenido: '',
    type: 'general' as NoteType,
    esImportante: false
  });
  
  const [noteAttachments, setNoteAttachments] = useState<Omit<NoteAttachment, 'id' | 'noteId' | 'uploadedAt' | 'filePath'>[]>([]);

  // Mock data - en una implementación real vendría de la base de datos
  const [historial, setHistorial] = useState<PolicyHistory>({
    policyId: policy.id,
    vigencias: [
      {
        id: 'vig-1',
        policyId: policy.id,
        vigenciaNumber: 1,
        fechaInicio: '2023-01-01',
        fechaFin: '2024-01-01',
        fechaRenovacion: '2023-12-15',
        status: 'expired',
        primaNeta: 12000,
        total: 15000,
        sumaAsegurada: 1000000,
        notas: 'Primera vigencia de la póliza',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'vig-2',
        policyId: policy.id,
        vigenciaNumber: 2,
        fechaInicio: '2024-01-01',
        fechaFin: '2025-01-01',
        status: 'active',
        primaNeta: 13000,
        total: 16000,
        sumaAsegurada: 1200000,
        cambios: {
          sumaAseguradaAnterior: 1000000,
          primaAnterior: 15000,
          motivoCambio: 'Incremento por inflación y mejora en cobertura'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    renovaciones: [
      {
        id: 'ren-1',
        policyId: policy.id,
        vigenciaAnteriorId: 'vig-1',
        vigenciaNuevaId: 'vig-2',
        renewalType: policy.ramo === 'Vida' ? 'vida_renewal' : 'annual_renewal',
        status: 'processed',
        fechaVencimientoAnterior: '2024-01-01',
        fechaInicioNueva: '2024-01-01',
        fechaFinNueva: '2025-01-01',
        fechaProcesamiento: '2023-12-15',
        esPrimerRenovacion: true,
        numeroRenovacion: 1,
        cambiosPrima: 1000,
        motivosRenovacion: 'Renovación automática con ajuste por inflación',
        alertas: [],
        createdAt: '2023-12-15T00:00:00Z',
        updatedAt: '2023-12-15T00:00:00Z'
      }
    ],
    notas: [
      {
        id: 'note-1',
        policyId: policy.id,
        type: 'renewal',
        titulo: 'Renovación procesada exitosamente',
        contenido: 'Se procesó la primera renovación con incremento en suma asegurada. Cliente confirmó aceptación de nuevos términos.',
        attachments: [],
        tieneArchivosAdjuntos: false,
        esImportante: true,
        esVisible: true,
        creadoPor: 'Sistema',
        fechaCreacion: '2023-12-15T10:00:00Z'
      },
      {
        id: 'note-2',
        policyId: policy.id,
        type: 'client_contact',
        titulo: 'Contacto con cliente',
        contenido: 'Cliente llamó para consultar sobre beneficiarios. Se le explicó el proceso de actualización.',
        attachments: [],
        tieneArchivosAdjuntos: false,
        esImportante: false,
        esVisible: true,
        creadoPor: 'Juan Pérez',
        fechaCreacion: '2024-03-10T14:30:00Z'
      }
    ],
    alertasRenovacion: [],
    totalVigencias: 2,
    totalRenovaciones: 1,
    esProductoVida: policy.ramo === 'Vida',
    renovacionesVidaEspeciales: policy.ramo === 'Vida' ? {
      renovacionesAutomaticas: 1,
      renovacionesManuales: 0,
      ultimaActualizacionBeneficiarios: '2024-03-10'
    } : undefined
  });

  const handleAddNote = () => {
    if (!newNote.titulo.trim() || !newNote.contenido.trim()) return;

    const noteId = `note-${Date.now()}`;
    
    // Crear los attachments con IDs únicos
    const attachmentsWithIds: NoteAttachment[] = noteAttachments.map((attachment, index) => ({
      ...attachment,
      id: `attachment-${noteId}-${index}`,
      noteId: noteId,
      uploadedAt: new Date().toISOString(),
      filePath: `notes/${noteId}/${attachment.fileName}` // Ruta simulada
    }));

    const nota: PolicyNote = {
      id: noteId,
      policyId: policy.id,
      type: newNote.type,
      titulo: newNote.titulo,
      contenido: newNote.contenido,
      attachments: attachmentsWithIds,
      tieneArchivosAdjuntos: attachmentsWithIds.length > 0,
      esImportante: newNote.esImportante,
      esVisible: true,
      creadoPor: 'Usuario Actual', // En implementación real vendría del contexto
      fechaCreacion: new Date().toISOString()
    };

    setHistorial(prev => ({
      ...prev,
      notas: [nota, ...prev.notas]
    }));

    // Limpiar formulario
    setNewNote({
      titulo: '',
      contenido: '',
      type: 'general',
      esImportante: false
    });
    setNoteAttachments([]);
    setIsAddingNote(false);
  };

  const vigenciaActiva = historial.vigencias.find(v => v.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Historial de Póliza {policy.policyNumber}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {historial.totalVigencias} vigencia{historial.totalVigencias !== 1 ? 's' : ''} • 
                  {historial.totalRenovaciones} renovación{historial.totalRenovaciones !== 1 ? 'es' : ''} • 
                  {historial.notas.length} nota{historial.notas.length !== 1 ? 's' : ''}
                  {historial.esProductoVida && ' • 💜 Producto VIDA'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'vigencias', label: `Vigencias (${historial.totalVigencias})`, icon: Shield },
          { id: 'renovaciones', label: `Renovaciones (${historial.totalRenovaciones})`, icon: RefreshCw },
          { id: 'notas', label: `Notas (${historial.notas.length})`, icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[400px]">
        {activeTab === 'vigencias' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Historial de Vigencias</h3>
            </div>
            <div className="space-y-4">
              {historial.vigencias
                .sort((a, b) => b.vigenciaNumber - a.vigenciaNumber)
                .map(vigencia => (
                  <VigenciaCard
                    key={vigencia.id}
                    vigencia={vigencia}
                    isActive={vigencia.status === 'active'}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'renovaciones' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Historial de Renovaciones</h3>
            </div>
            <div className="space-y-4">
              {historial.renovaciones.length > 0 ? (
                historial.renovaciones
                  .sort((a, b) => b.numeroRenovacion - a.numeroRenovacion)
                  .map(renewal => (
                    <RenewalCard
                      key={renewal.id}
                      renewal={renewal}
                    />
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay renovaciones registradas aún
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notas' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notas Internas</h3>
              <Button onClick={() => setIsAddingNote(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Nota
              </Button>
            </div>

            {/* Formulario para nueva nota */}
            {isAddingNote && (
              <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="note-title">Título de la Nota</Label>
                        <Input
                          id="note-title"
                          value={newNote.titulo}
                          onChange={(e) => setNewNote(prev => ({ ...prev, titulo: e.target.value }))}
                          placeholder="Ej: Contacto con cliente"
                        />
                      </div>
                      <div>
                        <Label htmlFor="note-type">Tipo de Nota</Label>
                        <Select value={newNote.type} onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value as NoteType }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="renewal">Renovación</SelectItem>
                            <SelectItem value="payment">Pago</SelectItem>
                            <SelectItem value="client_contact">Contacto Cliente</SelectItem>
                            <SelectItem value="internal">Nota Interna</SelectItem>
                            <SelectItem value="alert">Alerta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="note-content">Contenido</Label>
                      <Textarea
                        id="note-content"
                        value={newNote.contenido}
                        onChange={(e) => setNewNote(prev => ({ ...prev, contenido: e.target.value }))}
                        placeholder="Describe los detalles de esta nota..."
                        rows={4}
                      />
                    </div>
                    
                    {/* Componente de archivos adjuntos */}
                    <NoteAttachmentUploader
                      attachments={noteAttachments}
                      onAttachmentsChange={setNoteAttachments}
                      className="border-t pt-4"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="important"
                        checked={newNote.esImportante}
                        onChange={(e) => setNewNote(prev => ({ ...prev, esImportante: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="important">Marcar como importante</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddNote}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Nota
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de notas */}
            <div className="space-y-3">
              {historial.notas.length > 0 ? (
                historial.notas
                  .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
                  .map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                    />
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      No hay notas registradas
                    </p>
                    <Button variant="outline" onClick={() => setIsAddingNote(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar primera nota
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
