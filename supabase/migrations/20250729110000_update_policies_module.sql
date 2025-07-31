-- Añadir los nuevos roles al tipo enum 'policy_contact_role'
-- Se añaden con 'IF NOT EXISTS' para evitar errores si se ejecuta la migración más de una vez.
ALTER TYPE public.policy_contact_role ADD VALUE IF NOT EXISTS 'contabilidad';
ALTER TYPE public.policy_contact_role ADD VALUE IF NOT EXISTS 'administracion';
ALTER TYPE public.policy_contact_role ADD VALUE IF NOT EXISTS 'personal';
