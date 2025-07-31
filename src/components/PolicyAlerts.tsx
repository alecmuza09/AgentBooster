import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle,
  FileText,
  Bell
} from 'lucide-react';
import { Policy } from '../types/policy';
import { differenceInDays, addDays, parseISO } from 'date-fns';

interface PolicyAlert {
  id: string;
  policyId: string;
  policyNumber: string;
  type: 'payment' | 'cancelled' | 'vigor' | 'anulada';
  severity: 'warning' | 'error' | 'info';
  message: string;
  dueDate: Date;
  daysUntilDue: number;
  isActive: boolean;
}

interface PolicyAlertsProps {
  policies: Policy[];
}

const getPaymentFrequencyDays = (formaDePago: string): number => {
  switch (formaDePago) {
    case 'Mensual': return 30;
    case 'Trimestral': return 90;
    case 'Semestral': return 180;
    case 'Anual': return 365;
    default: return 30;
  }
};

const getAlertDays = (formaDePago: string): number => {
  switch (formaDePago) {
    case 'Mensual': return 15;
    default: return 30;
  }
};

const calculateNextPaymentDate = (lastPaymentDate: string, formaDePago: string): Date => {
  const lastPayment = parseISO(lastPaymentDate);
  const frequencyDays = getPaymentFrequencyDays(formaDePago);
  return addDays(lastPayment, frequencyDays);
};

const generateAlerts = (policies: Policy[]): PolicyAlert[] => {
  const alerts: PolicyAlert[] = [];
  const today = new Date();

  policies.forEach(policy => {
    if (policy.status === 'active' && policy.fechaPagoActual) {
      const nextPaymentDate = calculateNextPaymentDate(policy.fechaPagoActual, policy.formaDePago);
      const alertDays = getAlertDays(policy.formaDePago);
      const daysUntilDue = differenceInDays(nextPaymentDate, today);

      // Alerta automática por pago próximo
      if (daysUntilDue <= alertDays && daysUntilDue >= 0) {
        alerts.push({
          id: `payment-${policy.id}`,
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          type: 'payment',
          severity: daysUntilDue <= 7 ? 'error' : 'warning',
          message: `Pago próximo: ${policy.policyNumber} - ${daysUntilDue} días restantes`,
          dueDate: nextPaymentDate,
          daysUntilDue,
          isActive: true
        });
      }

      // Alerta por pago vencido
      if (daysUntilDue < 0) {
        alerts.push({
          id: `overdue-${policy.id}`,
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          type: 'payment',
          severity: 'error',
          message: `Pago vencido: ${policy.policyNumber} - ${Math.abs(daysUntilDue)} días de retraso`,
          dueDate: nextPaymentDate,
          daysUntilDue,
          isActive: true
        });
      }
    }

    // Alertas manuales para estados especiales
    if (policy.status === 'cancelled') {
      alerts.push({
        id: `cancelled-${policy.id}`,
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        type: 'cancelled',
        severity: 'error',
        message: `Póliza cancelada: ${policy.policyNumber} - Requiere revisión manual`,
        dueDate: today,
        daysUntilDue: 0,
        isActive: true
      });
    }
  });

  return alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

export const PolicyAlerts: React.FC<PolicyAlertsProps> = ({ policies }) => {
  const [alerts, setAlerts] = useState<PolicyAlert[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const generatedAlerts = generateAlerts(policies);
    setAlerts(generatedAlerts);
  }, [policies]);

  const activeAlerts = alerts.filter(alert => alert.isActive);
  const displayedAlerts = showAll ? activeAlerts : activeAlerts.slice(0, 5);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Bell className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';
      default: return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200';
    }
  };

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertas de Pólizas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            No hay alertas activas. Todas las pólizas están al día.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Pólizas
            <Badge variant="secondary" className="ml-2">
              {activeAlerts.length}
            </Badge>
          </div>
          {activeAlerts.length > 5 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Mostrar menos' : 'Ver todas'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedAlerts.map((alert) => (
          <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <AlertTitle className="text-sm font-medium">
                    {alert.policyNumber}
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                      {alert.dueDate.toLocaleDateString()}
                    </span>
                    {alert.daysUntilDue >= 0 && (
                      <Badge variant="outline" className="text-xs">
                        {alert.daysUntilDue} días
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Ver póliza
              </Button>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default PolicyAlerts;
