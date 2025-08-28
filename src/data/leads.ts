import { supabase } from '../supabaseClient';
import { Lead, LeadData, LeadStatus } from '../types/lead';
import { subDays, formatISO } from 'date-fns';

const now = new Date();

export const getLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) throw new Error(error.message);
    // Mapea los campos de snake_case a camelCase
    return data.map(d => ({
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
};

export const createLead = async (leadData: LeadData): Promise<Lead> => {
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
    if (error) throw new Error(error.message);
    return {
        ...data,
        potentialValue: data.potential_value,
        statusUpdatedAt: data.status_updated_at,
        createdAt: data.created_at
    } as Lead;
};

export const updateLeadStatus = async (leadId: string, newStatus: string): Promise<Lead> => {
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
}

export const updateLead = async (id: string, updates: Partial<LeadData>): Promise<Lead> => {
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

    if (error) throw new Error(error.message);
    return {
        ...data,
        potentialValue: data.potential_value,
        statusUpdatedAt: data.status_updated_at,
        createdAt: data.created_at
    } as Lead;
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