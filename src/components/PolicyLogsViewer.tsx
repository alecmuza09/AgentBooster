import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  History, 
  Filter, 
  Search, 
  Download, 
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
  DollarSign,
  MessageSquare,
  Paperclip,
  Phone,
  Bell,
  Trash2,
  Plus,
  BarChart3
} from 'lucide-react';
import { PolicyLog, LogAction, LOG_ACTION_CONFIG } from '@/types/notes';
import { policyLogger } from '@/utils/policyLogger';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PolicyLogsViewerProps {
  policyId: string;
  className?: string;
}

export const PolicyLogsViewer: React.FC<PolicyLogsViewerProps> = ({ 
  policyId, 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'statistics'>('timeline');

  // Obtener logs de la póliza
  const allLogs = policyLogger.getPolicyLogs(policyId);
  const statistics = policyLogger.getLogStatistics();

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    let filtered = allLogs;

    // Filtro por término de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(search) ||
        log.performedBy.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search)
      );
    }

    // Filtro por acción
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filtro por severidad
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Filtro por usuario
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.performedBy === userFilter);
    }

    // Filtro por rango de fechas
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRangeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(log => new Date(log.performedAt) >= startDate);
    }

    return filtered;
  }, [allLogs, searchTerm, actionFilter, severityFilter, userFilter, dateRangeFilter]);

  // Obtener valores únicos para filtros
  const uniqueActions = [...new Set(allLogs.map(log => log.action))];
  const uniqueSeverities = [...new Set(allLogs.map(log => log.severity))];
  const uniqueUsers = [...new Set(allLogs.map(log => log.performedBy))];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActionIcon = (action: LogAction) => {
    switch (action) {
      case 'created': return <Plus className="w-4 h-4" />;
      case 'updated': return <FileText className="w-4 h-4" />;
      case 'status_changed': return <RefreshCw className="w-4 h-4" />;
      case 'payment_received': return <DollarSign className="w-4 h-4" />;
      case 'payment_overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'renewal_processed': return <RefreshCw className="w-4 h-4" />;
      case 'renewal_due': return <Calendar className="w-4 h-4" />;
      case 'document_uploaded': return <Paperclip className="w-4 h-4" />;
      case 'document_removed': return <Trash2 className="w-4 h-4" />;
      case 'note_added': return <MessageSquare className="w-4 h-4" />;
      case 'note_updated': return <FileText className="w-4 h-4" />;
      case 'note_deleted': return <Trash2 className="w-4 h-4" />;
      case 'contact_made': return <Phone className="w-4 h-4" />;
      case 'alert_created': return <Bell className="w-4 h-4" />;
      case 'alert_resolved': return <CheckCircle className="w-4 h-4" />;
      case 'bulk_updated': return <BarChart3 className="w-4 h-4" />;
      case 'deleted': return <Trash2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    const daysDiff = differenceInDays(now, date);

    if (daysDiff === 0) {
      return 'Hoy';
    } else if (daysDiff === 1) {
      return 'Ayer';
    } else if (daysDiff < 7) {
      return `Hace ${daysDiff} días`;
    } else {
      return format(date, 'dd/MM/yyyy', { locale: es });
    }
  };

  const exportLogs = () => {
    const logsToExport = filteredLogs;
    const dataStr = JSON.stringify(logsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-policy-${policyId}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Registro de Actividad</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {allLogs.length} evento{allLogs.length !== 1 ? 's' : ''} registrado{allLogs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Acción</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las acciones</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {LOG_ACTION_CONFIG[action as LogAction]?.label || action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Severidad</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las severidades</SelectItem>
                    {uniqueSeverities.map(severity => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Usuario</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Período</label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el tiempo</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                    <SelectItem value="quarter">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setActionFilter('all');
                    setSeverityFilter('all');
                    setUserFilter('all');
                    setDateRangeFilter('all');
                  }}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs simplificados */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Línea de Tiempo
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Estadísticas
            </button>
          </div>

          {/* Contenido de tabs */}
          {activeTab === 'timeline' && (
            <div className="mt-6">
              {/* Lista de logs */}
              <div className="space-y-3">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Icono de acción */}
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>

                      {/* Contenido del log */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {LOG_ACTION_CONFIG[log.action]?.label || log.action}
                          </h4>
                          <Badge className={getSeverityColor(log.severity)} variant="outline">
                            {getSeverityIcon(log.severity)}
                            <span className="ml-1">{log.severity}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {log.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.performedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(log.performedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                          <span className="text-gray-400">
                            {formatTimeAgo(log.performedAt)}
                          </span>
                        </div>

                        {/* Mostrar valores antiguos y nuevos si existen */}
                        {(log.oldValue || log.newValue) && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                            {log.oldValue && (
                              <div className="text-red-600 dark:text-red-400">
                                <strong>Antes:</strong> {JSON.stringify(log.oldValue)}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-green-600 dark:text-green-400">
                                <strong>Después:</strong> {JSON.stringify(log.newValue)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No se encontraron logs con los filtros aplicados
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="mt-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <History className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{statistics.totalLogs}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{statistics.logsBySeverity.success || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Éxitos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{statistics.logsBySeverity.warning || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Advertencias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{statistics.logsBySeverity.error || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Errores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de acciones más comunes */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Más Comunes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.logsByAction)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([action, count]) => (
                        <div key={action} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActionIcon(action as LogAction)}
                            <span className="text-sm">
                              {LOG_ACTION_CONFIG[action as LogAction]?.label || action}
                            </span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
