import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabaseClient';
import { Course } from '../types/learning';
import { AlertCircle, UploadCloud } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().optional(),
  category: z.enum(['products', 'sales', 'compliance', 'tools']),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  is_mandatory: z.boolean().default(false),
  thumbnail: z.instanceof(FileList).refine(files => files?.length >= 1, 'La imagen de portada es obligatoria.'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface NewCourseFormProps {
    onCourseCreated: (newCourse: Course) => void;
    onClose: () => void;
}

export const NewCourseForm: React.FC<NewCourseFormProps> = ({ onCourseCreated, onClose }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema)
    });

    const handleFormSubmit = async (formData: CourseFormData) => {
        setIsUploading(true);
        setServerError(null);

        try {
            const thumbnailFile = formData.thumbnail[0];
            const fileName = `${Date.now()}_${thumbnailFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('course-thumbnails')
                .upload(fileName, thumbnailFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('course-thumbnails')
                .getPublicUrl(fileName);
            
            const thumbnailUrl = urlData?.publicUrl;

            const { data: courseData, error: insertError } = await supabase
                .from('courses')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    difficulty: formData.difficulty,
                    is_mandatory: formData.is_mandatory,
                    thumbnail_url: thumbnailUrl,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            onCourseCreated(courseData as Course);
            onClose();

        } catch (error: any) {
            setServerError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const isFormSubmitting = isSubmitting || isUploading;

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-lg mx-auto p-1">
            
            <div>
                <label htmlFor="title" className="label-style">Título del Curso</label>
                <input id="title" {...register('title')} className="input-style" />
                {errors.title && <p className="error-style">{errors.title.message}</p>}
            </div>

            <div>
                <label htmlFor="description" className="label-style">Descripción</label>
                <textarea id="description" {...register('description')} rows={3} className="input-style" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="label-style">Categoría</label>
                    <select id="category" {...register('category')} className="input-style">
                        <option value="products">Productos</option>
                        <option value="sales">Ventas</option>
                        <option value="compliance">Cumplimiento</option>
                        <option value="tools">Herramientas</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="difficulty" className="label-style">Dificultad</label>
                    <select id="difficulty" {...register('difficulty')} className="input-style">
                        <option value="Beginner">Principiante</option>
                        <option value="Intermediate">Intermedio</option>
                        <option value="Advanced">Avanzado</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="thumbnail" className="label-style">Imagen de Portada</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary dark:text-primary-dark hover:text-primary-hover">
                                <span>Sube un archivo</span>
                                <input id="thumbnail-upload" {...register('thumbnail')} type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" />
                            </label>
                            <p className="pl-1">o arrástralo aquí</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP hasta 2MB</p>
                    </div>
                </div>
                {errors.thumbnail && <p className="error-style">{errors.thumbnail.message}</p>}
            </div>
            
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="is_mandatory" {...register('is_mandatory')} type="checkbox" className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="is_mandatory" className="font-medium text-gray-700 dark:text-gray-200">¿Es un curso obligatorio?</label>
                </div>
            </div>
            
            {serverError && <div className="error-banner">{serverError}</div>}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isFormSubmitting} className="btn-primary">
                    {isFormSubmitting ? 'Guardando...' : 'Crear Curso'}
                </button>
            </div>
        </form>
    );
}; 