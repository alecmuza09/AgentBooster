-- Añadir nuevos campos para el sistema de alertas y comentarios
ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS comentarios TEXT,
ADD COLUMN IF NOT EXISTS comprobante_pago_path TEXT,
ADD COLUMN IF NOT EXISTS requiere_comprobante BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ultima_alerta_enviada TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS proximo_pago_esperado DATE;

-- Crear índice para optimizar consultas de alertas
CREATE INDEX IF NOT EXISTS idx_policies_proximo_pago ON public.policies(proximo_pago_esperado);
CREATE INDEX IF NOT EXISTS idx_policies_status_fecha ON public.policies(status, fecha_pago_actual);

-- Función para calcular la fecha del próximo pago
CREATE OR REPLACE FUNCTION calcular_proximo_pago(
    fecha_ultimo_pago DATE,
    forma_pago TEXT
) RETURNS DATE AS $$
BEGIN
    CASE forma_pago
        WHEN 'Mensual' THEN RETURN fecha_ultimo_pago + INTERVAL '1 month';
        WHEN 'Trimestral' THEN RETURN fecha_ultimo_pago + INTERVAL '3 months';
        WHEN 'Semestral' THEN RETURN fecha_ultimo_pago + INTERVAL '6 months';
        WHEN 'Anual' THEN RETURN fecha_ultimo_pago + INTERVAL '1 year';
        ELSE RETURN fecha_ultimo_pago + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar automáticamente la fecha del próximo pago
CREATE OR REPLACE FUNCTION actualizar_proximo_pago()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_pago_actual IS NOT NULL AND NEW.forma_de_pago IS NOT NULL THEN
        NEW.proximo_pago_esperado = calcular_proximo_pago(NEW.fecha_pago_actual, NEW.forma_de_pago);
    END IF;
    
    -- Marcar como requerido comprobante si es domiciliado
    IF NEW.conducto_de_pago = 'Domiciliado' THEN
        NEW.requiere_comprobante = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la fecha del próximo pago
DROP TRIGGER IF EXISTS trigger_actualizar_proximo_pago ON public.policies;
CREATE TRIGGER trigger_actualizar_proximo_pago
    BEFORE INSERT OR UPDATE ON public.policies
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_proximo_pago();
