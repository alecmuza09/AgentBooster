import { supabase } from '../supabaseClient';
import { Policy } from '../types/policy';
import { PolizaImport, ReciboImport } from '@/types/import';

// Datos de ejemplo para las pólizas
export const examplePolicies: Policy[] = [
    {
        id: 'pol1',
        policyNumber: 'POL-2024-001',
        ramo: 'Vida',
        subproducto: 'Vida Individual',
        aseguradora: 'GNP Seguros',
        status: 'active',
        formaDePago: 'Mensual',
        conductoDePago: 'Tarjeta',
        moneda: 'MXN',
        sumaAsegurada: 1000000,
        premiumAmount: 1500,
        fechaPagoActual: '2024-06-01',
        vigenciaPeriodo: { inicio: '2024-01-01', fin: '2025-01-01' },
        vigenciaTotal: { inicio: '2024-01-01', fin: '2025-01-01' },
        terminoPagos: '2025-01-01',
        contratante: { nombre: 'Juan Pérez García', rfc: 'PERJ840101ABC', correo: 'juan.perez@email.com', direccion: 'Av. Reforma 123', telefono: '5551234567', fechanacimiento: '1984-01-01', municipio: 'Cuauhtémoc' },
        asegurado: { nombre: 'Juan Pérez García', rfc: 'PERJ840101ABC', correo: 'juan.perez@email.com', direccion: 'Av. Reforma 123', telefono: '5551234567', fechanacimiento: '1984-01-01', municipio: 'Cuauhtémoc' },
        dueñoFinal: undefined,
        contactoPago: { nombre: 'Juan Pérez García', rfc: 'PERJ840101ABC', correo: 'juan.perez@email.com', direccion: 'Av. Reforma 123', telefono: '5551234567', fechanacimiento: '1984-01-01', municipio: 'Cuauhtémoc' },
        documents: [],
        documentsAttached: true,
        hasPendingPayment: false,
        comentarios: 'Póliza de vida individual con cobertura básica',
        comprobantePagoPath: undefined,
        requiereComprobante: false,
        ultimaAlertaEnviada: undefined,
        proximoPagoEsperado: '2024-07-01'
    },
    {
        id: 'pol2',
        policyNumber: 'POL-2023-087',
        ramo: 'Gastos Médicos',
        subproducto: 'GMM Familiar',
        aseguradora: 'MetLife',
        status: 'cancelled',
        formaDePago: 'Mensual',
        conductoDePago: 'Transferencia',
        moneda: 'MXN',
        sumaAsegurada: 500000,
        premiumAmount: 3200,
        fechaPagoActual: '2024-01-15',
        vigenciaPeriodo: { inicio: '2023-01-15', fin: '2024-01-15' },
        vigenciaTotal: { inicio: '2023-01-15', fin: '2024-01-15' },
        terminoPagos: '2024-01-15',
        contratante: { nombre: 'Ana Torres López', rfc: 'TOLA850215DEF', correo: 'ana.torres@email.com', direccion: 'Calle Juárez 456', telefono: '5559876543', fechanacimiento: '1985-02-15', municipio: 'Miguel Hidalgo' },
        asegurado: { nombre: 'Ana Torres López', rfc: 'TOLA850215DEF', correo: 'ana.torres@email.com', direccion: 'Calle Juárez 456', telefono: '5559876543', fechanacimiento: '1985-02-15', municipio: 'Miguel Hidalgo' },
        dueñoFinal: undefined,
        contactoPago: { nombre: 'Ana Torres López', rfc: 'TOLA850215DEF', correo: 'ana.torres@email.com', direccion: 'Calle Juárez 456', telefono: '5559876543', fechanacimiento: '1985-02-15', municipio: 'Miguel Hidalgo' },
        documents: [],
        documentsAttached: true,
        hasPendingPayment: false,
        comentarios: 'Gastos médicos mayores para familia',
        comprobantePagoPath: undefined,
        requiereComprobante: false,
        ultimaAlertaEnviada: undefined,
        proximoPagoEsperado: undefined
    },
    {
        id: 'pol3',
        policyNumber: 'POL-2024-009',
        ramo: 'Auto',
        subproducto: 'Auto Básico',
        aseguradora: 'Qualitas',
        status: 'active',
        formaDePago: 'Mensual',
        conductoDePago: 'Domiciliado',
        moneda: 'MXN',
        sumaAsegurada: 300000,
        premiumAmount: 900,
        fechaPagoActual: '2024-06-05',
        vigenciaPeriodo: { inicio: '2024-02-05', fin: '2025-02-05' },
        vigenciaTotal: { inicio: '2024-02-05', fin: '2025-02-05' },
        terminoPagos: '2025-02-05',
        contratante: { nombre: 'Carlos López Ruiz', rfc: 'LORC900310GHI', correo: 'carlos.lopez@email.com', direccion: 'Blvd. Insurgentes 789', telefono: '5554567890', fechanacimiento: '1990-03-10', municipio: 'Benito Juárez' },
        asegurado: { nombre: 'Carlos López Ruiz', rfc: 'LORC900310GHI', correo: 'carlos.lopez@email.com', direccion: 'Blvd. Insurgentes 789', telefono: '5554567890', fechanacimiento: '1990-03-10', municipio: 'Benito Juárez' },
        dueñoFinal: undefined,
        contactoPago: { nombre: 'Carlos López Ruiz', rfc: 'LORC900310GHI', correo: 'carlos.lopez@email.com', direccion: 'Blvd. Insurgentes 789', telefono: '5554567890', fechanacimiento: '1990-03-10', municipio: 'Benito Juárez' },
        documents: [],
        documentsAttached: false,
        hasPendingPayment: true,
        comentarios: 'Seguro de auto con cobertura de daños a terceros',
        comprobantePagoPath: undefined,
        requiereComprobante: true,
        ultimaAlertaEnviada: undefined,
        proximoPagoEsperado: '2024-07-05'
    },
    {
        id: 'pol4',
        policyNumber: 'POL-2022-145',
        ramo: 'Vida',
        subproducto: 'Vida Universal',
        aseguradora: 'AXA Seguros',
        status: 'cancelled',
        formaDePago: 'Anual',
        conductoDePago: 'Transferencia',
        moneda: 'USD',
        sumaAsegurada: 500000,
        premiumAmount: 12000,
        fechaPagoActual: '2022-11-20',
        vigenciaPeriodo: { inicio: '2022-11-20', fin: '2023-11-20' },
        vigenciaTotal: { inicio: '2022-11-20', fin: '2023-11-20' },
        terminoPagos: '2023-11-20',
        contratante: { nombre: 'Sofía Reyes', rfc: 'RESO880525JKL', correo: 'sofia.reyes@email.com', direccion: 'Paseo de la Reforma 321', telefono: '5557890123', fechanacimiento: '1988-05-25', municipio: 'Cuauhtémoc' },
        asegurado: { nombre: 'Sofía Reyes', rfc: 'RESO880525JKL', correo: 'sofia.reyes@email.com', direccion: 'Paseo de la Reforma 321', telefono: '5557890123', fechanacimiento: '1988-05-25', municipio: 'Cuauhtémoc' },
        dueñoFinal: undefined,
        contactoPago: { nombre: 'Sofía Reyes', rfc: 'RESO880525JKL', correo: 'sofia.reyes@email.com', direccion: 'Paseo de la Reforma 321', telefono: '5557890123', fechanacimiento: '1988-05-25', municipio: 'Cuauhtémoc' },
        documents: [],
        documentsAttached: true,
        hasPendingPayment: false,
        comentarios: 'Póliza de vida universal cancelada por falta de pago',
        comprobantePagoPath: undefined,
        requiereComprobante: false,
        ultimaAlertaEnviada: undefined,
        proximoPagoEsperado: undefined
    },
    {
        id: 'pol5',
        policyNumber: 'POL-2024-020',
        ramo: 'Gastos Médicos',
        subproducto: 'GMM Individual',
        aseguradora: 'GNP Seguros',
        status: 'pending',
        formaDePago: 'Mensual',
        conductoDePago: 'Tarjeta',
        moneda: 'MXN',
        sumaAsegurada: 800000,
        premiumAmount: 2800,
        fechaPagoActual: '2024-06-10',
        vigenciaPeriodo: { inicio: '2024-03-10', fin: '2025-03-10' },
        vigenciaTotal: { inicio: '2024-03-10', fin: '2025-03-10' },
        terminoPagos: '2025-03-10',
        contratante: { nombre: 'María González', rfc: 'GONM920815MNO', correo: 'maria.gonzalez@email.com', direccion: 'Av. Chapultepec 654', telefono: '5553210987', fechanacimiento: '1992-08-15', municipio: 'Miguel Hidalgo' },
        asegurado: { nombre: 'María González', rfc: 'GONM920815MNO', correo: 'maria.gonzalez@email.com', direccion: 'Av. Chapultepec 654', telefono: '5553210987', fechanacimiento: '1992-08-15', municipio: 'Miguel Hidalgo' },
        dueñoFinal: undefined,
        contactoPago: { nombre: 'María González', rfc: 'GONM920815MNO', correo: 'maria.gonzalez@email.com', direccion: 'Av. Chapultepec 654', telefono: '5553210987', fechanacimiento: '1992-08-15', municipio: 'Miguel Hidalgo' },
        documents: [],
        documentsAttached: true,
        hasPendingPayment: false,
        comentarios: 'Gastos médicos mayores individual pendiente de renovación',
        comprobantePagoPath: undefined,
        requiereComprobante: false,
        ultimaAlertaEnviada: undefined,
        proximoPagoEsperado: '2024-07-10'
    }
]; 

export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled';
export type InsuranceType = 'Vida' | 'Gastos Médicos' | 'Auto' | 'Hogar' | 'Otro'; 

export const getPolicies = async (): Promise<Policy[]> => {
    try {
        console.log('Attempting to fetch policies from Supabase...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        // Verificar si las credenciales están configuradas
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.error('Supabase credentials not configured. Please check your .env file.');
            console.log('Falling back to example policies due to missing credentials');
            return examplePolicies;
        }
        
        // 1. Obtener todas las pólizas
        const { data: policiesData, error: policiesError } = await supabase
            .from('policies')
            .select('*');

        if (policiesError) {
            console.error('Error fetching policies from Supabase:', policiesError);
            console.log('Falling back to example policies due to Supabase error');
            return examplePolicies;
        }

        console.log('Raw policies data from Supabase:', policiesData);

        // Si no hay datos en la base de datos, usar los datos de ejemplo
        if (!policiesData || policiesData.length === 0) {
            console.log('No policies found in database, using example policies');
            return examplePolicies;
        }

        // 2. Para cada póliza, obtener sus datos relacionados
        const policies: Policy[] = await Promise.all(
            policiesData.map(async (p) => {
                try {
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

                    const mappedPolicy = {
                        id: p.id,
                        policyNumber: p.policy_number || 'N/A',
                        ramo: p.ramo || 'N/A',
                        subproducto: p.subproducto,
                        aseguradora: p.aseguradora || 'N/A',
                        status: p.status || 'active',
                        formaDePago: p.forma_de_pago || 'Mensual',
                        conductoDePago: p.conducto_de_pago || 'Tarjeta',
                        moneda: p.moneda || 'MXN',
                        sumaAsegurada: p.suma_asegurada || 0,
                        premiumAmount: p.premium_amount || 0,
                        fechaPagoActual: p.fecha_pago_actual,
                        vigenciaPeriodo: { 
                            inicio: p.vigencia_periodo_inicio || '', 
                            fin: p.vigencia_periodo_fin || '' 
                        },
                        vigenciaTotal: { 
                            inicio: p.vigencia_total_inicio || '', 
                            fin: p.vigencia_total_fin || '' 
                        },
                        terminoPagos: p.termino_pagos,
                        contratante: contratante || { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        asegurado: asegurado || { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        dueñoFinal: dueñoFinal,
                        contactoPago: contactoPago || { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        documents: documentsData || [],
                        documentsAttached: (documentsData?.length || 0) > 0,
                        hasPendingPayment: false, // Lógica a implementar
                        comentarios: p.comentarios,
                        comprobantePagoPath: p.comprobante_pago_path,
                        requiereComprobante: p.requiere_comprobante || false,
                        ultimaAlertaEnviada: p.ultima_alerta_enviada,
                        proximoPagoEsperado: p.proximo_pago_esperado,
                    } as Policy;

                    console.log('Mapped policy:', mappedPolicy);
                    return mappedPolicy;
                } catch (error) {
                    console.error('Error processing policy', p.id, error);
                    // Si hay error procesando una póliza individual, devolver un objeto básico
                    return {
                        id: p.id,
                        policyNumber: p.policy_number || 'N/A',
                        ramo: p.ramo || 'N/A',
                        aseguradora: p.aseguradora || 'N/A',
                        status: p.status || 'active',
                        formaDePago: p.forma_de_pago || 'Mensual',
                        conductoDePago: p.conducto_de_pago || 'Tarjeta',
                        moneda: p.moneda || 'MXN',
                        sumaAsegurada: p.suma_asegurada || 0,
                        premiumAmount: p.premium_amount || 0,
                        fechaPagoActual: p.fecha_pago_actual,
                        vigenciaPeriodo: { inicio: p.vigencia_periodo_inicio || '', fin: p.vigencia_periodo_fin || '' },
                        vigenciaTotal: { inicio: p.vigencia_total_inicio || '', fin: p.vigencia_total_fin || '' },
                        terminoPagos: p.termino_pagos,
                        contratante: { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        asegurado: { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        dueñoFinal: undefined,
                        contactoPago: { nombre: 'N/A', rfc: '', direccion: '', telefono: '' },
                        documents: [],
                        documentsAttached: false,
                        hasPendingPayment: false,
                    } as Policy;
                }
            })
        );

        console.log('Final processed policies:', policies);
        return policies;
    } catch (error) {
        console.error('Error in getPolicies:', error);
        console.log('Falling back to example policies due to error');
        return examplePolicies;
    }
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

export const importPolicies = async (policies: PolizaImport[]) => {
    const formattedPolicies = policies.map(p => ({
        policy_number: p["No poliza"],
        ramo: p.Ramo,
        aseguradora: p.Aseguradora,
        moneda: p.Moneda,
        status: p["Estatus mov"],
        premium_amount: p.Prima,
        forma_de_pago: p["Forma Pago"],
        // TODO: Mapear más campos si es necesario
        // Las fechas necesitan conversión de DD/MM/YYYY a YYYY-MM-DD para Supabase
        vigencia_periodo_inicio: p["Fec vig de"].split('/').reverse().join('-'),
        vigencia_periodo_fin: p["Fec vig a"].split('/').reverse().join('-'),
    }));

    const { data, error } = await supabase
        .from('policies')
        .upsert(formattedPolicies, { onConflict: 'policy_number' });

    if (error) {
        console.error('Error importing policies:', error);
        throw new Error(error.message);
    }

    return data;
}

export const importRecibos = async (recibos: ReciboImport[]) => {
    const formattedRecibos = recibos.map(r => ({
        policy_number: r["No poliza"],
        ramo: r.Ramo,
        aseguradora: r.Aseguradora,
        moneda: r.Moneda,
        status: r["Status Movimiento"] || r["Status Poliza"], // Usa el status del movimiento si está disponible
        premium_amount: r.Prima,
        forma_de_pago: r["Forma Pago"],
        // Mapea los campos específicos del recibo
        vigencia_periodo_inicio: r["Fec_vig_de"]?.split('/').reverse().join('-'),
        vigencia_periodo_fin: r["Fec_vig_a"]?.split('/').reverse().join('-'),
        fecha_pago_actual: r["Fec_pago"]?.split('/').reverse().join('-'),
    }));

    const { data, error } = await supabase
        .from('policies')
        .upsert(formattedRecibos, { onConflict: 'policy_number' });

    if (error) {
        console.error('Error importing recibos:', error);
        throw new Error(error.message);
    }

    return data;
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