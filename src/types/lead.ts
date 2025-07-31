// Estados posibles para un prospecto
export type LeadStatus = 'Nuevo' | 'Contactado' | 'Cita' | 'Propuesta' | 'Cerrado' | 'Frenado';

export type LeadSortField = 'name' | 'status' | 'lastContactedDate' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export type InterestLevel = 'Bajo' | 'Medio' | 'Alto';

// Tipo para una entrada en el historial/timeline del prospecto
export interface LeadTimelineEntry {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change'; // Tipo de interacción
  date: string; // Fecha ISO 8601
  notes: string; // Descripción o resumen
  actor?: string; // Quién realizó la acción (Asesor, Sistema)
  newStatus?: LeadStatus; // Si fue un cambio de estado
}

export interface LeadDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

// Interfaz principal para un Prospecto (Lead)
export interface Lead {
  id: string;
  name?: string; // Ahora es opcional
  email?: string;
  phone: string; // El teléfono sigue siendo importante
  status: LeadStatus;
  source?: string;
  potentialValue?: number;
  lastContactedDate?: string;
  createdAt: string;
  statusUpdatedAt: string; // Para el contador de días
  notes?: string;
}

export type LeadData = Omit<Lead, 'id' | 'created_at' | 'user_id'>; 