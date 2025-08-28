import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle,
  FileText,
  Bell,
  Zap,
  CreditCard,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Policy } from '../types/policy';
import { differenceInDays, addDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos mejorados para el sistema de alertas
export interface PaymentAlert {
  id: string;
  policyId: string;
  policyNumber: string;
  clientName: string;
  type: 'payment_due' | 'overdue' | 'overdue_critical';
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: '30_days' | '15_days' | '10_days' | '7_days' | 'overdue';
  message: string;
  dueDate: Date;
  daysUntilDue: number;
  amount: number;
  isActive: boolean;
  isPersistent: boolean;
  lastAlertSent?: string;
  paymentConfirmed: boolean;
  priority: number; // 1 = más alta, 5 = más baja
}

interface PaymentAlertSystemProps {
  policies: Policy[];
  onMarkPaymentConfirmed?: (policyId: string) => void;
  onViewPolicy?: (policyId: string) => void;
}

// Configuración de segmentación por días
const ALERT_SEGMENTS = {
  '30_days': { days: 30, severity: 'info' as const, priority: 4 },
  '15_days': { days: 15, severity: 'warning' as const, priority: 3 },
  '10_days': { days: 10, severity: 'warning' as const, priority: 2 },
  '7_days': { days: 7, severity: 'error' as const, priority: 1 },
  'overdue': { days: 0, severity: 'critical' as const, priority: 0 }
};

const getPaymentFrequencyDays = (formaDePago: string): number => {
  switch (formaDePago) {
    case 'Mensual': return 30;
    case 'Trimestral': return 90;
    case 'Semestral': return 180;
    case 'Anual': return 365;
    default: return 30;
  }
};

const calculateNextPaymentDate = (lastPaymentDate: string, formaDePago: string): Date => {
  const lastPayment = parseISO(lastPaymentDate);
  const frequencyDays = getPaymentFrequencyDays(formaDePago);
  return addDays(lastPayment, frequencyDays);
};

const determineAlertCategory = (daysUntilDue: number): keyof typeof ALERT_SEGMENTS => {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return '7_days';
  if (daysUntilDue <= 10) return '10_days';
  if (daysUntilDue <= 15) return '15_days';
  if (daysUntilDue <= 30) return '30_days';
  return '30_days'; // fallback
};

const generatePaymentAlerts = (policies: Policy[]): PaymentAlert[] => {
  const alerts: PaymentAlert[] = [];
  const today = new Date();

  policies.forEach(policy => {
    // Solo generar alertas para pólizas activas con fecha de pago
    if ((policy.status === 'active' || policy.status === 'overdue_critical') && policy.fechaPagoActual) {
      const nextPaymentDate = calculateNextPaymentDate(policy.fechaPagoActual, policy.formaDePago);
      const daysUntilDue = differenceInDays(nextPaymentDate, today);
      
      // Determinar si debe generar alerta (dentro de 30 días o vencida)
      if (daysUntilDue <= 30) {
        const category = determineAlertCategory(daysUntilDue);
        const segmentConfig = ALERT_SEGMENTS[category];
        
        // Determinar tipo y severidad
        let type: PaymentAlert['type'] = 'payment_due';
        let severity = segmentConfig.severity;
        
        if (daysUntilDue < 0) {
          type = Math.abs(daysUntilDue) > 7 ? 'overdue_critical' : 'overdue';
          severity = 'critical';
        }

        // Generar mensaje personalizado
        let message = '';
        if (daysUntilDue < 0) {
          const daysOverdue = Math.abs(daysUntilDue);
          if (daysOverdue > 7) {
            message = `⚠️ PAGO VENCIDO CRÍTICO - ${daysOverdue} días de retraso`;
          } else {
            message = `Pago vencido - ${daysOverdue} día${daysOverdue > 1 ? 's' : ''} de retraso`;
          }
        } else if (daysUntilDue === 0) {
          message = '🔔 Pago vence HOY';
        } else {
          message = `Pago próximo en ${daysUntilDue} día${daysUntilDue > 1 ? 's' : ''}`;
        }

        const clientName = policy.contratante?.nombre || 'Cliente sin nombre';

        alerts.push({
          id: `payment-${policy.id}-${category}`,
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          clientName,
          type,
          severity,
          category,
          message,
          dueDate: nextPaymentDate,
          daysUntilDue,
          amount: policy.total || 0,
          isActive: true,
          isPersistent: daysUntilDue <= 7 || daysUntilDue < 0, // Persistente para 1 semana o vencidas
          lastAlertSent: policy.ultimaAlertaEnviada,
          paymentConfirmed: false,
          priority: segmentConfig.priority
        });
      }
    }
  });

  // Ordenar por prioridad (0 = más crítica) y luego por días hasta vencimiento
  return alerts.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.daysUntilDue - b.daysUntilDue;
  });
};

export const PaymentAlertSystem: React.FC<PaymentAlertSystemProps> = ({ 
  policies, 
  onMarkPaymentConfirmed,
  onViewPolicy 
}) => {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hiddenAlerts, setHiddenAlerts] = useState<Set<string>>(new Set());

  // Generar alertas cuando cambien las pólizas
  useEffect(() => {
    const generatedAlerts = generatePaymentAlerts(policies);
    setAlerts(generatedAlerts);
  }, [policies]);

  // Filtrar alertas
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => 
      alert.isActive && 
      !alert.paymentConfirmed && 
      !hiddenAlerts.has(alert.id)
    );

    if (filterCategory !== 'all') {
      filtered = filtered.filter(alert => alert.category === filterCategory);
    }

    return filtered;
  }, [alerts, filterCategory, hiddenAlerts]);

  // Alertas a mostrar (limitadas o todas)
  const displayedAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, 8);

  // Estadísticas por categoría
  const alertStats = useMemo(() => {
    const stats = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      overdue: filteredAlerts.filter(a => a.type === 'overdue' || a.type === 'overdue_critical').length,
      persistent: filteredAlerts.filter(a => a.isPersistent).length
    };
    return stats;
  }, [filteredAlerts]);

  const handleConfirmPayment = (alertId: string, policyId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, paymentConfirmed: true, isActive: false } : alert
    ));
    onMarkPaymentConfirmed?.(policyId);
  };

  const handleHideAlert = (alertId: string) => {
    setHiddenAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityIcon = (severity: PaymentAlert['severity']) => {
    switch (severity) {
      case 'critical': return <Zap className="h-5 w-5" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColors = (severity: PaymentAlert['severity'], type: PaymentAlert['type']) => {
    if (type === 'overdue_critical') {
      return {
        container: 'border-red-500 bg-red-100 dark:bg-red-950 shadow-lg shadow-red-200 dark:shadow-red-900/50',
        text: 'text-red-900 dark:text-red-100',
        badge: 'bg-red-600 text-white animate-pulse'
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          container: 'border-red-400 bg-red-50 dark:bg-red-950/70',
          text: 'text-red-800 dark:text-red-200',
          badge: 'bg-red-500 text-white'
        };
      case 'error':
        return {
          container: 'border-orange-300 bg-orange-50 dark:bg-orange-950/70',
          text: 'text-orange-800 dark:text-orange-200',
          badge: 'bg-orange-500 text-white'
        };
      case 'warning':
        return {
          container: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/70',
          text: 'text-yellow-800 dark:text-yellow-200',
          badge: 'bg-yellow-500 text-white'
        };
      case 'info':
        return {
          container: 'border-blue-300 bg-blue-50 dark:bg-blue-950/70',
          text: 'text-blue-800 dark:text-blue-200',
          badge: 'bg-blue-500 text-white'
        };
      default:
        return {
          container: 'border-gray-300 bg-gray-50 dark:bg-gray-950/70',
          text: 'text-gray-800 dark:text-gray-200',
          badge: 'bg-gray-500 text-white'
        };
    }
  };

  const getCategoryLabel = (category: keyof typeof ALERT_SEGMENTS) => {
    switch (category) {
      case '30_days': return '30 días';
      case '15_days': return '15 días';
      case '10_days': return '10 días';
      case '7_days': return '1 semana';
      case 'overdue': return 'Vencido';
      default: return category;
    }
  };

  if (filteredAlerts.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Sistema de Cobranza y Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700 dark:text-green-300 mb-1">
              ¡Excelente! No hay alertas de pago pendientes
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Todas las pólizas están al día con sus pagos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Sistema de Cobranza y Alertas</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión inteligente de vencimientos y pagos
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
              {alertStats.critical} Críticas
            </Badge>
            <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
              {alertStats.overdue} Vencidas
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              {alertStats.total} Total
            </Badge>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('all')}
          >
            Todas ({alertStats.total})
          </Button>
          {Object.entries(ALERT_SEGMENTS).map(([category, config]) => {
            const count = filteredAlerts.filter(a => a.category === category).length;
            if (count === 0) return null;
            
            return (
              <Button
                key={category}
                variant={filterCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(category)}
              >
                {getCategoryLabel(category as keyof typeof ALERT_SEGMENTS)} ({count})
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayedAlerts.map((alert) => {
          const colors = getSeverityColors(alert.severity, alert.type);
          
          return (
            <Alert key={alert.id} className={`${colors.container} transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icono de severidad */}
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>

                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTitle className={`text-base font-semibold ${colors.text}`}>
                        {alert.policyNumber}
                      </AlertTitle>
                      <Badge className={colors.badge}>
                        {getCategoryLabel(alert.category)}
                      </Badge>
                      {alert.isPersistent && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                          <Bell className="w-3 h-3 mr-1" />
                          Persistente
                        </Badge>
                      )}
                    </div>

                    <AlertDescription className={`text-sm ${colors.text} mb-3`}>
                      <div className="font-medium mb-1">{alert.clientName}</div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Vence: {format(alert.dueDate, 'dd/MM/yyyy', { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${alert.amount.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </AlertDescription>

                    <div className={`text-sm font-medium ${colors.text}`}>
                      {alert.message}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPolicy?.(alert.policyId)}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConfirmPayment(alert.id, alert.policyId)}
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmar Pago
                    </Button>
                    {!alert.isPersistent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHideAlert(alert.id)}
                        className="text-xs"
                      >
                        <EyeOff className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          );
        })}

        {/* Botón para mostrar más */}
        {filteredAlerts.length > 8 && (
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll 
                ? `Mostrar menos (${displayedAlerts.length} de ${filteredAlerts.length})` 
                : `Ver todas las alertas (${filteredAlerts.length - displayedAlerts.length} más)`
              }
            </Button>
          </div>
        )}

        {/* Información adicional */}
        {alertStats.persistent > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Alertas Persistentes Activas</p>
                <p>
                  {alertStats.persistent} alerta{alertStats.persistent !== 1 ? 's' : ''} 
                  {' '}permanecerá{alertStats.persistent === 1 ? '' : 'n'} visible{alertStats.persistent === 1 ? '' : 's'} 
                  {' '}hasta que se confirme el pago correspondiente.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
