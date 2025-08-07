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
                        inciso: p.inciso ?? undefined,
                        concepto: p.concepto ?? undefined,
                        modelo: p.modelo ?? undefined,
                        numeroSerie: p.numero_serie ?? undefined,
                        clienteId: p.cliente_id ?? undefined,
                        claveAgente: p.clave_agente ?? undefined,
                        ramo: p.ramo || 'N/A',
                        subproducto: p.subproducto,
                        aseguradora: p.aseguradora || 'N/A',
                        status: p.status || 'active',
                        formaDePago: p.forma_de_pago || 'Mensual',
                        conductoDePago: p.conducto_de_pago || 'Tarjeta',
                        moneda: p.moneda || 'MXN',
                        primaNeta: p.prima_neta || 0,
                        derecho: p.derecho || 0,
                        recargo: p.recargo || 0,
                        total: p.total || 0,
                        tipoDeCargo: p.tipo_de_cargo ?? undefined,
                        fechaRegistro: p.fecha_registro ?? undefined,
                        sumaAsegurada: p.suma_asegurada || 0,
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
                        inciso: p.inciso ?? undefined,
                        concepto: p.concepto ?? undefined,
                        modelo: p.modelo ?? undefined,
                        numeroSerie: p.numero_serie ?? undefined,
                        clienteId: p.cliente_id ?? undefined,
                        claveAgente: p.clave_agente ?? undefined,
                        ramo: p.ramo || 'N/A',
                        aseguradora: p.aseguradora || 'N/A',
                        status: p.status || 'active',
                        formaDePago: p.forma_de_pago || 'Mensual',
                        conductoDePago: p.conducto_de_pago || 'Tarjeta',
                        moneda: p.moneda || 'MXN',
                        sumaAsegurada: p.suma_asegurada || 0,
                        primaNeta: p.prima_neta || 0,
                        derecho: p.derecho || 0,
                        recargo: p.recargo || 0,
                        total: p.total || 0,
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
            inciso: policyData.inciso,
            concepto: policyData.concepto,
            modelo: policyData.modelo,
            numero_serie: policyData.numeroSerie,
            cliente_id: policyData.clienteId,
            clave_agente: policyData.claveAgente,
            ramo: policyData.ramo,
            subproducto: policyData.subproducto,
            aseguradora: policyData.aseguradora,
            status: policyData.status,
            forma_de_pago: policyData.formaDePago,
            conducto_de_pago: policyData.conductoDePago,
            moneda: policyData.moneda,
            prima_neta: policyData.primaNeta,
            derecho: policyData.derecho,
            recargo: policyData.recargo,
            total: policyData.total,
            tipo_de_cargo: policyData.tipoDeCargo,
            fecha_registro: policyData.fechaRegistro,
            suma_asegurada: policyData.sumaAsegurada,
            fecha_pago_actual: policyData.fechaPagoActual,
            vigencia_periodo_inicio: policyData.vigenciaPeriodo.inicio,
            vigencia_periodo_fin: policyData.vigenciaPeriodo.fin,
            vigencia_total_inicio: policyData.vigenciaTotal.inicio,
            vigencia_total_fin: policyData.vigenciaTotal.fin,
            termino_pagos: policyData.terminoPagos,
            comentarios: policyData.comentarios,
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
    const pick = (row: any, keys: string[]) => {
        for (const k of keys) if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
        return undefined;
    };
    const normalizeDate = (val: any): string | undefined => {
        if (val === null || val === undefined) return undefined;
        let s = String(val).trim();
        if (!s) return undefined;
        // Remove time part if present (T, space, etc.)
        s = s.replace(/[T ]\d{1,2}:\d{2}(:\d{2})?.*$/, '');
        // yyyy-mm-dd or yyyy/mm/dd
        let m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
        if (m) {
            const [_, y, mo, d] = m; return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
        // dd/mm/yyyy or dd-mm-yyyy
        m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (m) {
            let [_, d, mo, y] = m; if (y.length === 2) y = `20${y}`; return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
        // yy hh:mm-mm-dd (ej: 25 13:59-04-10)
        m = s.match(/^(\d{2})\s+\d{1,2}:\d{2}[\-\/](\d{1,2})[\-\/](\d{1,2})$/);
        if (m) {
            const [_, yy, mo, d] = m; const y = `20${yy}`; return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
        // Fallback: extrae últimos 3 números como y-m-d o d-m-y heurístico
        const nums = s.match(/\d{1,4}/g) || [];
        if (nums.length >= 3) {
            let a = nums[0], b = nums[1], c = nums[2];
            // Si a es año
            if (a.length === 4) {
                return `${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
            }
            // Si c es año
            if (c.length === 4) {
                return `${c}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
            }
            // Si a parece año de 2 dígitos
            if (a.length === 2) {
                return `20${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
            }
        }
        return undefined;
    };

    const toNumber = (val: any): number | null => {
        if (val === null || val === undefined || val === '') return null;
        let s = String(val).trim();
        s = s.replace(/[^0-9,.-]/g, '');
        if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
        else if (s.includes(',') && !s.includes('.')) s = s.replace(/,/g, '.');
        const n = Number(s);
        return isNaN(n) ? null : n;
    };

    const mapStatus = (s: any): string | undefined => {
        const v = String(s || '').toLowerCase();
        if (v.includes('vigente')) return 'active';
        if (v.includes('cancel')) return 'cancelled';
        if (v.includes('vencid')) return 'expired';
        if (v.includes('pend')) return 'pending';
        return undefined;
    };

    const formattedPolicies = policies.map(p => ({
        policy_number: pick(p, ["No poliza", "No póliza", "Poliza", "Póliza", "No_poliza"]),
        inciso: pick(p, ["Inciso"]),
        concepto: pick(p, ["Concepto", "Referencia"]),
        modelo: pick(p, ["Modelo"]),
        numero_serie: pick(p, ["No. Serie", "No Serie", "Numero Serie", "Número de Serie", "Serie"]),
        cliente_id: pick(p, ["Cliente id", "ClienteID", "Cliente Id", "Id Cliente"]),
        clave_agente: pick(p, ["Clave de Agente", "Cve agente", "Cve Agente", "Clave Agente"]),
        ramo: pick(p, ["Ramo", "SubRamo", "Sub Ramo"]),
        aseguradora: pick(p, ["Aseguradora", "Compañía", "Compania"]),
        status: pick(p, ["Estatus mov", "Status Poliza", "Status Movimiento"]),
        prima_neta: pick(p, ["Prima Neta", "Prima"]),
        derecho: pick(p, ["Derecho"]),
        recargo: pick(p, ["Recargo"]),
        total: pick(p, ["Total", "Total TC"]),
        tipo_de_cargo: pick(p, ["Tipo de Cargo", "Tipo Cargo", "Tipo de Pago", "Forma Pago"]),
        fecha_registro: normalizeDate(pick(p, ["Fecha de Registro", "Fec Registro", "Fec Creación", "Fec Creacion"])),
        vigencia_total_inicio: normalizeDate(pick(p, ["Fecha vigencia total de póliza de", "Fec vig de"])),
        vigencia_total_fin: normalizeDate(pick(p, ["Fecha vigencia total de póliza a", "Fec vig a"])),
        vigencia_periodo_inicio: normalizeDate(pick(p, ["Fecha vigencia del recibo de", "Fec vig de", "Fec_vig_de"])),
        vigencia_periodo_fin: normalizeDate(pick(p, ["Fecha vigencia del recibo a", "Fec vig a", "Fec_vig_a"])),
    }));

    const { data, error } = await supabase
        .from('policies')
        .upsert(formattedPolicies, { onConflict: 'policy_number' })
        .select('id, policy_number');

    if (error) {
        console.error('Error importing policies:', error);
        throw new Error(error.message);
    }

    // Crear contactos básicos con el nombre de Cliente (contratante/asegurado)
    try {
        const idByNumber = new Map<string, string>();
        (data || []).forEach(r => idByNumber.set(r.policy_number, r.id));
        const rows: any[] = [];
        for (const p of policies) {
            const num = pick(p as any, ["No poliza", "No póliza", "Poliza", "Póliza", "No_poliza"]);
            const pid = idByNumber.get(num);
            const nombre = pick(p as any, ["Cliente", "Nombre Cliente", "Asegurado"]);
            if (!pid || !nombre) continue;
            rows.push({ policy_id: pid, role: 'contratante', nombre: String(nombre) });
            rows.push({ policy_id: pid, role: 'asegurado', nombre: String(nombre) });
        }
        if (rows.length) {
            const { error: upErr } = await supabase.from('policy_contacts').upsert(rows, { onConflict: 'policy_id,role' });
            if (upErr) console.error('contacts upsert error', upErr);
        }
    } catch (e) {
        console.error('contacts import aux error', e);
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

// Actualización masiva de pólizas (campos comunes)
export const updatePoliciesBulk = async (
    ids: string[],
    updates: Partial<{
        status: string;
        formaDePago: string;
        conductoDePago: string;
        aseguradora: string;
    }>
) => {
    const mapped: Record<string, any> = {};
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.formaDePago !== undefined) mapped.forma_de_pago = updates.formaDePago;
    if (updates.conductoDePago !== undefined) mapped.conducto_de_pago = updates.conductoDePago;
    if (updates.aseguradora !== undefined) mapped.aseguradora = updates.aseguradora;

    if (Object.keys(mapped).length === 0) return { data: null, error: null };

    const { data, error } = await supabase
        .from('policies')
        .update(mapped)
        .in('id', ids)
        .select();

    if (error) {
        console.error('Error updating policies in bulk:', error);
        throw new Error(error.message);
    }
    return { data, error: null };
};

// Eliminación masiva de pólizas
export const deletePolicies = async (ids: string[]) => {
    // Si hay FKs con ON DELETE CASCADE, bastará con borrar de policies
    const { error } = await supabase
        .from('policies')
        .delete()
        .in('id', ids);

    if (error) {
        console.error('Error deleting policies:', error);
        throw new Error(error.message);
    }
};

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