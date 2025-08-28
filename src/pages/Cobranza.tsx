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
  RefreshCw
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
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
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
    </div>
  );
};
