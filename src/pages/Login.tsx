import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Briefcase, Building2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();
  const { signIn, error: authError } = useAuth();

  // Verificar conexión a Supabase al cargar el componente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const hasCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!hasCredentials) {
          setConnectionStatus('offline');
          return;
        }

        // Intentar una consulta simple para verificar conexión
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });

        if (response.ok) {
          setConnectionStatus('online');
        } else {
          setConnectionStatus('offline');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnectionStatus('offline');
      }
    };

    checkConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Login: Intentando iniciar sesión...');
      await signIn(email.trim(), password);
      console.log('Login: Inicio de sesión exitoso, redirigiendo...');
      navigate('/');
    } catch (err: any) {
      console.error('Login: Error durante inicio de sesión:', err);
      setError(err.message || 'Ocurrió un error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar error del contexto de autenticación
  const displayError = authError || error;

  // Función para obtener el indicador de conexión
  const getConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'online':
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Conectado</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Modo sin conexión</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span>Verificando conexión...</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-auto text-primary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Bienvenido a AgentBooster
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión para continuar
          </p>
          {getConnectionIndicator()}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <div className="relative mt-1">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{displayError}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-primary dark:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
                Regístrate aquí
            </Link>
        </p>

      </div>
    </div>
  );
}; 

export default Login; 