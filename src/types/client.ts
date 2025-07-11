export interface Client {
  id: string;
  agent_id?: string;
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'Activo' | 'Inactivo' | 'Prospecto';
  created_at: string;
  updated_at?: string;
} 