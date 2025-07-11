import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary dark:border-primary-dark"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando...</span>
    </div>
  );
}; 