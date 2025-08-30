import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Target,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Star,
  Award,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ChevronDown,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock3,
  CalendarDays,
  UserCircle,
  Briefcase,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LeadsKanbanView } from '@/components/LeadsKanbanView';
import { LeadsListView } from '@/components/LeadsListView';
import { Lead, LeadStatus } from '@/types/lead';
import { getLeads, updateLeadStatus, updateLead } from '@/data/leads';
import NewLeadForm from '@/components/NewLeadForm';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  thisMonthGrowth: number;
  lastMonthGrowth: number;
  averageResponseTime: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
}

export const Leads = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLeads = await getLeads();
      setLeads(fetchedLeads);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Calcular estadísticas de leads
  const stats: LeadStats = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    qualifiedLeads: leads.filter(lead => lead.status === 'qualified').length,
    convertedLeads: leads.filter(lead => lead.status === 'converted').length,
    lostLeads: leads.filter(lead => lead.status === 'lost').length,
    conversionRate: leads.length > 0 ? (leads.filter(lead => lead.status === 'converted').length / leads.length) * 100 : 0,
    thisMonthGrowth: 15.2,
    lastMonthGrowth: -3.8,
    averageResponseTime: 2.4,
    topSources: [
      { source: 'Website', count: 45, percentage: 35 },
      { source: 'Referral', count: 32, percentage: 25 },
      { source: 'Social Media', count: 28, percentage: 22 },
      { source: 'Cold Call', count: 15, percentage: 12 },
      { source: 'Email', count: 8, percentage: 6 }
    ]
  };

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const statusTyped = newStatus as LeadStatus;
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: statusTyped } : lead
        )
      );
      await updateLeadStatus(leadId, statusTyped);
    } catch (error) {
      console.error("Failed to update lead status:", error);
      fetchLeads();
    }
  };

  const handleLeadCreated = (newLead: Lead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
    setIsModalOpen(false);
  };

  const handleEditClick = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsEditModalOpen(true);
  };

  const handleLeadUpdated = async (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
    setIsEditModalOpen(false);
    setLeadToEdit(null);
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'from-blue-500 to-blue-600';
      case 'qualified': return 'from-yellow-500 to-yellow-600';
      case 'converted': return 'from-green-500 to-green-600';
      case 'lost': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'Nuevo';
      case 'qualified': return 'Calificado';
      case 'converted': return 'Convertido';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando leads...</p>
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
            <span className="font-medium">Error al cargar leads</span>
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10"></div>
        <div className="relative px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Gestión de Leads 📊
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Administra y optimiza tu pipeline de prospectos
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={fetchLeads}>
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
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.thisMonthGrowth > 0 ? '+' : ''}{stats.thisMonthGrowth}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-green-100 text-sm">Total Leads</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{stats.thisMonthGrowth}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.newLeads}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.newLeads}</p>
                  <p className="text-blue-100 text-sm">Nuevos Leads</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Requieren seguimiento</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.qualifiedLeads}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.qualifiedLeads}</p>
                  <p className="text-yellow-100 text-sm">Leads Calificados</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Target className="w-4 h-4 mr-1" />
                  <span>Listos para propuesta</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {stats.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.convertedLeads}</p>
                  <p className="text-emerald-100 text-sm">Convertidos</p>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Tasa de conversión {stats.conversionRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles y filtros */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Búsqueda */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filtro de estado */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="new">Nuevos</option>
                    <option value="qualified">Calificados</option>
                    <option value="converted">Convertidos</option>
                    <option value="lost">Perdidos</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  {/* Botones de vista */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                      className={viewMode === 'kanban' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Botón agregar lead */}
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Lead
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Vista de leads */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Users className="w-5 h-5 text-green-600" />
                    {viewMode === 'kanban' ? 'Vista Kanban' : 'Vista Lista'}
                    <Badge variant="outline" className="ml-auto">
                      {filteredLeads.length} leads
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === 'kanban' ? (
                    <LeadsKanbanView 
                      leads={filteredLeads} 
                      onLeadStatusChange={handleLeadStatusChange} 
                      onEditLead={handleEditClick} 
                    />
                  ) : (
                    <LeadsListView 
                      leads={filteredLeads} 
                      onLeadStatusChange={handleLeadStatusChange} 
                      onEditLead={handleEditClick} 
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Panel lateral con estadísticas */}
            <div className="space-y-6">
              
              {/* Distribución por estado */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Distribución por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries({
                      new: stats.newLeads,
                      qualified: stats.qualifiedLeads,
                      converted: stats.convertedLeads,
                      lost: stats.lostLeads
                    }).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(status as LeadStatus)}`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {getStatusLabel(status as LeadStatus)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0} 
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

              {/* Top fuentes de leads */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Top Fuentes de Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topSources.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{source.source}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{source.count} leads</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {source.percentage}%
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
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tasa de Conversión</span>
                      <span className="text-sm font-medium text-emerald-600">{stats.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={stats.conversionRate} 
                      className="h-2 bg-emerald-100 dark:bg-emerald-900/20"
                    />
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tiempo Promedio Respuesta</span>
                      <span className="text-sm font-medium text-blue-600">{stats.averageResponseTime}h</span>
                    </div>
                    <Progress 
                      value={(stats.averageResponseTime / 24) * 100} 
                      className="h-2 bg-blue-100 dark:bg-blue-900/20"
                    />
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Leads Calificados</span>
                      <span className="text-sm font-medium text-yellow-600">{stats.qualifiedLeads}</span>
                    </div>
                    <Progress 
                      value={stats.totalLeads > 0 ? (stats.qualifiedLeads / stats.totalLeads) * 100 : 0} 
                      className="h-2 bg-yellow-100 dark:bg-yellow-900/20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Lead">
        <NewLeadForm onLeadCreated={handleLeadCreated} />
      </Modal>
      
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Lead">
        {leadToEdit && (
          <NewLeadForm
            onLeadCreated={handleLeadUpdated}
            initialData={leadToEdit}
            isEditMode={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default Leads;