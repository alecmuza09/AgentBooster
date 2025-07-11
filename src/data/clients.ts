import { Client } from '../types/client';
import { subDays, addDays } from 'date-fns';

export const exampleClients: Client[] = [
    { 
        id: '1', 
        internal_id: 'CLI001', 
        name: 'Juan Pérez García', 
        rfc: 'PEJG800101ABC', 
        email: 'juan.perez@email.com', 
        phone: '55 1234 5678', 
        status: 'active', 
        policyCount: 3, 
        lastInteraction: subDays(new Date(), 5), 
        nextRenewal: addDays(new Date(), 25), 
        assignedAdvisor: 'Ana López', 
        insuranceCompany: 'GNP Seguros', 
        alerts: { pendingPayments: true, expiredDocs: false, homonym: false }, 
        preferredPaymentMethod: 'card', 
        paymentFrequency: 'monthly' 
    },
    { 
        id: '2', 
        internal_id: 'CLI002', 
        name: 'María Rodríguez Luna', 
        rfc: 'ROLM920315XYZ', 
        email: 'maria.r@email.com', 
        phone: '55 9876 5432', 
        status: 'active', 
        policyCount: 1, 
        lastInteraction: subDays(new Date(), 2), 
        nextRenewal: addDays(new Date(), 80), 
        assignedAdvisor: 'Carlos Marín', 
        insuranceCompany: 'AXA Seguros', 
        alerts: { pendingPayments: false, expiredDocs: true, homonym: false }, 
        preferredPaymentMethod: 'transfer', 
        paymentFrequency: 'annual' 
    },
    { 
        id: '3', 
        internal_id: 'CLI003', 
        name: 'Pedro Martínez Solís', 
        rfc: 'MASP751120DEF', 
        email: 'pedro.m@email.com', 
        phone: '55 1122 3344', 
        status: 'inactive', 
        policyCount: 0, 
        lastInteraction: subDays(new Date(), 100), 
        assignedAdvisor: 'Ana López', 
        insuranceCompany: 'MetLife', 
        alerts: { pendingPayments: false, expiredDocs: false, homonym: false } 
    },
    { 
        id: '4', 
        internal_id: 'CLI004', 
        name: 'Laura Gómez Morales', 
        rfc: 'GOML880505JKL', 
        email: 'laura.gm@email.com', 
        phone: '55 4455 6677', 
        status: 'prospect', 
        policyCount: 0, 
        assignedAdvisor: 'Carlos Marín', 
        insuranceCompany: '-', 
        alerts: { pendingPayments: false, expiredDocs: false, homonym: true } 
    },
]; 