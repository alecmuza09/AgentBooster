import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, AlertCircle, TrendingUp, LucideIcon,
    PlusCircle, UploadCloud, FilePlus, Bell, CheckCircle, XCircle,
    UserCheck, CalendarCheck, BarChartHorizontal, Search, Filter,
    Eye, Mail, Trash, UserCircle, DollarSign // Añadir icono para actor
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNowStrict } from 'date-fns'; // Añadir formatDistanceToNowStrict
import { es } from 'date-fns/locale'; // Usar locale completo
import { Modal } from '../components/Modal';
import { NewPolicyForm } from '../components/NewPolicyForm';
import { NewDocumentForm } from '../components/NewDocumentForm';
import { NewClientForm } from '../components/NewClientForm';

// Importar datos de ejemplo (Actualizado)
import { examplePolicies, Policy } from '../data/policies';

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

// Simulación de datos de Primas Vendidas
const salesData = [
    { agent: 'Ana López', type: 'Vida', amount: 15000 },
    { agent: 'Carlos Marín', type: 'Auto', amount: 8500 },
    { agent: 'Sofía Reyes', type: 'Vida', amount: 22000 },
    { agent: 'Javier Peña', type: 'Gastos Médicos', amount: 12000 },
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
    
    // Estados para los modales
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
    const [activitySearch, setActivitySearch] = useState('');

    // Póliza de ejemplo para el modal de documentos
    const dummyPolicyForUpload: Policy = examplePolicies[0] || {
        id: 'dummy-1',
        policyNumber: 'POL-000',
        clientName: 'Cliente de Ejemplo',
        status: 'active',
        insuranceType: 'Vida',
        premium: 0,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
    };

    // --- Cálculos de Indicadores ---
    const activePoliciesCount = useMemo(() => {
        return examplePolicies.filter(p => p.status === 'active').length;
    }, [examplePolicies]);

    const pendingPaymentsCount = useMemo(() => {
        // Contar desde pólizas O clientes (aquí desde pólizas)
        return examplePolicies.filter(p => p.hasPendingPayment === true).length;
    }, [examplePolicies]);

    const upcomingTasks = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return exampleActivities
            .filter(item => item.type === 'task' && item.dueDate && item.dueDate >= now && item.dueDate <= sevenDaysFromNow)
            .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());
    }, [exampleActivities]);

    // --- Agregación de Primas Vendidas Simuladas ---
    const totalSales = salesData.reduce((acc, sale) => acc + sale.amount, 0);
    
    const salesByAgent = useMemo(() => {
        return salesData.reduce((acc, item) => {
            acc[item.agent] = (acc[item.agent] || 0) + item.amount;
            return acc;
        }, {} as Record<string, number>);
    }, [salesData]);

    const salesByType = useMemo(() => {
        return salesData.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + item.amount;
            return acc;
        }, {} as Record<string, number>);
    }, [salesData]);

    const filteredActivities = useMemo(() => {
        // Incluir búsqueda por actor
        return exampleActivities
            .filter(item => activityFilter === 'all' || item.type === activityFilter)
            .filter(item => {
                if (!activitySearch) return true;
                const searchTerm = activitySearch.toLowerCase();
                return (
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    (item.clientName && item.clientName.toLowerCase().includes(searchTerm)) ||
                    (item.policyNumber && item.policyNumber.toLowerCase().includes(searchTerm)) ||
                    (item.actor && item.actor.toLowerCase().includes(searchTerm)) // Buscar por actor
                );
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Ordenar por más reciente
    }, [activityFilter, activitySearch, exampleActivities]);

    const advisorName = "John Doe"; // Simular nombre del asesor

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Cabecera y Acciones Rápidas */}
            <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsClientModalOpen(true)} className="btn-secondary flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> Nuevo Cliente
                        </button>
                        <button onClick={() => setIsPolicyModalOpen(true)} className="btn-secondary flex items-center gap-2">
                            <FilePlus className="w-4 h-4" /> Nueva Póliza
                        </button>
                        <button onClick={() => setIsNewDocumentModalOpen(true)} className="btn-primary flex items-center gap-2">
                            <UploadCloud className="w-4 h-4" /> Subir Documento
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido principal del Dashboard */}
            <main className="flex-grow space-y-8">
                {/* 1. KPIs Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <StatCard
                        title="Pólizas Activas"
                        value={activePoliciesCount}
                        icon={FileText}
                        onClick={() => navigate('/policies?status=active')} // Navegar a pólizas filtradas
                     />
                     <StatCard
                        title="Pagos Pendientes"
                        value={pendingPaymentsCount}
                        icon={AlertCircle}
                        colorClass={pendingPaymentsCount > 0 ? 'border-red-500 text-red-600' : ''} // Resaltar si hay pendientes
                        note={pendingPaymentsCount > 0 ? 'Requieren atención inmediata' : 'Todo al día'}
                        onClick={() => navigate('/policies?pendingPayment=true')} // Navegar
                    />
                    {/* Añadir más StatCards si es necesario (Ej: Nuevos Clientes Mes, Renovaciones Próximas) */}
                    <StatCard
                        title="Tareas Próximas (7 días)"
                        value={upcomingTasks.length}
                        icon={CalendarCheck}
                        note={upcomingTasks.length > 0 ? 'Ver detalles abajo' : 'Sin tareas próximas'}
                     />
                     <StatCard
                         title="Primas Vendidas Totales (Simulado)"
                         value={`$${totalSales.toLocaleString()}`}
                         icon={DollarSign}
                         note="Datos de ejemplo"
                     />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3. Tareas Pendientes y Actividad Reciente */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Sección Tareas Próximas */} 
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Tareas por Vencimiento (Próximos 7 días)</h2>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                                {upcomingTasks.length > 0 ? (
                                    upcomingTasks.map(task => <ActivityItem key={task.id} item={task} />)
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay tareas próximas.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Sección Actividad Reciente / Logs */} 
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Actividad Reciente y Logs</h2>
                             {/* Controles de Filtro y Búsqueda para Logs */} 
                             <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border dark:border-gray-700">
                                 <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                     <input
                                         type="text"
                                         placeholder="Buscar en actividad..."
                                         className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                                         value={activitySearch}
                                         onChange={(e) => setActivitySearch(e.target.value)}
                                     />
                                 </div>
                                 <select
                                     value={activityFilter}
                                     onChange={(e) => setActivityFilter(e.target.value as ActivityType | 'all')}
                                     className="text-sm border rounded-md p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                                >
                                     <option value="all">Todo Tipo</option>
                                     <option value="policy">Pólizas</option>
                                     <option value="document">Documentos</option>
                                     <option value="payment_received">Pagos Recibidos</option>
                                     <option value="payment_pending">Pagos Pendientes</option>
                                     <option value="renewal_alert">Alertas Renovación</option>
                                     <option value="task">Tareas</option>
                                 </select>
                             </div>
                             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
                                 {filteredActivities.length > 0 ? (
                                    filteredActivities.map(item => <ActivityItem key={item.id} item={item} />)
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No se encontró actividad con esos filtros.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Reporte de Primas Vendidas Simuladas */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Primas Vendidas por Agente (Simulado)</h2>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                <ul className="space-y-2 text-sm">
                                    {Object.entries(salesByAgent).sort(([, a], [, b]) => b - a).map(([agent, amount]) => (
                                        <li key={agent} className="flex justify-between items-center">
                                            <span className="text-gray-700 dark:text-gray-300">{agent}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">${amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                 </ul>
                            </div>
                        </div>
                        <div>
                             <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Primas Vendidas por Tipo Seguro (Simulado)</h2>
                             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                <ul className="space-y-2 text-sm">
                                    {Object.entries(salesByType).sort(([, a], [, b]) => b - a).map(([type, amount]) => (
                                        <li key={type} className="flex justify-between items-center">
                                            <span className="text-gray-700 dark:text-gray-300">{type}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">${amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                 </ul>
                            </div>
                        </div>
                        {/* Aquí se podría añadir un gráfico simple si se instala una librería */}
                     </div>
                </div>
            </main>

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