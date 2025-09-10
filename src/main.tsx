import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import TestApp from './TestApp.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';

// Usar TestApp temporalmente para debugging
const AppComponent = window.location.pathname === '/test' ? TestApp : App;

console.log('Main.tsx: Iniciando aplicación React...');
console.log('Main.tsx: Ruta actual:', window.location.pathname);
console.log('Main.tsx: Usando componente:', AppComponent.name);

try {
  const rootElement = document.getElementById('root');
  console.log('Main.tsx: Elemento root encontrado:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Elemento root no encontrado');
  }

  const root = createRoot(rootElement);
  console.log('Main.tsx: Root creado exitosamente');

  root.render(
    <StrictMode>
      <AuthProvider>
        <AppComponent />
      </AuthProvider>
    </StrictMode>
  );
  
  console.log('Main.tsx: Aplicación renderizada exitosamente');
} catch (error) {
  console.error('Main.tsx: Error al renderizar aplicación:', error);
}
