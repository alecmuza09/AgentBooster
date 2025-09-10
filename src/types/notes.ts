// Tipos para el sistema de notas y logs de pólizas

export type NoteType = 
  | 'general'
  | 'renovacion'
  | 'pago'
  | 'contacto_cliente'
  | 'nota_interna'
  | 'alerta'
  | 'documento'
  | 'cambio_estado'
  | 'comunicacion'
  | 'seguimiento';

export type NotePriority = 'baja' | 'media' | 'alta' | 'critica';

export interface NoteAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PolicyNote {
  id: string;
  policyId: string;
  type: NoteType;
  priority: NotePriority;
  title: string;
  content: string;
  attachments: NoteAttachment[];
  isInternal: boolean; // Si es solo para uso interno
  isAlert: boolean; // Si requiere atención especial
  alertExpiry?: string; // Fecha de expiración de la alerta
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[]; // Etiquetas para categorización
  relatedPolicyId?: string; // Para notas relacionadas con otras pólizas
}

export interface PolicyLog {
  id: string;
  policyId: string;
  action: string; // 'created', 'updated', 'status_changed', 'payment_received', etc.
  description: string;
  oldValue?: any;
  newValue?: any;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>; // Datos adicionales específicos de la acción
}

export interface PolicyHistory {
  id: string;
  policyId: string;
  type: 'vigencia' | 'renovacion' | 'pago' | 'cambio_estado' | 'documento' | 'nota';
  title: string;
  description: string;
  date: string;
  status?: string;
  amount?: number;
  currency?: string;
  performedBy: string;
  metadata?: Record<string, any>;
}

// Configuración de tipos de notas
export const NOTE_TYPE_CONFIG = {
  general: {
    label: 'General',
    icon: '📝',
    color: 'blue',
    description: 'Nota general sobre la póliza'
  },
  renovacion: {
    label: 'Renovación',
    icon: '🔄',
    color: 'purple',
    description: 'Información relacionada con renovaciones'
  },
  pago: {
    label: 'Pago',
    icon: '💰',
    color: 'green',
    description: 'Información sobre pagos y cobranza'
  },
  contacto_cliente: {
    label: 'Contacto con Cliente',
    icon: '📞',
    color: 'orange',
    description: 'Registro de comunicación con el cliente'
  },
  nota_interna: {
    label: 'Nota Interna',
    icon: '🔒',
    color: 'gray',
    description: 'Información confidencial para uso interno'
  },
  alerta: {
    label: 'Alerta',
    icon: '⚠️',
    color: 'red',
    description: 'Alerta que requiere atención especial'
  },
  documento: {
    label: 'Documento',
    icon: '📄',
    color: 'indigo',
    description: 'Información sobre documentos adjuntos'
  },
  cambio_estado: {
    label: 'Cambio de Estado',
    icon: '🔄',
    color: 'yellow',
    description: 'Registro de cambios en el estado de la póliza'
  },
  comunicacion: {
    label: 'Comunicación',
    icon: '💬',
    color: 'cyan',
    description: 'Registro de comunicaciones externas'
  },
  seguimiento: {
    label: 'Seguimiento',
    icon: '👁️',
    color: 'pink',
    description: 'Notas de seguimiento y recordatorios'
  }
};

export const NOTE_PRIORITY_CONFIG = {
  baja: {
    label: 'Baja',
    color: 'green',
    icon: '🟢'
  },
  media: {
    label: 'Media',
    color: 'yellow',
    icon: '🟡'
  },
  alta: {
    label: 'Alta',
    color: 'orange',
    icon: '🟠'
  },
  critica: {
    label: 'Crítica',
    color: 'red',
    icon: '🔴'
  }
};
