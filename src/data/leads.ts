import { supabase } from '../supabaseClient';
import { Lead, LeadData, LeadStatus } from '../types/lead';
import { subDays, formatISO } from 'date-fns';

const now = new Date();

// Cache para optimizar consultas de leads
let leadsCache: { data: Lead[]; timestamp: number } | null = null;
const LEADS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutos para leads (actualización frecuente)

export const getLeads = async (forceRefresh: boolean = false): Promise<Lead[]> => {
    try {
        console.log('Leads: Intentando obtener leads desde Supabase...');

        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('Leads: Credenciales de Supabase no configuradas, usando datos mock');
            return mockLeads;
        }

        // Verificar cache si no se fuerza refresh
        if (!forceRefresh && leadsCache && (Date.now() - leadsCache.timestamp) < LEADS_CACHE_DURATION) {
            console.log('Leads: Usando datos del cache');
            return leadsCache.data;
        }

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(300); // Limitar para rendimiento

        if (error) {
            console.error('Leads: Error obteniendo leads desde Supabase:', error);
            console.log('Leads: Usando datos mock debido a error');
            return mockLeads;
        }

        if (!data || data.length === 0) {
            console.log('Leads: No hay leads en la base de datos, usando datos mock');
            return mockLeads;
        }

        console.log('Leads: Datos obtenidos exitosamente:', data.length);

        // Mapea los campos de snake_case a camelCase
        const mappedLeads = data.map(d => ({
            id: d.id,
            name: d.name,
            email: d.email,
            phone: d.phone,
            status: d.status,
            source: d.source,
            potentialValue: d.potential_value,
            lastContactedDate: d.last_contacted_date,
            createdAt: d.created_at,
            statusUpdatedAt: d.status_updated_at,
            notes: d.notes,
        })) as Lead[];

        // Guardar en cache
        leadsCache = {
            data: mappedLeads,
            timestamp: Date.now()
        };

        return mappedLeads;
    } catch (error) {
        console.error('Leads: Error inesperado:', error);
        console.log('Leads: Usando datos mock debido a error inesperado');
        return mockLeads;
    }
};

// Función para obtener leads básicos (solo para dashboard)
export const getLeadsBasic = async (): Promise<any[]> => {
    try {
        // Verificar cache primero
        if (leadsCache && (Date.now() - leadsCache.timestamp) < LEADS_CACHE_DURATION) {
            return leadsCache.data.map(l => ({
                id: l.id,
                name: l.name,
                status: l.status,
                source: l.source,
                potentialValue: l.potentialValue
            }));
        }

        const { data, error } = await supabase
            .from('leads')
            .select('id, name, status, source, potential_value')
            .order('created_at', { ascending: false })
            .limit(300);

        if (error) {
            console.error('Error fetching basic leads:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getLeadsBasic:', error);
        return [];
    }
};

// Función para invalidar cache de leads
export const invalidateLeadsCache = () => {
    leadsCache = null;
};

export const createLead = async (leadData: LeadData): Promise<Lead> => {
    try {
        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('Leads: Creando lead en modo desarrollo (mock)');
            // Crear un lead mock
            const mockLead: Lead = {
                id: `mock-${Date.now()}`,
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                status: leadData.status,
                source: leadData.source,
                potentialValue: leadData.potentialValue,
                lastContactedDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                statusUpdatedAt: new Date().toISOString(),
                notes: leadData.notes,
            };
            return mockLead;
        }

        const { data, error } = await supabase
            .from('leads')
            .insert({
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                status: leadData.status,
                source: leadData.source,
                potential_value: leadData.potentialValue,
                notes: leadData.notes,
            })
            .select()
            .single();
            
        if (error) {
            console.error('Leads: Error creando lead:', error);
            throw new Error(error.message);
        }
        
        return {
            ...data,
            potentialValue: data.potential_value,
            statusUpdatedAt: data.status_updated_at,
            createdAt: data.created_at
        } as Lead;
    } catch (error) {
        console.error('Leads: Error inesperado creando lead:', error);
        throw error;
    }
};

export const updateLeadStatus = async (leadId: string, newStatus: string): Promise<Lead> => {
    try {
        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('Leads: Actualizando lead en modo desarrollo (mock)');
            // Buscar el lead en los datos mock y actualizarlo
            const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
            if (leadIndex !== -1) {
                mockLeads[leadIndex].status = newStatus as LeadStatus;
                mockLeads[leadIndex].statusUpdatedAt = new Date().toISOString();
                return mockLeads[leadIndex];
            }
            throw new Error('Lead no encontrado');
        }

        const { data, error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', leadId)
            .select()
            .single();

        if (error) {
            console.error('Error updating lead status:', error);
            throw new Error(error.message);
        }
        
        return data as Lead;
    } catch (error) {
        console.error('Leads: Error inesperado actualizando lead:', error);
        throw error;
    }
}

export const updateLead = async (id: string, updates: Partial<LeadData>): Promise<Lead> => {
    try {
        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('Leads: Actualizando lead en modo desarrollo (mock)');
            // Buscar el lead en los datos mock y actualizarlo
            const leadIndex = mockLeads.findIndex(lead => lead.id === id);
            if (leadIndex !== -1) {
                mockLeads[leadIndex] = {
                    ...mockLeads[leadIndex],
                    ...updates,
                    statusUpdatedAt: new Date().toISOString()
                };
                return mockLeads[leadIndex];
            }
            throw new Error('Lead no encontrado');
        }

        const { data, error } = await supabase
            .from('leads')
            .update({
                name: updates.name,
                email: updates.email,
                phone: updates.phone,
                status: updates.status,
                source: updates.source,
                potential_value: updates.potentialValue,
                notes: updates.notes,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Leads: Error actualizando lead:', error);
            throw new Error(error.message);
        }
        
        return {
            ...data,
            potentialValue: data.potential_value,
            statusUpdatedAt: data.status_updated_at,
            createdAt: data.created_at
        } as Lead;
    } catch (error) {
        console.error('Leads: Error inesperado actualizando lead:', error);
        throw error;
    }
};

// --- Mock Data ---

// Datos de ejemplo para el desarrollo local.
// Asegúrate de que los valores coincidan con el tipo `Lead` y `LeadStatus`.
export const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '5512345678',
      status: 'Nuevo',
      source: 'Referido',
      potentialValue: 5000,
      lastContactedDate: formatISO(subDays(now, 5)),
      createdAt: formatISO(subDays(now, 10)),
      statusUpdatedAt: formatISO(subDays(now, 3)),
    },
    {
      id: '2',
      name: 'Ana García',
      email: 'ana.garcia@example.com',
      phone: '5587654321',
      status: 'Contactado',
      source: 'Página Web',
      potentialValue: 10000,
      lastContactedDate: formatISO(subDays(now, 1)),
      createdAt: formatISO(subDays(now, 8)),
      statusUpdatedAt: formatISO(subDays(now, 1)),
    },
     {
      id: '3',
      name: 'Carlos Sánchez',
      phone: '5555555555',
      status: 'Cita',
      source: 'Llamada en frío',
      createdAt: formatISO(subDays(now, 40)),
      statusUpdatedAt: formatISO(subDays(now, 2)),
      potentialValue: 7500,
    },
    {
      id: '4',
      name: 'Sofía Martínez',
      phone: '5511223344',
      status: 'Propuesta',
      source: 'Evento',
      potentialValue: 25000,
      createdAt: formatISO(subDays(now, 28)),
      statusUpdatedAt: formatISO(subDays(now, 1)),
    },
    {
      id: '5',
      name: 'Luis Hernández',
      phone: '5544332211',
      status: 'Cerrado',
      source: 'Referido',
      potentialValue: 15000,
      createdAt: formatISO(subDays(now, 60)),
      statusUpdatedAt: formatISO(subDays(now, 10)),
    },
    {
      id: '6',
      name: 'Laura Gómez',
      phone: '5599887766',
      status: 'Frenado',
      source: 'Página Web',
      notes: 'El cliente pidió esperar al siguiente trimestre.',
      createdAt: formatISO(subDays(now, 35)),
      statusUpdatedAt: formatISO(subDays(now, 15)),
    }
];