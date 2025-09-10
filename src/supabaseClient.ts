import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las credenciales están disponibles
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  console.log('Supabase: Credenciales encontradas, creando cliente');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase: Credenciales no configuradas, usando modo desarrollo');
  // Crear un cliente mock para desarrollo
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: function() { return this; },
      single: function() { return this; }
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Modo desarrollo' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Modo desarrollo' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: { message: 'Modo desarrollo' } }),
        remove: () => Promise.resolve({ error: null }),
        listBuckets: () => Promise.resolve({ data: [], error: null })
      })
    }
  };
}

export { supabase }; 