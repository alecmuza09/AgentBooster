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