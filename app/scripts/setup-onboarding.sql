-- Onboarding form data (JSONB for flexible schema)
CREATE TABLE IF NOT EXISTS client_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  data jsonb DEFAULT '{}',
  completed_sections jsonb DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE client_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own onboarding"
  ON client_onboarding FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users insert own onboarding"
  ON client_onboarding FOR INSERT
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users update own onboarding"
  ON client_onboarding FOR UPDATE
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
