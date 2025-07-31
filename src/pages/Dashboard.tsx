import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, AlertCircle, TrendingUp, LucideIcon,
    PlusCircle, UploadCloud, FilePlus, Bell, CheckCircle, XCircle,
    UserCheck, CalendarCheck, BarChartHorizontal, Search, Filter,
    Eye, Mail, Trash, UserCircle, DollarSign, Sun, Moon, 
    Clock, Target, Award, Shield, Heart, Car, Home, Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import { NewPolicyForm } from '../components/NewPolicyForm';
import { NewDocumentForm } from '../components/NewDocumentForm';
import { NewClientForm } from '../components/NewClientForm';
import { PolicyAlerts } from '../components/PolicyAlerts';
import { useAuth } from '../contexts/AuthContext';
import { getPolicies } from '../data/policies';
import { getLeads } from '../data/leads';
import { Policy } from '../types/policy';
import { Lead } from '../types/lead';
import { 
    getCombinedAnalytics, 
    formatCurrency, 
    formatPercentage,
    type CombinedAnalytics
} from '../utils/reports';
import { supabase } from '../supabaseClient';

// --- Tipos y Datos de Ejemplo (Actualizados) ---
type ActivityType = 'policy' | 'document' | 'payment_received' | 'payment_pending' | 'renewal_alert' | 'task';

interface ActivityItemData {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  clientName?: string;
  policyNumber?: string;
  actor?: string; // Quién realizó la acción
  dueDate?: Date; // Fecha de vencimiento para tareas
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  note?: string;
  colorClass?: string; // Para resaltar KPIs críticos (e.g., 'border-red-500', 'text-red-600')
  onClick?: () => void; // Para hacer clickeable
}

// Datos de ejemplo para actividad (actualizados con actor y dueDate)
const exampleActivities: ActivityItemData[] = [
  { id: 'a1', type: 'policy', title: 'Nueva Póliza Registrada', description: 'Auto - #AUT789123', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), clientName: 'Juan Pérez', actor: 'Asesor A' },
  { id: 'a2', type: 'document', title: 'Documento Actualizado', description: 'Identificación Oficial', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), clientName: 'María García', actor: 'Sistema' },
  { id: 'a3', type: 'payment_received', title: 'Pago Recibido', description: 'Póliza #VID456789', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), clientName: 'Carlos López', actor: 'Admin' },
  { id: 'a4', type: 'renewal_alert', title: 'Recordatorio Renovación', description: 'Póliza #GMM123456 vence pronto', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), clientName: 'Ana Torres', actor: 'Sistema' },
  { id: 'a5', type: 'payment_pending', title: 'Pago Vencido', description: 'Póliza #AUT789123 - 2 días', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), clientName: 'Juan Pérez', actor: 'Sistema' },
  { id: 't1', type: 'task', title: 'Llamar a Cliente', description: 'Seguimiento cotización GMM', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), clientName: 'Laura Martínez', actor: 'Asesor B', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }, // Vence mañana
  { id: 't2', type: 'task', title: 'Enviar Documentación', description: 'Póliza #AUT789123', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), clientName: 'Juan Pérez', actor: 'Asesor A', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }, // Vence en 5 días
];



// --- Componentes Reutilizables Adaptados a Dark Mode ---

const StatCard: React.FC<StatCardProps> = ({
    title, value, icon: Icon, trend, trendDirection, note, colorClass = '', onClick
}) => {
    const trendIconColor = trendDirection === 'up' ? 'text-green-500 dark:text-green-400' : trendDirection === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
    const trendTextColor = trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : trendDirection === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';
    
    // Extraer color base (ej: 'red', 'yellow', 'primary')
    // Nota: Tailwind JIT debe poder encontrar las clases completas (e.g., border-red-500, text-red-600, etc.)
    let baseColor = 'primary'; // default
    let textColor = 'text-gray-900 dark:text-white';
    let noteColor = 'text-gray-500 dark:text-gray-400';
    let iconBg = 'bg-primary-100 dark:bg-primary-900/50';
    let iconColor = 'text-primary dark:text-primary-dark';
    let borderColor = 'border-primary dark:border-primary-dark';

    if (colorClass) {
        const parts = colorClass.split(' '); // Asume formato como "border-red-500 text-red-600"
        const borderPart = parts.find(p => p.startsWith('border-'));
        const textPart = parts.find(p => p.startsWith('text-'));
        if (borderPart) {
            baseColor = borderPart.split('-')[1]; // e.g., 'red'
            borderColor = `${borderPart} dark:border-${baseColor}-400`;
            iconBg = `bg-${baseColor}-100 dark:bg-${baseColor}-900/50`;
            iconColor = `text-${baseColor}-600 dark:text-${baseColor}-400`;
            noteColor = `text-${baseColor}-700 dark:text-${baseColor}-400 font-medium`;
        }
         if (textPart) {
            textColor = `${textPart} dark:text-${baseColor}-300`;
        }
    }

    return (
        <div className={clsx(
            'p-5 rounded-lg shadow-md border-l-4 transition-shadow hover:shadow-lg',
            'bg-white dark:bg-gray-800', // Fondo claro/oscuro
            borderColor, // Borde izquierdo con color
            onClick && 'cursor-pointer'
         )} onClick={onClick}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
                </div>
                 <div className={clsx("p-2 rounded-full", iconBg)}> 
                    <Icon className={clsx("w-6 h-6", iconColor)} />
                 </div>
            </div>
            {(trend || note) && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {trend && (
                        <div className="flex items-center text-sm">
                            <TrendingUp className={`w-4 h-4 ${trendIconColor} mr-1`} />
                            <span className={`${trendTextColor} font-medium`}>{trend}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
                        </div>
                    )}
                    {note && <p className={`text-xs mt-1 ${noteColor}`}>{note}</p>}
                </div>
            )}
        </div>
    );
};

// Mapeo de tipos de actividad a iconos y colores
const activityConfig: { [key in ActivityType]: { icon: LucideIcon, color: string } } = {
    policy: { icon: FilePlus, color: 'blue' },
    document: { icon: UploadCloud, color: 'purple' },
    payment_received: { icon: CheckCircle, color: 'green' },
    payment_pending: { icon: XCircle, color: 'red' },
    renewal_alert: { icon: Bell, color: 'yellow' },
    task: { icon: CalendarCheck, color: 'indigo' },
};

const ActivityItem: React.FC<{ item: ActivityItemData }> = ({ item }) => {
    const config = activityConfig[item.type] || activityConfig.task;
    const Icon = config.icon;
    const colorName = config.color;

    // Formateo de tiempo relativo más preciso
    const timeAgo = (date: Date): string => {
        return formatDistanceToNowStrict(date, { addSuffix: true, locale: es });
    };

    // Formateo de fecha corta
    const formatDateShort = (date?: Date): string => {
        return date ? format(date, 'dd/MM/yy', { locale: es }) : '' ;
    };

    const iconBgColor = `bg-${colorName}-100 dark:bg-${colorName}-900/50`;
    const iconColor = `text-${colorName}-600 dark:text-${colorName}-400`;

    return (
        <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 -mx-2 rounded transition-colors">
            <div className={clsx("mt-1 p-2 rounded-full flex-shrink-0", iconBgColor)}>
                 <Icon className={clsx("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-grow overflow-hidden">
                 <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.title}>{item.title}</p>
                 <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {item.clientName && <span className="font-medium">{item.clientName}</span>}
                    {item.clientName && item.description ? ' - ' : ''}
                    {item.description}
                </p>
                 {/* Mostrar Actor y Fecha */} 
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-1">
                     <span>{timeAgo(item.timestamp)}</span>
                     {item.actor && (
                         <span className="flex items-center gap-1" title={`Realizado por ${item.actor}`}> 
                            <UserCircle className="w-3 h-3" /> {item.actor}
                         </span>
                     )}
                     {item.type === 'task' && item.dueDate && (
                         <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium" title="Fecha de Vencimiento">
                             <CalendarCheck className="w-3 h-3" /> Vence: {formatDateShort(item.dueDate)}
                         </span>
                     )}
                </div>
            </div>
            {/* Botones de acción rápida - Adaptados a dark mode */}
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                 <button className="p-1 rounded text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title="Ver Detalles">
                    <Eye className="w-4 h-4" />
                </button>
                {item.clientName && (
                     <button className="p-1 rounded text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title={`Contactar a ${item.clientName}`}>
                        <Mail className="w-4 h-4" />
                     </button>
                )}
                 {/* <button className="p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600" title="Descartar">
                    <Trash className="w-4 h-4" />
                 </button> */} 
            </div>
        </div>
    );
};

// --- Componente Principal Dashboard con Navegación ---
export const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Estados para los modales
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
    const [activitySearch, setActivitySearch] = useState('');
    
    // Estados para datos reales
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [analytics, setAnalytics] = useState<CombinedAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Función para obtener saludo personalizado
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Función para obtener el nombre del usuario
    const getUserName = () => {
        if (userProfile?.full_name) return userProfile.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'Usuario';
    };

    // Función para obtener el estado del día
    const getDayStatus = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { icon: Sun, text: 'Mañana', color: 'text-yellow-600' };
        if (hour < 18) return { icon: Sun, text: 'Tarde', color: 'text-orange-600' };
        return { icon: Moon, text: 'Noche', color: 'text-blue-600' };
    };



    // Cargar datos reales
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Cargar datos en paralelo
                const [policiesData, leadsData] = await Promise.all([
                    getPolicies(),
                    getLeads()
                ]);

                setPolicies(policiesData);
                setLeads(leadsData);

                // Calcular analytics
                const analyticsData = await getCombinedAnalytics(policiesData, leadsData);
                setAnalytics(analyticsData);

                // Cargar perfil del usuario si está autenticado
                if (user) {
                    try {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', user.id)
                            .single();
                        setUserProfile(profile);
                    } catch (error) {
                        console.log('No se pudo cargar el perfil del usuario');
                    }
                }
            } catch (error) {
                console.error("Error cargando datos del dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const dayStatus = getDayStatus();
    const DayStatusIcon = dayStatus.icon;

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header personalizado con saludo */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50`}>
                                <DayStatusIcon className={`w-6 h-6 ${dayStatus.color}`} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    {getGreeting()}, {getUserName()}!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {format(new Date(), 'EEEE, d \'de\' MMMM', { locale: es })}
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                            Aquí tienes un resumen completo de tu actividad y el estado de tu cartera de seguros.
                        </p>
                    </div>
                    
                    {/* Acciones rápidas */}
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setIsPolicyModalOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <FilePlus className="h-4 w-4" />
                            Nueva Póliza
                        </button>
                        <button 
                            onClick={() => setIsClientModalOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <UserCircle className="h-4 w-4" />
                            Nuevo Cliente
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando tu dashboard...</span>
                </div>
            ) : (
                <>
                    {/* Alertas de Pólizas */}
                    <PolicyAlerts policies={policies} />

                    {/* Estadísticas principales con datos reales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Pólizas Activas"
                            value={analytics?.policies.activePolicies || 0}
                            icon={Shield}
                            trend={analytics?.overallMetrics[0]?.change.toFixed(1) + '%'}
                            trendDirection={analytics?.overallMetrics[0]?.trend}
                            onClick={() => navigate('/policies?status=active')}
                        />
                        <StatCard
                            title="Nuevos Leads"
                            value={analytics?.leads.recentLeads || 0}
                            icon={Users}
                            trend={analytics?.overallMetrics[1]?.change.toFixed(1) + '%'}
                            trendDirection={analytics?.overallMetrics[1]?.trend}
                            onClick={() => navigate('/leads')}
                        />
                        <StatCard
                            title="Tasa de Conversión"
                            value={formatPercentage(analytics?.leads.conversionRate || 0)}
                            icon={Target}
                            trend={analytics?.overallMetrics[2]?.change.toFixed(1) + '%'}
                            trendDirection={analytics?.overallMetrics[2]?.trend}
                            note="Leads convertidos"
                        />
                        <StatCard
                            title="Prima Total"
                            value={formatCurrency(analytics?.policies.totalPremium || 0)}
                            icon={DollarSign}
                            trend={analytics?.overallMetrics[3]?.change.toFixed(1) + '%'}
                            trendDirection={analytics?.overallMetrics[3]?.trend}
                            onClick={() => navigate('/reports')}
                        />
                    </div>

                    {/* Métricas adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Pólizas"
                            value={analytics?.policies.totalPolicies || 0}
                            icon={FileText}
                            note={`${analytics?.policies.cancelledPolicies || 0} canceladas`}
                            colorClass="border-blue-500 text-blue-600"
                        />
                        <StatCard
                            title="Pólizas por Renovar"
                            value={analytics?.policies.policiesNeedingRenewal || 0}
                            icon={AlertCircle}
                            note="Próximas a vencer"
                            colorClass={analytics?.policies.policiesNeedingRenewal > 0 ? 'border-orange-500 text-orange-600' : ''}
                        />
                        <StatCard
                            title="Leads por Seguimiento"
                            value={analytics?.leads.leadsNeedingFollowUp || 0}
                            icon={Bell}
                            note="Requieren atención"
                            colorClass={analytics?.leads.leadsNeedingFollowUp > 0 ? 'border-red-500 text-red-600' : ''}
                        />
                        <StatCard
                            title="Promedio Prima"
                            value={formatCurrency(analytics?.policies.averagePremium || 0)}
                            icon={Award}
                            note="Por póliza"
                        />
                    </div>
                </>
            )}

                {!isLoading && analytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Distribución de Pólizas y Leads */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Distribución por Ramo */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        Distribución de Pólizas por Ramo
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                        Total: {analytics.policies.totalPolicies} pólizas
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analytics.policies.policiesByRamo.map((ramo, index) => {
                                            const percentage = analytics.policies.totalPolicies > 0 
                                                ? (ramo.value / analytics.policies.totalPolicies * 100).toFixed(1)
                                                : '0';
                                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                                            return (
                                                <div key={ramo.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{ramo.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{ramo.value}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Distribución de Leads */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-green-600" />
                                        Estado de Leads
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                        Tasa de conversión: {formatPercentage(analytics.leads.conversionRate)}
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analytics.leads.leadsByStatus.map((status, index) => {
                                            const percentage = analytics.leads.totalLeads > 0 
                                                ? (status.value / analytics.leads.totalLeads * 100).toFixed(1)
                                                : '0';
                                            const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500'];
                                            return (
                                                <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{status.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{status.value}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel lateral con información adicional */}
                        <div className="space-y-6">
                            {/* Resumen de Aseguradoras */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-indigo-600" />
                                        Pólizas por Aseguradora
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {analytics.policies.policiesByAseguradora.slice(0, 5).map((aseguradora, index) => (
                                            <div key={aseguradora.name} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{aseguradora.name}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{aseguradora.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Fuentes de Leads */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-purple-600" />
                                        Fuentes de Leads
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {analytics.leads.leadsBySource.slice(0, 5).map((source, index) => (
                                            <div key={source.name} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{source.name}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{source.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Acciones Rápidas */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Acciones Rápidas
                                    </h3>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => navigate('/policies')}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Ver Pólizas</span>
                                        </button>
                                        <button 
                                            onClick={() => navigate('/leads')}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Users className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Gestionar Leads</span>
                                        </button>
                                        <button 
                                            onClick={() => navigate('/reports')}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <BarChartHorizontal className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Ver Reportes</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* Modales */}
            <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title="Registrar Nueva Póliza">
                <NewPolicyForm onPolicyCreated={() => { /* Lógica para refrescar datos */ }} onClose={() => setIsPolicyModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Registrar Nuevo Cliente">
                <NewClientForm onClientCreated={() => { /* Lógica para refrescar datos */ }} onClose={() => setIsClientModalOpen(false)} />
            </Modal>

            <Modal isOpen={isNewDocumentModalOpen} onClose={() => setIsNewDocumentModalOpen(false)} title="Subir Nuevo Documento">
                <NewDocumentForm 
                    onClose={() => setIsNewDocumentModalOpen(false)} 
                    onDocumentUploaded={() => {
                        console.log("Documento subido, refrescar datos aquí");
                        setIsNewDocumentModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
};

// Helper para clases CSS de botones/inputs (asumiendo que existen en index.css o similar)
// .btn-primary { @apply bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 dark:focus:ring-primary-dark; }
// .input-icon { @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4; }
// .input-text { @apply border rounded-lg focus:outline-none focus:ring-1 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 focus:ring-primary focus:border-primary bg-white text-gray-900 dark:border-gray-600 dark:focus:ring-primary-dark dark:focus:border-primary-dark dark:bg-gray-700 dark:text-gray-200; }
// .select-input { @apply border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600; }