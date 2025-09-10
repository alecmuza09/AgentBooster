import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { PaymentAlertSystem } from '@/components/PaymentAlertSystem';
import { Modal } from '@/components/Modal';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  CreditCard,
  Banknote,
  PiggyBank,
  Target,
  Users,
  Building2,
  Zap,
  Bell,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  RotateCcw,
  Car,
  Database,
  Trash,
  Upload,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import { Policy } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { 
  calculatePaymentStatus, 
  getPaymentStatistics, 
  updatePolicyStatuses,
  getPolicyStatusDisplay 
} from '@/utils/paymentUtils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos específicos para cobranza
interface CobranzaAction {
  id: string;
  policyId: string;
  type: 'call' | 'email' | 'sms' | 'visit' | 'legal' | 'payment_plan';
  status: 'pending' | 'completed' | 'failed' | 'scheduled';
  description: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdBy: string;
}

interface PaymentPlan {
  id: string;
  policyId: string;
  totalAmount: number;
  installments: {
    number: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
  }[];
  status: 'active' | 'completed' | 'cancelled';
  createdDate: string;
  notes?: string;
}

interface CobranzaStats {
  totalPendingAmount: number;
  totalOverdueAmount: number;
  totalPoliciesWithDebt: number;
  averageDebtPerPolicy: number;
  collectionRate: number;
  thisMonthCollected: number;
  pendingActions: number;
  successfulContacts: number;
}

export const Cobranza: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');
  const [contactFilter, setContactFilter] = useState<string>('all');
  
  // Estados para modales y acciones
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isAutoInsuranceViewOpen, setIsAutoInsuranceViewOpen] = useState(false);
  
  // Estados para acciones de cobranza
  const [cobranzaActions, setCobranzaActions] = useState<CobranzaAction[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  
  // Nuevas acciones
  const [newAction, setNewAction] = useState({
    type: 'call' as CobranzaAction['type'],
    description: '',
    scheduledDate: '',
    notes: ''
  });

  // Estados para renovación
  const [renewalData, setRenewalData] = useState({
    newPremium: '',
    newStartDate: '',
    newEndDate: '',
    notes: ''
  });

  // Estados para movimientos de póliza
  const [policyMovement, setPolicyMovement] = useState({
    type: 'status_change' as 'status_change' | 'payment' | 'renewal' | 'cancellation' | 'endorsement',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Estados para exportación
  const [exportOptions, setExportOptions] = useState({
    format: 'excel' as 'excel' | 'csv' | 'pdf',
    includeActions: true,
    includeHistory: true,
    dateRange: 'all' as 'all' | 'current_month' | 'last_3_months' | 'custom',
    customStartDate: '',
    customEndDate: ''
  });

  // Estados para limpieza de datos
  const [cleanupOptions, setCleanupOptions] = useState({
    deleteOldActions: false,
    deleteOldLogs: false,
    archiveOldPolicies: false,
    daysOld: 365
  });

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Timeout de seguridad para evitar carga infinita
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.error('Cobranza: Timeout en carga de datos');
          setError('La carga de datos está tomando demasiado tiempo. Por favor, recarga la página.');
          setIsLoading(false);
        }
      }, 10000); // 10 segundos de timeout
      
      try {
        console.log('Cobranza: Iniciando carga de datos...');
        const policiesData = await getPolicies();
        console.log('Cobranza: Datos de pólizas cargados:', policiesData.length);
        
        // updatePolicyStatuses no es async
        const updatedPolicies = updatePolicyStatuses(policiesData);
        console.log('Cobranza: Pólizas actualizadas:', updatedPolicies.length);
        
        setPolicies(updatedPolicies);
        console.log('Cobranza: Estado actualizado correctamente');
        
        // Limpiar timeout si la carga fue exitosa
        clearTimeout(timeoutId);
      } catch (err: any) {
        console.error('Cobranza: Error cargando datos:', err);
        setError(err.message || 'Error desconocido al cargar los datos');
        clearTimeout(timeoutId);
      } finally {
        setIsLoading(false);
        console.log('Cobranza: Carga de datos completada');
      }
    };

    fetchData();
  }, []);

  // Calcular estadísticas de cobranza
  const cobranzaStats = useMemo((): CobranzaStats => {
    const policiesWithPaymentIssues = policies.filter(policy => {
      const paymentStatus = calculatePaymentStatus(policy);
      return paymentStatus.isCritical || paymentStatus.requiresImmedateAttention;
    });

    const totalPendingAmount = policiesWithPaymentIssues.reduce((sum, policy) => sum + (policy.total || 0), 0);
    const overdueAmount = policies
      .filter(p => calculatePaymentStatus(p).isCritical)
      .reduce((sum, policy) => sum + (policy.total || 0), 0);

    return {
      totalPendingAmount,
      totalOverdueAmount: overdueAmount,
      totalPoliciesWithDebt: policiesWithPaymentIssues.length,
      averageDebtPerPolicy: policiesWithPaymentIssues.length > 0 ? totalPendingAmount / policiesWithPaymentIssues.length : 0,
      collectionRate: 85.5, // Mock data - en implementación real vendría de la base de datos
      thisMonthCollected: 450000, // Mock data
      pendingActions: cobranzaActions.filter(a => a.status === 'pending').length,
      successfulContacts: cobranzaActions.filter(a => a.status === 'completed').length
    };
  }, [policies, cobranzaActions]);

  // Filtrar pólizas para cobranza
  const filteredPolicies = useMemo(() => {
    let filtered = policies.filter(policy => {
      const paymentStatus = calculatePaymentStatus(policy);
      return paymentStatus.isCritical || paymentStatus.requiresImmedateAttention || policy.hasPendingPayment;
    });

    // Aplicar filtros
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(policy =>
        policy.policyNumber.toLowerCase().includes(search) ||
        policy.contratante?.nombre?.toLowerCase().includes(search) ||
        policy.contratante?.rfc?.toLowerCase().includes(search) ||
        policy.asegurado?.nombre?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => {
        const paymentStatus = calculatePaymentStatus(policy);
        switch (statusFilter) {
          case 'critical': return policy.status === 'overdue_critical';
          case 'overdue': return paymentStatus.isCritical && policy.status !== 'overdue_critical';
          case 'due_soon': return paymentStatus.requiresImmedateAttention && !paymentStatus.isCritical;
          default: return true;
        }
      });
    }

    if (amountFilter !== 'all') {
      filtered = filtered.filter(policy => {
        const amount = policy.total || 0;
        switch (amountFilter) {
          case 'high': return amount >= 50000;
          case 'medium': return amount >= 10000 && amount < 50000;
          case 'low': return amount < 10000;
          default: return true;
        }
      });
    }

    // Ordenar por prioridad (más críticos primero)
    return filtered.sort((a, b) => {
      const aStatus = calculatePaymentStatus(a);
      const bStatus = calculatePaymentStatus(b);
      
      if (a.status === 'overdue_critical' && b.status !== 'overdue_critical') return -1;
      if (b.status === 'overdue_critical' && a.status !== 'overdue_critical') return 1;
      
      if (aStatus.isCritical && !bStatus.isCritical) return -1;
      if (bStatus.isCritical && !aStatus.isCritical) return 1;
      
      return bStatus.daysOverdue - aStatus.daysOverdue;
    });
  }, [policies, searchTerm, statusFilter, amountFilter]);

  // Funciones para acciones
  const handleCreateAction = () => {
    if (!selectedPolicy || !newAction.description.trim()) return;

    const action: CobranzaAction = {
      id: `action-${Date.now()}`,
      policyId: selectedPolicy.id,
      type: newAction.type,
      status: newAction.scheduledDate ? 'scheduled' : 'pending',
      description: newAction.description,
      scheduledDate: newAction.scheduledDate || undefined,
      notes: newAction.notes || undefined,
      createdBy: 'Usuario Actual' // En implementación real vendría del contexto
    };

    setCobranzaActions(prev => [action, ...prev]);
    setNewAction({ type: 'call', description: '', scheduledDate: '', notes: '' });
    setIsActionModalOpen(false);
  };

  const handleMarkPaymentReceived = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { 
            ...policy, 
            fechaPagoActual: new Date().toISOString().split('T')[0], 
            status: 'active',
            hasPendingPayment: false 
          }
        : policy
    ));
  };

  // Función para procesar renovación
  const handleProcessRenewal = () => {
    if (!selectedPolicy || !renewalData.newPremium || !renewalData.newStartDate || !renewalData.newEndDate) return;

    // Crear nueva póliza renovada
    const renewedPolicy: Policy = {
      ...selectedPolicy,
      id: `renewed-${selectedPolicy.id}-${Date.now()}`,
      policyNumber: `${selectedPolicy.policyNumber}-REN`,
      fechaInicio: renewalData.newStartDate,
      fechaVencimiento: renewalData.newEndDate,
      total: parseFloat(renewalData.newPremium),
      status: 'active',
      hasPendingPayment: false,
      fechaPagoActual: new Date().toISOString().split('T')[0]
    };

    // Agregar a la lista de pólizas
    setPolicies(prev => [renewedPolicy, ...prev]);

    // Marcar póliza original como renovada
    setPolicies(prev => prev.map(policy => 
      policy.id === selectedPolicy.id 
        ? { ...policy, status: 'renewed' }
        : policy
    ));

    // Limpiar formulario
    setRenewalData({ newPremium: '', newStartDate: '', newEndDate: '', notes: '' });
    setIsRenewalModalOpen(false);
  };

  // Función para registrar movimiento de póliza
  const handleRegisterMovement = () => {
    if (!selectedPolicy || !policyMovement.description.trim()) return;

    // Crear movimiento
    const movement = {
      id: `movement-${Date.now()}`,
      policyId: selectedPolicy.id,
      type: policyMovement.type,
      description: policyMovement.description,
      amount: policyMovement.amount ? parseFloat(policyMovement.amount) : undefined,
      date: policyMovement.date,
      notes: policyMovement.notes,
      createdBy: 'Usuario Actual'
    };

    // Aquí se guardaría en la base de datos
    console.log('Movimiento registrado:', movement);

    // Limpiar formulario
    setPolicyMovement({
      type: 'status_change',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsMovementModalOpen(false);
  };

  // Función para exportar cartera
  const handleExportPortfolio = () => {
    const exportData = {
      policies: filteredPolicies,
      actions: exportOptions.includeActions ? cobranzaActions : [],
      exportDate: new Date().toISOString(),
      format: exportOptions.format
    };

    // Simular exportación
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cartera-cobranza-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
  };

  // Función para limpiar datos
  const handleCleanupData = () => {
    // Simular limpieza de datos
    if (cleanupOptions.deleteOldActions) {
      setCobranzaActions(prev => prev.filter(action => {
        const actionDate = new Date(action.completedDate || action.scheduledDate || '');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - cleanupOptions.daysOld);
        return actionDate > cutoffDate;
      }));
    }

    // Mostrar confirmación
    alert(`Limpieza completada. Se eliminaron registros anteriores a ${cleanupOptions.daysOld} días.`);
    setIsCleanupModalOpen(false);
  };

  const getPriorityLevel = (policy: Policy): { level: 'critical' | 'high' | 'medium' | 'low'; label: string; color: string } => {
    const paymentStatus = calculatePaymentStatus(policy);
    
    if (policy.status === 'overdue_critical') {
      return { level: 'critical', label: 'CRÍTICO', color: 'bg-red-600 text-white animate-pulse' };
    } else if (paymentStatus.isCritical) {
      return { level: 'high', label: 'ALTO', color: 'bg-red-500 text-white' };
    } else if (paymentStatus.requiresImmedateAttention) {
      return { level: 'medium', label: 'MEDIO', color: 'bg-yellow-500 text-white' };
    } else {
      return { level: 'low', label: 'BAJO', color: 'bg-green-500 text-white' };
    }
  };

  const getActionTypeIcon = (type: CobranzaAction['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'visit': return <Users className="w-4 h-4" />;
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'payment_plan': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando módulo de cobranza...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar datos de cobranza</AlertTitle>
          <AlertDescription className="mb-4">
            {error}
            <br />
            <small className="text-gray-600">
              Verifica tu conexión a internet y las credenciales de Supabase.
            </small>
          </AlertDescription>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar página
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50">
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Centro de Cobranza
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión integral de pagos pendientes y recuperación de cartera
            </p>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Monto Pendiente</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    ${cobranzaStats.totalPendingAmount.toLocaleString('es-MX')}
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Monto Vencido</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    ${cobranzaStats.totalOverdueAmount.toLocaleString('es-MX')}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pólizas con Deuda</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {cobranzaStats.totalPoliciesWithDebt}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Tasa de Cobranza</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {cobranzaStats.collectionRate}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sistema de Alertas de Pago */}
      <PaymentAlertSystem
        policies={policies}
        onMarkPaymentConfirmed={handleMarkPaymentReceived}
        onViewPolicy={(policyId) => {
          const policy = policies.find(p => p.id === policyId);
          if (policy) setSelectedPolicy(policy);
        }}
      />

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Cobranza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Póliza, cliente, RFC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                  <SelectItem value="due_soon">Próximos a Vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Monto</label>
              <Select value={amountFilter} onValueChange={setAmountFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">Alto (≥$50,000)</SelectItem>
                  <SelectItem value="medium">Medio ($10,000-$49,999)</SelectItem>
                  <SelectItem value="low">Bajo (&lt;$10,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setAmountFilter('all');
                }}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cobranza */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Cartera de Cobranza ({filteredPolicies.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCleanupModalOpen(true)}
              >
                <Trash className="w-4 h-4 mr-2" />
                Limpiar Datos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAutoInsuranceViewOpen(true)}
              >
                <Car className="w-4 h-4 mr-2" />
                Seguros de Auto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Póliza</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Días Vencido</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Último Contacto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy) => {
                    const paymentStatus = calculatePaymentStatus(policy);
                    const priority = getPriorityLevel(policy);
                    const lastAction = cobranzaActions
                      .filter(a => a.policyId === policy.id)
                      .sort((a, b) => new Date(b.completedDate || b.scheduledDate || '').getTime() - new Date(a.completedDate || a.scheduledDate || '').getTime())[0];

                    return (
                      <TableRow key={policy.id} className={policy.status === 'overdue_critical' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{policy.policyNumber}</p>
                            <p className="text-sm text-gray-500">{policy.aseguradora}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{policy.contratante?.nombre}</p>
                            <p className="text-sm text-gray-500">{policy.contratante?.rfc}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={paymentStatus.daysOverdue > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {paymentStatus.daysOverdue > 0 ? paymentStatus.daysOverdue : 0} días
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-lg">
                            ${(policy.total || 0).toLocaleString('es-MX')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lastAction ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                {getActionTypeIcon(lastAction.type)}
                                <span className="capitalize">{lastAction.type}</span>
                              </div>
                              <p className="text-gray-500">
                                {lastAction.completedDate ? 
                                  format(parseISO(lastAction.completedDate), 'dd/MM/yyyy', { locale: es }) :
                                  'Programado'
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin contacto</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setIsActionModalOpen(true);
                              }}
                              title="Nueva acción"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setIsContactModalOpen(true);
                              }}
                              title="Contactar"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setIsRenewalModalOpen(true);
                              }}
                              title="Renovar póliza"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setIsMovementModalOpen(true);
                              }}
                              title="Registrar movimiento"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkPaymentReceived(policy.id)}
                              className="bg-green-600 hover:bg-green-700"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-12 h-12" />
                        <p className="text-lg font-medium">¡Excelente trabajo!</p>
                        <p>No hay pagos pendientes de cobranza</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para nueva acción */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`Nueva Acción de Cobranza - ${selectedPolicy?.policyNumber || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Acción</label>
              <Select value={newAction.type} onValueChange={(value) => setNewAction(prev => ({ ...prev, type: value as CobranzaAction['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Llamada Telefónica</SelectItem>
                  <SelectItem value="email">Envío de Email</SelectItem>
                  <SelectItem value="sms">Mensaje SMS</SelectItem>
                  <SelectItem value="visit">Visita Personal</SelectItem>
                  <SelectItem value="legal">Acción Legal</SelectItem>
                  <SelectItem value="payment_plan">Plan de Pagos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha Programada (Opcional)</label>
              <Input
                type="datetime-local"
                value={newAction.scheduledDate}
                onChange={(e) => setNewAction(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Descripción</label>
            <Textarea
              placeholder="Describe la acción a realizar..."
              value={newAction.description}
              onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Notas Adicionales</label>
            <Textarea
              placeholder="Notas internas, observaciones..."
              value={newAction.notes}
              onChange={(e) => setNewAction(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAction}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Acción
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de contacto rápido */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={`Contactar Cliente - ${selectedPolicy?.policyNumber || ''}`}
        size="md"
      >
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Información de Contacto</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Cliente:</strong> {selectedPolicy.contratante?.nombre}</p>
                <p><strong>Teléfono:</strong> {selectedPolicy.contratante?.telefono || 'No disponible'}</p>
                <p><strong>Email:</strong> {selectedPolicy.contratante?.correo || 'No disponible'}</p>
                <p><strong>Monto Adeudado:</strong> ${(selectedPolicy.total || 0).toLocaleString('es-MX')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button className="flex items-center justify-center gap-2" onClick={() => window.open(`tel:${selectedPolicy.contratante?.telefono}`)}>
                <Phone className="w-4 h-4" />
                Llamar
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2" onClick={() => window.open(`mailto:${selectedPolicy.contratante?.correo}`)}>
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Carta
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Renovación */}
      <Modal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        title={`Renovar Póliza - ${selectedPolicy?.policyNumber || ''}`}
        size="lg"
      >
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Información de la Póliza Actual</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Cliente:</strong> {selectedPolicy.contratante?.nombre}</p>
                  <p><strong>Prima Actual:</strong> ${(selectedPolicy.total || 0).toLocaleString('es-MX')}</p>
                </div>
                <div>
                  <p><strong>Vigencia:</strong> {format(parseISO(selectedPolicy.fechaInicio), 'dd/MM/yyyy', { locale: es })} - {format(parseISO(selectedPolicy.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}</p>
                  <p><strong>Ramo:</strong> {selectedPolicy.ramo}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nueva Prima</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={renewalData.newPremium}
                  onChange={(e) => setRenewalData(prev => ({ ...prev, newPremium: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={renewalData.newStartDate}
                  onChange={(e) => setRenewalData(prev => ({ ...prev, newStartDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha de Vencimiento</label>
                <Input
                  type="date"
                  value={renewalData.newEndDate}
                  onChange={(e) => setRenewalData(prev => ({ ...prev, newEndDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notas de Renovación</label>
                <Textarea
                  placeholder="Observaciones sobre la renovación..."
                  value={renewalData.notes}
                  onChange={(e) => setRenewalData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRenewalModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleProcessRenewal} className="bg-blue-600 hover:bg-blue-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Procesar Renovación
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Movimiento de Póliza */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title={`Registrar Movimiento - ${selectedPolicy?.policyNumber || ''}`}
        size="lg"
      >
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Movimiento</label>
                <Select value={policyMovement.type} onValueChange={(value) => setPolicyMovement(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status_change">Cambio de Estado</SelectItem>
                    <SelectItem value="payment">Pago Recibido</SelectItem>
                    <SelectItem value="renewal">Renovación</SelectItem>
                    <SelectItem value="cancellation">Cancelación</SelectItem>
                    <SelectItem value="endorsement">Endoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha del Movimiento</label>
                <Input
                  type="date"
                  value={policyMovement.date}
                  onChange={(e) => setPolicyMovement(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Monto (si aplica)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={policyMovement.amount}
                  onChange={(e) => setPolicyMovement(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descripción del Movimiento</label>
              <Textarea
                placeholder="Describe el movimiento realizado..."
                value={policyMovement.description}
                onChange={(e) => setPolicyMovement(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notas Adicionales</label>
              <Textarea
                placeholder="Notas internas, observaciones..."
                value={policyMovement.notes}
                onChange={(e) => setPolicyMovement(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMovementModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterMovement}>
                <Edit className="w-4 h-4 mr-2" />
                Registrar Movimiento
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Exportación */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Cartera de Cobranza"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Formato de Exportación</label>
              <Select value={exportOptions.format} onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
              <Select value={exportOptions.dateRange} onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los registros</SelectItem>
                  <SelectItem value="current_month">Mes actual</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                  <SelectItem value="custom">Rango personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {exportOptions.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={exportOptions.customStartDate}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha de Fin</label>
                <Input
                  type="date"
                  value={exportOptions.customEndDate}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeActions"
                checked={exportOptions.includeActions}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeActions: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeActions" className="text-sm">Incluir historial de acciones</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeHistory"
                checked={exportOptions.includeHistory}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeHistory: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeHistory" className="text-sm">Incluir historial de movimientos</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportPortfolio} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Cartera
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Limpieza de Datos */}
      <Modal
        isOpen={isCleanupModalOpen}
        onClose={() => setIsCleanupModalOpen(false)}
        title="Limpieza de Datos"
        size="lg"
      >
        <div className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              Esta acción eliminará permanentemente los datos seleccionados. Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Eliminar registros anteriores a:</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={cleanupOptions.daysOld}
                onChange={(e) => setCleanupOptions(prev => ({ ...prev, daysOld: parseInt(e.target.value) || 365 }))}
                className="w-24"
              />
              <span className="text-sm text-gray-600">días</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="deleteOldActions"
                checked={cleanupOptions.deleteOldActions}
                onChange={(e) => setCleanupOptions(prev => ({ ...prev, deleteOldActions: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="deleteOldActions" className="text-sm">Eliminar acciones de cobranza antiguas</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="deleteOldLogs"
                checked={cleanupOptions.deleteOldLogs}
                onChange={(e) => setCleanupOptions(prev => ({ ...prev, deleteOldLogs: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="deleteOldLogs" className="text-sm">Eliminar logs antiguos</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="archiveOldPolicies"
                checked={cleanupOptions.archiveOldPolicies}
                onChange={(e) => setCleanupOptions(prev => ({ ...prev, archiveOldPolicies: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="archiveOldPolicies" className="text-sm">Archivar pólizas antiguas</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCleanupModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCleanupData} className="bg-red-600 hover:bg-red-700">
              <Trash className="w-4 h-4 mr-2" />
              Ejecutar Limpieza
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Vista de Seguros de Auto */}
      <Modal
        isOpen={isAutoInsuranceViewOpen}
        onClose={() => setIsAutoInsuranceViewOpen(false)}
        title="Seguros de Auto - Vista Especializada"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Pólizas de Auto en Cobranza
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vista especializada para seguros de auto con variables específicas del vehículo
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Póliza</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Número de Serie</TableHead>
                  <TableHead>Tipo de Carro</TableHead>
                  <TableHead>Modelo/Año</TableHead>
                  <TableHead>Monto Adeudado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies
                  .filter(policy => policy.ramo?.toLowerCase().includes('auto') || policy.ramo?.toLowerCase().includes('vehicular'))
                  .map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{policy.policyNumber}</p>
                          <p className="text-sm text-gray-500">{policy.aseguradora}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{policy.contratante?.nombre}</p>
                          <p className="text-sm text-gray-500">{policy.contratante?.rfc}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>Vehículo</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {policy.policyNumber.slice(-8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Sedán</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">2020</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-lg">
                          ${(policy.total || 0).toLocaleString('es-MX')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsRenewalModalOpen(true);
                            }}
                            title="Renovar póliza de auto"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsContactModalOpen(true);
                            }}
                            title="Contactar cliente"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPolicies.filter(policy => policy.ramo?.toLowerCase().includes('auto') || policy.ramo?.toLowerCase().includes('vehicular')).length === 0 && (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay pólizas de auto en cobranza
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
