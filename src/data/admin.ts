import { AdminUser, UserActivity, SystemSettings, AuditLog, ROLE_CONFIGS } from '../types/admin';

// Datos dummy de usuarios administradores
export const dummyAdminUsers: AdminUser[] = [
  {
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
  },
  {
    id: '2',
    email: 'carlos.mendoza@agentbooster.com',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: 'admin',
    permissions: ROLE_CONFIGS.admin.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: true,
    lastLogin: '2024-01-25T09:15:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 2345 6789',
    department: 'Operaciones',
    managerId: '1',
    notes: 'Administrador de operaciones'
  },
  {
    id: '3',
    email: 'patricia.lopez@agentbooster.com',
    firstName: 'Patricia',
    lastName: 'López',
    role: 'manager',
    permissions: ROLE_CONFIGS.manager.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: true,
    lastLogin: '2024-01-25T08:45:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-25T08:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 3456 7890',
    department: 'Ventas',
    managerId: '2',
    notes: 'Gerente de ventas'
  },
  {
    id: '4',
    email: 'roberto.silva@agentbooster.com',
    firstName: 'Roberto',
    lastName: 'Silva',
    role: 'agent',
    permissions: ROLE_CONFIGS.agent.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: true,
    lastLogin: '2024-01-25T07:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-25T07:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 4567 8901',
    department: 'Ventas',
    managerId: '3',
    notes: 'Agente de seguros senior'
  },
  {
    id: '5',
    email: 'ana.torres@agentbooster.com',
    firstName: 'Ana',
    lastName: 'Torres',
    role: 'assistant',
    permissions: ROLE_CONFIGS.assistant.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: true,
    lastLogin: '2024-01-25T06:20:00Z',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-25T06:20:00Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 5678 9012',
    department: 'Administración',
    managerId: '2',
    notes: 'Asistente administrativa'
  },
  {
    id: '6',
    email: 'miguel.angel@agentbooster.com',
    firstName: 'Miguel',
    lastName: 'Ángel',
    role: 'viewer',
    permissions: ROLE_CONFIGS.viewer.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    isActive: false,
    lastLogin: '2024-01-20T16:00:00Z',
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phone: '+52 55 6789 0123',
    department: 'Finanzas',
    managerId: '2',
    notes: 'Usuario inactivo - Acceso solo lectura'
  }
];

// Datos dummy de actividades de usuario
export const dummyUserActivities: UserActivity[] = [
  {
    id: '1',
    userId: '1',
    action: 'login',
    resource: 'system',
    timestamp: '2024-01-25T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: '2',
    userId: '1',
    action: 'create',
    resource: 'user',
    resourceId: '7',
    details: { email: 'nuevo.usuario@agentbooster.com', role: 'agent' },
    timestamp: '2024-01-25T10:25:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    userId: '2',
    action: 'update',
    resource: 'course',
    resourceId: '3',
    details: { title: 'Regulaciones y Cumplimiento 2024', difficulty: 'intermedio' },
    timestamp: '2024-01-25T09:15:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    id: '4',
    userId: '3',
    action: 'view',
    resource: 'reports',
    timestamp: '2024-01-25T08:45:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: '5',
    userId: '4',
    action: 'create',
    resource: 'policy',
    resourceId: '15',
    details: { clientName: 'Juan Pérez', policyType: 'auto' },
    timestamp: '2024-01-25T07:30:00Z',
    ipAddress: '192.168.1.103'
  },
  {
    id: '6',
    userId: '5',
    action: 'update',
    resource: 'lead',
    resourceId: '8',
    details: { status: 'contacted', notes: 'Cliente interesado en seguro de vida' },
    timestamp: '2024-01-25T06:20:00Z',
    ipAddress: '192.168.1.104'
  }
];

// Datos dummy de configuraciones del sistema
export const dummySystemSettings: SystemSettings[] = [
  {
    id: '1',
    key: 'session_timeout',
    value: 3600,
    description: 'Tiempo de sesión en segundos',
    category: 'security',
    updatedAt: '2024-01-25T10:00:00Z',
    updatedBy: '1'
  },
  {
    id: '2',
    key: 'password_min_length',
    value: 8,
    description: 'Longitud mínima de contraseña',
    category: 'security',
    updatedAt: '2024-01-25T09:30:00Z',
    updatedBy: '1'
  },
  {
    id: '3',
    key: 'enable_two_factor',
    value: true,
    description: 'Habilitar autenticación de dos factores',
    category: 'security',
    updatedAt: '2024-01-25T09:00:00Z',
    updatedBy: '1'
  },
  {
    id: '4',
    key: 'company_name',
    value: 'AgentBooster CRM',
    description: 'Nombre de la empresa',
    category: 'general',
    updatedAt: '2024-01-25T08:00:00Z',
    updatedBy: '1'
  },
  {
    id: '5',
    key: 'email_notifications',
    value: true,
    description: 'Habilitar notificaciones por email',
    category: 'notifications',
    updatedAt: '2024-01-25T07:30:00Z',
    updatedBy: '2'
  },
  {
    id: '6',
    key: 'theme',
    value: 'light',
    description: 'Tema de la aplicación',
    category: 'appearance',
    updatedAt: '2024-01-25T07:00:00Z',
    updatedBy: '2'
  }
];

// Datos dummy de logs de auditoría
export const dummyAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'user_created',
    resource: 'user',
    resourceId: '7',
    oldValue: null,
    newValue: { email: 'nuevo.usuario@agentbooster.com', role: 'agent' },
    timestamp: '2024-01-25T10:25:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: '1',
    action: 'role_updated',
    resource: 'user',
    resourceId: '6',
    oldValue: { role: 'agent' },
    newValue: { role: 'viewer' },
    timestamp: '2024-01-25T00:00:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    userId: '2',
    action: 'setting_updated',
    resource: 'system_setting',
    resourceId: '3',
    oldValue: { enable_two_factor: false },
    newValue: { enable_two_factor: true },
    timestamp: '2024-01-25T09:00:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    id: '4',
    userId: '3',
    action: 'permission_granted',
    resource: 'user',
    resourceId: '4',
    oldValue: { permissions: { 'reports:create': false } },
    newValue: { permissions: { 'reports:create': true } },
    timestamp: '2024-01-24T15:30:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: '5',
    userId: '1',
    action: 'user_deactivated',
    resource: 'user',
    resourceId: '6',
    oldValue: { isActive: true },
    newValue: { isActive: false },
    timestamp: '2024-01-24T14:00:00Z',
    ipAddress: '192.168.1.100'
  }
];

// Estadísticas del sistema
export const getSystemStats = () => {
  const totalUsers = dummyAdminUsers.length;
  const activeUsers = dummyAdminUsers.filter(user => user.isActive).length;
  const todayActivities = dummyUserActivities.filter(
    activity => new Date(activity.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const recentLogins = dummyAdminUsers.filter(
    user => user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    todayActivities,
    recentLogins,
    systemUptime: '99.9%',
    lastBackup: '2024-01-25T02:00:00Z'
  };
};
