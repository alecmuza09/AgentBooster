import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    Users, Plus, Search, Filter, Edit, Trash2, Shield, 
    UserCheck, UserX, Mail, Phone, Building, Calendar,
    MoreHorizontal, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { AdminUser, UserRole, ROLE_CONFIGS, hasPermission, canManageUser } from '@/types/admin';
import { dummyAdminUsers } from '@/data/admin';

interface UserManagementProps {
    currentUser: AdminUser;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<AdminUser[]>(dummyAdminUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    // Filtrar usuarios
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !searchTerm || 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Estadísticas
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.isActive).length;
        const inactive = total - active;
        const recentLogins = users.filter(u => 
            u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        return { total, active, inactive, recentLogins };
    }, [users]);

    // Funciones de gestión
    const handleCreateUser = (userData: Partial<AdminUser>) => {
        const newUser: AdminUser = {
            id: Date.now().toString(),
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role || 'viewer',
            permissions: ROLE_CONFIGS[userData.role || 'viewer'].permissions.reduce(
                (acc, perm) => ({ ...acc, [perm]: true }), {}
            ),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...userData
        };

        setUsers(prev => [newUser, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleUpdateUser = (userId: string, updates: Partial<AdminUser>) => {
        setUsers(prev => prev.map(user => 
            user.id === userId 
                ? { ...user, ...updates, updatedAt: new Date().toISOString() }
                : user
        ));
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            setUsers(prev => prev.filter(user => user.id !== userId));
        }
    };

    const handleToggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(user => 
            user.id === userId 
                ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
                : user
        ));
    };

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedUsers.length === 0) return;

        switch (action) {
            case 'activate':
                setUsers(prev => prev.map(user => 
                    selectedUsers.includes(user.id) 
                        ? { ...user, isActive: true, updatedAt: new Date().toISOString() }
                        : user
                ));
                break;
            case 'deactivate':
                setUsers(prev => prev.map(user => 
                    selectedUsers.includes(user.id) 
                        ? { ...user, isActive: false, updatedAt: new Date().toISOString() }
                        : user
                ));
                break;
            case 'delete':
                if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedUsers.length} usuarios?`)) {
                    setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
                }
                break;
        }
        setSelectedUsers([]);
    };

    const canManage = (targetUser: AdminUser) => canManageUser(currentUser, targetUser);

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Usuarios</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Activos</p>
                                <p className="text-3xl font-bold">{stats.active}</p>
                            </div>
                            <UserCheck className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Inactivos</p>
                                <p className="text-3xl font-bold">{stats.inactive}</p>
                            </div>
                            <UserX className="w-8 h-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Conectados Hoy</p>
                                <p className="text-3xl font-bold">{stats.recentLogins}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Panel de control */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <span>Gestión de Usuarios</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Búsqueda y filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            {hasPermission(currentUser.permissions, 'users:create') && (
                                <Button 
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Usuario
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Acciones en lote */}
                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                {selectedUsers.length} usuarios seleccionados
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkAction('activate')}
                                    className="border-green-300 text-green-600 hover:bg-green-50"
                                >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Activar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                    <UserX className="w-4 h-4 mr-1" />
                                    Desactivar
                                </Button>
                                {hasPermission(currentUser.permissions, 'users:delete') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('delete')}
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tabla de usuarios */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(filteredUsers.map(u => u.id));
                                                } else {
                                                    setSelectedUsers([]);
                                                }
                                            }}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuario</th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Rol</th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Departamento</th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Estado</th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Último Acceso</th>
                                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers(prev => [...prev, user.id]);
                                                    } else {
                                                        setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                    }
                                                }}
                                                className="rounded border-slate-300"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge 
                                                className={`${ROLE_CONFIGS[user.role].color} text-white`}
                                            >
                                                {ROLE_CONFIGS[user.role].name}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                                            {user.department || 'Sin asignar'}
                                        </td>
                                        <td className="p-3">
                                            <Badge 
                                                variant={user.isActive ? "default" : "secondary"}
                                                className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                            >
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                                            {user.lastLogin 
                                                ? new Date(user.lastLogin).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'Nunca'
                                            }
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {canManage(user) && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleUserStatus(user.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {user.isActive ? (
                                                                <UserX className="w-4 h-4 text-orange-600" />
                                                            ) : (
                                                                <UserCheck className="w-4 h-4 text-green-600" />
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                                {hasPermission(currentUser.permissions, 'users:delete') && canManage(user) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Estado vacío */}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                No se encontraron usuarios
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Intenta ajustar los filtros o crear un nuevo usuario
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modales (implementar después) */}
            {/* TODO: Implementar modales de creación y edición de usuarios */}
        </div>
    );
};
