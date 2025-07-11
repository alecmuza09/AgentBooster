import React, { useState } from 'react';
import { LineChart, Megaphone, ShoppingBag, ClipboardList, History, Facebook, Instagram, MessageSquare, Settings } from 'lucide-react';
import clsx from 'clsx';

// Datos/Componentes de ejemplo para las secciones
const AnalyticsOverview = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Resumen de Analíticas de Marketing</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="p-4 border dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">Leads de Campaña (Vida - Q2)</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">23</p>
        <p className="text-xs text-green-500">+5% vs Q1</p>
      </div>
      <div className="p-4 border dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">Tasa Conversión (GMM - Facebook)</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">12%</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Costo por Lead: $150 MXN</p>
      </div>
      <div className="p-4 border dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">Visitas a Página de Aterrizaje (Autos)</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">480</p>
        <p className="text-xs text-red-500">-10% vs semana pasada</p>
      </div>
    </div>
    {/* Placeholder para gráfico */}
    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <p className="text-gray-400 dark:text-gray-500">[Placeholder para Gráfico de Tendencia de Leads]</p>
    </div>
  </div>
);

const SocialMediaIntegration = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Gestión de Redes Sociales</h3>
    <div className="flex space-x-4 mb-6">
      <button className="flex items-center px-4 py-2 border rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
        <Facebook className="w-4 h-4 mr-2" /> Publicar en Facebook
      </button>
      <button className="flex items-center px-4 py-2 border rounded-md text-sm font-medium bg-pink-500 text-white hover:bg-pink-600">
        <Instagram className="w-4 h-4 mr-2" /> Publicar en Instagram
      </button>
    </div>
    <div className="space-y-4">
      <div className="p-3 border dark:border-gray-700 rounded-md">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Última Publicación (Facebook): "5 Mitos sobre los Seguros de Vida"</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Alcance: 1.2K | Interacciones: 45 | Comentarios: 3</p>
      </div>
      <div className="p-3 border dark:border-gray-700 rounded-md">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Programado (Instagram): "Infografía: Beneficios del Seguro de GMM" - Mañana 10:00 AM</p>
      </div>
    </div>
  </div>
);

const MarketingServices = () => (
   <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
     <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Catálogo de Servicios de Marketing</h3>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="p-4 border dark:border-gray-700 rounded-lg">
         <ShoppingBag className="w-6 h-6 mb-2 text-primary dark:text-primary-dark"/>
         <p className="font-semibold text-gray-800 dark:text-gray-200">Campaña de Leads (Seguro de Auto)</p>
         <p className="text-sm text-gray-600 dark:text-gray-400">Segmentación, anuncios y landing page para atraer prospectos de seguro de auto.</p>
         <button className="mt-3 px-3 py-1 text-sm bg-primary dark:bg-primary-dark text-white rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark">Solicitar Info</button>
       </div>
       <div className="p-4 border dark:border-gray-700 rounded-lg">
         <Megaphone className="w-6 h-6 mb-2 text-primary dark:text-primary-dark"/>
         <p className="font-semibold text-gray-800 dark:text-gray-200">Newsletter Mensual para Clientes</p>
         <p className="text-sm text-gray-600 dark:text-gray-400">Diseño, contenido y envío de boletín para fidelizar clientes y promover cross-selling.</p>
         <button className="mt-3 px-3 py-1 text-sm bg-primary dark:bg-primary-dark text-white rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark">Solicitar Info</button>
       </div>
       {/* Añadir más servicios de ejemplo */}
     </div>
   </div>
);

// Define los tipos de pestañas disponibles
type MarketingTab = 'analytics' | 'social' | 'services' | 'forms' | 'history' | 'chat' | 'settings';

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('analytics');

  const tabs: { id: MarketingTab; name: string; icon: React.ElementType }[] = [
    { id: 'analytics', name: 'Analíticas', icon: LineChart },
    { id: 'social', name: 'Redes Sociales', icon: Megaphone }, // O usar Instagram/Facebook combinado?
    { id: 'services', name: 'Servicios', icon: ShoppingBag },
    { id: 'forms', name: 'Formularios', icon: ClipboardList },
    { id: 'history', name: 'Historial', icon: History },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsOverview />;
      case 'social':
         return <SocialMediaIntegration />;
      case 'services':
        return <MarketingServices />;
      case 'forms':
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Formularios de Captación</h3>
            <div className="mt-4 space-y-3">
              <div className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Formulario: "Cotiza tu Seguro de Gastos Médicos Mayores"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Respuestas: 12 | Tasa de conversión: 8%</p>
                </div>
                <button className="text-sm text-primary dark:text-primary-dark hover:underline">Ver Respuestas</button>
              </div>
              <div className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Formulario: "Solicitud de Asesoría - Seguros de Vida"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Respuestas: 5 | Tasa de conversión: N/A</p>
                </div>
                <button className="text-sm text-primary dark:text-primary-dark hover:underline">Ver Respuestas</button>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Historial de Actividad de Marketing</h3>
            <ul className="mt-4 space-y-3 divide-y dark:divide-gray-700">
              <li className="pt-3 first:pt-0">
                <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Campaña Email:</span> "Renovación Pólizas GMM - Junio" enviada a 120 clientes.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hace 2 días - Aperturas: 45%, Clics: 12%</p>
              </li>
              <li className="pt-3">
                <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Publicación FB:</span> "Ventajas de tener un seguro de hogar" programada.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hace 1 día - Para el 15/07/2024</p>
              </li>
              <li className="pt-3">
                <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Formulario:</span> Nueva respuesta en "Cotiza tu Seguro de Auto" de Mónica Herrera.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hace 3 horas</p>
              </li>
            </ul>
          </div>
        );
      case 'chat':
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat / Mensajería</h3><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Integración con herramientas de chat para marketing o soporte.</p></div>;
      case 'settings':
         return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Configuración de Marketing</h3><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Ajustes de integraciones, plantillas, audiencias, etc.</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Marketing y Ventas</h1>

      {/* Navegación por Pestañas */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              )}
            >
              <tab.icon
                 className={clsx(
                    '-ml-0.5 mr-2 h-5 w-5',
                    activeTab === tab.id ? 'text-primary dark:text-primary-dark' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                  )}
                 aria-hidden="true"
               />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Marketing; 