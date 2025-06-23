export type ClientStatus = 'active' | 'inactive' | 'prospect';

export interface Client {
  id: string;
  internal_id: string;
  name: string;
  rfc: string;
  email: string;
  phone: string;
  status: ClientStatus;
  policyCount: number;
  assignedAdvisor: string;
  insuranceCompany: string;
  alerts: {
    pendingPayments: boolean;
    expiredDocs: boolean;
    homonym: boolean;
  };
  policyStartDate?: string | Date;
  policyEndDate?: string | Date;
  paymentEndDate?: string | Date;
  paymentFrequency?: 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'single';
  preferredPaymentMethod?: 'transfer' | 'cash' | 'card' | 'direct_debit';
  ineDocumentUrl?: string;
  lastInteraction?: Date;
  nextRenewal?: Date;
  isIntegral?: boolean;
} 