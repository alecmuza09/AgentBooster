export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'pending_renewal';

// Nuevos tipos para los campos de póliza
export type Ramo = 'Vida' | 'Gastos Médicos' | 'Autos' | 'Daños';
export type FormaDePago = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual';
export type ConductoDePago = 'Agente' | 'Domiciliado' | 'Tarjeta';
export type Moneda = 'MXN' | 'USD';

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
  policyNumber: string;
  ramo: string;
  subproducto?: string;
  aseguradora: string;
  status: PolicyStatus;
  formaDePago: FormaDePago;
  conductoDePago: ConductoDePago;
  moneda: Moneda;
  sumaAsegurada: number;
  premiumAmount: number;
  fechaPagoActual?: string;
  vigenciaPeriodo: {
    inicio: string;
    fin: string;
  };
  vigenciaTotal: {
    inicio: string;
    fin: string;
  };
  terminoPagos?: string;
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