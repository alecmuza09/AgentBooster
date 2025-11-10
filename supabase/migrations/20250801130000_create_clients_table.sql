-- =============================================
-- MIGRACIÓN COMPLETA PARA CORREGIR LA BASE DE DATOS
-- Fecha: 2025-01-10
-- =============================================

-- 1. CORRECCIONES DE POLÍTICAS RLS Y RELACIONES

-- Actualizar políticas de clients para incluir lógica de actualización de policy_count
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios clientes" ON public.clients;
CREATE POLICY "Los usuarios pueden actualizar sus propios clientes" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. FUNCIONES PARA MANTENER LA INTEGRIDAD DE DATOS

-- Función para actualizar automáticamente policy_count en clients
CREATE OR REPLACE FUNCTION update_client_policy_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el contador cuando se inserta una nueva póliza
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clients
        SET policy_count = policy_count + 1,
            updated_at = NOW()
        WHERE id::text = NEW.cliente_id AND user_id = NEW.user_id;
        RETURN NEW;
    END IF;

    -- Actualizar el contador cuando se elimina una póliza
    IF TG_OP = 'DELETE' THEN
        UPDATE public.clients
        SET policy_count = GREATEST(policy_count - 1, 0),
            updated_at = NOW()
        WHERE id::text = OLD.cliente_id AND user_id = OLD.user_id;
        RETURN OLD;
    END IF;

    -- Actualizar contadores cuando cambia cliente_id
    IF TG_OP = 'UPDATE' AND OLD.cliente_id IS DISTINCT FROM NEW.cliente_id THEN
        -- Decrementar el contador del cliente anterior
        IF OLD.cliente_id IS NOT NULL THEN
            UPDATE public.clients
            SET policy_count = GREATEST(policy_count - 1, 0),
                updated_at = NOW()
            WHERE id::text = OLD.cliente_id AND user_id = OLD.user_id;
        END IF;

        -- Incrementar el contador del nuevo cliente
        IF NEW.cliente_id IS NOT NULL THEN
            UPDATE public.clients
            SET policy_count = policy_count + 1,
                updated_at = NOW()
            WHERE id::text = NEW.cliente_id AND user_id = NEW.user_id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para mantener policy_count actualizado
DROP TRIGGER IF EXISTS trigger_update_client_policy_count ON public.policies;
CREATE TRIGGER trigger_update_client_policy_count
    AFTER INSERT OR UPDATE OR DELETE ON public.policies
    FOR EACH ROW
    EXECUTE FUNCTION update_client_policy_count();

-- 3. FUNCIONES PARA ALERTAS Y RENOVACIONES

-- Función para actualizar alertas de clientes basado en pólizas
CREATE OR REPLACE FUNCTION update_client_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar alertas cuando hay cambios en pólizas
    UPDATE public.clients
    SET alerts = jsonb_build_object(
        'pending_payments', EXISTS(
            SELECT 1 FROM public.policies p
            WHERE p.cliente_id = clients.id::text
            AND p.user_id = clients.user_id
            AND p.status IN ('overdue_critical', 'pending_renewal')
        ),
        'expired_docs', EXISTS(
            SELECT 1 FROM public.policies p
            WHERE p.cliente_id = clients.id::text
            AND p.user_id = clients.user_id
            AND p.vigencia_total_fin < CURRENT_DATE
        ),
        'homonym', (SELECT COUNT(*) > 1 FROM public.clients c2
                   WHERE c2.user_id = clients.user_id
                   AND c2.name = clients.name
                   AND c2.id != clients.id)
    ),
    next_renewal = (
        SELECT MIN(p.vigencia_total_fin)
        FROM public.policies p
        WHERE p.cliente_id = clients.id::text
        AND p.user_id = clients.user_id
        AND p.vigencia_total_fin > CURRENT_DATE
    ),
    updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar alertas cuando cambian las pólizas
DROP TRIGGER IF EXISTS trigger_update_client_alerts ON public.policies;
CREATE TRIGGER trigger_update_client_alerts
    AFTER INSERT OR UPDATE OR DELETE ON public.policies
    FOR EACH ROW
    EXECUTE FUNCTION update_client_alerts();

-- 4. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_policies_cliente_id ON public.policies(cliente_id);
CREATE INDEX IF NOT EXISTS idx_policies_vigencia_fin ON public.policies(vigencia_total_fin);
CREATE INDEX IF NOT EXISTS idx_policies_status_user ON public.policies(status, user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name_search ON public.clients USING gin (to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_leads_status_user ON public.leads(status, user_id);

-- 5. FUNCIONES DE VALIDACIÓN

-- Función para validar RFC mexicano
CREATE OR REPLACE FUNCTION validate_mexican_rfc(rfc TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- RFC persona física: 13 caracteres (4 letras + 6 dígitos + 3 alfanuméricos)
    -- RFC persona moral: 12 caracteres (3 letras + 6 dígitos + 3 alfanuméricos)
    RETURN rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para validar email
CREATE OR REPLACE FUNCTION validate_email_format(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. VISTAS PARA REPORTES

-- Vista para pólizas con información del cliente
CREATE OR REPLACE VIEW policies_with_clients AS
SELECT
    p.*,
    c.name as client_name,
    c.rfc as client_rfc,
    c.email as client_email,
    c.phone as client_phone,
    c.status as client_status
FROM public.policies p
LEFT JOIN public.clients c ON c.id::text = p.cliente_id AND c.user_id = p.user_id;

-- Vista para resumen financiero por usuario
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT
    user_id,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_policies,
    COUNT(CASE WHEN status IN ('overdue_critical', 'pending_renewal') THEN 1 END) as policies_with_alerts,
    COALESCE(SUM(total), 0) as total_premium_value,
    COALESCE(AVG(total), 0) as average_premium
FROM public.policies
GROUP BY user_id;

-- 7. DATOS INICIALES DE EJEMPLO

-- Insertar datos de ejemplo si las tablas están vacías
INSERT INTO public.clients (name, rfc, email, phone, status, assigned_advisor, insurance_company)
SELECT * FROM (VALUES
    ('Juan Pérez García', 'PEJG800101ABC', 'juan.perez@email.com', '5551234567', 'active', 'Ana López', 'GNP Seguros'),
    ('María Rodríguez Luna', 'ROLM920315XYZ', 'maria.r@email.com', '5559876543', 'active', 'Carlos Marín', 'AXA Seguros'),
    ('Pedro Martínez Solís', 'MASP751120DEF', 'pedro.m@email.com', '5551122334', 'inactive', 'Ana López', 'MetLife'),
    ('Laura Gómez Morales', 'GOML880505JKL', 'laura.gm@email.com', '5554455667', 'prospect', 'Carlos Marín', 'GNP Seguros')
) AS v(name, rfc, email, phone, status, assigned_advisor, insurance_company)
WHERE NOT EXISTS (SELECT 1 FROM public.clients LIMIT 1);

-- Insertar pólizas de ejemplo
INSERT INTO public.policies (
    policy_number, ramo, aseguradora, status, forma_de_pago, conducto_de_pago,
    moneda, prima_neta, total, suma_asegurada,
    fecha_vigencia_inicial, fecha_vigencia_final, cliente_id
)
SELECT * FROM (VALUES
    ('POL-2024-001', 'Vida', 'GNP Seguros', 'active', 'Mensual', 'Tarjeta', 'MXN', 1200, 1500, 1000000, '2024-01-01', '2025-01-01', (SELECT id::text FROM public.clients WHERE name = 'Juan Pérez García' LIMIT 1)),
    ('POL-2024-002', 'Gastos Médicos', 'MetLife', 'active', 'Mensual', 'Transferencia', 'MXN', 2800, 3200, 500000, '2024-02-01', '2025-02-01', (SELECT id::text FROM public.clients WHERE name = 'María Rodríguez Luna' LIMIT 1)),
    ('POL-2024-003', 'Auto', 'Qualitas', 'pending', 'Mensual', 'Domiciliado', 'MXN', 800, 950, 300000, '2024-03-01', '2025-03-01', (SELECT id::text FROM public.clients WHERE name = 'Pedro Martínez Solís' LIMIT 1))
) AS v(policy_number, ramo, aseguradora, status, forma_de_pago, conducto_de_pago, moneda, prima_neta, total, suma_asegurada, fecha_vigencia_inicial, fecha_vigencia_final, cliente_id)
WHERE NOT EXISTS (SELECT 1 FROM public.policies LIMIT 1);

-- Insertar contactos para las pólizas
INSERT INTO public.policy_contacts (policy_id, role, nombre, rfc, direccion, telefono)
SELECT * FROM (VALUES
    ((SELECT id FROM public.policies WHERE policy_number = 'POL-2024-001'), 'contratante', 'Juan Pérez García', 'PEJG800101ABC', 'Av. Reforma 123', '5551234567'),
    ((SELECT id FROM public.policies WHERE policy_number = 'POL-2024-001'), 'asegurado', 'Juan Pérez García', 'PEJG800101ABC', 'Av. Reforma 123', '5551234567'),
    ((SELECT id FROM public.policies WHERE policy_number = 'POL-2024-002'), 'contratante', 'María Rodríguez Luna', 'ROLM920315XYZ', 'Calle Juárez 456', '5559876543'),
    ((SELECT id FROM public.policies WHERE policy_number = 'POL-2024-002'), 'asegurado', 'María Rodríguez Luna', 'ROLM920315XYZ', 'Calle Juárez 456', '5559876543')
) AS v(policy_id, role, nombre, rfc, direccion, telefono)
WHERE NOT EXISTS (SELECT 1 FROM public.policy_contacts LIMIT 1);

-- 8. POLÍTICAS DE SEGURIDAD ADICIONALES

-- Política para permitir que los usuarios vean pólizas de sus clientes
DROP POLICY IF EXISTS "Los usuarios pueden ver pólizas de sus clientes" ON public.policies;
CREATE POLICY "Los usuarios pueden ver pólizas de sus clientes" ON public.policies
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id::text = policies.cliente_id
            AND c.user_id = auth.uid()
        )
    );

-- 9. COMENTARIOS FINALES

-- Esta migración corrige:
-- ✅ Relaciones entre clients y policies
-- ✅ Actualización automática de contadores
-- ✅ Sistema de alertas inteligente
-- ✅ Índices optimizados para rendimiento
-- ✅ Funciones de validación
-- ✅ Vistas para reportes
-- ✅ Datos de ejemplo iniciales
-- ✅ Políticas RLS mejoradas
