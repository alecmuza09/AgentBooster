import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types/learning';
import { CourseCard } from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

type CourseCategory = 'sales' | 'products' | 'compliance' | 'tools' | 'all';
type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'all';
type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'all';

interface LearningFilters {
    level: CourseLevel;
    category: CourseCategory;
    status: CourseStatus;
}

export const Learning = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<LearningFilters>({
        level: 'all',
        category: 'all',
        status: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set()); // TODO: Store favorites in DB

    useEffect(() => {
        const fetchLearningData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);

            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select(`
                    *,
                    course_modules (
                        *,
                        user_module_progress (
                            user_id,
                            completed_at
                        )
                    )
                `);
            
            if (coursesError) {
                console.error("Error fetching courses:", coursesError);
                setIsLoading(false);
                return;
            }

            const processedCourses: Course[] = coursesData.map((course: any) => {
                const total_modules = course.course_modules?.length || 0;
                const completed_modules = course.course_modules?.filter((m: any) => 
                    m.user_module_progress.some((p: any) => p.user_id === user.id && p.completed_at)
                ).length || 0;
                
                return {
                    ...course,
                    modules: course.course_modules,
                    total_modules,
                    completed_modules,
                } as Course;
            });

            setCourses(processedCourses);
            setIsLoading(false);
        };

        fetchLearningData();
    }, [user]);
    
    const handleToggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(id)) newFavs.delete(id);
            else newFavs.add(id);
            return newFavs;
        });
    };

    const filteredCourses = useMemo(() => {
        let filtered = courses;

        // Apply filters
        if (filters.level !== 'all') {
            filtered = filtered.filter(c => c.difficulty === filters.level);
        }
        if (filters.category !== 'all') {
             filtered = filtered.filter(c => c.category === filters.category);
         }
        if (filters.status !== 'all') {
             const statusLogic = (c: Course): CourseStatus => {
                 if (c.completed_modules === c.total_modules && c.total_modules > 0) return 'completed';
                 if (c.completed_modules > 0) return 'in_progress';
                 return 'not_started';
             };
             filtered = filtered.filter(c => statusLogic(c) === filters.status);
         }

        // Apply search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                 (c.title && c.title.toLowerCase().includes(lowerSearch)) ||
                 (c.description && c.description.toLowerCase().includes(lowerSearch))
            );
        }
        
         filtered.sort((a, b) => {
            if (a.is_mandatory !== b.is_mandatory) return a.is_mandatory ? -1 : 1;
            const isAFav = favorites.has(a.id);
            const isBFav = favorites.has(b.id);
            if (isAFav !== isBFav) return isAFav ? -1 : 1;
            return a.title.localeCompare(b.title);
         });

        return filtered;
    }, [courses, searchTerm, filters, favorites]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary dark:text-primary-dark" /> 
            Centro de Aprendizaje
        </h1>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowFilters(!showFilters)} 
             className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
            <Filter className="w-4 h-4" />
            Filtros {showFilters ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-4">
        <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
        </div>

        {showFilters && (
             <div className="border-t border-gray-200 dark:border-gray-600 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label htmlFor="filter-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nivel</label>
                     <select id="filter-level" value={filters.level} onChange={e => setFilters({...filters, level: e.target.value as LearningFilters['level']})} className="w-full p-2 rounded-md dark:bg-gray-700 dark:border-gray-600">
                          <option value="all">Todos</option>
                          <option value="Beginner">Principiante</option>
                          <option value="Intermediate">Intermedio</option>
                          <option value="Advanced">Avanzado</option>
                      </select>
                  </div>
                  <div>
                      <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                     <select id="filter-category" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value as LearningFilters['category']})} className="w-full p-2 rounded-md dark:bg-gray-700 dark:border-gray-600">
                          <option value="all">Todas</option>
                          <option value="sales">Ventas</option>
                          <option value="products">Productos</option>
                          <option value="compliance">Cumplimiento</option>
                          <option value="tools">Herramientas</option>
                      </select>
                  </div>
                   <div>
                      <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                     <select id="filter-status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value as LearningFilters['status']})} className="w-full p-2 rounded-md dark:bg-gray-700 dark:border-gray-600">
                          <option value="all">Todos</option>
                          <option value="not_started">No Iniciado</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completado</option>
                      </select>
                  </div>
              </div>
          )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
          <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
          </div>
      ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.has(course.id)}
                  />
              ))}
          </div>
      ) : (
          <div className="text-center py-16">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay cursos disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">Pronto se añadirán nuevos cursos. ¡Vuelve a consultar más tarde!</p>
          </div>
      )}
    </div>
  );
};