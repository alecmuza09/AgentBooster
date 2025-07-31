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
  Building,
  Users,
  FileText,
  DollarSign,
  Target
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import clsx from 'clsx';
import { getPolicies } from '@/data/policies';
import { getLeads } from '@/data/leads';
import { Policy } from '@/types/policy';
import { Lead } from '@/types/lead';
import { 
  getCombinedAnalytics, 
  formatCurrency, 
  formatPercentage,
  type CombinedAnalytics,
  type ReportMetric,
  type ChartDataPoint
} from '@/utils/reports';



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
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CombinedAnalytics | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

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

        // Cargar perfil del usuario
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) console.error("Error cargando el perfil:", error);
          else setProfile(data);
        }
      } catch (error) {
        console.error("Error cargando datos para reportes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);



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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando reportes...</span>
        </div>
      ) : analytics ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.overallMetrics.map((metric) => (
              <div key={metric.label} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.label === 'Prima Total' 
                    ? formatCurrency(metric.value)
                    : metric.label === 'Tasa de Conversión'
                    ? formatPercentage(metric.value)
                    : metric.value.toLocaleString('es-MX')}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {metric.trend === 'up' ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">vs periodo anterior</span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pólizas</p>
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.policies.totalPolicies}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {analytics.policies.activePolicies} activas
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.leads.totalLeads}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {analytics.leads.recentLeads} nuevos este mes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pólizas por Renovar</p>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.policies.policiesNeedingRenewal}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Próximas a vencer
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leads por Seguimiento</p>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.leads.leadsNeedingFollowUp}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Requieren atención
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No se pudieron cargar los datos de reportes
        </div>
      )}

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ingresos por Prima</h2>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analytics.policies.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Policy Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución por Ramo</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.policies.policiesByRamo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.policies.policiesByRamo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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

      {/* Additional Charts */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Status */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Leads por Estado</h2>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.leads.leadsByStatus} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Policies by Aseguradora */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pólizas por Aseguradora</h2>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.policies.policiesByAseguradora}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.policies.policiesByAseguradora.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Leads by Source */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Leads por Fuente</h2>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.leads.leadsBySource} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;