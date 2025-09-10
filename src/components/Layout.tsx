import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Shield,
  BookOpen,
  Settings,
  LineChart,
  Mail,
  Megaphone,
  CircleDollarSign,
  DollarSign,
  LogOut,
  Building2,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Award,
  Star,
  Heart,
  Car,
  Home,
  Briefcase as BriefcaseIcon,
  Shield as ShieldIcon,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

// Función para obtener las iniciales del nombre
const getInitials = (name: string) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Configuración de navegación mejorada
const navItems = [
  { 
    href: '/', 
    icon: LayoutDashboard, 
    label: 'Dashboard',
    description: 'Vista general del negocio',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  { 
    href: '/leads', 
    icon: Users, 
    label: 'Leads',
    description: 'Gestionar prospectos',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  { 
    href: '/policies', 
    icon: FileText, 
    label: 'Pólizas',
    description: 'Administrar pólizas',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  { 
    href: '/cobranza', 
    icon: DollarSign, 
    label: 'Cobranza',
    description: 'Gestión de pagos',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  { 
    href: '/reports', 
    icon: LineChart, 
    label: 'Reportes',
    description: 'Análisis y métricas',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  { 
    href: '/learning', 
    icon: BookOpen, 
    label: 'Aprendizaje',
    description: 'Centro de formación',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800'
  },
  { 
    href: '/finanzas-360', 
    icon: CircleDollarSign, 
    label: 'Finanzas 360°',
    description: 'Gestión financiera',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
];

const adminNavItems = [
  { 
    href: '/admin', 
    icon: Settings, 
    label: 'Administración',
    description: 'Configuración del sistema',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800'
  },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 h-full w-64 flex flex-col transition-all duration-300 ease-in-out z-[100]",
        "bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700",
        "shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                AgentBooster
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                CRM Profesional
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => clsx(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={clsx(
                    "p-2 rounded-lg transition-all duration-200",
                    "group-hover:scale-110",
                    "group-[.active]:bg-white/20 group-[.active]:text-white",
                    "group-[.active]:shadow-inner"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{item.label}</div>
                    <div className={clsx(
                      "text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      "group-[.active]:opacity-100"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {item.href === '/cobranza' && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      3
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Separador */}
          <Separator className="my-4" />

          {/* Navegación de Administración */}
          <div className="space-y-1">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Administración
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => clsx(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={clsx(
                    "p-2 rounded-lg transition-all duration-200",
                    "group-hover:scale-110",
                    "group-[.active]:bg-white/20 group-[.active]:text-white"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{item.label}</div>
                    <div className={clsx(
                      "text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      "group-[.active]:opacity-100"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Plan Pro
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Acceso completo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col lg:ml-64">
        
        {/* Header Principal */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            
            {/* Lado izquierdo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Dashboard</span>
                <ChevronDown className="w-4 h-4" />
                <span>Vista General</span>
              </div>
            </div>

            {/* Lado derecho */}
            <div className="flex items-center gap-4">
              
              {/* Búsqueda */}
              <div className="hidden md:flex items-center gap-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* Toggle de tema */}
              <ThemeToggle />

              {/* Menú de usuario */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={toggleUserMenu}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {getInitials(user?.user_metadata?.full_name || user?.email || 'Usuario')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>

              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay para el menú de usuario */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-[9998]"
          onClick={toggleUserMenu}
        />
      )}

      {/* Menú de usuario - Posicionamiento fijo para aparecer por delante de todo */}
      {isUserMenuOpen && (
        <div className="fixed top-20 right-6 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-[9999]">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user?.user_metadata?.full_name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
          
          <div className="py-2">
            <button 
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => {
                navigate('/settings');
                setIsUserMenuOpen(false);
              }}
            >
              <User className="w-4 h-4" />
              Perfil
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => {
                navigate('/settings');
                setIsUserMenuOpen(false);
              }}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
          </div>
          
          <Separator />
          
          <div className="py-2">
            <button
              onClick={() => {
                handleLogout();
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};