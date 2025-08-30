import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Shield, Users, Activity, Settings, Database, 
    TrendingUp, AlertTriangle, CheckCircle, Clock,
    Zap, Globe, Lock, Eye, Crown, UserCheck
} from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { AdminUser, ROLE_CONFIGS } from '@/types/admin';
import { dummyAdminUsers, dummyAuditLogs, dummyUserActivities, getSystemStats } from '@/data/admin';

// Usuario actual (simulado)
const currentUser: AdminUser = {
    id: '1',
    email: 'admin@agentbooster.com',
    firstName: 'María',
    lastName: 'González',
    role: 'super_admin',
    permissions: ROLE_CONFIGS.super_admin.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: true,
    lastLogin: '2024-01-25T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T10:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 1234 5678',
    department: 'Administración',
    notes: 'Administrador principal del sistema'
};

export const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const systemStats = getSystemStats();

    // Estadísticas adicionales
    const additionalStats = useMemo(() => {
        const totalLogs = dummyAuditLogs.length + dummyUserActivities.length;
        const criticalActions = dummyAuditLogs.filter(log => 
            ['delete', 'role_updated', 'permission_granted'].includes(log.action)
        ).length;
        const recentActivities = dummyUserActivities.filter(activity => 
            new Date(activity.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        return {
            totalLogs,
            criticalActions,
            recentActivities,
            systemHealth: 'Excelente',
            lastBackup: '2024-01-25T02:00:00Z'
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Header Principal */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
                </div>
                
                <div className="relative px-6 py-8 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
                                        <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                            <Shield className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                            Panel de Administración
                                        </h1>
                                        <p className="text-xl text-blue-100 mt-2 max-w-2xl">
                                            Gestiona usuarios, monitorea actividades y configura el sistema de AgentBooster CRM
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Información del usuario actual */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                        <img
                                            src={currentUser.avatar}
                                            alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="text-white font-medium">
                                                {currentUser.firstName} {currentUser.lastName}
                                            </p>
                                            <p className="text-blue-100 text-sm">
                                                {ROLE_CONFIGS[currentUser.role].name}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500 text-white">
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Activo
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Acciones rápidas */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                                >
                                    <Database className="h-4 w-4 mr-2" />
                                    Backup
                                </Button>
                                <Button 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Acciones Rápidas
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 lg:px-8 lg:py-12">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Estadísticas del Sistema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-blue-100 text-sm font-medium">Usuarios Totales</p>
                                        <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
                                        <p className="text-blue-200 text-xs">{systemStats.activeUsers} activos</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Users className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-green-100 text-sm font-medium">Actividad Hoy</p>
                                        <p className="text-3xl font-bold">{additionalStats.recentActivities}</p>
                                        <p className="text-green-200 text-xs">Acciones registradas</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-orange-100 text-sm font-medium">Acciones Críticas</p>
                                        <p className="text-3xl font-bold">{additionalStats.criticalActions}</p>
                                        <p className="text-orange-200 text-xs">Requieren atención</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-purple-100 text-sm font-medium">Salud del Sistema</p>
                                        <p className="text-3xl font-bold">{systemStats.systemUptime}</p>
                                        <p className="text-purple-200 text-xs">Uptime</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel Principal con Tabs */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                            <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span>Administración del Sistema</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-700 p-1">
                                    <TabsTrigger 
                                        value="overview" 
                                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Resumen
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="users" 
                                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                                    >
                                        <Users className="w-4 h-4" />
                                        Usuarios
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="audit" 
                                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                                    >
                                        <Activity className="w-4 h-4" />
                                        Auditoría
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="settings" 
                                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Configuración
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Resumen de Usuarios */}
                                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                                    <Users className="w-5 h-5" />
                                                    Resumen de Usuarios
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            {systemStats.activeUsers}
                                                        </p>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400">Activos</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                            {systemStats.inactiveUsers}
                                                        </p>
                                                        <p className="text-sm text-orange-600 dark:text-orange-400">Inactivos</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {Object.entries(ROLE_CONFIGS).map(([role, config]) => {
                                                        const count = dummyAdminUsers.filter(user => user.role === role).length;
                                                        return (
                                                            <div key={role} className="flex items-center justify-between">
                                                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                                                    {config.name}
                                                                </span>
                                                                <Badge className={`${config.color} text-white`}>
                                                                    {count}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Actividad Reciente */}
                                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                                                    <Activity className="w-5 h-5" />
                                                    Actividad Reciente
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    {dummyUserActivities.slice(0, 5).map((activity, index) => {
                                                        const user = dummyAdminUsers.find(u => u.id === activity.userId);
                                                        return (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">
                                                                        {user?.firstName?.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                                        {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
                                                                    </p>
                                                                    <p className="text-xs text-green-700 dark:text-green-300">
                                                                        {activity.action} en {activity.resource}
                                                                    </p>
                                                                </div>
                                                                <div className="text-xs text-green-600 dark:text-green-400">
                                                                    {new Date(activity.timestamp).toLocaleTimeString('es-ES', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Información del Sistema */}
                                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                                <Settings className="w-5 h-5" />
                                                Información del Sistema
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {systemStats.systemUptime}
                                                    </p>
                                                    <p className="text-sm text-purple-600 dark:text-purple-400">Uptime</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {additionalStats.totalLogs}
                                                    </p>
                                                    <p className="text-sm text-purple-600 dark:text-purple-400">Logs Totales</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {new Date(additionalStats.lastBackup).toLocaleDateString('es-ES')}
                                                    </p>
                                                    <p className="text-sm text-purple-600 dark:text-purple-400">Último Backup</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="users" className="p-6">
                                    <UserManagement currentUser={currentUser} />
                                </TabsContent>

                                <TabsContent value="audit" className="p-6">
                                    <AuditLogs currentUser={currentUser} />
                                </TabsContent>

                                <TabsContent value="settings" className="p-6">
                                    <SystemSettings currentUser={currentUser} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}; 