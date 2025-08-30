import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PaymentAlertSystem } from '@/components/PaymentAlertSystem';
import { RenewalAlertSystem } from '@/components/RenewalAlertSystem';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  DollarSign, 
  Target,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Star,
  Award,
  Zap,
  Shield,
  Heart,
  Building2,
  Car,
  Home,
  Briefcase,
  UserCheck,
  UserX,
  CalendarDays,
  Clock3,
  AlertCircle,
  Bell,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Policy } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { updatePolicyStatuses } from '@/utils/paymentUtils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const policiesData = await getPolicies();
        const updatedPolicies = updatePolicyStatuses(policiesData);
        setPolicies(updatedPolicies);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular estadísticas
  const stats: DashboardStats = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === 'active').length,
    totalLeads: 45, // Mock data
    conversionRate: 68.5,
    monthlyRevenue: 125000,
    pendingRenewals: policies.filter(p => p.status === 'pending_renewal').length,
    overduePayments: policies.filter(p => p.status === 'overdue_critical').length,
    thisMonthGrowth: 12.5,
    lastMonthGrowth: -2.3
  };

  // Acciones rápidas
  const quickActions: QuickAction[] = [
    {
      id: 'new-policy',
      title: 'Nueva Póliza',
      description: 'Crear una nueva póliza de seguro',
      icon: <FileText className="w-6 h-6" />,
      href: '/policies',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'new-lead',
      title: 'Nuevo Lead',
      description: 'Agregar un nuevo prospecto',
      icon: <Users className="w-6 h-6" />,
      href: '/leads',
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'cobranza',
      title: 'Cobranza',
      description: 'Gestionar pagos pendientes',
      icon: <DollarSign className="w-6 h-6" />,
      href: '/cobranza',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'reports',
      title: 'Reportes',
      description: 'Ver análisis y métricas',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/reports',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
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
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
                <Button size="sm">
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

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.conversionRate}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-green-100 text-sm">Leads Activos</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <UserCheck className="w-4 h-4 mr-1" />
                  <span>Tasa de conversión {stats.conversionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    +{stats.lastMonthGrowth}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">${(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-purple-100 text-sm">Ingresos Mensuales</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{stats.lastMonthGrowth}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.activePolicies}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.activePolicies}</p>
                  <p className="text-orange-100 text-sm">Pólizas Activas</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>{((stats.activePolicies / stats.totalPolicies) * 100).toFixed(1)}% activas</span>
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
                    onClick={() => window.location.href = action.href}
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
                      window.location.href = `/policies?policy=${policyId}`;
                    }}
                  />
                  
                  <Separator />
                  
                  <RenewalAlertSystem
                    policies={policies}
                    onProcessRenewal={(policyId) => {
                      setPolicies(prev => prev.map(policy =>
                        policy.id === policyId
                          ? { ...policy, status: 'pending_renewal' }
                          : policy
                      ));
                    }}
                    onViewPolicy={(policyId) => {
                      window.location.href = `/policies?policy=${policyId}`;
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
                    {Object.entries(ramoDistribution).map(([ramo, count]) => (
                      <div key={ramo} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ramo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / stats.totalPolicies) * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    {topAseguradorasList.map(([aseguradora, count], index) => (
                      <div key={aseguradora} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{aseguradora}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{count} pólizas</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {((count / stats.totalPolicies) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de rendimiento */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Activity className="w-5 h-5 text-green-600" />
                    Rendimiento
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
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tasa de Conversión</span>
                      <span className="text-sm font-medium text-green-600">{stats.conversionRate}%</span>
                    </div>
                    <Progress 
                      value={stats.conversionRate} 
                      className="h-2 bg-green-100 dark:bg-green-900/20"
                    />
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pagos Pendientes</span>
                      <span className="text-sm font-medium text-orange-600">{stats.overduePayments}</span>
                    </div>
                    <Progress 
                      value={(stats.overduePayments / stats.totalPolicies) * 100} 
                      className="h-2 bg-orange-100 dark:bg-orange-900/20"
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