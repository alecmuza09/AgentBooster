import React from 'react';
import clsx from 'clsx';
import { BookOpen, Clock, PlayCircle, CheckCircle, Star, Heart, Download, Notebook } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es as esLocale } from 'date-fns/locale/es';
import { Course } from '../types/learning';

interface CourseCardProps {
  course: Course;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onToggleFavorite, isFavorite }) => {
  const { id, title, description, category, difficulty: level, total_modules: modules, thumbnail_url: imageUrl, completed_modules, is_mandatory: isMandatory } = course;
  
  const progressPercentage = modules > 0 ? Math.round((completed_modules / modules) * 100) : 0;
  const isCompleted = progressPercentage === 100;
  const isInProgress = progressPercentage > 0 && !isCompleted;

  const duration = course.modules?.reduce((acc, mod) => acc + (mod.duration_minutes || 0), 0) || 0;
  const durationText = `${Math.floor(duration / 60)}h ${duration % 60}m`;

  const lastAccessed = "2024-05-20T14:30:00Z"; // TODO: get this from user_module_progress
  
  const formatLastAccessed = (dateString?: string) => {
      return dateString ? `Accedido: ${format(parseISO(dateString), 'dd MMM yyyy', { locale: esLocale })}` : '' ;
  };

  let actionButtonText = 'Empezar Curso';
  let ActionButtonIcon = PlayCircle;
  if (isCompleted) {
      actionButtonText = 'Ver Curso';
      ActionButtonIcon = CheckCircle;
  } else if (isInProgress) {
      actionButtonText = 'Continuar Curso';
      ActionButtonIcon = PlayCircle;
  }

  return (
    <div className={clsx(
        "flex flex-col rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg h-full",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        isCompleted && "border-green-500 dark:border-green-600"
    )}>
        <div className="relative">
            {imageUrl ? (
                <img src={imageUrl} alt={`Portada ${title}`} className="w-full h-40 object-cover" />
            ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <button 
                onClick={() => onToggleFavorite(id)}
                className={clsx(
                    "absolute top-2 right-2 p-1.5 rounded-full transition-colors",
                    isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-black/30 text-white hover:bg-black/50 dark:bg-white/20 dark:hover:bg-white/40"
                )}
                title={isFavorite ? "Quitar de Favoritos" : "Añadir a Favoritos"}
                aria-pressed={isFavorite}
             >
                 <Heart className="w-4 h-4" />
            </button>
             {isMandatory && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center gap-1" title="Curso Obligatorio">
                     <Star className="w-3 h-3" /> Obligatorio
                 </span>
            )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 truncate" title={title}>{title}</h3>
             <div className="flex items-center gap-2 mb-2 text-xs">
                 <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize font-medium">{category}</span>
                 <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 capitalize font-medium">{level}</span>
             </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 flex-grow" title={description}>{description}</p> 
            
            <div className="mb-3">
                 <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progreso: {progressPercentage}%</span>
                    <span>{completed_modules}/{modules} Módulos</span>
                 </div>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className={clsx("h-1.5 rounded-full", isCompleted ? "bg-green-500" : "bg-primary dark:bg-primary-dark")} style={{ width: `${progressPercentage}%` }}></div>
                 </div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {durationText}</span>
                 {lastAccessed && <span>{formatLastAccessed(lastAccessed)}</span>}
            </div>
            
             <div className="mt-auto space-y-2">
                 <button className={clsx(
                     "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                     isCompleted
                         ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500"
                         : "bg-primary text-white dark:bg-primary-dark dark:hover:bg-primary-hover-dark hover:bg-primary-hover focus:ring-primary dark:focus:ring-primary-dark"
                 )}>
                    <ActionButtonIcon className="w-4 h-4" />
                    {actionButtonText}
                 </button>
                 { (
                     <div className="flex gap-2">
                         <a href={"#"} target="_blank" rel="noopener noreferrer" className="btn-secondary-small flex-1"><Download className="w-4 h-4 mr-1"/>Material</a>
                         <a href={"#"} target="_blank" rel="noopener noreferrer" className="btn-secondary-small flex-1"><Notebook className="w-4 h-4 mr-1"/>Notas</a>
                     </div>
                 )}
             </div>
        </div>
    </div>
  );
};

// Helper to define secondary button styles, as it was likely in the original file context
const BtnSecondarySmall: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, className, ...props }) => (
  <a
    className={clsx(
      "flex items-center justify-center text-center px-3 py-1.5 border rounded-md text-xs font-medium transition-colors",
      "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
      "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus dark:focus:ring-offset-gray-800",
      className
    )}
    {...props}
  >
    {children}
  </a>
);

export const ActionButtons: React.FC<{ course: Course, isCompleted: boolean, isInProgress: boolean }> = ({ course, isCompleted, isInProgress }) => {
    // ... (logic from original card can be extracted here if it gets complex)
    return <></>;
} 