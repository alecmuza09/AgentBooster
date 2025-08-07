ALTER TABLE policies ADD COLUMN inciso INT;
ALTER TABLE policies ADD COLUMN concepto TEXT;
ALTER TABLE policies ADD COLUMN modelo TEXT;
ALTER TABLE policies ADD COLUMN numero_serie TEXT;
ALTER TABLE policies ADD COLUMN cliente_id TEXT;
-- Algunos proyectos antiguos no tenían esta columna
DO $$ BEGIN
  BEGIN
    ALTER TABLE policies ADD COLUMN clave_agente TEXT;
  EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'Column clave_agente already exists, skipping';
  END;
END $$;
ALTER TABLE policies ADD COLUMN prima_neta NUMERIC;
ALTER TABLE policies ADD COLUMN derecho NUMERIC;
ALTER TABLE policies ADD COLUMN recargo NUMERIC;
ALTER TABLE policies ADD COLUMN total NUMERIC;
ALTER TABLE policies ADD COLUMN tipo_de_cargo TEXT;
ALTER TABLE policies ADD COLUMN fecha_registro DATE;

DO $$ BEGIN
  BEGIN
    ALTER TABLE policies DROP COLUMN premium_amount;
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column premium_amount does not exist, skipping';
  END;
END $$;
