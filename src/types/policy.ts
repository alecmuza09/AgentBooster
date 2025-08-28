export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'pending_renewal' | 'overdue_critical';

// Nuevos tipos para los campos de póliza
export type Ramo = 'Vida' | 'Gastos Médicos' | 'Autos' | 'Daños';
export type FormaDePago = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual';
export type ConductoDePago = 'Agente' | 'Domiciliado' | 'Tarjeta';
export type Moneda = 'MXN' | 'USD';
export type TipoDeCargo = 'CAT' | 'CXC' | 'CUT';

export type PolicyContactRole = 
  | 'contratante'
  | 'asegurado'
  | 'dueñoFinal'
  | 'contactoPago'
  | 'contabilidad'
  | 'administracion'
  | 'personal';

// Interfaz para las personas relacionadas con la póliza
export interface PolicyContact {
  id?: string;
  nombre: string;
  rfc: string;
  correo?: string;
  direccion: string;
  telefono: string;
  fechanacimiento?: string;
  municipio?: string;
}

export interface PolicyDocumentVersion {
  version: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface PolicyDocument {
  id: string; // ID único del contenedor del documento
  policyId: string; // ID de la póliza a la que pertenece
  title: string; // Título dado por el usuario, ej: "Identificación Oficial"
  role: 'contratante' | 'asegurado' | 'dueñoFinal' | 'contactoPago' | 'general';
  versions: PolicyDocumentVersion[];
}

export interface Policy {
  id: string;
  policyNumber: string; // numero de poliza
  inciso?: number;
  concepto?: string;
  modelo?: string;
  numeroSerie?: string;
  clienteId?: string;
  claveAgente?: string;
  ramo: string;
  subproducto?: string;
  aseguradora: string;
  status: PolicyStatus;
  formaDePago: FormaDePago;
  conductoDePago: ConductoDePago;
  moneda: Moneda;
  primaNeta: number;
  derecho?: number;
  recargo?: number;
  total: number;
  tipoDeCargo?: TipoDeCargo;
  sumaAsegurada: number;
  // premiumAmount: number; // campo obsoleto, usar "total"
  
  // === 5 FECHAS CLAVE DE LA PÓLIZA ===
  fechaSolicitud?: string;        // 1. Fecha de solicitud/creación
  fechaVigenciaInicial: string;   // 2. Fecha de vigencia inicial
  fechaVigenciaFinal: string;     // 3. Fecha de vigencia final/término
  fechaEmision?: string;          // 4. Fecha de emisión formal
  fechaPrimerPago?: string;       // 5. Fecha de primer pago/pago programado
  
  // Campos de fechas adicionales para compatibilidad
  fechaRegistro?: string;         // Mantenido por compatibilidad
  fechaPagoActual?: string;       // Fecha de próximo pago
  vigenciaPeriodo: {              // Vigencia del recibo/período actual
    inicio: string;
    fin: string;
  };
  vigenciaTotal: {                // Vigencia total de la póliza (mismo que inicial/final)
    inicio: string;
    fin: string;
  };
  terminoPagos?: string;          // Fecha límite de pagos
  contratante: PolicyContact;
  asegurado: PolicyContact;
  dueñoFinal?: PolicyContact;
  contactoPago?: PolicyContact;
  documents: any[];
  documentsAttached: boolean;
  hasPendingPayment: boolean;
  // Nuevos campos para alertas y comentarios
  comentarios?: string;
  comprobantePagoPath?: string;
  requiereComprobante?: boolean;
  ultimaAlertaEnviada?: string;
  proximoPagoEsperado?: string;
} 