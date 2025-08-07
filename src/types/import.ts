export type ImportableEntityType = 'polizas' | 'recibos';

export interface PolizaImport {
  "No poliza": string;
  "Inciso": number;
  "Concepto": string;
  "Modelo": string;
  "No. Serie": string;
  "Cliente id": string;
  "Cliente": string;
  "Clave de Agente": string;
  "Aseguradora": string;
  "Ramo": string;
  "Fecha vigencia total de póliza de": string;
  "Fecha vigencia total de póliza a": string;
  "Fecha vigencia del recibo de": string;
  "Fecha vigencia del recibo a": string;
  "Prima Neta": number;
  "Derecho": number;
  "Recargo": number;
  "Total": number;
  "Tipo de Cargo": 'CAT' | 'CXC' | 'CUT';
  "Fecha de Registro": string;
  "Estatus mov": 'Vigente' | 'Cancelada' | 'Vencida';
}

export interface ReciboImport extends Omit<PolizaImport, 'Fecha vigencia total de póliza de' | 'Fecha vigencia total de póliza a'> {
  Recibo: number;
  "Fec_vig_de": string;
  "Fec_vig_a": string;
  "Fec_vence": string;
  "Fec_liquidacion": string;
  Liquidacion: string;
  Liquido: string;
  Conciliado: string;
  Porcentaje: number;
  Esperada: number;
  "Fec_conciliado": string;
  Comentario: string;
  "Prima_TC": number;
  "Total TC": number;
  "Pago TC": number;
  Pago: string;
  "Fec_pago": string;
  "Tipo cambio": number;
  "Status Poliza": string;
  "Status Movimiento": string;
  "Prima Anual": string;
  "Concepto Pago": string;
  "Fecha Registro Pago": string;
  ReciboId: number;
}

export type ImportState = 'idle' | 'uploading' | 'validating' | 'preview' | 'importing' | 'completed' | 'error';

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface DuplicateInfo {
  row: number;
  poliza: string;
  message: string;
}

export interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: ValidationError[];
  duplicates: DuplicateInfo[];
}

export interface ImportError {
  type: 'file' | 'structure' | 'validation' | 'duplicate' | 'system';
  row?: number;
  field?: string;
  value?: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
  batchSize: number;
  dateFormat: 'DD/MM/YYYY';
  decimalSeparator: '.' | ',';
}
