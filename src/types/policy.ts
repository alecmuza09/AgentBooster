export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'pending_renewal';

// Nuevos tipos para los campos de póliza
export type Ramo = 'Vida' | 'Gastos Médicos' | 'Autos' | 'Daños';
export type FormaDePago = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual';
export type ConductoDePago = 'Agente' | 'Domiciliado' | 'Tarjeta';
export type Moneda = 'MXN' | 'USD';

// Interfaz para las personas relacionadas con la póliza
export interface PolicyContact {
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
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

  // Roles
  contratante: PolicyContact;
  asegurado: PolicyContact;
  dueñoFinal?: PolicyContact; // Opcional
  contactoPago: PolicyContact;

  // Información de la Póliza
  ramo: Ramo;
  formaDePago: FormaDePago;
  conductoDePago: ConductoDePago;
  moneda: Moneda;
  sumaAsegurada: number;
  aseguradora: string;
  status: PolicyStatus;

  // Fechas Clave
  fechaPagoActual: string; // Próxima fecha de pago
  vigenciaPeriodo: { inicio: string, fin: string }; // Vigencia del recibo actual
  vigenciaTotal: { inicio: string, fin: string }; // Vigencia de la carátula de la póliza
  terminoPagos?: string; // Opcional, para pólizas de vida

  // Documentos
  documents: PolicyDocument[];

  // Campos anteriores (se pueden mantener, eliminar o adaptar según necesidad)
  premiumAmount: number; // Podría ser reemplazado por sumaAsegurada o ser un campo diferente
  documentsAttached: boolean;
  hasPendingPayment?: boolean;
} 