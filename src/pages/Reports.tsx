import React, { useState, useEffect } from 'react';
import { 
  Download,
  Filter, 
  LineChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  AlertCircle,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import clsx from 'clsx';

interface ReportMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartData {
  labels: string[];
  values: number[];
}

// --- Componente de Alerta de Cédula ---
const LicenseStatusCard = ({ profile }) => {
    if (!profile) return <div>Cargando información de la cédula...</div>;

    const { cedula_type, cedula_expiration_date, agencia } = profile;
    if (!cedula_expiration_date) {
        return (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="font-semibold">No hay datos de cédula registrados.</p>
                <p className="text-sm text-gray-500">Por favor, actualiza tu perfil.</p>
            </div>
        );
    }

    const today = new Date();
    const expirationDate = new Date(cedula_expiration_date);
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    let status = {
        text: 'Vigente',
        color: 'green',
        icon: <ShieldCheck className="w-10 h-10" />
    };
    if (daysUntilExpiration <= 0) {
        status = { text: 'Vencida', color: 'red', icon: <AlertCircle className="w-10 h-10" /> };
    } else if (daysUntilExpiration <= 30) {
        status = { text: 'Por Vencer', color: 'yellow', icon: <AlertCircle className="w-10 h-10" /> };
    }
    
    return (
        <div className={clsx("p-6 rounded-lg shadow-lg text-white", `bg-${status.color}-500`)}>
            <div className="flex items-center gap-4">
                {status.icon}
                <div>
                    <p className="font-bold text-2xl">{status.text}</p>
                    <p className="text-sm opacity-90">Tu cédula tipo '{cedula_type}' vence el {expirationDate.toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                <p className="flex items-center gap-2"><Building className="w-4 h-4" /> Agencia: <strong>{agencia || 'No especificada'}</strong></p>
                <p className="flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> Tienes <strong>{daysUntilExpiration > 0 ? daysUntilExpiration : 0} días</strong> para renovarla.</p>
            </div>
        </div>
    );
};

export const Reports = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Placeholder metrics data
  const metrics: ReportMetric[] = [
    {
      label: 'Pólizas Nuevas',
      value: 156,
      change: 12.5,
      trend: 'up'
    },
    {
      label: 'Renovaciones',
      value: 89,
      change: 5.2,
      trend: 'up'
    },
    {
      label: 'Cancelaciones',
      value: 23,
      change: -8.4,
      trend: 'down'
    },
    {
      label: 'Prima Total',
      value: 2345678,
      change: 15.7,
      trend: 'up'
    }
  ];

  // Placeholder chart data
  const revenueData: ChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    values: [150000, 165000, 180000, 172000, 195000, 205000]
  };

  const policyTypeData: ChartData = {
    labels: ['Vida', 'Auto', 'Hogar', 'Salud', 'Negocio'],
    values: [35, 25, 20, 15, 5]
  };

  const policyData: ChartData = {
    labels: ['Vida', 'Auto', 'Hogar', 'Salud', 'Negocio'],
    values: [35, 25, 20, 15, 5]
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) console.error("Error cargando el perfil:", error);
        else setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  // ... (datos de ejemplo para gráficas)
  const salesData = [
    { name: 'Primas de Vida', value: 400 },
    { name: 'Primas de Auto', value: 300 },
    { name: 'Primas de GMM', value: 300 },
    { name: 'Primas de Daños', value: 200 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reportes y Cumplimiento</h1>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Nueva Sección de Cédula */}
      <LicenseStatusCard profile={profile} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {metric.label === 'Prima Total' 
                ? `$${metric.value.toLocaleString('es-MX')}`
                : metric.value.toLocaleString('es-MX')}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {metric.trend === 'up' ? '+' : ''}{metric.change}%
              </span>
              <span className="text-gray-500 ml-1">vs periodo anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ingresos por Prima</h2>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.values.map((value, index) => (
              <div key={index} className="flex-1">
                <div 
                  className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                  style={{ 
                    height: `${(value / Math.max(...revenueData.values)) * 100}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="text-xs text-gray-500 text-center mt-2">
                  {revenueData.labels[index]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Distribución de Pólizas</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {policyTypeData.labels.map((label, index) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium">{policyTypeData.values[index]}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${policyTypeData.values[index]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Reporte Mensual de Ventas</h3>
                  <p className="text-sm text-gray-500">Generado el 1 de Marzo, 2024</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
                Descargar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Primas Vendidas por Ramo</h2>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución de Cartera</h2>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={salesData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label>
                {salesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;