import React, { useState, useMemo, Fragment } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GastosState, GASTO_CATEGORIES } from '../../types/finanzas';
import { Home, Car, Utensils, School, User, Shield, PlusCircle, Trash2, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Disclosure, Transition } from '@headlessui/react';
import clsx from 'clsx';

// --- Esquema de Validación y Datos Iniciales ---
const gastoItemSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "Nombre requerido"),
  montoMensual: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || 0, z.number().min(0)),
  montoAdeudado: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || 0, z.number().min(0).optional()),
  fechaTermino: z.string().optional(),
  valorActualActivo: z.preprocess((val) => Number(String(val).replace(/,/g, '')) || 0, z.number().min(0).optional()),
});

const gastosStateSchema = z.object(
  GASTO_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = z.array(gastoItemSchema);
    return acc;
  }, {} as Record<string, z.ZodTypeAny>)
);

const initialData: GastosState = GASTO_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = [];
  return acc;
}, {} as GastosState);

const categoryIcons: Record<string, React.ElementType> = {
  Vivienda: Home,
  Transporte: Car,
  Alimentacion: Utensils,
  'Escuelas y Extra Academicos': School,
  Personales: User,
  Seguros: Shield,
};

// --- Componente de Categoría de Gasto (Acordeón) ---
const GastoCategorySection = ({ categoryName, control, register }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: categoryName });
  const watchedItems = useWatch({ control, name: categoryName });
  const totalCategoria = useMemo(() => watchedItems.reduce((sum: number, item: any) => sum + item.montoMensual, 0), [watchedItems]);
  const Icon = categoryIcons[categoryName] || Home;

  return (
    <Disclosure as="div" className="bg-white dark:bg-gray-800 rounded-lg shadow" defaultOpen>
      {({ open }) => (
        <>
          <Disclosure.Button className="w-full flex justify-between items-center p-4 text-left text-lg font-medium">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-primary" />
              <span>{categoryName.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-base">${(totalCategoria * 12).toLocaleString()} Anual</span>
              <ChevronDown className={clsx("w-5 h-5 transition-transform", open && "transform rotate-180")} />
            </div>
          </Disclosure.Button>
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
            <Disclosure.Panel className="p-4 pt-0">
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3"><input {...register(`${categoryName}.${index}.nombre`)} placeholder="Nombre/Descripción" className="input-style-sm"/></div>
                    <div className="col-span-2"><input {...register(`${categoryName}.${index}.montoMensual`)} type="number" className="input-style-sm text-right"/></div>
                    <div className="col-span-2 text-right font-mono text-sm pr-2">${((watchedItems[index]?.montoMensual || 0) * 12).toLocaleString()}</div>
                    <div className="col-span-2"><input {...register(`${categoryName}.${index}.montoAdeudado`)} type="number" placeholder="Monto Adeudado" className="input-style-sm text-right"/></div>
                    <div className="col-span-2"><input {...register(`${categoryName}.${index}.fechaTermino`)} type="date" className="input-style-sm"/></div>
                    <div className="col-span-1"><button type="button" onClick={() => remove(index)} className="btn-danger p-1.5"><Trash2 size={16}/></button></div>
                  </div>
                ))}
                <button type="button" onClick={() => append({ id: crypto.randomUUID(), nombre: '', montoMensual: 0 })} className="btn-secondary flex items-center gap-2">
                  <PlusCircle size={16}/>Añadir Gasto
                </button>
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};


// --- Componente Principal ---
export const GastosPanel = () => {
    const { control, handleSubmit, register } = useForm<GastosState>({
        resolver: zodResolver(gastosStateSchema),
        defaultValues: initialData,
    });
    
    const watchedData = useWatch({ control });

    const { chartData, totalAnual } = useMemo(() => {
        const data: { name: string, value: number }[] = [];
        let total = 0;
        for (const category of GASTO_CATEGORIES) {
            const items = watchedData[category] || [];
            const categoryTotal = items.reduce((sum: number, item: any) => sum + (item.montoMensual || 0) * 12, 0);
            if (categoryTotal > 0) {
                data.push({ name: category.replace(/([A-Z])/g, ' $1').trim(), value: categoryTotal });
            }
            total += categoryTotal;
        }
        return { chartData: data, totalAnual: total };
    }, [watchedData]);

    const onSubmit = (data: GastosState) => console.log("Gastos guardados:", data);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1'];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {GASTO_CATEGORIES.map(cat => <GastoCategorySection key={cat} categoryName={cat} control={control} register={register} />)}
                </div>
                <aside className="lg:col-span-1 space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Resumen de Gastos</h3>
                        <p className="text-3xl font-bold text-red-500">${totalAnual.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total Anual</p>
                    </div>
                     <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-center">Concentración de Gastos</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </aside>
            </div>
             <div className="flex justify-end pt-6 border-t"><button type="submit" className="btn-primary">Guardar Cambios</button></div>
        </form>
    );
}; 