import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importar el hook de autenticación real

const ProtectedRoute: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth(); // Usar el estado de usuario real

  if (!user) {
    // Redirigir a login si no hay un usuario
    return <Navigate to="/login" replace />;
  }

  // Si se pasan children directamente, renderizarlos
  // Si no, renderizar <Outlet /> para que las rutas anidadas se muestren
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 