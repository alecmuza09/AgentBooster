import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Course } from '../types/learning';
import { PlusCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { NewCourseForm } from '../components/NewCourseForm';
import { Link } from 'react-router-dom';
// Importaremos el formulario cuando lo creemos: import { NewCourseForm } from './NewCourseForm';

export const Admin = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data as Course[]);
      }
      setIsLoading(false);
    };
    fetchCourses();
  }, []);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
    setIsModalOpen(false);
  }

  return (
    <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gestión de Cursos</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Crea, edita y gestiona los cursos del Centro de Aprendizaje.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5"/>
                Crear Curso
            </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obligatorio</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8">Cargando...</td></tr>
                        ) : courses.length > 0 ? (
                            courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        <Link 
                                            to={`/admin/course/${course.id}`} 
                                            className="text-primary dark:text-primary-dark hover:underline"
                                        >
                                            {course.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.difficulty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.is_mandatory ? 'Sí' : 'No'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">No hay cursos creados todavía.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Curso">
                <NewCourseForm 
                    onCourseCreated={handleCourseCreated} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </Modal>
        )}
    </div>
  );
}; 