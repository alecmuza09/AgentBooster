import { Policy, PolicyStatus } from './policy';

// Tipos para el sistema de renovaciones y historial

export type RenewalStatus = 'pending' | 'processed' | 'cancelled' | 'overdue';
export type RenewalType = 'automatic' | 'manual' | 'vida_renewal' | 'annual_renewal';
export type NoteType = 'general' | 'renewal' | 'payment' | 'client_contact' | 'internal' | 'alert';

// Interfaz para las vigencias históricas
export interface PolicyVigencia {
  id: string;
  policyId: string;
  vigenciaNumber: number; // Número secuencial de la vigencia (1, 2, 3...)
  fechaInicio: string;
  fechaFin: string;
  fechaRenovacion?: string; // Fecha en que se procesó la renovación
  status: PolicyStatus;
  primaNeta: number;
  total: number;
  sumaAsegurada: number;
  // Cambios en la vigencia
  cambios?: {
    sumaAseguradaAnterior?: number;
    primaAnterior?: number;
    motivoCambio?: string;
  };
  // Notas específicas de esta vigencia
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para las renovaciones
export interface PolicyRenewal {
  id: string;
  policyId: string;
  vigenciaAnteriorId: string;
  vigenciaNuevaId: string;
  renewalType: RenewalType;
  status: RenewalStatus;
  
  // Fechas importantes
  fechaVencimientoAnterior: string;
  fechaInicioNueva: string;
  fechaFinNueva: string;
  fechaProcesamiento?: string;
  fechaAlertaEnviada?: string;
  
  // Información de la renovación
  esPrimerRenovacion: boolean;
  numeroRenovacion: number; // 1, 2, 3...
  
  // Cambios en la renovación
  cambiosSumaAsegurada?: number;
  cambiosPrima?: number;
  motivosRenovacion?: string;
  
  // Alertas de renovación
  alertas: RenewalAlert[];
  
  // Documentos de renovación
  documentosRenovacion?: string[];
  
  // Notas internas
  notasInternas?: string;
  
  // Metadatos
  creadoPor?: string;
  procesadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

// Alertas específicas de renovación
export interface RenewalAlert {
  id: string;
  renewalId: string;
  policyId: string;
  type: 'renewal_45_days' | 'renewal_30_days' | 'renewal_15_days' | 'renewal_7_days' | 'renewal_overdue';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  diasHastaVencimiento: number;
  fechaVencimiento: string;
  isPersistent: boolean; // Las de 7 días son persistentes
  isActive: boolean;
  fechaEnvio?: string;
  fechaConfirmacion?: string;
  createdAt: string;
}

// Tipos de documentos médicos y especializados
export type DocumentCategory = 
  | 'informacion_medica' 
  | 'programacion_medicamentos' 
  | 'renovaciones' 
  | 'reembolsos' 
  | 'indemnizaciones'
  | 'certificados_medicos'
  | 'estudios_clinicos'
  | 'recetas_medicas'
  | 'comprobantes_pago'
  | 'documentos_legales'
  | 'otros';

// Interfaz para archivos adjuntos en notas
export interface NoteAttachment {
  id: string;
  noteId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string; // MIME type
  category: DocumentCategory;
  description?: string;
  
  // Información médica específica
  esSensible: boolean; // Para información médica confidencial
  requiereAutorizacion?: boolean;
  fechaDocumento?: string; // Fecha del documento médico/receta
  medicoTratante?: string; // Para documentos médicos
  numeroReceta?: string; // Para recetas
  
  // Metadatos de archivo
  uploadedBy: string;
  uploadedAt: string;
  filePath: string; // Ruta donde se almacena el archivo
  
  // Control de acceso
  esPrivado: boolean;
  autorizadoPor?: string[];
}

// Notas internas del historial
export interface PolicyNote {
  id: string;
  policyId: string;
  renewalId?: string; // Si está relacionada con una renovación específica
  vigenciaId?: string; // Si está relacionada con una vigencia específica
  
  type: NoteType;
  titulo: string;
  contenido: string;
  
  // Archivos adjuntos
  attachments: NoteAttachment[];
  tieneArchivosAdjuntos: boolean;
  
  // Metadatos
  esImportante: boolean;
  esVisible: boolean; // Si se muestra en el historial principal
  
  // Seguimiento
  creadoPor: string;
  editadoPor?: string;
  fechaCreacion: string;
  fechaEdicion?: string;
  
  // Recordatorios
  esRecordatorio?: boolean;
  fechaRecordatorio?: string;
  recordatorioCompletado?: boolean;
}

// Historial completo de una póliza
export interface PolicyHistory {
  policyId: string;
  vigencias: PolicyVigencia[];
  renovaciones: PolicyRenewal[];
  notas: PolicyNote[];
  alertasRenovacion: RenewalAlert[];
  
  // Estadísticas del historial
  totalVigencias: number;
  totalRenovaciones: number;
  proximaRenovacion?: {
    fecha: string;
    diasRestantes: number;
    requiereAccion: boolean;
  };
  
  // Información específica para VIDA
  esProductoVida: boolean;
  renovacionesVidaEspeciales?: {
    renovacionesAutomaticas: number;
    renovacionesManuales: number;
    ultimaActualizacionBeneficiarios?: string;
  };
}

// Configuración de alertas de renovación
export const RENEWAL_ALERT_CONFIG = {
  '45_days': {
    days: 45,
    severity: 'info' as const,
    priority: 4,
    isPersistent: false,
    message: 'Renovación próxima en 45 días'
  },
  '30_days': {
    days: 30,
    severity: 'warning' as const,
    priority: 3,
    isPersistent: false,
    message: 'Renovación próxima en 30 días'
  },
  '15_days': {
    days: 15,
    severity: 'warning' as const,
    priority: 2,
    isPersistent: false,
    message: 'Renovación próxima en 15 días'
  },
  '7_days': {
    days: 7,
    severity: 'error' as const,
    priority: 1,
    isPersistent: true,
    message: 'Renovación próxima en 1 semana - ACCIÓN REQUERIDA'
  },
  'overdue': {
    days: 0,
    severity: 'critical' as const,
    priority: 0,
    isPersistent: true,
    message: 'RENOVACIÓN VENCIDA - ATENCIÓN INMEDIATA'
  }
} as const;

// Filtros para el historial
export interface HistoryFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoNota?: NoteType[];
  soloRenovaciones?: boolean;
  soloVigenciasActivas?: boolean;
  soloProductosVida?: boolean;
  conAlertasPendientes?: boolean;
}

// Estadísticas de renovaciones
export interface RenewalStatistics {
  totalPolicies: number;
  proximasRenovaciones: {
    en45Dias: number;
    en30Dias: number;
    en15Dias: number;
    en7Dias: number;
    vencidas: number;
  };
  productosVida: {
    total: number;
    proximasRenovaciones: number;
    renovacionesAutomaticas: number;
  };
  renovacionesProcesadas: {
    esteMes: number;
    esteAno: number;
    exitosas: number;
    fallidas: number;
  };
}

// Extensión del tipo Policy para incluir información de renovación
export interface PolicyWithRenewal extends Policy {
  historial?: PolicyHistory;
  proximaRenovacion?: {
    fecha: string;
    diasRestantes: number;
    tipoRenovacion: RenewalType;
    requiereDocumentacion: boolean;
    alertasActivas: RenewalAlert[];
  };
  esProductoVida: boolean;
  renovacionAutomatica: boolean;
}
