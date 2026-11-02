-- Tabela de cadastros para início de contrato (onboarding ágil via link WhatsApp)
CREATE TABLE IF NOT EXISTS client_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  trade_name text,
  person_type text DEFAULT 'PJ',
  document_number text,
  state_registration text,
  representative_name text,
  representative_cpf text,
  representative_role text,
  contact_phone text,
  contact_email text,
  billing_email text,
  billing_day text,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  instagram_handle text,
  website_url text,
  observations text,
  status text DEFAULT 'pendente',
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_registrations' AND policyname = 'Permitir insercao anonima de cadastros'
  ) THEN
    CREATE POLICY "Permitir insercao anonima de cadastros" ON client_registrations FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_registrations' AND policyname = 'Permitir leitura de cadastros para todos'
  ) THEN
    CREATE POLICY "Permitir leitura de cadastros para todos" ON client_registrations FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_registrations' AND policyname = 'Permitir atualizacao de cadastros para todos'
  ) THEN
    CREATE POLICY "Permitir atualizacao de cadastros para todos" ON client_registrations FOR UPDATE USING (true);
  END IF;
END
$$;
