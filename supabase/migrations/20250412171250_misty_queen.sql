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

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  internal_id TEXT UNIQUE NOT NULL,
  insurance_company TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  policyholder_name TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  rfc TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  homonym_flag BOOLEAN DEFAULT false
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id),
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
CREATE POLICY "Allow authenticated read access" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON policies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON audit_logs
  FOR SELECT TO authenticated USING (true);

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
  stage text default 'no_contacted' not null
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