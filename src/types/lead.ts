// Estados posibles para un prospecto
export type LeadStatus = 'No Contactado' | 'Contactado' | 'Cita Agendada' | 'Propuesta Trabajada' | 'Convertido' | 'Perdido';

export type LeadSortField = 'name' | 'status' | 'last_contact_date' | 'created_at';
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
  created_at: string;
  name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  agent_id?: string;
  last_contact_date?: string;
  source?: string;
  potential_value?: number;
  interest_level?: InterestLevel;
  notes?: string;
} 