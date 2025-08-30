import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Activity, Search, Filter, Calendar, User, Shield, 
    FileText, Settings, Eye, Download, RefreshCw,
    AlertTriangle, CheckCircle, Info, Clock, Plus, Edit, Trash2
} from 'lucide-react';
import { AuditLog, UserActivity, dummyAuditLogs, dummyUserActivities } from '@/data/admin';
import { dummyAdminUsers } from '@/data/admin';

interface AuditLogsProps {
    currentUser: any;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ currentUser }) => {
    const [auditLogs] = useState<AuditLog[]>(dummyAuditLogs);
    const [userActivities] = useState<UserActivity[]>(dummyUserActivities);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [resourceFilter, setResourceFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [selectedTab, setSelectedTab] = useState<'audit' | 'activity'>('audit');

    // Combinar logs de auditoría y actividades
    const allLogs = useMemo(() => {
        const auditWithType = auditLogs.map(log => ({ ...log, type: 'audit' as const }));
        const activityWithType = userActivities.map(activity => ({ ...activity, type: 'activity' as const }));
        return [...auditWithType, ...activityWithType].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [auditLogs, userActivities]);

    // Filtrar logs
    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const matchesSearch = !searchTerm || 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress?.includes(searchTerm);

            const matchesAction = actionFilter === 'all' || log.action === actionFilter;
            const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
            
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const logDate = new Date(log.timestamp);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

                switch (dateFilter) {
                    case 'today':
                        matchesDate = logDate >= today;
                        break;
                    case 'yesterday':
                        matchesDate = logDate >= yesterday && logDate < today;
                        break;
                    case 'week':
                        matchesDate = logDate >= weekAgo;
                        break;
                }
            }

            return matchesSearch && matchesAction && matchesResource && matchesDate;
        });
    }, [allLogs, searchTerm, actionFilter, resourceFilter, dateFilter]);

    // Obtener usuario por ID
    const getUserById = (userId: string) => {
        return dummyAdminUsers.find(user => user.id === userId);
    };

    // Obtener icono y color para la acción
    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login':
                return { icon: CheckCircle, color: 'text-green-600' };
            case 'logout':
                return { icon: AlertTriangle, color: 'text-orange-600' };
            case 'create':
                return { icon: Plus, color: 'text-blue-600' };
            case 'update':
                return { icon: Edit, color: 'text-yellow-600' };
            case 'delete':
                return { icon: Trash2, color: 'text-red-600' };
            case 'view':
                return { icon: Eye, color: 'text-purple-600' };
            default:
                return { icon: Info, color: 'text-gray-600' };
        }
    };

    // Obtener color del badge para el recurso
    const getResourceColor = (resource: string) => {
        switch (resource) {
            case 'user':
                return 'bg-blue-100 text-blue-800';
            case 'course':
                return 'bg-green-100 text-green-800';
            case 'policy':
                return 'bg-purple-100 text-purple-800';
            case 'lead':
                return 'bg-orange-100 text-orange-800';
            case 'system':
                return 'bg-gray-100 text-gray-800';
            case 'reports':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Exportar logs
    const handleExportLogs = () => {
        const csvContent = [
            ['Fecha', 'Usuario', 'Acción', 'Recurso', 'IP', 'Detalles'].join(','),
            ...filteredLogs.map(log => [
                new Date(log.timestamp).toLocaleString('es-ES'),
                getUserById(log.userId)?.email || 'Desconocido',
                log.action,
                log.resource,
                log.ipAddress || 'N/A',
                log.details ? JSON.stringify(log.details) : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Logs</p>
                                <p className="text-3xl font-bold">{allLogs.length}</p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Hoy</p>
                                <p className="text-3xl font-bold">
                                    {allLogs.filter(log => 
                                        new Date(log.timestamp).toDateString() === new Date().toDateString()
                                    ).length}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Usuarios Activos</p>
                                <p className="text-3xl font-bold">
                                    {new Set(allLogs.map(log => log.userId)).size}
                                </p>
                            </div>
                            <User className="w-8 h-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Acciones Críticas</p>
                                <p className="text-3xl font-bold">
                                    {allLogs.filter(log => 
                                        ['delete', 'role_updated', 'permission_granted'].includes(log.action)
                                    ).length}
                                </p>
                            </div>
                            <Shield className="w-8 h-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Panel de control */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span>Logs de Auditoría</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportLogs}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualizar
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setSelectedTab('audit')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                selectedTab === 'audit'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Auditoría del Sistema
                        </button>
                        <button
                            onClick={() => setSelectedTab('activity')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                selectedTab === 'activity'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Actividad de Usuarios
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar en logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por acción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las acciones</SelectItem>
                                <SelectItem value="login">Inicio de sesión</SelectItem>
                                <SelectItem value="create">Crear</SelectItem>
                                <SelectItem value="update">Actualizar</SelectItem>
                                <SelectItem value="delete">Eliminar</SelectItem>
                                <SelectItem value="view">Ver</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={resourceFilter} onValueChange={setResourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por recurso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los recursos</SelectItem>
                                <SelectItem value="user">Usuarios</SelectItem>
                                <SelectItem value="course">Cursos</SelectItem>
                                <SelectItem value="policy">Pólizas</SelectItem>
                                <SelectItem value="lead">Leads</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por fecha" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las fechas</SelectItem>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="yesterday">Ayer</SelectItem>
                                <SelectItem value="week">Última semana</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {filteredLogs.length} resultados
                            </Badge>
                        </div>
                    </div>

                    {/* Lista de logs */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {filteredLogs.map((log, index) => {
                            const user = getUserById(log.userId);
                            const { icon: ActionIcon, color } = getActionIcon(log.action);
                            
                            return (
                                <div
                                    key={`${log.type}-${log.id || index}`}
                                    className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                                >
                                    <div className={`p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm`}>
                                        <ActionIcon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                                                        alt={user?.firstName || 'Usuario'}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {user ? `${user.firstName} ${user.lastName}` : 'Usuario Desconocido'}
                                                    </span>
                                                </div>
                                                <Badge className={getResourceColor(log.resource)}>
                                                    {log.resource}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.timestamp).toLocaleString('es-ES', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm text-slate-700 dark:text-slate-300">
                                            <span className="font-medium">{log.action}</span>
                                            {log.resourceId && (
                                                <span className="text-slate-500"> (ID: {log.resourceId})</span>
                                            )}
                                        </div>
                                        
                                        {log.details && (
                                            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded">
                                                <pre className="whitespace-pre-wrap">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            {log.ipAddress && (
                                                <span>IP: {log.ipAddress}</span>
                                            )}
                                            {log.type === 'audit' && (log as AuditLog).oldValue && (
                                                <span className="text-orange-600">Valor anterior modificado</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Estado vacío */}
                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12">
                            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                No se encontraron logs
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Intenta ajustar los filtros o seleccionar un período diferente
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
