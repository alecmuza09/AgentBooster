import { supabase } from '../supabaseClient';
import { Policy } from '../types/policy';

// Datos de ejemplo para las pólizas
export const examplePolicies: Policy[] = [
    { id: 'pol1', policyNumber: 'POL-2024-001', clientName: 'Juan Pérez García', policyType: 'Vida', startDate: '2024-01-01', endDate: '2025-01-01', paymentDueDate: '2024-07-01', premiumAmount: 1500, premiumCurrency: 'MXN', status: 'active', insuranceCompany: 'GNP Seguros', paymentForm: 'monthly', paymentMethod: 'card', lastPaymentDate: '2024-06-01', reminderScheduled: true, documentsAttached: true, hasPendingPayment: false },
    { id: 'pol2', policyNumber: 'POL-2023-087', clientName: 'Ana Torres López', policyType: 'Gastos Médicos', startDate: '2023-01-15', endDate: '2024-01-15', paymentDueDate: undefined, premiumAmount: 3200, premiumCurrency: 'MXN', status: 'expired', insuranceCompany: 'MetLife', paymentForm: 'monthly', paymentMethod: 'transfer', lastPaymentDate: '2024-01-15', reminderScheduled: false, documentsAttached: true, hasPendingPayment: false },
    { id: 'pol3', policyNumber: 'POL-2024-009', clientName: 'Carlos López Ruiz', policyType: 'Auto', startDate: '2024-02-05', endDate: '2025-02-05', paymentDueDate: '2024-07-05', premiumAmount: 900, premiumCurrency: 'MXN', status: 'active', insuranceCompany: 'Qualitas', paymentForm: 'monthly', paymentMethod: 'direct_debit', lastPaymentDate: '2024-06-05', reminderScheduled: true, documentsAttached: false, hasPendingPayment: true },
    { id: 'pol4', policyNumber: 'POL-2022-145', clientName: 'Sofía Reyes', policyType: 'Vida', startDate: '2022-11-20', endDate: '2023-11-20', paymentDueDate: undefined, premiumAmount: 12000, premiumCurrency: 'USD', status: 'cancelled', insuranceCompany: 'AXA Seguros', paymentForm: 'annual', paymentMethod: 'transfer', lastPaymentDate: '2022-11-20', reminderScheduled: false, documentsAttached: true, hasPendingPayment: false },
    { id: 'pol5', policyNumber: 'POL-2024-020', clientName: 'Juan Pérez García', policyType: 'Gastos Médicos', startDate: '2024-03-10', endDate: '2025-03-10', paymentDueDate: '2024-07-10', premiumAmount: 2800, premiumCurrency: 'MXN', status: 'pending_renewal', insuranceCompany: 'GNP Seguros', paymentForm: 'monthly', paymentMethod: 'card', lastPaymentDate: '2024-06-10', reminderScheduled: true, documentsAttached: true, hasPendingPayment: false },
]; 

export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled';
export type InsuranceType = 'Vida' | 'Gastos Médicos' | 'Auto' | 'Hogar' | 'Otro';

export interface Policy {
    id: string;
    policyNumber: string;
    // ... (resto de la interfaz)
} 

export const getPolicies = async (): Promise<Policy[]> => {
    // 1. Obtener todas las pólizas
    const { data: policiesData, error: policiesError } = await supabase
        .from('policies')
        .select('*');

    if (policiesError) {
        console.error('Error fetching policies:', policiesError);
        throw new Error(policiesError.message);
    }

    // 2. Para cada póliza, obtener sus datos relacionados
    const policies: Policy[] = await Promise.all(
        policiesData.map(async (p) => {
            // Obtener contactos
            const { data: contactsData, error: contactsError } = await supabase
                .from('policy_contacts')
                .select('*')
                .eq('policy_id', p.id);
            if (contactsError) console.error('Error fetching contacts for policy', p.id, contactsError);
            
            // Obtener documentos y sus versiones
            const { data: documentsData, error: documentsError } = await supabase
                .from('policy_documents')
                .select(`*, versions:policy_document_versions(*)`)
                .eq('policy_id', p.id);
            if (documentsError) console.error('Error fetching documents for policy', p.id, documentsError);
            
            // Mapear los datos al tipo `Policy`
            const contratante = contactsData?.find(c => c.role === 'contratante');
            const asegurado = contactsData?.find(c => c.role === 'asegurado');
            const dueñoFinal = contactsData?.find(c => c.role === 'dueñoFinal');
            const contactoPago = contactsData?.find(c => c.role === 'contactoPago');

            return {
                ...p,
                // Supabase devuelve fechas como strings, las dejamos así por ahora
                // pero en una app real, es mejor convertirlas a objetos Date
                vigenciaPeriodo: { inicio: p.vigencia_periodo_inicio, fin: p.vigencia_periodo_fin },
                vigenciaTotal: { inicio: p.vigencia_total_inicio, fin: p.vigencia_total_fin },
                contratante: contratante || {},
                asegurado: asegurado || {},
                dueñoFinal: dueñoFinal,
                contactoPago: contactoPago || {},
                documents: documentsData || [],
                documentsAttached: (documentsData?.length || 0) > 0,
                hasPendingPayment: false, // Lógica a implementar
            } as unknown as Policy;
        })
    );

    return policies;
};

export const createPolicy = async (policyData: Omit<Policy, 'id' | 'documents' | 'documentsAttached' | 'hasPendingPayment'>): Promise<Policy> => {
    // 1. Insertar la póliza principal
    const { data: newPolicy, error: policyError } = await supabase
        .from('policies')
        .insert({
            policy_number: policyData.policyNumber,
            ramo: policyData.ramo,
            forma_de_pago: policyData.formaDePago,
            conducto_de_pago: policyData.conductoDePago,
            moneda: policyData.moneda,
            suma_asegurada: policyData.sumaAsegurada,
            aseguradora: policyData.aseguradora,
            status: policyData.status,
            fecha_pago_actual: policyData.fechaPagoActual,
            vigencia_periodo_inicio: policyData.vigenciaPeriodo.inicio,
            vigencia_periodo_fin: policyData.vigenciaPeriodo.fin,
            vigencia_total_inicio: policyData.vigenciaTotal.inicio,
            vigencia_total_fin: policyData.vigenciaTotal.fin,
            termino_pagos: policyData.terminoPagos,
            premium_amount: policyData.premiumAmount,
        })
        .select()
        .single();
    
    if (policyError) {
        console.error('Error creating policy:', policyError);
        throw new Error(policyError.message);
    }

    // 2. Insertar los contactos asociados
    const contactsToInsert = [];
    if (policyData.contratante) contactsToInsert.push({ policy_id: newPolicy.id, role: 'contratante', ...policyData.contratante });
    if (policyData.asegurado) contactsToInsert.push({ policy_id: newPolicy.id, role: 'asegurado', ...policyData.asegurado });
    if (policyData.dueñoFinal) contactsToInsert.push({ policy_id: newPolicy.id, role: 'dueñoFinal', ...policyData.dueñoFinal });
    if (policyData.contactoPago) contactsToInsert.push({ policy_id: newPolicy.id, role: 'contactoPago', ...policyData.contactoPago });

    const { error: contactsError } = await supabase.from('policy_contacts').insert(contactsToInsert);

    if (contactsError) {
        console.error('Error creating policy contacts:', contactsError);
        // En un escenario real, deberíamos borrar la póliza que acabamos de crear para mantener la consistencia (transacción)
        await supabase.from('policies').delete().eq('id', newPolicy.id);
        throw new Error(contactsError.message);
    }
    
    // 3. Devolver la póliza completa como se esperaría en la UI
    // Por simplicidad, no volvemos a fetchear, solo reconstruimos.
    return {
        ...newPolicy,
        vigenciaPeriodo: { inicio: newPolicy.vigencia_periodo_inicio, fin: newPolicy.vigencia_periodo_fin },
        vigenciaTotal: { inicio: newPolicy.vigencia_total_inicio, fin: newPolicy.vigencia_total_fin },
        contratante: policyData.contratante,
        asegurado: policyData.asegurado,
        dueñoFinal: policyData.dueñoFinal,
        contactoPago: policyData.contactoPago,
        documents: [],
        documentsAttached: false,
    } as unknown as Policy;
}

export const createDocument = async (policyId: string, title: string, role: string): Promise<any> => {
    const { data, error } = await supabase
        .from('policy_documents')
        .insert({
            policy_id: policyId,
            title,
            role,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error creating document container:', error);
        throw new Error(error.message);
    }
    return data;
};

export const createDocumentVersion = async (documentId: string, file: File, version: number) => {
    const filePath = `public/${documentId}/${file.name}`;

    // 1. Subir el archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('policy_documents')
        .upload(filePath, file);
    
    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(uploadError.message);
    }
    
    // 2. Crear el registro de la versión en la base de datos
    const { data, error: dbError } = await supabase
        .from('policy_document_versions')
        .insert({
            document_id: documentId,
            version: version,
            file_name: file.name,
            storage_path: filePath,
        })
        .select()
        .single();
    
    if (dbError) {
        console.error('Error creating document version record:', dbError);
        // Intentar borrar el archivo que acabamos de subir si la BD falla
        await supabase.storage.from('policy_documents').remove([filePath]);
        throw new Error(dbError.message);
    }

    return data;
}

// La función para crear una póliza será más compleja.
// Requerirá una transacción para asegurar que todos los datos (póliza, contactos) se inserten atómicamente.
// La crearé en el siguiente paso al refactorizar el formulario. 