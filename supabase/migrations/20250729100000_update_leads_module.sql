-- 1. Eliminar la restricción CHECK existente para los estados
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- 2. Añadir la nueva restricción CHECK con los estados actualizados
ALTER TABLE public.leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('Nuevo', 'Contactado', 'Cita', 'Propuesta', 'Cerrado', 'Frenado'));

-- 3. Hacer que el campo 'name' sea opcional
ALTER TABLE public.leads ALTER COLUMN name DROP NOT NULL;

-- 4. Añadir una columna para rastrear cuándo se actualizó el estado por última vez
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Opcional: Crear una función y un trigger para actualizar status_updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_lead_status_change ON public.leads;
CREATE TRIGGER on_lead_status_change
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_status_timestamp();
