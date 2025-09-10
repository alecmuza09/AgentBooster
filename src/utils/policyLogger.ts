// Sistema de logs para pólizas
import { Policy } from '@/types/policy';
import { PolicyLog } from '@/types/notes';

export type LogAction = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'payment_received'
  | 'payment_overdue'
  | 'renewal_processed'
  | 'renewal_due'
  | 'document_uploaded'
  | 'document_removed'
  | 'note_added'
  | 'note_updated'
  | 'note_deleted'
  | 'contact_made'
  | 'alert_created'
  | 'alert_resolved'
  | 'bulk_updated'
  | 'deleted';

export interface LogEntry {
  id: string;
  policyId: string;
  action: LogAction;
  description: string;
  oldValue?: any;
  newValue?: any;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'success';
}

// Configuración de acciones de log
export const LOG_ACTION_CONFIG = {
  created: {
    label: 'Póliza Creada',
    icon: '➕',
    color: 'green',
    severity: 'success' as const
  },
  updated: {
    label: 'Póliza Actualizada',
    icon: '✏️',
    color: 'blue',
    severity: 'info' as const
  },
  status_changed: {
    label: 'Estado Cambiado',
    icon: '🔄',
    color: 'orange',
    severity: 'warning' as const
  },
  payment_received: {
    label: 'Pago Recibido',
    icon: '💰',
    color: 'green',
    severity: 'success' as const
  },
  payment_overdue: {
    label: 'Pago Vencido',
    icon: '⚠️',
    color: 'red',
    severity: 'error' as const
  },
  renewal_processed: {
    label: 'Renovación Procesada',
    icon: '🔄',
    color: 'purple',
    severity: 'success' as const
  },
  renewal_due: {
    label: 'Renovación Próxima',
    icon: '📅',
    color: 'orange',
    severity: 'warning' as const
  },
  document_uploaded: {
    label: 'Documento Subido',
    icon: '📄',
    color: 'blue',
    severity: 'info' as const
  },
  document_removed: {
    label: 'Documento Eliminado',
    icon: '🗑️',
    color: 'red',
    severity: 'warning' as const
  },
  note_added: {
    label: 'Nota Agregada',
    icon: '📝',
    color: 'blue',
    severity: 'info' as const
  },
  note_updated: {
    label: 'Nota Actualizada',
    icon: '✏️',
    color: 'blue',
    severity: 'info' as const
  },
  note_deleted: {
    label: 'Nota Eliminada',
    icon: '🗑️',
    color: 'red',
    severity: 'warning' as const
  },
  contact_made: {
    label: 'Contacto Realizado',
    icon: '📞',
    color: 'green',
    severity: 'info' as const
  },
  alert_created: {
    label: 'Alerta Creada',
    icon: '🚨',
    color: 'red',
    severity: 'error' as const
  },
  alert_resolved: {
    label: 'Alerta Resuelta',
    icon: '✅',
    color: 'green',
    severity: 'success' as const
  },
  bulk_updated: {
    label: 'Actualización Masiva',
    icon: '📊',
    color: 'purple',
    severity: 'info' as const
  },
  deleted: {
    label: 'Póliza Eliminada',
    icon: '🗑️',
    color: 'red',
    severity: 'error' as const
  }
};

class PolicyLogger {
  private logs: LogEntry[] = [];

  // Crear un nuevo log
  createLog(
    policyId: string,
    action: LogAction,
    description: string,
    performedBy: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>
  ): LogEntry {
    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      policyId,
      action,
      description,
      oldValue,
      newValue,
      performedBy,
      performedAt: new Date().toISOString(),
      metadata,
      severity: LOG_ACTION_CONFIG[action].severity
    };

    this.logs.push(log);
    return log;
  }

  // Obtener logs de una póliza específica
  getPolicyLogs(policyId: string): LogEntry[] {
    return this.logs
      .filter(log => log.policyId === policyId)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Obtener todos los logs
  getAllLogs(): LogEntry[] {
    return this.logs.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Obtener logs por acción
  getLogsByAction(action: LogAction): LogEntry[] {
    return this.logs
      .filter(log => log.action === action)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Obtener logs por usuario
  getLogsByUser(performedBy: string): LogEntry[] {
    return this.logs
      .filter(log => log.performedBy === performedBy)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Obtener logs por rango de fechas
  getLogsByDateRange(startDate: Date, endDate: Date): LogEntry[] {
    return this.logs
      .filter(log => {
        const logDate = new Date(log.performedAt);
        return logDate >= startDate && logDate <= endDate;
      })
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Generar descripción automática para cambios de póliza
  generatePolicyChangeDescription(
    action: LogAction,
    policy: Policy,
    oldValue?: any,
    newValue?: any
  ): string {
    switch (action) {
      case 'created':
        return `Póliza ${policy.policyNumber} creada para ${policy.contratante.nombre}`;
      
      case 'updated':
        return `Póliza ${policy.policyNumber} actualizada`;
      
      case 'status_changed':
        return `Estado de póliza ${policy.policyNumber} cambiado de "${oldValue}" a "${newValue}"`;
      
      case 'payment_received':
        return `Pago recibido para póliza ${policy.policyNumber} - $${newValue || policy.total}`;
      
      case 'payment_overdue':
        return `Pago vencido para póliza ${policy.policyNumber} - $${policy.total}`;
      
      case 'renewal_processed':
        return `Renovación procesada para póliza ${policy.policyNumber}`;
      
      case 'renewal_due':
        return `Renovación próxima para póliza ${policy.policyNumber} - vence ${newValue}`;
      
      case 'document_uploaded':
        return `Documento "${newValue}" subido para póliza ${policy.policyNumber}`;
      
      case 'document_removed':
        return `Documento "${oldValue}" eliminado de póliza ${policy.policyNumber}`;
      
      case 'note_added':
        return `Nota agregada a póliza ${policy.policyNumber}: "${newValue}"`;
      
      case 'note_updated':
        return `Nota actualizada en póliza ${policy.policyNumber}`;
      
      case 'note_deleted':
        return `Nota eliminada de póliza ${policy.policyNumber}`;
      
      case 'contact_made':
        return `Contacto realizado con cliente de póliza ${policy.policyNumber}`;
      
      case 'alert_created':
        return `Alerta creada para póliza ${policy.policyNumber}: ${newValue}`;
      
      case 'alert_resolved':
        return `Alerta resuelta para póliza ${policy.policyNumber}`;
      
      case 'bulk_updated':
        return `Actualización masiva aplicada a póliza ${policy.policyNumber}`;
      
      case 'deleted':
        return `Póliza ${policy.policyNumber} eliminada`;
      
      default:
        return `Acción ${action} realizada en póliza ${policy.policyNumber}`;
    }
  }

  // Log automático para cambios de póliza
  logPolicyChange(
    policy: Policy,
    action: LogAction,
    performedBy: string,
    oldValue?: any,
    newValue?: any,
    customDescription?: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const description = customDescription || this.generatePolicyChangeDescription(
      action,
      policy,
      oldValue,
      newValue
    );

    return this.createLog(
      policy.id,
      action,
      description,
      performedBy,
      oldValue,
      newValue,
      metadata
    );
  }

  // Log para pagos
  logPayment(
    policy: Policy,
    amount: number,
    paymentDate: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      'payment_received',
      performedBy,
      undefined,
      amount,
      `Pago de $${amount} recibido el ${paymentDate}`,
      { ...metadata, paymentDate, amount }
    );
  }

  // Log para renovaciones
  logRenewal(
    policy: Policy,
    renewalType: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      'renewal_processed',
      performedBy,
      undefined,
      renewalType,
      `Renovación ${renewalType} procesada`,
      { ...metadata, renewalType }
    );
  }

  // Log para documentos
  logDocument(
    policy: Policy,
    action: 'document_uploaded' | 'document_removed',
    fileName: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      action,
      performedBy,
      action === 'document_removed' ? fileName : undefined,
      action === 'document_uploaded' ? fileName : undefined,
      undefined,
      { ...metadata, fileName }
    );
  }

  // Log para notas
  logNote(
    policy: Policy,
    action: 'note_added' | 'note_updated' | 'note_deleted',
    noteTitle: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      action,
      performedBy,
      action === 'note_deleted' ? noteTitle : undefined,
      action === 'note_added' ? noteTitle : undefined,
      undefined,
      { ...metadata, noteTitle }
    );
  }

  // Log para contactos
  logContact(
    policy: Policy,
    contactType: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      'contact_made',
      performedBy,
      undefined,
      contactType,
      `Contacto ${contactType} realizado`,
      { ...metadata, contactType }
    );
  }

  // Log para alertas
  logAlert(
    policy: Policy,
    action: 'alert_created' | 'alert_resolved',
    alertMessage: string,
    performedBy: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return this.logPolicyChange(
      policy,
      action,
      performedBy,
      action === 'alert_resolved' ? alertMessage : undefined,
      action === 'alert_created' ? alertMessage : undefined,
      undefined,
      { ...metadata, alertMessage }
    );
  }

  // Exportar logs a JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Importar logs desde JSON
  importLogs(logsJson: string): void {
    try {
      const importedLogs = JSON.parse(logsJson);
      if (Array.isArray(importedLogs)) {
        this.logs = [...this.logs, ...importedLogs];
      }
    } catch (error) {
      console.error('Error importing logs:', error);
    }
  }

  // Limpiar logs antiguos (más de X días)
  cleanOldLogs(daysToKeep: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.logs = this.logs.filter(log => 
      new Date(log.performedAt) > cutoffDate
    );
  }

  // Obtener estadísticas de logs
  getLogStatistics(): {
    totalLogs: number;
    logsByAction: Record<LogAction, number>;
    logsBySeverity: Record<string, number>;
    logsByUser: Record<string, number>;
    recentActivity: number; // logs en las últimas 24 horas
  } {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const logsByAction = {} as Record<LogAction, number>;
    const logsBySeverity = {} as Record<string, number>;
    const logsByUser = {} as Record<string, number>;

    this.logs.forEach(log => {
      // Por acción
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
      
      // Por severidad
      logsBySeverity[log.severity] = (logsBySeverity[log.severity] || 0) + 1;
      
      // Por usuario
      logsByUser[log.performedBy] = (logsByUser[log.performedBy] || 0) + 1;
    });

    const recentActivity = this.logs.filter(log => 
      new Date(log.performedAt) > yesterday
    ).length;

    return {
      totalLogs: this.logs.length,
      logsByAction,
      logsBySeverity,
      logsByUser,
      recentActivity
    };
  }
}

// Instancia singleton del logger
export const policyLogger = new PolicyLogger();

// Funciones de conveniencia para uso en componentes
export const logPolicyCreated = (policy: Policy, performedBy: string) => {
  return policyLogger.logPolicyChange(policy, 'created', performedBy);
};

export const logPolicyUpdated = (policy: Policy, performedBy: string, oldValue?: any, newValue?: any) => {
  return policyLogger.logPolicyChange(policy, 'updated', performedBy, oldValue, newValue);
};

export const logStatusChanged = (policy: Policy, oldStatus: string, newStatus: string, performedBy: string) => {
  return policyLogger.logPolicyChange(policy, 'status_changed', performedBy, oldStatus, newStatus);
};

export const logPaymentReceived = (policy: Policy, amount: number, paymentDate: string, performedBy: string) => {
  return policyLogger.logPayment(policy, amount, paymentDate, performedBy);
};

export const logRenewalProcessed = (policy: Policy, renewalType: string, performedBy: string) => {
  return policyLogger.logRenewal(policy, renewalType, performedBy);
};

export const logDocumentUploaded = (policy: Policy, fileName: string, performedBy: string) => {
  return policyLogger.logDocument(policy, 'document_uploaded', fileName, performedBy);
};

export const logNoteAdded = (policy: Policy, noteTitle: string, performedBy: string) => {
  return policyLogger.logNote(policy, 'note_added', noteTitle, performedBy);
};

export const logContactMade = (policy: Policy, contactType: string, performedBy: string) => {
  return policyLogger.logContact(policy, contactType, performedBy);
};

export const logAlertCreated = (policy: Policy, alertMessage: string, performedBy: string) => {
  return policyLogger.logAlert(policy, 'alert_created', alertMessage, performedBy);
};
