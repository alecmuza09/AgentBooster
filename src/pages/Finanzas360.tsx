import React, { useState } from 'react';
import { LayoutDashboard, Wallet, PiggyBank, Briefcase, Handshake, HeartPulse, User, TrendingUp, Scale } from 'lucide-react';
import clsx from 'clsx';
import { DatosGeneralesPanel } from '../components/finanzas/DatosGeneralesPanel';
import { IngresosPanel } from '../components/finanzas/IngresosPanel';
import { GastosPanel } from '../components/finanzas/GastosPanel';
import { BalancePanel } from '../components/finanzas/BalancePanel';
import InversionesPanel from '../components/finanzas/InversionesPanel';
import SegurosPanel from '../components/finanzas/SegurosPanel';
// Importaremos los componentes de cada módulo aquí when los creemos
// import { IngresosPanel } from './components/finanzas/IngresosPanel';
// import { GastosPanel } from './components/finanzas/GastosPanel';
// etc...

const TABS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Datos Generales', icon: User },
  { name: 'Ingresos', icon: Wallet },
  { name: 'Gastos', icon: PiggyBank },
  { name: 'Balance Financiero', icon: Scale },
  { name: 'Inversiones', icon: TrendingUp },
  { name: 'Gestión de Seguros', icon: HeartPulse },
];

export const Finanzas360 = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <div>Contenido del Dashboard Principal...</div>;
      case 'Datos Generales':
        return <DatosGeneralesPanel />; // Aquí irá <DatosGeneralesPanel />
      case 'Ingresos':
        return <IngresosPanel />;
      case 'Gastos':
        return <GastosPanel />;
      case 'Balance Financiero':
        return <BalancePanel />;
      case 'Inversiones':
        return <InversionesPanel />;
      case 'Gestión de Seguros':
        return <SegurosPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          Finanzas Personales 360
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Una vista completa de tu salud financiera.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 flex-grow">
        {/* Navegación de Pestañas (Vertical) */}
        <aside className="md:w-1/5">
          <nav className="flex flex-row md:flex-col gap-2">
            {TABS.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.name
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden md:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-grow md:w-4/5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Finanzas360; 