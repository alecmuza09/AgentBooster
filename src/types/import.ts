export type ImportableEntityType = 'polizas' | 'recibos';

export interface PolizaImport {
  OT: string;
  "No poliza": string;
  Referencia?: string;
  "No endoso": string;
  Inciso: number;
  Concepto: string;
  "Cliente id": number;
  Cliente: string;
  Ramo: string;
  SubRamo: string;
  Aseguradora: string;
  "Cve agente": number;
  "Fec vig de": string;
  "Fec vig a": string;
  Servicio: string;
  Prima: number;
  Moneda: string;
  Grupo: string;
  Vendedor: string;
  "Usuario Captura": string;
  "Fec Creación": string;
  "Porc Com": number;
  "Total recibos": number;
  "Forma Pago": string;
  "Prima Neta": number;
  Derecho: number;
  Recargo: number;
  IVA: number;
  Total: number;
  "Estatus mov": string;
  "Comision Total": string;
  "Comision Vendedor": string;
  "Ejecutivo Servicio": string;
  "Tipo de Póliza": string;
  "Tipo de Pago": string;
  "Fec Registro": string;
  "Tipo Movimiento": string;
}

export interface ReciboImport extends Omit<PolizaImport, 'Fec vig de' | 'Fec vig a'> {
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
