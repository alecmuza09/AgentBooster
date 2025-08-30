// Tipos de usuario y sistema de administración
export type UserRole = 
  | 'super_admin'      // Administrador principal con acceso total
  | 'admin'            // Administrador general
  | 'manager'          // Gerente de equipo
  | 'agent'            // Agente de seguros
  | 'assistant'        // Asistente administrativo
  | 'viewer';          // Solo lectura

export type Permission = 
  | 'users:read'           // Ver usuarios
  | 'users:create'         // Crear usuarios
  | 'users:update'         // Editar usuarios
  | 'users:delete'         // Eliminar usuarios
  | 'roles:manage'         // Gestionar roles
  | 'courses:manage'       // Gestionar cursos
  | 'policies:manage'      // Gestionar pólizas
  | 'leads:manage'         // Gestionar leads
  | 'reports:view'         // Ver reportes
  | 'reports:create'       // Crear reportes
  | 'finances:view'        // Ver finanzas
  | 'finances:manage'      // Gestionar finanzas
  | 'settings:manage'      // Gestionar configuraciones
  | 'audit:view';          // Ver auditoría

export interface UserPermissions {
  [key: string]: boolean;
}

export interface UserRoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  icon: string;
  level: number; // Nivel de acceso (1-6, donde 1 es el más alto)
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
  department?: string;
  managerId?: string;
  notes?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  category: 'security' | 'general' | 'notifications' | 'appearance';
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: string;
}

// Configuración de roles predefinidos
export const ROLE_CONFIGS: Record<UserRole, UserRoleConfig> = {
  super_admin: {
    name: 'Super Administrador',
    description: 'Acceso completo a todas las funcionalidades del sistema',
    permissions: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:manage', 'courses:manage', 'policies:manage', 'leads:manage',
      'reports:view', 'reports:create', 'finances:view', 'finances:manage',
      'settings:manage', 'audit:view'
    ],
    color: 'bg-red-500',
    icon: 'Shield',
    level: 1
  },
  admin: {
    name: 'Administrador',
    description: 'Administrador general con acceso a la mayoría de funcionalidades',
    permissions: [
      'users:read', 'users:create', 'users:update',
      'courses:manage', 'policies:manage', 'leads:manage',
      'reports:view', 'reports:create', 'finances:view',
      'settings:manage'
    ],
    color: 'bg-purple-500',
    icon: 'Settings',
    level: 2
  },
  manager: {
    name: 'Gerente',
    description: 'Gerente de equipo con acceso a gestión de equipo y reportes',
    permissions: [
      'users:read', 'users:update',
      'courses:manage', 'policies:manage', 'leads:manage',
      'reports:view', 'reports:create', 'finances:view'
    ],
    color: 'bg-blue-500',
    icon: 'Users',
    level: 3
  },
  agent: {
    name: 'Agente',
    description: 'Agente de seguros con acceso a gestión de clientes y pólizas',
    permissions: [
      'policies:manage', 'leads:manage', 'reports:view'
    ],
    color: 'bg-green-500',
    icon: 'User',
    level: 4
  },
  assistant: {
    name: 'Asistente',
    description: 'Asistente administrativo con acceso limitado',
    permissions: [
      'leads:manage', 'reports:view'
    ],
    color: 'bg-yellow-500',
    icon: 'HelpCircle',
    level: 5
  },
  viewer: {
    name: 'Visualizador',
    description: 'Solo acceso de lectura a reportes y datos',
    permissions: [
      'reports:view'
    ],
    color: 'bg-gray-500',
    icon: 'Eye',
    level: 6
  }
};

// Función helper para verificar permisos
export const hasPermission = (userPermissions: UserPermissions, permission: Permission): boolean => {
  return userPermissions[permission] || false;
};

// Función helper para obtener permisos de un rol
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_CONFIGS[role]?.permissions || [];
};

// Función helper para verificar si un usuario puede gestionar a otro
export const canManageUser = (currentUser: AdminUser, targetUser: AdminUser): boolean => {
  const currentLevel = ROLE_CONFIGS[currentUser.role]?.level || 6;
  const targetLevel = ROLE_CONFIGS[targetUser.role]?.level || 6;
  
  return currentLevel < targetLevel && hasPermission(currentUser.permissions, 'users:update');
};
