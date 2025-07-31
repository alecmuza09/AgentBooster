/*
  # Initial Schema for Consolida Capital CRM

  1. New Tables
    - `clients`
      - Core client information
      - Personal and business details
      - Contact information
    - `policies`
      - Insurance policy details
      - Payment information
      - Status tracking
    - `documents`
      - Document management
      - Version control
      - Security classifications
    - `audit_logs`
      - Activity tracking
      - Security monitoring
    
  2. Security
    - Enable RLS on all tables
    - Implement role-based access control
    - Audit logging for all operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table (Rediseñada para simplicidad y alineación con la UI)
DROP TABLE IF EXISTS public.clients CASCADE; -- Eliminar la tabla vieja si existe

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Columna estandarizada y obligatoria
  name TEXT NOT NULL,
  rfc TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Prospecto', -- Por defecto es un Prospecto
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policies table
DROP TABLE IF EXISTS public.policies CASCADE; -- Para asegurar que los cambios se apliquen
CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Columna añadida
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE, -- Es importante que si se borra el cliente, se borre la póliza
  policy_number TEXT UNIQUE NOT NULL,
  policy_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_frequency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id),
  policy_id uuid REFERENCES policies(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  version INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by uuid NOT NULL
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id uuid NOT NULL,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Primero, borramos la política permisiva que existía para 'clients'
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.clients;

-- Ahora, creamos las políticas seguras basadas en user_id
CREATE POLICY "Los usuarios pueden ver sus propios clientes"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear clientes para sí mismos"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios clientes"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios clientes"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Quitamos la política insegura para 'policies'
DROP POLICY IF EXISTS "Allow authenticated read access" ON policies;

-- Y añadimos las nuevas políticas seguras
CREATE POLICY "Los usuarios pueden ver sus propias pólizas"
  ON public.policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear pólizas para sí mismos"
  ON public.policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias pólizas"
  ON public.policies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias pólizas"
  ON public.policies FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_clients_rfc ON clients(rfc);
CREATE INDEX idx_policies_client_id ON policies(client_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_policy_id ON documents(policy_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- =============================================
-- Tablas Adicionales (Fusionadas)
-- =============================================

-- Perfiles de Usuario
DROP TABLE IF EXISTS public.profiles CASCADE;

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  cedula_type text,
  cedula_expiration_date date,
  agencia text
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger para sincronizar perfiles con auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Prospectos
-- Primero eliminamos el trigger y la tabla si existen para evitar conflictos en re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.prospects;

-- Re-crear la tabla con la estructura correcta
create table public.prospects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text,
  phone text,
  value numeric,
  source text,
  stage text default 'no_contacted' not null,
  potential_value numeric,
  interest_level text,
  notes text
);
alter table public.prospects enable row level security;
create policy "Users can manage their own prospects." on public.prospects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Re-crear el trigger de auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tablas de Finanzas 360
create table if not exists f360_incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  name text not null,
  monthly numeric not null default 0,
  tax_rate numeric not null default 0,
  annual_increase numeric not null default 0
);
alter table f360_incomes enable row level security;
create policy "Users can manage their own income records." on f360_incomes for all using (auth.uid() = user_id);

create table if not exists f360_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  category text not null,
  name text not null,
  monthly numeric not null default 0
);
alter table f360_expenses enable row level security;
create policy "Users can manage their own expense records." on f360_expenses for all using (auth.uid() = user_id);

create table if not exists f360_assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  category text not null,
  name text not null,
  value numeric not null default 0
);
alter table f360_assets enable row level security;
create policy "Users can manage their own asset records." on f360_assets for all using (auth.uid() = user_id);

create table if not exists f360_liabilities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  category text not null,
  name text not null,
  amount numeric not null default 0
);
alter table f360_liabilities enable row level security;
create policy "Users can manage their own liability records." on f360_liabilities for all using (auth.uid() = user_id);

create table if not exists f360_investments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  category text not null,
  description text,
  purchase_price numeric not null default 0,
  purchase_year integer,
  market_value numeric not null default 0
);
alter table f360_investments enable row level security;
create policy "Users can manage their own investment records." on f360_investments for all using (auth.uid() = user_id);

create table if not exists f360_insurance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  name text not null,
  death_benefit numeric not null default 0,
  disability_benefit numeric not null default 0,
  cash_value numeric not null default 0,
  end_date date
);
alter table f360_insurance enable row level security;
create policy "Users can manage their own insurance records." on f360_insurance for all using (auth.uid() = user_id);

-- =============================================
-- Tablas del Centro de Aprendizaje
-- =============================================

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT, -- URL a la imagen en Supabase Storage
  category TEXT, -- E.g., 'Products', 'Sales', 'Compliance'
  difficulty TEXT, -- E.g., 'Beginner', 'Intermediate', 'Advanced'
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read courses" ON courses FOR SELECT TO authenticated USING (true);


CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- URL al video en Supabase Storage
  material_url TEXT, -- URL a un PDF u otro material
  content TEXT, -- Para contenido tipo artículo
  duration_minutes INTEGER,
  "order" INTEGER NOT NULL -- Para ordenar los módulos dentro de un curso
);
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read modules" ON course_modules FOR SELECT TO authenticated USING (true);


CREATE TABLE IF NOT EXISTS user_module_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES course_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_module_unique UNIQUE (user_id, module_id)
);
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own progress" ON user_module_progress FOR ALL USING (auth.uid() = user_id);

-- Para simplificar, podrías crear políticas de Admin más adelante para la inserción/actualización de cursos.
-- Por ahora, los datos se podrían insertar manualmente o vía script.

-- Tabla para Ingresos de Finanzas 360
create table public.f360_incomes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    monthly_amount numeric not null,
    tax_rate numeric default 0,
    annual_increase numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.f360_incomes enable row level security;
create policy "Los usuarios pueden ver sus propios ingresos" on public.f360_incomes for select using (auth.uid() = user_id);
create policy "Los usuarios pueden insertar sus propios ingresos" on public.f360_incomes for insert with check (auth.uid() = user_id);
create policy "Los usuarios pueden actualizar sus propios ingresos" on public.f360_incomes for update using (auth.uid() = user_id);
create policy "Los usuarios pueden eliminar sus propios ingresos" on public.f360_incomes for delete using (auth.uid() = user_id);


-- Tabla para Gastos de Finanzas 360
create table public.f360_expenses (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    category text not null,
    monthly_amount numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.f360_expenses enable row level security;
create policy "Los usuarios pueden ver sus propios gastos" on public.f360_expenses for select using (auth.uid() = user_id);
create policy "Los usuarios pueden insertar sus propios gastos" on public.f360_expenses for insert with check (auth.uid() = user_id);
create policy "Los usuarios pueden actualizar sus propios gastos" on public.f360_expenses for update using (auth.uid() = user_id);
create policy "Los usuarios pueden eliminar sus propios gastos" on public.f360_expenses for delete using (auth.uid() = user_id);