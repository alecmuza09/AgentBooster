-- 1. LIMPIEZA: Usamos CASCADE para borrar las tablas y sus dependencias.
DROP TABLE IF EXISTS public.finanzas_balance CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.policy_document_versions CASCADE;
DROP TABLE IF EXISTS public.policy_documents CASCADE;
DROP TABLE IF EXISTS public.policy_contacts CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.policy_contact_role CASCADE;

-- 2. CREACIÓN: Volvemos a crear todo desde cero.

-- Creamos un enum para los roles de contacto, para reutilizarlo de forma segura
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'policy_contact_role') THEN
        CREATE TYPE public.policy_contact_role AS ENUM (
            'contratante',
            'asegurado',
            'dueñoFinal',
            'contactoPago'
        );
    END IF;
END$$;

-- Tabla para perfiles de usuario, extiende auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Habilitamos RLS y creamos políticas para perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Función para crear un perfil automáticamente cuando un nuevo usuario se registra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función después de un nuevo registro en auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Tabla para Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL CHECK (status IN ('Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación', 'Frenado', 'Cerrado')),
    source TEXT,
    potential_value NUMERIC,
    stage TEXT,
    last_contacted_date DATE,
    notes TEXT
);
-- Habilitamos RLS y creamos políticas para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los agentes pueden ver sus propios leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los agentes pueden insertar nuevos leads" ON public.leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Los agentes pueden actualizar sus propios leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los agentes pueden eliminar sus propios leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);


-- Tabla para Pólizas
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    policy_number TEXT NOT NULL UNIQUE,
    ramo TEXT NOT NULL,
    forma_de_pago TEXT,
    conducto_de_pago TEXT,
    moneda TEXT,
    suma_asegurada NUMERIC,
    aseguradora TEXT,
    status TEXT,
    fecha_pago_actual DATE,
    vigencia_periodo_inicio DATE,
    vigencia_periodo_fin DATE,
    vigencia_total_inicio DATE,
    vigencia_total_fin DATE,
    termino_pagos DATE,
    premium_amount NUMERIC
);
-- Habilitamos RLS y creamos políticas para policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los agentes pueden ver sus propias pólizas" ON public.policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los agentes pueden insertar nuevas pólizas" ON public.policies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Los agentes pueden actualizar sus propias pólizas" ON public.policies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los agentes pueden eliminar sus propias pólizas" ON public.policies FOR DELETE USING (auth.uid() = user_id);


-- Tabla para los contactos asociados a una póliza
CREATE TABLE IF NOT EXISTS public.policy_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
    role public.policy_contact_role NOT NULL,
    nombre TEXT NOT NULL,
    rfc TEXT,
    direccion TEXT,
    telefono TEXT,
    UNIQUE(policy_id, role) -- Asegura que solo haya un tipo de contacto por póliza
);
-- Habilitamos RLS y creamos políticas para contactos
ALTER TABLE public.policy_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los agentes pueden gestionar los contactos de sus pólizas" ON public.policy_contacts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.policies WHERE policies.id = public.policy_contacts.policy_id AND policies.user_id = auth.uid()));

-- Tabla para Documentos (contenedores)
CREATE TABLE IF NOT EXISTS public.policy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Habilitamos RLS y creamos políticas para documentos
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los agentes pueden gestionar los documentos de sus pólizas" ON public.policy_documents FOR ALL
    USING (EXISTS (SELECT 1 FROM public.policies WHERE policies.id = public.policy_documents.policy_id AND policies.user_id = auth.uid()));

-- Tabla para Versiones de Documentos, vinculada a Supabase Storage
CREATE TABLE IF NOT EXISTS public.policy_document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.policy_documents(id) ON DELETE CASCADE NOT NULL,
    version INT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Ruta en Supabase Storage
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version)
);
-- Habilitamos RLS y creamos políticas para versiones
ALTER TABLE public.policy_document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los agentes pueden gestionar las versiones de los documentos de sus pólizas" ON public.policy_document_versions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.policy_documents pd
        JOIN public.policies p ON p.id = pd.policy_id
        WHERE pd.id = public.policy_document_versions.document_id AND p.user_id = auth.uid()
    ));

-- Creamos el bucket de almacenamiento para los documentos de las pólizas
INSERT INTO storage.buckets (id, name, public) VALUES ('policy_documents', 'policy_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Creamos las políticas de seguridad para el bucket
DROP POLICY IF EXISTS "bucket_policy_select" ON storage.objects;
CREATE POLICY "bucket_policy_select" ON storage.objects FOR SELECT
    USING (bucket_id = 'policy_documents' AND (
        SELECT p.user_id FROM public.policies p 
        JOIN public.policy_documents pd ON p.id = pd.policy_id 
        JOIN public.policy_document_versions pdv ON pd.id = pdv.document_id 
        WHERE pdv.storage_path = storage.objects.name
    ) = auth.uid());
    
DROP POLICY IF EXISTS "bucket_policy_insert" ON storage.objects;
CREATE POLICY "bucket_policy_insert" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'policy_documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bucket_policy_delete" ON storage.objects;
CREATE POLICY "bucket_policy_delete" ON storage.objects FOR DELETE
    USING (bucket_id = 'policy_documents' AND (
        SELECT p.user_id FROM public.policies p 
        JOIN public.policy_documents pd ON p.id = pd.policy_id 
        JOIN public.policy_document_versions pdv ON pd.id = pdv.document_id 
        WHERE pdv.storage_path = storage.objects.name
    ) = auth.uid());


-- Tablas para el módulo de Aprendizaje
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos los usuarios pueden ver los cursos" ON public.courses FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    module_order INT NOT NULL,
    UNIQUE(course_id, module_order)
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos los usuarios pueden ver los módulos" ON public.modules FOR SELECT USING (true);


-- Tablas para el módulo de Finanzas 360
CREATE TABLE IF NOT EXISTS public.finanzas_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
    datos_generales JSONB,
    ingresos JSONB,
    gastos JSONB,
    inversiones JSONB,
    seguros JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.finanzas_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los usuarios pueden ver su propio balance" ON public.finanzas_balance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Los usuarios pueden crear su propio balance" ON public.finanzas_balance FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Los usuarios pueden actualizar su propio balance" ON public.finanzas_balance FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Los usuarios pueden eliminar su propio balance" ON public.finanzas_balance FOR DELETE USING (user_id = auth.uid()); 