import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient'; // Usar el cliente centralizado

// Definir un tipo para el perfil del usuario que coincida con la tabla `profiles`
interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  cedula_type?: string;
  cedula_expiration_date?: string;
  agencia?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data: { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado en componentes desmontados

    // Timeout de seguridad para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (loading && isMounted) {
        console.warn('AuthContext: Timeout en carga de autenticación');
        console.log('AuthContext: Verificando configuración de Supabase...');

        // Verificar si las credenciales están configuradas
        const hasSupabaseCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!hasSupabaseCredentials) {
          console.warn('Supabase credentials not configured. Using mock mode for development.');
          // En modo desarrollo sin credenciales, permitir login manual
          setLoading(false);
        } else {
          console.error('AuthContext: Timeout pero credenciales configuradas - posible problema de conexión');
          setError('Error de conexión. Verifica tu conexión a internet.');
          setLoading(false);
        }
      }
    }, 10000); // 10 segundos de timeout (aumentado)

    // Función para verificar conexión a Supabase
    const checkSupabaseConnection = async () => {
      try {
        console.log('AuthContext: Verificando conexión a Supabase...');
        // Hacer una consulta simple para verificar conexión
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return !error;
      } catch (error) {
        console.error('AuthContext: Error conectando a Supabase:', error);
        return false;
      }
    };

    // Verificar si las credenciales de Supabase están configuradas
    const hasSupabaseCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!hasSupabaseCredentials) {
      console.warn('Supabase credentials not configured. Using development mode.');
      // En desarrollo sin credenciales, no hacer login automático
      setLoading(false);
      clearTimeout(timeoutId);
      return;
    }

    // Intentar conectarse a Supabase
    checkSupabaseConnection().then((isConnected) => {
      if (!isMounted) return;

      if (!isConnected) {
        console.warn('AuthContext: No se pudo conectar a Supabase, usando modo offline');
        setError('No se pudo conectar a Supabase. Verifica tu conexión.');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      console.log('AuthContext: Conexión a Supabase exitosa, verificando sesión...');

      // Verificar sesión existente
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!isMounted) return;

        if (error) {
          console.error('AuthContext: Error obteniendo sesión:', error);
          setError('Error al verificar sesión. Intenta recargar la página.');
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        if (session?.user) {
          console.log('AuthContext: Sesión existente encontrada:', session.user.email);
          setUser(session.user);
          loadUserProfile(session.user.id);
        } else {
          console.log('AuthContext: No hay sesión existente - usuario debe hacer login');
        }

        setLoading(false);
        clearTimeout(timeoutId);
      }).catch((error) => {
        if (!isMounted) return;
        console.error('AuthContext: Error verificando sesión:', error);
        setError('Error al verificar sesión.');
        setLoading(false);
        clearTimeout(timeoutId);
      });
    });

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      console.log('AuthContext: Auth state changed:', _event, session?.user?.email || 'null');
      setUser(session?.user ?? null);
      setError(null); // Limpiar errores cuando cambia el estado

      if (session?.user) {
        // Cargar perfil del usuario
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('AuthContext: Intentando login con:', email);

      // Verificar si las credenciales de Supabase están configuradas
      const hasSupabaseCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!hasSupabaseCredentials) {
        console.log('AuthContext: Credenciales no configuradas, usando login mock');

        // Login mock para desarrollo
        if (email && password) {
          console.log('AuthContext: Login mock exitoso');
          const mockUser = {
            id: 'mock-user-' + Date.now(),
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated'
          } as User;

          // Simular perfil
          const mockProfile = {
            id: mockUser.id,
            full_name: email.split('@')[0],
            avatar_url: null,
            cedula_type: null,
            cedula_expiration_date: null,
            agencia: 'Desarrollo'
          };

          setUser(mockUser);
          setProfile(mockProfile);
          return;
        } else {
          throw new Error('Email y contraseña son requeridos');
        }
      }

      // Intentar login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      console.log('AuthContext: Respuesta de Supabase:', { success: !error, user: data?.user?.email });

      if (error) {
        // Manejar errores específicos de Supabase
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email no confirmado. Revisa tu correo y confirma tu cuenta.');
        }
        if (error.message.includes('Too many requests')) {
          throw new Error('Demasiados intentos. Espera un momento antes de intentar nuevamente.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No se pudo autenticar el usuario');
      }

      console.log('AuthContext: Login exitoso para:', data.user.email);

    } catch (err) {
      console.error('AuthContext: Error durante login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido durante el inicio de sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, data: { full_name: string }) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: data
        },
      });
      if (error) throw new Error(error.message);
      alert('¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta.');
    } catch (err) {
      console.error('Error during sign up:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Iniciando cierre de sesión...');
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpiar estado local
      setUser(null);
      setProfile(null);
      console.log('AuthContext: Sesión cerrada exitosamente');
    } catch (err) {
      console.error('AuthContext: Error al cerrar sesión:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign out');
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}