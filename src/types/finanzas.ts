/**
 * Tipos de datos para el módulo de Finanzas Personales 360.
 */

// 1. Panel de Datos Generales
export interface DatosPersonales {
  nombre: string;
  conyuge?: string;
  dependientes: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  tipo: 'micro' | 'macro';
  descripcion?: string;
}

export interface DatosGenerales {
  personales: DatosPersonales;
  proyectos: Proyecto[];
}

// 2. Módulo de Ingresos
export const INGRESO_CATEGORIES = [
  'Sueldo',
  'Honorarios',
  'Comisiones',
  'Intereses',
  'Dividendos',
  'Rentas',
  'Regalías',
] as const;

export type IngresoCategoriaFija = typeof INGRESO_CATEGORIES[number];
export type IngresoCategoria = IngresoCategoriaFija | 'Otros';

export interface Ingreso {
  id: string;
  nombre?: string;
  montoMensual: number;
  tasaImpuestoEfectiva?: number;
  incrementoAnual?: number;
  // Campos específicos para Intereses y Rentas
  capital?: number;
  tasaAnual?: number;
  valorMercado?: number;
}

export interface ParametrosFinancieros {
  inflacion: number;
  tipoCambio: number;
  precioOroCentenario: number;
}

export interface IngresosState {
  parametros: ParametrosFinancieros;
  ingresosFijos: Record<IngresoCategoriaFija, Ingreso>;
  otrosIngresos: Ingreso[];
}

// 3. Módulo de Gastos
export const GASTO_CATEGORIES = [
  'Vivienda',
  'Transporte',
  'Alimentacion',
  'Escuelas y Extra Academicos',
  'Personales',
  'Seguros',
] as const;

export type GastoCategoria = typeof GASTO_CATEGORIES[number];

export interface GastoItem {
  id: string;
  nombre: string;
  montoMensual: number;
  // Campos específicos para créditos
  montoAdeudado?: number;
  fechaTermino?: string;
  valorActualActivo?: number;
}

export interface GastosState {
  [key: string]: GastoItem[];
}

// 4. Módulo de Balance
export const ACTIVO_CATEGORIES = [
  'Efectivo', 'Valor en Efectivo de Pólizas', 'Mercado de Dinero', 'Casas',
  'Departamentos', 'Terrenos', 'Muebles', 'Acciones Privadas', 'Autos',
  'Cuentas para Retiro', 'Joyería/Commodities', 'Aviones/Botes', 'Arte Fino',
  'Acciones Publicas', 'Deuda Privada', 'Otros'
] as const;

export const PASIVO_CATEGORIES = [
  'Hipotecas', 'Tarjetas de Crédito', 'Créditos Automotrices', 'Impuestos no pagados', 'Otros'
] as const;

export type ActivoCategoria = typeof ACTIVO_CATEGORIES[number];
export type PasivoCategoria = typeof PASIVO_CATEGORIES[number];

export interface BalanceItem {
  id: string;
  nombre: string;
  valor: number;
}

export interface BalanceState {
  activos: Record<string, BalanceItem[]>;
  pasivos: Record<string, BalanceItem[]>;
}

// 5. Módulo de Inversiones
export const INVERSION_CATEGORIES = [
  'Moneda',
  'Acciones Publicas',
  'Acciones Privadas',
  'Commodities',
  'Deuda Privada',
  'Deuda Publica',
  'Bienes Raices',
] as const;

export type InversionCategoria = typeof INVERSION_CATEGORIES[number];

export interface Inversion {
  id: string;
  categoria: InversionCategoria;
  descripcion: string;
  precioEntrada: number;
  roi?: number; // Opcional, puede ser calculado
  salidaMinima?: number;
  moneda: 'MXN' | 'USD';
  precioMercadoActual: number;
  // Minusvalía/Plusvalía se puede calcular: precioMercadoActual - precioEntrada
  tasaAnual?: number;
  tasaCrecimientoPromedioMensualizado?: number;
  tasaAnualizada?: number; // Puede ser calculado
  pagoAnualInversion?: number;
}

export interface InversionesState {
  inversiones: Inversion[];
}

// 6. Módulo de Seguros
export const SEGURO_TYPES = [
  'Seguro Vida',
  'Seguro Ahorro + Vida',
  'Otro'
] as const;

export type SeguroTipo = typeof SEGURO_TYPES[number];

export interface Seguro {
  id: string;
  tipo: SeguroTipo;
  // Un nombre custom, por ej. "Seguro Vida 1"
  nombre: string; 
  proteccionFallecimiento: number;
  proteccionInvalidez: number;
  valorEfectivoFinal: number;
  fechaTermino: string; // Puede ser una fecha o un texto como "Full Life"
}

export interface SegurosState {
  seguros: Seguro[];
}

// Aquí añadiremos los tipos para los otros módulos (Inversiones, etc.) a medida que los construyamos. 