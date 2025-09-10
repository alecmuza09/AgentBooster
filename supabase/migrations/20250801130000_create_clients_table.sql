-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    internal_id TEXT UNIQUE,
    name TEXT NOT NULL,
    rfc TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    policy_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMPTZ,
    next_renewal DATE,
    assigned_advisor TEXT,
    insurance_company TEXT,
    alerts JSONB DEFAULT '{"pending_payments": false, "expired_docs": false, "homonym": false}',
    preferred_payment_method TEXT DEFAULT 'card',
    payment_frequency TEXT DEFAULT 'monthly'
);

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propios clientes" ON public.clients 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar clientes" ON public.clients 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios pueden actualizar sus propios clientes" ON public.clients 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios clientes" ON public.clients 
    FOR DELETE USING (auth.uid() = user_id);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_next_renewal ON public.clients(next_renewal);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
