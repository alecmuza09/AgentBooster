import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabaseClient';
import { Course, CourseModule } from '../types/learning';
import { ArrowLeft } from 'lucide-react';
import { Modal } from '../components/Modal';
import { NewModuleForm } from '../components/NewModuleForm';

const courseSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().optional(),
  category: z.enum(['products', 'sales', 'compliance', 'tools']),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  is_mandatory: z.boolean().default(false),
});
type CourseFormData = z.infer<typeof courseSchema>;

export const CourseDetailAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema)
  });
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      if (!id) return;
      setIsLoading(true);
      
      // Obtener el curso
      const { data: courseData, error: courseError } = await supabase.from('courses').select('*').eq('id', id).single();
      if (courseError) {
        console.error("Error fetching course:", courseError);
        navigate('/admin'); // Si no se encuentra el curso, volver
      } else {
        setCourse(courseData);
        reset(courseData); // Cargar datos en el formulario
      }

      // Obtener los módulos del curso
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', id)
        .order('module_order', { ascending: true });
      
      if (modulesError) {
        console.error("Error fetching modules:", modulesError);
      } else {
        setModules(modulesData);
      }

      setIsLoading(false);
    };
    fetchCourseAndModules();
  }, [id, navigate, reset]);

  const handleUpdateCourse = async (formData: CourseFormData) => {
    if (!id) return;
    const { error } = await supabase.from('courses').update(formData).eq('id', id);
    if (error) {
        alert("Error al actualizar el curso: " + error.message);
    } else {
        alert("¡Curso actualizado con éxito!");
    }
  };

  const handleModuleCreated = (newModule: CourseModule) => {
    setModules(prevModules => [...prevModules, newModule].sort((a, b) => a.module_order - b.module_order));
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-4 md:p-6">
        <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-2 mb-4 text-primary dark:text-primary-dark hover:underline">
            <ArrowLeft size={16} />
            Volver a la lista de cursos
        </button>
        
        <form onSubmit={handleSubmit(handleUpdateCourse)} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 border-b pb-4 mb-4">Editar Curso</h1>
            
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
            
            <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                    <input id="is_mandatory" {...register('is_mandatory')} type="checkbox" className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="is_mandatory" className="font-medium text-gray-700 dark:text-gray-200">¿Es un curso obligatorio?</label>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Módulos del Curso</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">Añadir Módulo</button>
             </div>
             
             {modules.length > 0 ? (
                <ul className="space-y-3">
                    {modules.map(module => (
                        <li key={module.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <span className="font-medium">Módulo {module.module_order}: {module.title}</span>
                            {/* Aquí irían botones de editar/eliminar módulo */}
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-gray-500">Este curso todavía no tiene módulos.</p>
             )}
        </div>

        {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Módulo">
                <NewModuleForm
                    courseId={id!}
                    onModuleCreated={handleModuleCreated}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        )}
    </div>
  );
}; 