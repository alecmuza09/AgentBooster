export interface Client {
  id: string;
  user_id?: string;
  internal_id?: string; // Generado automáticamente
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect'; // Cambiado a inglés para consistencia
  policyCount: number; // Actualizado automáticamente por triggers
  lastInteraction?: Date;
  nextRenewal?: Date; // Calculado automáticamente basado en pólizas
  assignedAdvisor?: string;
  insuranceCompany?: string;
  alerts: {
    pendingPayments: boolean; // Calculado automáticamente
    expiredDocs: boolean; // Calculado automáticamente
    homonym: boolean; // Calculado automáticamente
  };
  preferredPaymentMethod?: string;
  paymentFrequency?: string;
  created_at?: string;
  updated_at?: string;
}

// Nuevos tipos para las vistas de la base de datos
export interface PolicyWithClient {
  // Campos de Policy
  id: string;
  policyNumber: string;
  ramo: string;
  aseguradora: string;
  status: string;
  formaDePago: string;
  conductoDePago: string;
  moneda: string;
  primaNeta: number;
  total: number;
  sumaAsegurada: number;
  fechaVigenciaInicial: string;
  fechaVigenciaFinal: string;
  clienteId?: string;
  user_id: string;

  // Campos adicionales del cliente
  client_name?: string;
  client_rfc?: string;
  client_email?: string;
  client_phone?: string;
  client_status?: string;
}

export interface UserFinancialSummary {
  user_id: string;
  total_policies: number;
  active_policies: number;
  policies_with_alerts: number;
  total_premium_value: number;
  average_premium: number;
}

// Tipos para validaciones
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RFCValidation extends ValidationResult {
  type: 'persona_fisica' | 'persona_moral' | 'invalid';
} 