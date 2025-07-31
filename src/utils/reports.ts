import { Policy } from '@/types/policy';
import { Lead, LeadStatus } from '@/types/lead';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ReportMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface PolicyAnalytics {
  totalPolicies: number;
  activePolicies: number;
  cancelledPolicies: number;
  totalPremium: number;
  averagePremium: number;
  policiesByRamo: ChartDataPoint[];
  policiesByAseguradora: ChartDataPoint[];
  policiesByStatus: ChartDataPoint[];
  monthlyRevenue: ChartDataPoint[];
  policiesNeedingRenewal: number;
  policiesWithPendingPayment: number;
}

export interface LeadAnalytics {
  totalLeads: number;
  leadsByStatus: ChartDataPoint[];
  conversionRate: number;
  averageDaysInStage: number;
  leadsBySource: ChartDataPoint[];
  recentLeads: number;
  leadsNeedingFollowUp: number;
}

export interface CombinedAnalytics {
  policies: PolicyAnalytics;
  leads: LeadAnalytics;
  overallMetrics: ReportMetric[];
}

// Función para calcular métricas de pólizas
export const calculatePolicyAnalytics = (policies: Policy[]): PolicyAnalytics => {
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subDays(now, 30));

  // Métricas básicas
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const cancelledPolicies = policies.filter(p => p.status === 'cancelled').length;
  
  // Cálculo de primas
  const totalPremium = policies.reduce((sum, p) => sum + (p.premiumAmount || 0), 0);
  const averagePremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0;

  // Pólizas por ramo
  const ramoCount = policies.reduce((acc, p) => {
    acc[p.ramo] = (acc[p.ramo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const policiesByRamo: ChartDataPoint[] = Object.entries(ramoCount).map(([name, value]) => ({
    name,
    value
  }));

  // Pólizas por aseguradora
  const aseguradoraCount = policies.reduce((acc, p) => {
    acc[p.aseguradora] = (acc[p.aseguradora] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const policiesByAseguradora: ChartDataPoint[] = Object.entries(aseguradoraCount).map(([name, value]) => ({
    name,
    value
  }));

  // Pólizas por estado
  const statusCount = policies.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const policiesByStatus: ChartDataPoint[] = Object.entries(statusCount).map(([name, value]) => ({
    name: getStatusLabel(name),
    value
  }));

  // Ingresos mensuales (simulado basado en fecha de pago)
  const monthlyRevenue: ChartDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subDays(now, i * 30);
    const monthName = format(monthDate, 'MMM', { locale: es });
    
    // Simular ingresos basados en pólizas activas
    const monthPolicies = policies.filter(p => {
      if (!p.fechaPagoActual) return false;
      const paymentDate = parseISO(p.fechaPagoActual);
      return paymentDate.getMonth() === monthDate.getMonth() && 
             paymentDate.getFullYear() === monthDate.getFullYear();
    });
    
    const monthRevenue = monthPolicies.reduce((sum, p) => sum + (p.premiumAmount || 0), 0);
    monthlyRevenue.push({ name: monthName, value: monthRevenue });
  }

  // Pólizas que necesitan renovación (próximas a vencer)
  const policiesNeedingRenewal = policies.filter(p => {
    if (!p.vigenciaTotal?.fin) return false;
    const endDate = parseISO(p.vigenciaTotal.fin);
    const daysUntilExpiry = differenceInDays(endDate, now);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Pólizas con pagos pendientes
  const policiesWithPendingPayment = policies.filter(p => p.hasPendingPayment).length;

  return {
    totalPolicies,
    activePolicies,
    cancelledPolicies,
    totalPremium,
    averagePremium,
    policiesByRamo,
    policiesByAseguradora,
    policiesByStatus,
    monthlyRevenue,
    policiesNeedingRenewal,
    policiesWithPendingPayment
  };
};

// Función para calcular métricas de leads
export const calculateLeadAnalytics = (leads: Lead[]): LeadAnalytics => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Métricas básicas
  const totalLeads = leads.length;
  
  // Leads por estado
  const statusCount = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const leadsByStatus: ChartDataPoint[] = Object.entries(statusCount).map(([name, value]) => ({
    name: getLeadStatusLabel(name as LeadStatus),
    value
  }));

  // Tasa de conversión (leads cerrados vs total)
  const closedLeads = statusCount['Cerrado'] || 0;
  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  // Promedio de días en etapa
  const totalDays = leads.reduce((sum, lead) => {
    if (lead.statusUpdatedAt) {
      const updateDate = parseISO(lead.statusUpdatedAt);
      return sum + differenceInDays(now, updateDate);
    }
    return sum;
  }, 0);
  const averageDaysInStage = totalLeads > 0 ? totalDays / totalLeads : 0;

  // Leads por fuente
  const sourceCount = leads.reduce((acc, l) => {
    const source = l.source || 'Sin especificar';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadsBySource: ChartDataPoint[] = Object.entries(sourceCount).map(([name, value]) => ({
    name,
    value
  }));

  // Leads recientes (últimos 30 días)
  const recentLeads = leads.filter(l => {
    if (!l.createdAt) return false;
    const createdDate = parseISO(l.createdAt);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Leads que necesitan seguimiento (más de 7 días sin contacto)
  const leadsNeedingFollowUp = leads.filter(l => {
    if (!l.lastContactedDate || l.status === 'Cerrado' || l.status === 'Frenado') return false;
    const lastContact = parseISO(l.lastContactedDate);
    return differenceInDays(now, lastContact) > 7;
  }).length;

  return {
    totalLeads,
    leadsByStatus,
    conversionRate,
    averageDaysInStage,
    leadsBySource,
    recentLeads,
    leadsNeedingFollowUp
  };
};

// Función para calcular métricas generales
export const calculateOverallMetrics = (
  policies: Policy[], 
  leads: Lead[], 
  previousPeriodPolicies: Policy[] = [], 
  previousPeriodLeads: Lead[] = []
): ReportMetric[] => {
  const policyAnalytics = calculatePolicyAnalytics(policies);
  const leadAnalytics = calculateLeadAnalytics(leads);
  
  const previousPolicyAnalytics = calculatePolicyAnalytics(previousPeriodPolicies);
  const previousLeadAnalytics = calculateLeadAnalytics(previousPeriodLeads);

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return [
    {
      label: 'Pólizas Activas',
      value: policyAnalytics.activePolicies,
      change: calculateChange(policyAnalytics.activePolicies, previousPolicyAnalytics.activePolicies),
      trend: policyAnalytics.activePolicies >= previousPolicyAnalytics.activePolicies ? 'up' : 'down'
    },
    {
      label: 'Nuevos Leads',
      value: leadAnalytics.recentLeads,
      change: calculateChange(leadAnalytics.recentLeads, previousLeadAnalytics.recentLeads),
      trend: leadAnalytics.recentLeads >= previousLeadAnalytics.recentLeads ? 'up' : 'down'
    },
    {
      label: 'Tasa de Conversión',
      value: Math.round(leadAnalytics.conversionRate),
      change: calculateChange(leadAnalytics.conversionRate, previousLeadAnalytics.conversionRate),
      trend: leadAnalytics.conversionRate >= previousLeadAnalytics.conversionRate ? 'up' : 'down'
    },
    {
      label: 'Prima Total',
      value: policyAnalytics.totalPremium,
      change: calculateChange(policyAnalytics.totalPremium, previousPolicyAnalytics.totalPremium),
      trend: policyAnalytics.totalPremium >= previousPolicyAnalytics.totalPremium ? 'up' : 'down'
    }
  ];
};

// Función para obtener datos combinados
export const getCombinedAnalytics = async (
  policies: Policy[], 
  leads: Lead[]
): Promise<CombinedAnalytics> => {
  const policyAnalytics = calculatePolicyAnalytics(policies);
  const leadAnalytics = calculateLeadAnalytics(leads);
  const overallMetrics = calculateOverallMetrics(policies, leads);

  return {
    policies: policyAnalytics,
    leads: leadAnalytics,
    overallMetrics
  };
};

// Funciones auxiliares
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'active': 'Activas',
    'cancelled': 'Canceladas',
    'expired': 'Vencidas',
    'pending': 'Pendientes'
  };
  return labels[status] || status;
};

const getLeadStatusLabel = (status: LeadStatus): string => {
  const labels: Record<LeadStatus, string> = {
    'Nuevo': 'Nuevos',
    'Contactado': 'Contactados',
    'Cita': 'Citas',
    'Propuesta': 'Propuestas',
    'Cerrado': 'Cerrados',
    'Frenado': 'Frenados'
  };
  return labels[status] || status;
};

// Función para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

// Función para formatear porcentaje
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
}; 