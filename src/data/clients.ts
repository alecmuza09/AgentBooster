import { Client } from '../types/client';
import { subDays, addDays } from 'date-fns';
import { supabase } from '../supabaseClient';

export const exampleClients: Client[] = [
    { 
        id: '1', 
        internal_id: 'CLI001', 
        name: 'Juan Pérez García', 
        rfc: 'PEJG800101ABC', 
        email: 'juan.perez@email.com', 
        phone: '55 1234 5678', 
        status: 'active', 
        policyCount: 3, 
        lastInteraction: subDays(new Date(), 5), 
        nextRenewal: addDays(new Date(), 25), 
        assignedAdvisor: 'Ana López', 
        insuranceCompany: 'GNP Seguros', 
        alerts: { pendingPayments: true, expiredDocs: false, homonym: false }, 
        preferredPaymentMethod: 'card', 
        paymentFrequency: 'monthly' 
    },
    { 
        id: '2', 
        internal_id: 'CLI002', 
        name: 'María Rodríguez Luna', 
        rfc: 'ROLM920315XYZ', 
        email: 'maria.r@email.com', 
        phone: '55 9876 5432', 
        status: 'active', 
        policyCount: 1, 
        lastInteraction: subDays(new Date(), 2), 
        nextRenewal: addDays(new Date(), 80), 
        assignedAdvisor: 'Carlos Marín', 
        insuranceCompany: 'AXA Seguros', 
        alerts: { pendingPayments: false, expiredDocs: true, homonym: false }, 
        preferredPaymentMethod: 'transfer', 
        paymentFrequency: 'annual' 
    },
    { 
        id: '3', 
        internal_id: 'CLI003', 
        name: 'Pedro Martínez Solís', 
        rfc: 'MASP751120DEF', 
        email: 'pedro.m@email.com', 
        phone: '55 1122 3344', 
        status: 'inactive', 
        policyCount: 0, 
        lastInteraction: subDays(new Date(), 100), 
        assignedAdvisor: 'Ana López', 
        insuranceCompany: 'MetLife', 
        alerts: { pendingPayments: false, expiredDocs: false, homonym: false } 
    },
    { 
        id: '4', 
        internal_id: 'CLI004', 
        name: 'Laura Gómez Morales', 
        rfc: 'GOML880505JKL', 
        email: 'laura.gm@email.com', 
        phone: '55 4455 6677', 
        status: 'prospect', 
        policyCount: 0, 
        assignedAdvisor: 'Carlos Marín', 
        insuranceCompany: '-', 
        alerts: { pendingPayments: false, expiredDocs: false, homonym: true } 
    },
];

// Funciones para conectar con Supabase
export const getClients = async (): Promise<Client[]> => {
    try {
        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.warn('Clients: Credenciales no configuradas, usando datos mock');
            return exampleClients;
        }

        // Timeout para evitar esperas infinitas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos max

        try {
            // Obtener clientes desde Supabase con timeout
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30)
                .abortSignal(controller.signal);

            clearTimeout(timeoutId);

            if (error) {
                console.error('Error fetching clients:', error);
                return exampleClients;
            }

            if (!data || data.length === 0) {
                return exampleClients;
            }

            // Mapear datos básicos
            return data.map(client => ({
                id: client.id,
                internal_id: client.internal_id || `CLI${client.id.slice(-3)}`,
                name: client.name,
                rfc: client.rfc,
                email: client.email,
                phone: client.phone,
                status: client.status || 'active',
                policyCount: client.policy_count || 0,
                lastInteraction: client.last_interaction ? new Date(client.last_interaction) : new Date(),
                nextRenewal: client.next_renewal ? new Date(client.next_renewal) : undefined,
                assignedAdvisor: client.assigned_advisor,
                insuranceCompany: client.insurance_company || '-',
                alerts: {
                    pendingPayments: client.alerts?.pending_payments || false,
                    expiredDocs: client.alerts?.expired_docs || false,
                    homonym: client.alerts?.homonym || false
                },
                preferredPaymentMethod: client.preferred_payment_method || 'card',
                paymentFrequency: client.payment_frequency || 'monthly'
            }));
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn('Clients: Timeout fetching data, using mock data');
            } else {
                console.error('Error in getClients:', error);
            }
            return exampleClients;
        }
    } catch (error) {
        console.error('Error in getClients:', error);
        return exampleClients;
    }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'internal_id' | 'policyCount' | 'lastInteraction' | 'nextRenewal' | 'alerts'>): Promise<Client> => {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: clientData.name,
            rfc: clientData.rfc,
            email: clientData.email,
            phone: clientData.phone,
            status: clientData.status,
            assigned_advisor: clientData.assignedAdvisor,
            insurance_company: clientData.insuranceCompany,
            preferred_payment_method: clientData.preferredPaymentMethod,
            payment_frequency: clientData.paymentFrequency,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating client:', error);
        throw new Error(error.message);
    }

    return {
        id: data.id,
        internal_id: data.internal_id || `CLI${data.id.slice(-3)}`,
        name: data.name,
        rfc: data.rfc,
        email: data.email,
        phone: data.phone,
        status: data.status,
        policyCount: 0,
        lastInteraction: new Date(),
        assignedAdvisor: data.assigned_advisor,
        insuranceCompany: data.insurance_company,
        alerts: {
            pendingPayments: false,
            expiredDocs: false,
            homonym: false
        },
        preferredPaymentMethod: data.preferred_payment_method,
        paymentFrequency: data.payment_frequency
    };
};

export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client> => {
    const { data, error } = await supabase
        .from('clients')
        .update({
            name: updates.name,
            rfc: updates.rfc,
            email: updates.email,
            phone: updates.phone,
            status: updates.status,
            assigned_advisor: updates.assignedAdvisor,
            insurance_company: updates.insuranceCompany,
            preferred_payment_method: updates.preferredPaymentMethod,
            payment_frequency: updates.paymentFrequency,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating client:', error);
        throw new Error(error.message);
    }

    return {
        id: data.id,
        internal_id: data.internal_id || `CLI${data.id.slice(-3)}`,
        name: data.name,
        rfc: data.rfc,
        email: data.email,
        phone: data.phone,
        status: data.status,
        policyCount: data.policy_count || 0,
        lastInteraction: data.last_interaction ? new Date(data.last_interaction) : new Date(),
        nextRenewal: data.next_renewal ? new Date(data.next_renewal) : undefined,
        assignedAdvisor: data.assigned_advisor,
        insuranceCompany: data.insurance_company,
        alerts: {
            pendingPayments: data.alerts?.pending_payments || false,
            expiredDocs: data.alerts?.expired_docs || false,
            homonym: data.alerts?.homonym || false
        },
        preferredPaymentMethod: data.preferred_payment_method,
        paymentFrequency: data.payment_frequency
    };
};

export const deleteClient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting client:', error);
        throw new Error(error.message);
    }
}; 