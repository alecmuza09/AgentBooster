import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabaseClient';
import { CourseModule } from '../types/learning';

const moduleSchema = z.object({
  title: z.string().min(3, 'El título es requerido.'),
  module_order: z.coerce.number().min(1, 'El orden debe ser al menos 1.'),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface NewModuleFormProps {
    courseId: string;
    onModuleCreated: (newModule: CourseModule) => void;
    onClose: () => void;
}

export const NewModuleForm: React.FC<NewModuleFormProps> = ({ courseId, onModuleCreated, onClose }) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ModuleFormData>({
        resolver: zodResolver(moduleSchema)
    });

    const handleFormSubmit = async (formData: ModuleFormData) => {
        setServerError(null);
        try {
            const { data, error } = await supabase
                .from('course_modules')
                .insert({
                    ...formData,
                    course_id: courseId,
                })
                .select()
                .single();

            if (error) throw error;
            
            onModuleCreated(data);
            onClose();

        } catch (error: any) {
            console.error("Error creating module:", error);
            setServerError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label htmlFor="title" className="label-style">Título del Módulo</label>
                <input id="title" {...register('title')} className="input-style" />
                {errors.title && <p className="error-style">{errors.title.message}</p>}
            </div>
            <div>
                <label htmlFor="module_order" className="label-style">Orden</label>
                <input id="module_order" type="number" {...register('module_order')} className="input-style" />
                {errors.module_order && <p className="error-style">{errors.module_order.message}</p>}
            </div>
            
            {serverError && <p className="error-style">{serverError}</p>}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Creando...' : 'Crear Módulo'}
                </button>
            </div>
        </form>
    );
}; 