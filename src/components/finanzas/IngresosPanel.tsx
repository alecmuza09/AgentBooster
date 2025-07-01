import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { INGRESO_CATEGORIES, IngresosState, Ingreso, IngresoCategoriaFija } from '@/types/finanzas';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

// --- Esquema de Validación (Zod) ---
const ingresoSchema = z.object({
  id: z.string(),
  nombre: z.string().optional(),
  montoMensual: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || 0, z.number().min(0)),
  tasaImpuestoEfectiva: z.preprocess((val) => Number(val) || 0, z.number().min(0).max(100).optional()),
  incrementoAnual: z.preprocess((val) => Number(val) || 0, z.number().min(0).optional()),
  capital: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || undefined, z.number().min(0).optional()),
  tasaAnual: z.preprocess((val) => Number(val) || undefined, z.number().min(0).optional()),
  valorMercado: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || undefined, z.number().min(0).optional()),
});

const ingresosStateSchema = z.object({
  parametros: z.object({
    inflacion: z.preprocess((val) => Number(val) || 0, z.number()),
    tipoCambio: z.preprocess((val) => Number(val) || 0, z.number()),
    precioOroCentenario: z.preprocess((val) => Number(val) || 0, z.number()),
  }),
  ingresosFijos: z.record(ingresoSchema),
  otrosIngresos: z.array(ingresoSchema),
});

// --- Datos Iniciales ---
const initialData: IngresosState = {
  parametros: { inflacion: 4, tipoCambio: 18.00, precioOroCentenario: 45000 },
  ingresosFijos: INGRESO_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { id: cat, montoMensual: 0, nombre: '', tasaImpuestoEfectiva: 0, incrementoAnual: 0 };
    return acc;
  }, {} as Record<IngresoCategoriaFija, Ingreso>),
  otrosIngresos: [],
};

// --- Componente de Fila de Ingreso ---
const IngresoRow = ({ control, register, name, index, remove, isOtro = false }: {
    control: Control<IngresosState>,
    register: any,
    name?: IngresoCategoriaFija,
    index?: number,
    remove?: (index: number) => void,
    isOtro?: boolean
}) => {
    const fieldName = isOtro ? `otrosIngresos.${index}` : `ingresosFijos.${name}`;
    const montoMensual = useWatch({ control, name: `${fieldName}.montoMensual` as const });
    const montoAnual = (montoMensual || 0) * 12;
    const showExtraFields = name === 'Intereses' || name === 'Rentas';

    return (
        <TableRow>
            <TableCell className="font-medium">{isOtro ? 'Otro' : name}</TableCell>
            <TableCell>
                <Input {...register(`${fieldName}.nombre`)} placeholder="Descripción" />
            </TableCell>
            <TableCell>
                <Input {...register(`${fieldName}.montoMensual`)} type="number" step="100" className="text-right" />
            </TableCell>
            <TableCell className="text-right font-mono">
                {montoAnual.toLocaleString('en-US', { style: 'currency', currency: 'MXN' })}
            </TableCell>
            <TableCell>
                <Input {...register(`${fieldName}.tasaImpuestoEfectiva`)} type="number" placeholder="%" className="text-right" />
            </TableCell>
            <TableCell>
                <Input {...register(`${fieldName}.incrementoAnual`)} type="number" placeholder="%" className="text-right" />
            </TableCell>
            
            {showExtraFields ? (
                <>
                    <TableCell><Input {...register(`${fieldName}.capital`)} type="number" className="text-right" /></TableCell>
                    <TableCell><Input {...register(`${fieldName}.tasaAnual`)} type="number" placeholder="%" className="text-right" /></TableCell>
                    <TableCell><Input {...register(`${fieldName}.valorMercado`)} type="number" className="text-right" /></TableCell>
                </>
            ) : (
                <TableCell colSpan={3}></TableCell>
            )}

            <TableCell className="text-center">
              {isOtro && <Button type="button" variant="destructive" size="icon" onClick={() => remove && remove(index!)}><Trash2 size={16} /></Button>}
            </TableCell>
        </TableRow>
    );
};

// --- Componente Principal ---
export const IngresosPanel = () => {
  const [isSaved, setIsSaved] = useState(false);
  const { control, register, handleSubmit, formState: { errors } } = useForm<IngresosState>({
    resolver: zodResolver(ingresosStateSchema),
    defaultValues: initialData,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "otrosIngresos" });

  const watchedData = useWatch({ control });

  const { totalAnualBruto, totalAnualNeto, chartData } = useMemo(() => {
    let totalAnualBruto = 0;
    const allIngresos = [...Object.values(watchedData.ingresosFijos || {}), ...(watchedData.otrosIngresos || [])];
    const dataForChart: { name: string; value: number }[] = [];

    allIngresos.forEach((ingreso) => {
      const anual = (ingreso.montoMensual || 0) * 12;
      totalAnualBruto += anual;
      if (anual > 0) {
        const categoria = INGRESO_CATEGORIES.find(c => c === ingreso.id) || ingreso.nombre || 'Otro';
        const existingEntry = dataForChart.find(d => d.name === categoria);
        if (existingEntry) {
          existingEntry.value += anual;
        } else {
          dataForChart.push({ name: categoria, value: anual });
        }
      }
    });

    const totalImpuestos = allIngresos.reduce((acc, ing) => {
      const anual = (ing.montoMensual || 0) * 12;
      const tasa = (ing.tasaImpuestoEfectiva || 0) / 100;
      return acc + (anual * tasa);
    }, 0);

    return {
      totalAnualBruto,
      totalAnualNeto: totalAnualBruto - totalImpuestos,
      chartData: dataForChart,
    };
  }, [watchedData]);

  const onSubmit = (data: IngresosState) => {
    console.log("Datos de ingresos guardados:", data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1', '#FF6F91', '#FF9671'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <Card>
        <CardHeader><CardTitle>Asunciones (Parámetros Globales)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label htmlFor="inflacion">Inflación (%)</Label><Input id="inflacion" {...register('parametros.inflacion')} type="number" step="0.1" /></div>
          <div><Label htmlFor="tipoCambio">Tipo de Cambio (MXN/USD)</Label><Input id="tipoCambio" {...register('parametros.tipoCambio')} type="number" step="0.01" /></div>
          <div><Label htmlFor="precioOro">Precio Oro Centenario ($)</Label><Input id="precioOro" {...register('parametros.precioOroCentenario')} type="number" step="1000" /></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Fuentes de Ingreso</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Mensual</TableHead>
                <TableHead className="text-right">Anual</TableHead>
                <TableHead className="text-right">Tasa Impuesto Efectiva (%)</TableHead>
                <TableHead className="text-right">Incremento Anual (%)</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">Tasa Anual (%)</TableHead>
                <TableHead className="text-right">Valor Mercado (Propiedades)</TableHead>
                <TableHead className="text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INGRESO_CATEGORIES.map(cat => <IngresoRow key={cat} name={cat} control={control} register={register} />)}
              {fields.map((field, index) => <IngresoRow key={field.id} index={index} control={control} register={register} remove={remove} isOtro={true} />)}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={() => append({ id: uuidv4(), montoMensual: 0, nombre: '' })}>
              <PlusCircle size={16} className="mr-2"/>Añadir Otro Ingreso
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Resumen Anual</CardTitle></CardHeader>
          <CardContent className="space-y-2">
           <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Ingreso Bruto:</span> <span className="font-bold text-lg">${totalAnualBruto.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
           <div className="flex justify-between items-center"><span className="text-muted-foreground">Neto Promedio (Post-Imp):</span> <span className="font-bold text-lg text-green-500">${totalAnualNeto.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-center">Distribución de Ingresos</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString('es-MX')}`, name]} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <CardFooter className="flex justify-end pt-6">
        <Button type="submit">{isSaved ? '¡Guardado!' : 'Guardar Cambios'}</Button>
      </CardFooter>
    </form>
  );
}; 