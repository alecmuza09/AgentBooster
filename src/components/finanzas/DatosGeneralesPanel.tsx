import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatosGenerales, Proyecto } from '../../types/finanzas';
import { User, PlusCircle, Trash2 } from 'lucide-react';

// Esquema de validación con Zod
const proyectoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['micro', 'macro']),
  descripcion: z.string().optional(),
});

const datosGeneralesSchema = z.object({
  personales: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    conyuge: z.string().optional(),
    dependientes: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().min(0, 'Debe ser un número positivo').optional()
    ),
  }),
  proyectos: z.array(proyectoSchema),
});

// Valores iniciales de ejemplo
const initialData: DatosGenerales = {
  personales: {
    nombre: '',
    conyuge: '',
    dependientes: 0,
  },
  proyectos: [],
};

export const DatosGeneralesPanel = () => {
  const [isSaved, setIsSaved] = useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm<DatosGenerales>({
    resolver: zodResolver(datosGeneralesSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'proyectos',
  });

  const onSubmit = (data: DatosGenerales) => {
    console.log('Datos guardados:', data);
    // Aquí iría la lógica para guardar en LocalStorage o backend
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Resetear mensaje después de 3s
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sección de Datos Personales */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Información Personal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="personales.nombre" className="label-style">Nombre Completo</label>
            <input {...register('personales.nombre')} id="personales.nombre" className="input-style" />
            {errors.personales?.nombre && <p className="error-style">{errors.personales.nombre.message}</p>}
          </div>
          <div>
            <label htmlFor="personales.conyuge" className="label-style">Cónyuge (Opcional)</label>
            <input {...register('personales.conyuge')} id="personales.conyuge" className="input-style" />
          </div>
          <div>
            <label htmlFor="personales.dependientes" className="label-style">Dependientes</label>
            <input {...register('personales.dependientes')} id="personales.dependientes" type="number" className="input-style" />
            {errors.personales?.dependientes && <p className="error-style">{errors.personales.dependientes.message}</p>}
          </div>
        </div>
      </section>

      {/* Sección de Proyectos */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Proyectos (Micro y Macro)</h3>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-8 gap-3 p-3 border rounded-lg">
              <input type="hidden" {...register(`proyectos.${index}.id`)} />
              <div className="md:col-span-3">
                <label className="label-style text-xs">Nombre del Proyecto</label>
                <input {...register(`proyectos.${index}.nombre`)} className="input-style" />
              </div>
              <div className="md:col-span-2">
                <label className="label-style text-xs">Tipo</label>
                <select {...register(`proyectos.${index}.tipo`)} className="input-style">
                  <option value="micro">Micro</option>
                  <option value="macro">Macro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label-style text-xs">Descripción</label>
                <input {...register(`proyectos.${index}.descripcion`)} className="input-style" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => remove(index)} className="btn-danger p-2 h-10">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ id: crypto.randomUUID(), nombre: '', tipo: 'micro', descripcion: '' })}
            className="btn-secondary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Añadir Proyecto
          </button>
        </div>
      </section>

      {/* Botón de Guardar */}
      <div className="flex justify-end pt-6 border-t">
        <button type="submit" className="btn-primary">
          {isSaved ? '¡Guardado con Éxito!' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}; 