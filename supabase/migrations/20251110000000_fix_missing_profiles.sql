-- =============================================
-- MIGRACIÓN: Corregir perfiles faltantes
-- Fecha: 2025-11-10
-- Problema: Usuarios en auth.users sin perfil en profiles
-- =============================================

-- 1. CREAR PERFILES PARA USUARIOS EXISTENTES SIN PERFIL
-- Esto crea un perfil para cada usuario que no lo tiene

INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
    au.raw_user_meta_data->>'avatar_url' as avatar_url,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. ASEGURAR QUE LA POLÍTICA DE INSERT EXISTE
-- Esto permite que los usuarios creen su propio perfil si falta

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

CREATE POLICY "Users can insert their own profile." 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR TRIGGER
-- Asegurar que el trigger existe y está activo

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. LOG DE VERIFICACIÓN
-- Contar cuántos usuarios tienen perfil

DO $$
DECLARE
    total_users INTEGER;
    total_profiles INTEGER;
    missing_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    missing_profiles := total_users - total_profiles;
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'VERIFICACIÓN DE PERFILES';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Usuarios en auth.users: %', total_users;
    RAISE NOTICE 'Perfiles en profiles: %', total_profiles;
    RAISE NOTICE 'Perfiles faltantes: %', missing_profiles;
    
    IF missing_profiles > 0 THEN
        RAISE WARNING 'HAY % USUARIOS SIN PERFIL - SE CREARON AUTOMÁTICAMENTE', missing_profiles;
    ELSE
        RAISE NOTICE 'TODOS LOS USUARIOS TIENEN PERFIL ✓';
    END IF;
    RAISE NOTICE '==================================================';
END $$;

-- 5. COMENTARIO FINAL
COMMENT ON TABLE public.profiles IS 'Tabla de perfiles de usuario. Cada usuario en auth.users debe tener un perfil aquí. El trigger on_auth_user_created lo crea automáticamente.';

