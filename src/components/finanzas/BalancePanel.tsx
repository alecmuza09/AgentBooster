import React, { useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BalanceState, ACTIVO_CATEGORIES, PASIVO_CATEGORIES } from '../../types/finanzas';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- Esquema y Datos Iniciales ---
const balanceItemSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'Nombre requerido'),
  valor: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || 0, z.number().min(0)),
});

const balanceStateSchema = z.object({
  activos: z.object(ACTIVO_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: z.array(balanceItemSchema) }), {})),
  pasivos: z.object(PASIVO_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: z.array(balanceItemSchema) }), {})),
});

const initialData: BalanceState = {
  activos: ACTIVO_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
  pasivos: PASIVO_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
};

// --- Sub-componentes ---
const BalanceCategory = ({ name, control, register, type }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: `${type}.${name}` });
  const items = useWatch({ control, name: `${type}.${name}` });
  const total = useMemo(() => items.reduce((sum: number, item: any) => sum + (parseFloat(String(item.valor)) || 0), 0), [items]);

  return (
    <div className="py-2 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center font-semibold">
        <span>{name}</span>
        <span className="font-mono">${total.toLocaleString()}</span>
      </div>
      <div className="pl-4 mt-1 space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6"><input {...register(`${type}.${name}.${index}.nombre`)} className="input-style-sm" placeholder="Descripción"/></div>
            <div className="col-span-5"><input {...register(`${type}.${name}.${index}.valor`)} type="number" className="input-style-sm text-right"/></div>
            <div className="col-span-1"><button type="button" onClick={() => remove(index)} className="btn-danger p-1.5"><Trash2 size={16}/></button></div>
          </div>
        ))}
        <button type="button" onClick={() => append({ id: crypto.randomUUID(), nombre: '', valor: 0 })} className="btn-secondary-sm flex items-center gap-1">
          <PlusCircle size={14}/> Añadir
        </button>
      </div>
    </div>
  );
};

const DonutChart = ({ data, title }: { data: any[], title: string }) => {
    const COLORS = title === 'Activos'
      ? ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2']
      : ['#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', '#F9F871'];
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- Componente Principal ---
export const BalancePanel = () => {
    const { control, register, handleSubmit } = useForm<BalanceState>({
        resolver: zodResolver(balanceStateSchema),
        defaultValues: initialData,
    });
    
    const watchedData = useWatch({ control });

    const { totalActivos, totalPasivos, netWorth, activosChartData, pasivosChartData } = useMemo(() => {
        let totalActivos = 0;
        const activosChartData: {name: string, value: number}[] = [];
        Object.entries(watchedData.activos || {}).forEach(([cat, items]) => {
            const catTotal = items.reduce((sum, item) => sum + (parseFloat(String(item.valor)) || 0), 0);
            if(catTotal > 0) {
                activosChartData.push({name: cat, value: catTotal});
                totalActivos += catTotal;
            }
        });

        let totalPasivos = 0;
        const pasivosChartData: {name: string, value: number}[] = [];
        Object.entries(watchedData.pasivos || {}).forEach(([cat, items]) => {
            const catTotal = items.reduce((sum, item) => sum + (parseFloat(String(item.valor)) || 0), 0);
             if(catTotal > 0) {
                pasivosChartData.push({name: cat, value: catTotal});
                totalPasivos += catTotal;
            }
        });
        
        return { totalActivos, totalPasivos, netWorth: totalActivos - totalPasivos, activosChartData, pasivosChartData };
    }, [watchedData]);

    const onSubmit = (data: BalanceState) => console.log("Balance guardado:", data);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-sm text-gray-500">Mi Valor Neto</p>
                <p className="text-4xl font-bold text-primary">${netWorth.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Activos */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-2">
                    <h2 className="text-xl font-bold">Activos</h2>
                    {ACTIVO_CATEGORIES.map(cat => <BalanceCategory key={cat} name={cat} type="activos" control={control} register={register} />)}
                </div>
                {/* Columna Pasivos */}
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-2">
                    <h2 className="text-xl font-bold">Pasivos</h2>
                    {PASIVO_CATEGORIES.map(cat => <BalanceCategory key={cat} name={cat} type="pasivos" control={control} register={register} />)}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DonutChart data={activosChartData} title="Distribución de Activos"/>
                <DonutChart data={pasivosChartData} title="Distribución de Pasivos"/>
            </div>

            <div className="flex justify-end pt-6 border-t"><button type="submit" className="btn-primary">Guardar Cambios</button></div>
        </form>
    );
}; 