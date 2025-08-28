import { Policy, PolicyStatus } from '@/types/policy';
import { differenceInDays, parseISO, addDays } from 'date-fns';

export interface PaymentStatus {
  status: PolicyStatus;
  daysOverdue: number;
  nextPaymentDate: Date;
  isCritical: boolean;
  requiresImmedateAttention: boolean;
}

/**
 * Calcula el estado de pago de una póliza
 */
export const calculatePaymentStatus = (policy: Policy): PaymentStatus => {
  if (!policy.fechaPagoActual) {
    return {
      status: policy.status,
      daysOverdue: 0,
      nextPaymentDate: new Date(),
      isCritical: false,
      requiresImmedateAttention: false
    };
  }

  const nextPaymentDate = calculateNextPaymentDate(policy.fechaPagoActual, policy.formaDePago);
  const today = new Date();
  const daysUntilDue = differenceInDays(nextPaymentDate, today);
  const daysOverdue = Math.abs(daysUntilDue);

  let newStatus: PolicyStatus = policy.status;
  let isCritical = false;
  let requiresImmedateAttention = false;

  // Determinar el estado basado en los días de retraso
  if (daysUntilDue < 0) {
    // Pago vencido
    if (daysOverdue > 7) {
      // Más de 7 días de retraso = Vencido Super Destacado
      newStatus = 'overdue_critical';
      isCritical = true;
      requiresImmedateAttention = true;
    } else {
      // 1-7 días de retraso = mantener activa pero con alerta crítica
      newStatus = 'active';
      isCritical = true;
      requiresImmedateAttention = true;
    }
  } else if (daysUntilDue <= 7) {
    // Próximo a vencer (7 días o menos)
    requiresImmedateAttention = true;
  }

  return {
    status: newStatus,
    daysOverdue: daysOverdue,
    nextPaymentDate,
    isCritical,
    requiresImmedateAttention
  };
};

/**
 * Actualiza automáticamente el estado de las pólizas basado en vencimientos
 */
export const updatePolicyStatuses = (policies: Policy[]): Policy[] => {
  return policies.map(policy => {
    const paymentStatus = calculatePaymentStatus(policy);
    
    // Solo actualizar si el estado ha cambiado
    if (paymentStatus.status !== policy.status) {
      return {
        ...policy,
        status: paymentStatus.status,
        hasPendingPayment: paymentStatus.requiresImmedateAttention
      };
    }
    
    return {
      ...policy,
      hasPendingPayment: paymentStatus.requiresImmedateAttention
    };
  });
};

/**
 * Calcula la próxima fecha de pago basada en la frecuencia
 */
export const calculateNextPaymentDate = (lastPaymentDate: string, formaDePago: string): Date => {
  const lastPayment = parseISO(lastPaymentDate);
  
  switch (formaDePago) {
    case 'Mensual':
      return addDays(lastPayment, 30);
    case 'Trimestral':
      return addDays(lastPayment, 90);
    case 'Semestral':
      return addDays(lastPayment, 180);
    case 'Anual':
      return addDays(lastPayment, 365);
    default:
      return addDays(lastPayment, 30);
  }
};

/**
 * Obtiene el color y estilo para mostrar el estado de la póliza
 */
export const getPolicyStatusDisplay = (policy: Policy) => {
  const paymentStatus = calculatePaymentStatus(policy);
  
  switch (policy.status) {
    case 'overdue_critical':
      return {
        label: 'Vencido Super Destacado',
        color: 'bg-red-600 text-white',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: '🚨',
        priority: 1,
        description: `${paymentStatus.daysOverdue} días de retraso crítico`
      };
    case 'active':
      if (paymentStatus.isCritical) {
        return {
          label: 'Pago Vencido',
          color: 'bg-orange-500 text-white',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          icon: '⚠️',
          priority: 2,
          description: `${paymentStatus.daysOverdue} días de retraso`
        };
      } else if (paymentStatus.requiresImmedateAttention) {
        return {
          label: 'Pago Próximo',
          color: 'bg-yellow-500 text-white',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: '🔔',
          priority: 3,
          description: `Vence en ${Math.abs(differenceInDays(paymentStatus.nextPaymentDate, new Date()))} días`
        };
      } else {
        return {
          label: 'Activa',
          color: 'bg-green-500 text-white',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: '✅',
          priority: 5,
          description: 'Al día con pagos'
        };
      }
    case 'cancelled':
      return {
        label: 'Cancelada',
        color: 'bg-gray-500 text-white',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200',
        icon: '❌',
        priority: 4,
        description: 'Póliza cancelada'
      };
    case 'expired':
      return {
        label: 'Expirada',
        color: 'bg-purple-500 text-white',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: '📅',
        priority: 4,
        description: 'Póliza expirada'
      };
    default:
      return {
        label: 'Pendiente',
        color: 'bg-blue-500 text-white',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: '⏳',
        priority: 3,
        description: 'Estado pendiente'
      };
  }
};

/**
 * Filtra pólizas por estado de pago
 */
export const filterPoliciesByPaymentStatus = (
  policies: Policy[], 
  statusFilter: 'all' | 'current' | 'due_soon' | 'overdue' | 'critical'
): Policy[] => {
  if (statusFilter === 'all') return policies;

  return policies.filter(policy => {
    const paymentStatus = calculatePaymentStatus(policy);
    
    switch (statusFilter) {
      case 'current':
        return !paymentStatus.isCritical && !paymentStatus.requiresImmedateAttention;
      case 'due_soon':
        return paymentStatus.requiresImmedateAttention && !paymentStatus.isCritical;
      case 'overdue':
        return paymentStatus.isCritical && policy.status !== 'overdue_critical';
      case 'critical':
        return policy.status === 'overdue_critical';
      default:
        return true;
    }
  });
};

/**
 * Obtiene estadísticas de pagos
 */
export const getPaymentStatistics = (policies: Policy[]) => {
  const stats = {
    total: policies.length,
    current: 0,
    dueSoon: 0,
    overdue: 0,
    critical: 0,
    totalAmount: 0,
    overdueAmount: 0
  };

  policies.forEach(policy => {
    const paymentStatus = calculatePaymentStatus(policy);
    const amount = policy.total || 0;
    
    stats.totalAmount += amount;
    
    if (policy.status === 'overdue_critical') {
      stats.critical++;
      stats.overdueAmount += amount;
    } else if (paymentStatus.isCritical) {
      stats.overdue++;
      stats.overdueAmount += amount;
    } else if (paymentStatus.requiresImmedateAttention) {
      stats.dueSoon++;
    } else {
      stats.current++;
    }
  });

  return stats;
};

/**
 * Marca un pago como confirmado
 */
export const markPaymentConfirmed = (policy: Policy): Policy => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    ...policy,
    fechaPagoActual: today,
    status: 'active',
    hasPendingPayment: false,
    ultimaAlertaEnviada: undefined,
    comprobantePagoPath: undefined,
    requiereComprobante: policy.conductoDePago === 'Domiciliado'
  };
};
