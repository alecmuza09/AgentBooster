export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'pending_renewal';
export type InsuranceType = 'Vida' | 'Gastos Médicos' | 'Auto' | 'Hogar' | 'Otro';
export type PaymentForm = 'monthly' | 'quarterly' | 'annual' | 'single';
export type PaymentMethod = 'direct_debit' | 'card' | 'transfer' | 'cash';

export interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  policyType: string; 
  startDate: string; 
  endDate: string;   
  paymentDueDate?: string; 
  premiumAmount: number;
  premiumCurrency?: string;
  status: PolicyStatus;
  insuranceCompany: string;
  paymentForm: PaymentForm;
  paymentMethod: PaymentMethod;
  lastPaymentDate?: string; 
  reminderScheduled: boolean;
  documentsAttached: boolean;
  hasPendingPayment?: boolean; 
} 