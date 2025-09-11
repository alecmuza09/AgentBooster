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
    // Timeout de seguridad para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('AuthContext: Timeout en carga de autenticación, usando modo desarrollo');
        setLoading(false);
      }
    }, 5000); // 5 segundos de timeout

    // Verificar si las credenciales de Supabase están configuradas
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials not configured. Using mock user for development.');
      // Simular usuario autenticado para desarrollo
      const mockUser = {
        id: 'mock-user-id',
        email: 'usuario@ejemplo.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated'
      } as User;
      
      setUser(mockUser);
      setLoading(false);
      clearTimeout(timeoutId);
      return;
    }

    // Verificar sesión existente primero
    console.log('AuthContext: Verificando sesión existente...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('AuthContext: Sesión existente encontrada:', session.user.email);
        setUser(session.user);
        loadUserProfile(session.user.id);
        setLoading(false);
        clearTimeout(timeoutId);
      } else {
        console.log('AuthContext: No hay sesión existente, intentando auto-login...');
        // Auto-login con usuario de prueba solo si no hay sesión
        supabase.auth.signInWithPassword({
          email: 'test@agentbooster.com',
          password: 'testpassword123'
        }).then(({ data: loginData, error: loginError }) => {
          if (loginError) {
            console.warn('AuthContext: Error en auto-login:', loginError.message);
            console.log('AuthContext: Continuando sin autenticación automática');
            setLoading(false);
            clearTimeout(timeoutId);
          } else {
            console.log('AuthContext: Auto-login exitoso');
            setUser(loginData.user);
            if (loginData.user) {
              loadUserProfile(loginData.user.id);
            }
            setLoading(false);
            clearTimeout(timeoutId);
          }
        }).catch((error) => {
          console.error('AuthContext: Error en auto-login:', error);
          setLoading(false);
          clearTimeout(timeoutId);
        });
      }
    }).catch((error) => {
      console.error('AuthContext: Error verificando sesión:', error);
      setLoading(false);
      clearTimeout(timeoutId);
    });

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Cargar perfil del usuario
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Supabase sign in attempt:', { data, error });
      if (error) throw error;
    } catch (err) {
      console.error('Error during sign in:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
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
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
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