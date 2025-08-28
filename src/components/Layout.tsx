import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
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
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

export const Layout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/leads', icon: Briefcase, label: 'Leads' },
    { href: '/policies', icon: FileText, label: 'Pólizas' },
    { href: '/cobranza', icon: DollarSign, label: 'Cobranza' },
    { href: '/reports', icon: LineChart, label: 'Reportes' },
    { href: '/learning', icon: BookOpen, label: 'Aprendizaje' },
    { href: '/finanzas-360', icon: CircleDollarSign, label: 'Finanzas 360' },
  ];

  const adminNavItems = [
    { href: '/admin', icon: Settings, label: 'Administración' },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar - Estilos adaptados para claro/oscuro */}
      <aside className={clsx(
          "fixed top-0 left-0 h-full w-64 flex flex-col transition-colors duration-300",
          "bg-white border-r border-gray-200", // Modo Claro
          "dark:bg-gray-800 dark:border-gray-700" // Modo Oscuro
       )}>
        {/* Logo Area */}
        <div className={clsx(
            "flex items-center gap-3 p-5 border-b flex-shrink-0",
            "border-gray-200", // Claro
            "dark:border-gray-700" // Oscuro
         )}>
           {/* Usar color primario (azul por defecto ahora) */}
          <Building2 className="w-7 h-7 text-primary dark:text-primary-dark" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">Consolida C.</span>
        </div>

        {/* Navegación */}
        <nav className="p-4 flex-grow overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</p>
          <ul className="space-y-1.5 mt-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  end // Asegura que solo la ruta exacta esté activa (para Dashboard)
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark" // Activo: ligero fondo azul, texto azul
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" // Inactivo: hover sutil
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          
          {/* Sección de Administración */}
          <p className="mt-6 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Configuración</p>
          <ul className="space-y-1.5 mt-2">
            {adminNavItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botón Cerrar Sesión */} 
        <div className={clsx(
             "p-4 border-t flex-shrink-0",
             "border-gray-200", // Claro
             "dark:border-gray-700" // Oscuro
         )}>
          <button 
            onClick={handleLogout}
            className={clsx(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium cursor-pointer",
              "text-gray-600 hover:bg-gray-100 hover:text-gray-900", // Claro
              "dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" // Oscuro
           )}>
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- Área de Contenido Principal --- */} 
      <div className="ml-64 flex-1 flex flex-col">
        {/* Cabecera - Adaptada para claro/oscuro */}
        <header className={clsx(
             "sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b",
             "bg-white border-gray-200", // Claro
             "dark:bg-gray-800 dark:border-gray-700" // Oscuro
         )}>
           {/* Sección Izquierda - Podría tener breadcrumbs o título */} 
          <div>
              {/* <h2 className="text-lg font-semibold">Dashboard</h2> */} 
           </div>
           {/* Sección Derecha - Iconos y Usuario */} 
          <div className="flex items-center gap-4">
            <ThemeToggle /> {/* Añadido el botón de tema */} 
            <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            {/* Avatar y Nombre */} 
             <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary/20 dark:bg-primary-dark/30 rounded-full flex items-center justify-center text-primary dark:text-primary-dark font-semibold text-sm">
                  {getInitials(profile?.full_name)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                  {profile?.full_name || 'Agente'}
                </span>
             </div>
           </div>
         </header>

        {/* Contenido de la Página */} 
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};