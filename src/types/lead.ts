// Estados posibles para un prospecto
export type LeadStatus = 'No Contactado' | 'Contactado' | 'Cita Agendada' | 'Propuesta Trabajada' | 'Convertido' | 'Perdido';

export type LeadSortField = 'name' | 'status' | 'last_contact_date' | 'created_at';
export type SortDirection = 'asc' | 'desc';

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
  name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  agent_id?: string;
  created_at: string;
  last_contact_date?: string;
  fullName: string;
  source?: string; // Origen (Referido, Web, Evento, etc.)
  assignedAdvisor?: string; // Asesor asignado
  nextActionDate?: string; // Fecha ISO 8601 para la próxima acción planeada (seguimiento, cita)
  potentialValue?: number; // Valor estimado (opcional)
  interestLevel?: 'low' | 'medium' | 'high'; // Nivel de interés (opcional)
  timeline?: LeadTimelineEntry[]; // Historial de interacciones
  documents?: LeadDocument[]; // Añadido para soportar documentos adjuntos
} 