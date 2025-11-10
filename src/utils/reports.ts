import { Policy } from '@/types/policy';
import { Lead, LeadStatus } from '@/types/lead';
import { PolicyWithClient, UserFinancialSummary } from '@/types/client';
import { supabase } from '@/supabaseClient';
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

// ================================
// FUNCIONES PARA VISTAS DE BASE DE DATOS
// ================================

/**
 * Obtiene pólizas con información del cliente usando la vista optimizada
 */
export const getPoliciesWithClientInfo = async (userId?: string): Promise<PolicyWithClient[]> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    let query = supabase.from('policies_with_clients').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching policies with client info:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPoliciesWithClientInfo:', error);
    return [];
  }
};

/**
 * Obtiene resumen financiero del usuario usando la vista optimizada
 */
export const getUserFinancialSummary = async (userId: string): Promise<UserFinancialSummary | null> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning null');
      return null;
    }

    const { data, error } = await supabase
      .from('user_financial_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user financial summary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserFinancialSummary:', error);
    return null;
  }
};

/**
 * Obtiene métricas avanzadas de pólizas usando las vistas de BD
 */
export const getAdvancedPolicyAnalytics = async (userId: string): Promise<{
  totalPolicies: number;
  activePolicies: number;
  policiesWithAlerts: number;
  totalPremiumValue: number;
  averagePremium: number;
  topClientsByPolicies: Array<{
    client_name: string;
    policy_count: number;
    total_premium: number;
  }>;
  policiesByExpiryMonth: Array<{
    month: string;
    count: number;
  }>;
}> => {
  try {
    // Obtener resumen financiero básico
    const financialSummary = await getUserFinancialSummary(userId);

    // Obtener pólizas con info de clientes
    const policiesWithClients = await getPoliciesWithClientInfo(userId);

    // Calcular métricas adicionales
    const topClientsByPolicies = policiesWithClients
      .reduce((acc, policy) => {
        const clientName = policy.client_name || 'Sin Cliente';
        const existing = acc.find(c => c.client_name === clientName);

        if (existing) {
          existing.policy_count += 1;
          existing.total_premium += policy.total || 0;
        } else {
          acc.push({
            client_name: clientName,
            policy_count: 1,
            total_premium: policy.total || 0
          });
        }

        return acc;
      }, [] as Array<{ client_name: string; policy_count: number; total_premium: number }>)
      .sort((a, b) => b.policy_count - a.policy_count)
      .slice(0, 10);

    // Pólizas por mes de expiración
    const policiesByExpiryMonth = policiesWithClients
      .filter(p => p.fecha_vigencia_final)
      .reduce((acc, policy) => {
        const expiryDate = new Date(policy.fecha_vigencia_final);
        const monthKey = format(expiryDate, 'yyyy-MM');

        const existing = acc.find(m => m.month === monthKey);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({
            month: monthKey,
            count: 1
          });
        }

        return acc;
      }, [] as Array<{ month: string; count: number }>)
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalPolicies: financialSummary?.total_policies || 0,
      activePolicies: financialSummary?.active_policies || 0,
      policiesWithAlerts: financialSummary?.policies_with_alerts || 0,
      totalPremiumValue: financialSummary?.total_premium_value || 0,
      averagePremium: financialSummary?.average_premium || 0,
      topClientsByPolicies,
      policiesByExpiryMonth
    };

  } catch (error) {
    console.error('Error in getAdvancedPolicyAnalytics:', error);
    return {
      totalPolicies: 0,
      activePolicies: 0,
      policiesWithAlerts: 0,
      totalPremiumValue: 0,
      averagePremium: 0,
      topClientsByPolicies: [],
      policiesByExpiryMonth: []
    };
  }
};

/**
 * Obtiene alertas inteligentes del sistema
 */
export const getSystemAlerts = async (userId: string): Promise<{
  pendingPayments: number;
  expiringPolicies: number;
  overduePayments: number;
  clientsWithAlerts: number;
  totalAlerts: number;
}> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return {
        pendingPayments: 0,
        expiringPolicies: 0,
        overduePayments: 0,
        clientsWithAlerts: 0,
        totalAlerts: 0
      };
    }

    // Consultar pólizas que expiran pronto (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: expiringPolicies, error: expiringError } = await supabase
      .from('policies')
      .select('id')
      .eq('user_id', userId)
      .lte('vigencia_total_fin', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('vigencia_total_fin', new Date().toISOString().split('T')[0]);

    // Consultar pólizas con pagos pendientes
    const { data: pendingPolicies, error: pendingError } = await supabase
      .from('policies')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending_renewal', 'overdue_critical']);

    // Consultar clientes con alertas
    const { data: clientsWithAlerts, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .or('alerts->>pending_payments.eq.true,alerts->>expired_docs.eq.true');

    const pendingPayments = pendingPolicies?.length || 0;
    const expiringPoliciesCount = expiringPolicies?.length || 0;
    const overduePayments = pendingPolicies?.filter(p =>
      pendingPolicies.some(pp => pp.id === p.id)
    ).length || 0;
    const clientsWithAlertsCount = clientsWithAlerts?.length || 0;

    return {
      pendingPayments,
      expiringPolicies: expiringPoliciesCount,
      overduePayments,
      clientsWithAlerts: clientsWithAlertsCount,
      totalAlerts: pendingPayments + expiringPoliciesCount + overduePayments + clientsWithAlertsCount
    };

  } catch (error) {
    console.error('Error in getSystemAlerts:', error);
    return {
      pendingPayments: 0,
      expiringPolicies: 0,
      overduePayments: 0,
      clientsWithAlerts: 0,
      totalAlerts: 0
    };
  }
}; 