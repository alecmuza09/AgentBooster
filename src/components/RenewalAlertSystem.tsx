import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  RefreshCw,
  Calendar, 
  AlertTriangle, 
  Clock, 
  Bell,
  Heart,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Shield
} from 'lucide-react';
import { Policy } from '../types/policy';
import { 
  RenewalAlert, 
  RENEWAL_ALERT_CONFIG,
  PolicyWithRenewal,
  RenewalStatistics 
} from '../types/renewal';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface RenewalAlertSystemProps {
  policies: Policy[];
  onProcessRenewal?: (policyId: string) => void;
  onMarkRenewalProcessed?: (policyId: string) => void;
  onViewPolicy?: (policyId: string) => void;
}

// Generar alertas de renovación para una póliza
const generateRenewalAlertsForPolicy = (policy: Policy): RenewalAlert[] => {
  if (!policy.fechaVigenciaFinal) return [];

  const today = new Date();
  const expirationDate = parseISO(policy.fechaVigenciaFinal);
  const daysUntilExpiration = differenceInDays(expirationDate, today);
  const alerts: RenewalAlert[] = [];

  // Verificar cada tipo de alerta
  Object.entries(RENEWAL_ALERT_CONFIG).forEach(([alertType, config]) => {
    let shouldCreateAlert = false;
    
    if (alertType === 'overdue') {
      shouldCreateAlert = daysUntilExpiration < 0;
    } else {
      shouldCreateAlert = daysUntilExpiration <= config.days && daysUntilExpiration >= 0;
    }

    if (shouldCreateAlert) {
      const alertId = `renewal-${policy.id}-${alertType}`;
      
      let message = '';
      if (daysUntilExpiration < 0) {
        const daysOverdue = Math.abs(daysUntilExpiration);
        message = `🚨 RENOVACIÓN VENCIDA - ${daysOverdue} día${daysOverdue > 1 ? 's' : ''} de retraso`;
      } else if (daysUntilExpiration === 0) {
        message = '🔔 Renovación vence HOY';
      } else {
        message = `Renovación próxima en ${daysUntilExpiration} día${daysUntilExpiration > 1 ? 's' : ''}`;
      }

      alerts.push({
        id: alertId,
        renewalId: `pending-${policy.id}`,
        policyId: policy.id,
        type: `renewal_${alertType}` as any,
        severity: config.severity,
        message,
        diasHastaVencimiento: daysUntilExpiration,
        fechaVencimiento: policy.fechaVigenciaFinal,
        isPersistent: config.isPersistent,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
  });

  return alerts.sort((a, b) => a.diasHastaVencimiento - b.diasHastaVencimiento);
};

// Generar todas las alertas de renovación
const generateAllRenewalAlerts = (policies: Policy[]): RenewalAlert[] => {
  const allAlerts: RenewalAlert[] = [];
  
  policies.forEach(policy => {
    const policyAlerts = generateRenewalAlertsForPolicy(policy);
    allAlerts.push(...policyAlerts);
  });

  // Ordenar por prioridad (días hasta vencimiento)
  return allAlerts.sort((a, b) => {
    // Primero las vencidas (días negativos)
    if (a.diasHastaVencimiento < 0 && b.diasHastaVencimiento >= 0) return -1;
    if (a.diasHastaVencimiento >= 0 && b.diasHastaVencimiento < 0) return 1;
    
    // Luego por días hasta vencimiento
    return a.diasHastaVencimiento - b.diasHastaVencimiento;
  });
};

// Calcular estadísticas de renovación
const calculateRenewalStatistics = (policies: Policy[]): RenewalStatistics => {
  const stats: RenewalStatistics = {
    totalPolicies: policies.length,
    proximasRenovaciones: {
      en45Dias: 0,
      en30Dias: 0,
      en15Dias: 0,
      en7Dias: 0,
      vencidas: 0
    },
    productosVida: {
      total: 0,
      proximasRenovaciones: 0,
      renovacionesAutomaticas: 0
    },
    renovacionesProcesadas: {
      esteMes: 0,
      esteAno: 0,
      exitosas: 0,
      fallidas: 0
    }
  };

  const today = new Date();

  policies.forEach(policy => {
    if (!policy.fechaVigenciaFinal) return;

    const expirationDate = parseISO(policy.fechaVigenciaFinal);
    const daysUntilExpiration = differenceInDays(expirationDate, today);

    // Contar por categorías de días
    if (daysUntilExpiration < 0) {
      stats.proximasRenovaciones.vencidas++;
    } else if (daysUntilExpiration <= 7) {
      stats.proximasRenovaciones.en7Dias++;
    } else if (daysUntilExpiration <= 15) {
      stats.proximasRenovaciones.en15Dias++;
    } else if (daysUntilExpiration <= 30) {
      stats.proximasRenovaciones.en30Dias++;
    } else if (daysUntilExpiration <= 45) {
      stats.proximasRenovaciones.en45Dias++;
    }

    // Estadísticas específicas de productos VIDA
    if (policy.ramo === 'Vida') {
      stats.productosVida.total++;
      if (daysUntilExpiration <= 45) {
        stats.productosVida.proximasRenovaciones++;
      }
      // Asumir que VIDA tiene renovación automática por defecto
      stats.productosVida.renovacionesAutomaticas++;
    }
  });

  return stats;
};

export const RenewalAlertSystem: React.FC<RenewalAlertSystemProps> = ({
  policies,
  onProcessRenewal,
  onMarkRenewalProcessed,
  onViewPolicy
}) => {
  const [alerts, setAlerts] = useState<RenewalAlert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hiddenAlerts, setHiddenAlerts] = useState<Set<string>>(new Set());

  // Generar alertas cuando cambien las pólizas
  useEffect(() => {
    const generatedAlerts = generateAllRenewalAlerts(policies);
    setAlerts(generatedAlerts);
  }, [policies]);

  // Calcular estadísticas
  const statistics = useMemo(() => calculateRenewalStatistics(policies), [policies]);

  // Filtrar alertas
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => 
      alert.isActive && 
      !hiddenAlerts.has(alert.id)
    );

    if (filterCategory !== 'all') {
      filtered = filtered.filter(alert => {
        switch (filterCategory) {
          case '45_days': return alert.diasHastaVencimiento <= 45 && alert.diasHastaVencimiento > 30;
          case '30_days': return alert.diasHastaVencimiento <= 30 && alert.diasHastaVencimiento > 15;
          case '15_days': return alert.diasHastaVencimiento <= 15 && alert.diasHastaVencimiento > 7;
          case '7_days': return alert.diasHastaVencimiento <= 7 && alert.diasHastaVencimiento >= 0;
          case 'overdue': return alert.diasHastaVencimiento < 0;
          case 'vida': return policies.find(p => p.id === alert.policyId)?.ramo === 'Vida';
          default: return true;
        }
      });
    }

    return filtered;
  }, [alerts, filterCategory, hiddenAlerts, policies]);

  // Alertas a mostrar (limitadas o todas)
  const displayedAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, 10);

  const handleHideAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert && !alert.isPersistent) {
      setHiddenAlerts(prev => new Set([...prev, alertId]));
    }
  };

  const handleProcessRenewal = (policyId: string) => {
    // Marcar alertas como procesadas
    setAlerts(prev => prev.map(alert => 
      alert.policyId === policyId ? { ...alert, isActive: false } : alert
    ));
    onProcessRenewal?.(policyId);
  };

  const getSeverityIcon = (severity: RenewalAlert['severity']) => {
    switch (severity) {
      case 'critical': return <Zap className="h-5 w-5 text-red-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Calendar className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColors = (severity: RenewalAlert['severity'], isPersistent: boolean) => {
    const baseColors = {
      critical: {
        container: 'border-red-500 bg-red-100 dark:bg-red-950 shadow-lg shadow-red-200 dark:shadow-red-900/50',
        text: 'text-red-900 dark:text-red-100',
        badge: 'bg-red-600 text-white animate-pulse'
      },
      error: {
        container: 'border-orange-400 bg-orange-50 dark:bg-orange-950/70',
        text: 'text-orange-800 dark:text-orange-200',
        badge: 'bg-orange-500 text-white'
      },
      warning: {
        container: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/70',
        text: 'text-yellow-800 dark:text-yellow-200',
        badge: 'bg-yellow-500 text-white'
      },
      info: {
        container: 'border-blue-300 bg-blue-50 dark:bg-blue-950/70',
        text: 'text-blue-800 dark:text-blue-200',
        badge: 'bg-blue-500 text-white'
      }
    };

    return baseColors[severity] || baseColors.info;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case '45_days': return '45 días';
      case '30_days': return '30 días';
      case '15_days': return '15 días';
      case '7_days': return '1 semana';
      case 'overdue': return 'Vencidas';
      case 'vida': return 'Productos VIDA';
      default: return 'Todas';
    }
  };

  if (filteredAlerts.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Sistema de Alertas de Renovación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700 dark:text-green-300 mb-1">
              ¡Excelente! No hay alertas de renovación pendientes
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Todas las pólizas están al día con sus renovaciones
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
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Sistema de Alertas de Renovación</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión inteligente de vencimientos y renovaciones
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
              {statistics.proximasRenovaciones.vencidas} Vencidas
            </Badge>
            <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
              {statistics.proximasRenovaciones.en7Dias} Esta Semana
            </Badge>
            <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
              💜 {statistics.productosVida.proximasRenovaciones} VIDA
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              {filteredAlerts.length} Total
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
            Todas ({alerts.length})
          </Button>
          {[
            { key: '45_days', count: statistics.proximasRenovaciones.en45Dias },
            { key: '30_days', count: statistics.proximasRenovaciones.en30Dias },
            { key: '15_days', count: statistics.proximasRenovaciones.en15Dias },
            { key: '7_days', count: statistics.proximasRenovaciones.en7Dias },
            { key: 'overdue', count: statistics.proximasRenovaciones.vencidas },
            { key: 'vida', count: statistics.productosVida.proximasRenovaciones }
          ].map(({ key, count }) => {
            if (count === 0) return null;
            
            return (
              <Button
                key={key}
                variant={filterCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(key)}
                className={key === 'vida' ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' : ''}
              >
                {key === 'vida' && '💜 '}
                {getCategoryLabel(key)} ({count})
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayedAlerts.map((alert) => {
          const policy = policies.find(p => p.id === alert.policyId);
          if (!policy) return null;

          const colors = getSeverityColors(alert.severity, alert.isPersistent);
          const isVidaProduct = policy.ramo === 'Vida';
          
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
                        {policy.policyNumber}
                      </AlertTitle>
                      {isVidaProduct && (
                        <Badge className="bg-purple-600 text-white">
                          <Heart className="w-3 h-3 mr-1" />
                          VIDA
                        </Badge>
                      )}
                      {alert.isPersistent && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                          <Bell className="w-3 h-3 mr-1" />
                          Persistente
                        </Badge>
                      )}
                    </div>

                    <AlertDescription className={`text-sm ${colors.text} mb-3`}>
                      <div className="font-medium mb-1">
                        {policy.contratante?.nombre || 'Cliente sin nombre'}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Vence: {format(parseISO(alert.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {policy.ramo}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {policy.aseguradora}
                        </span>
                      </div>
                    </AlertDescription>

                    <div className={`text-sm font-medium ${colors.text}`}>
                      {alert.message}
                    </div>

                    {/* Información específica para VIDA */}
                    {isVidaProduct && (
                      <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <p className="text-xs text-purple-800 dark:text-purple-200">
                          💜 Producto VIDA - Renovación especial requerida
                        </p>
                      </div>
                    )}
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
                      onClick={() => handleProcessRenewal(alert.policyId)}
                      className="text-xs bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Procesar
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
        {filteredAlerts.length > 10 && (
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

        {/* Información adicional sobre persistencia */}
        {filteredAlerts.some(a => a.isPersistent) && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Alertas Persistentes Activas</p>
                <p>
                  Las alertas de renovación de 1 semana y las vencidas permanecerán visibles 
                  hasta que se procese la renovación correspondiente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información especial para productos VIDA */}
        {statistics.productosVida.proximasRenovaciones > 0 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-purple-800 dark:text-purple-200">
                <p className="font-medium mb-1">💜 Productos VIDA - Atención Especial</p>
                <p>
                  {statistics.productosVida.proximasRenovaciones} póliza{statistics.productosVida.proximasRenovaciones !== 1 ? 's' : ''} 
                  {' '}de VIDA requiere{statistics.productosVida.proximasRenovaciones === 1 ? '' : 'n'} renovación. 
                  Estos productos pueden requerir documentación adicional o revisión de beneficiarios.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
