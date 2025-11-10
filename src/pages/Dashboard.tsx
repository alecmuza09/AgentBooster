import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PaymentAlertSystem } from '@/components/PaymentAlertSystem';
import { RenewalAlertSystem } from '@/components/RenewalAlertSystem';
import {
  TrendingUp,
  FileText,
  DollarSign,
  Target,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  PieChart,
  Download,
  RefreshCw,
  Zap,
  Building2,
  Bell
} from 'lucide-react';
import { Policy } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { getLeads } from '@/data/leads';
import { getClients } from '@/data/clients';
import { updatePolicyStatuses } from '@/utils/paymentUtils';
import { differenceInDays, parseISO, addDays } from 'date-fns';

interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  totalLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  pendingRenewals: number;
  overduePayments: number;
  thisMonthGrowth: number;
  lastMonthGrowth: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  gradient: string;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [policiesData, leadsData, clientsData] = await Promise.all([
                    getPolicies(),
                    getLeads(),
                    getClients()
                ]);

                setPolicies(policiesData);
                setLeads(leadsData);
                setClients(clientsData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

  // Calcular estadísticas enfocadas en cobranza y renovaciones
  const stats: DashboardStats = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === 'active').length,
    totalLeads: leads.length,
    conversionRate: leads.length > 0 ? (clients.length / leads.length) * 100 : 0,
    monthlyRevenue: policies.reduce((sum, p) => sum + (p.total || 0), 0),
    pendingRenewals: policies.filter(p => {
      if (!p.fecha_vigencia_final) return false;
      const today = new Date();
      const expirationDate = parseISO(p.fecha_vigencia_final);
      const daysUntilExpiration = differenceInDays(expirationDate, today);
      return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
    }).length,
    overduePayments: policies.filter(p => {
      if (!p.fecha_pago_actual) return false;
      const today = new Date();
      const lastPayment = parseISO(p.fecha_pago_actual);
      const frequencyDays = p.forma_de_pago === 'Mensual' ? 30 :
                           p.forma_de_pago === 'Trimestral' ? 90 :
                           p.forma_de_pago === 'Semestral' ? 180 : 365;
      const nextPaymentDate = addDays(lastPayment, frequencyDays);
      return differenceInDays(today, nextPaymentDate) > 0;
    }).length,
    thisMonthGrowth: 12.5,
    lastMonthGrowth: -2.3
  };

  // Acciones rápidas enfocadas en cobranza y renovaciones
  const quickActions: QuickAction[] = [
    {
      id: 'cobranza',
      title: 'Centro de Cobranza',
      description: 'Gestionar pagos pendientes y vencidos',
      icon: <DollarSign className="w-6 h-6" />,
      href: '/cobranza',
      color: 'text-red-600',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'renovaciones',
      title: 'Renovaciones',
      description: 'Procesar renovaciones próximas',
      icon: <RefreshCw className="w-6 h-6" />,
      href: '/cobranza?tab=renovaciones',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'alertas',
      title: 'Alertas Críticas',
      description: 'Ver alertas de pago y renovación',
      icon: <AlertTriangle className="w-6 h-6" />,
      href: '/cobranza?tab=alertas',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'nueva-póliza',
      title: 'Nueva Póliza',
      description: 'Crear una nueva póliza de seguro',
      icon: <FileText className="w-6 h-6" />,
      href: '/policies',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    }
  ];

  // Distribución por ramo
  const ramoDistribution = policies.reduce((acc, policy) => {
    acc[policy.ramo] = (acc[policy.ramo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top aseguradoras
  const topAseguradoras = policies.reduce((acc, policy) => {
    acc[policy.aseguradora] = (acc[policy.aseguradora] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAseguradorasList = Object.entries(topAseguradoras)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error al cargar datos</span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
                            </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                            <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  ¡Bienvenido de vuelta! 👋
                                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Aquí tienes un resumen de tu actividad reciente
                                </p>
                            </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    const fetchData = async () => {
                      try {
                        const [policiesData, leadsData, clientsData] = await Promise.all([
                          getPolicies(),
                          getLeads(),
                          getClients()
                        ]);
                        setPolicies(policiesData);
                        setLeads(leadsData);
                        setClients(clientsData);
                      } catch (err: any) {
                        setError(err.message);
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    fetchData();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    // Función para exportar datos del dashboard
                    const exportData = {
                      fecha: new Date().toISOString(),
                      estadisticas: stats,
                      politicas: policies.length,
                      resumen: {
                        totalPoliticas: stats.totalPolicies,
                        politicasActivas: stats.activePolicies,
                        pagosVencidos: stats.overduePayments,
                        renovacionesProximas: stats.pendingRenewals
                      }
                    };
                    
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

      <div className="px-6 lg:px-8 pb-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.thisMonthGrowth > 0 ? '+' : ''}{stats.thisMonthGrowth}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.totalPolicies}</p>
                  <p className="text-blue-100 text-sm">Total Pólizas</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{stats.thisMonthGrowth}% vs mes anterior</span>
                    </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.pendingRenewals}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.pendingRenewals}</p>
                  <p className="text-purple-100 text-sm">Renovaciones Próximas</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Próximas a vencer en 30 días</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.activePolicies}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.activePolicies}</p>
                  <p className="text-green-100 text-sm">Pólizas Activas</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Target className="w-4 h-4 mr-1" />
                  <span>{((stats.activePolicies / stats.totalPolicies) * 100).toFixed(1)}% del total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.overduePayments}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.overduePayments}</p>
                  <p className="text-red-100 text-sm">Pagos Vencidos</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Requieren atención inmediata</span>
                </div>
              </CardContent>
            </Card>
                                                    </div>

          {/* Acciones rápidas */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Zap className="w-5 h-5 text-blue-600" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800"
                    onClick={() => navigate(action.href)}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} text-white`}>
                      {action.icon}
                                                </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">{action.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </Button>
                ))}
                                </div>
            </CardContent>
          </Card>

          {/* Alertas Críticas - Sección destacada */}
          {stats.overduePayments > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                  ⚠️ ALERTAS CRÍTICAS - Atención Inmediata Requerida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.overduePayments}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Pagos Vencidos</p>
                  </div>
                  <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.pendingRenewals}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Renovaciones Próximas</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {stats.overduePayments + stats.pendingRenewals}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Total Crítico</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => navigate('/cobranza')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Ir al Centro de Cobranza
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Alertas de pago */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Bell className="w-5 h-5 text-orange-600" />
                    Alertas y Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PaymentAlertSystem
                    policies={policies}
                    onMarkPaymentConfirmed={(policyId) => {
                      setPolicies(prev => prev.map(policy => 
                        policy.id === policyId 
                          ? { ...policy, status: 'active', hasPendingPayment: false }
                          : policy
                      ));
                    }}
                    onViewPolicy={(policyId) => {
                      // Redirigir al módulo de cobranza para gestionar el pago
                      navigate(`/cobranza?action=payment&policy=${policyId}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <RenewalAlertSystem
                    policies={policies}
                    onProcessRenewal={(policyId) => {
                      // Redirigir al módulo de cobranza para procesar renovación
                      navigate(`/cobranza?action=renewal&policy=${policyId}`);
                    }}
                    onViewPolicy={(policyId) => {
                      // Redirigir al módulo de cobranza para ver detalles
                      navigate(`/cobranza?policy=${policyId}`);
                    }}
                  />
                </CardContent>
              </Card>
                            </div>

            {/* Estadísticas adicionales */}
            <div className="space-y-6">
              
              {/* Distribución por ramo */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Distribución por Ramo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(ramoDistribution)
                      .sort(([,a], [,b]) => b - a)
                      .map(([ramo, count]) => {
                        const percentage = (count / stats.totalPolicies) * 100;
                        const ramoColors = {
                          'Vida': 'from-purple-500 to-pink-500',
                          'Gastos Médicos Mayores': 'from-blue-500 to-cyan-500',
                          'Auto': 'from-green-500 to-emerald-500',
                          'Hogar': 'from-orange-500 to-yellow-500',
                          'Empresarial': 'from-red-500 to-rose-500'
                        };
                        return (
                          <div key={ramo} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${ramoColors[ramo as keyof typeof ramoColors] || 'from-gray-500 to-gray-600'}`}></div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ramo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={percentage} 
                                className="w-20 h-2"
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Top aseguradoras */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Top Aseguradoras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topAseguradorasList.map(([aseguradora, count], index) => {
                      const percentage = (count / stats.totalPolicies) * 100;
                      const rankColors = [
                        'from-yellow-500 to-yellow-600', // 1st
                        'from-gray-400 to-gray-500',     // 2nd
                        'from-orange-500 to-orange-600', // 3rd
                        'from-blue-500 to-blue-600',     // 4th
                        'from-purple-500 to-purple-600'  // 5th
                      ];
                      return (
                        <div key={aseguradora} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[index] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-sm font-bold`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{aseguradora}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{count} pólizas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs mb-1">
                              {percentage.toFixed(1)}%
                            </Badge>
                            <div className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${rankColors[index] || 'from-gray-500 to-gray-600'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de cobranza */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Métricas de Cobranza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pólizas Activas</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {stats.activePolicies}/{stats.totalPolicies}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.activePolicies / stats.totalPolicies) * 100} 
                      className="h-2"
                    />
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pagos Vencidos</span>
                      <span className="text-sm font-medium text-red-600">{stats.overduePayments}</span>
                    </div>
                    <Progress 
                      value={(stats.overduePayments / stats.totalPolicies) * 100} 
                      className="h-2 bg-red-100 dark:bg-red-900/20"
                    />
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Renovaciones Próximas</span>
                      <span className="text-sm font-medium text-purple-600">{stats.pendingRenewals}</span>
                    </div>
                    <Progress 
                      value={(stats.pendingRenewals / stats.totalPolicies) * 100} 
                      className="h-2 bg-purple-100 dark:bg-purple-900/20"
                    />

                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tasa de Cobranza</span>
                      <span className="text-sm font-medium text-green-600">85.5%</span>
                    </div>
                    <Progress 
                      value={85.5} 
                      className="h-2 bg-green-100 dark:bg-green-900/20"
                    />
                  </div>
                </CardContent>
              </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
        </div>
    );
};