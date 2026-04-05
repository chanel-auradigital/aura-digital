-- Clients table (linked to auth.users)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Apps connected per client (instagram, tiktok, etc.)
CREATE TABLE IF NOT EXISTS client_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  app_name text NOT NULL,
  app_account_id text,
  app_username text,
  metadata jsonb DEFAULT '{}',
  connected_at timestamptz DEFAULT now(),
  UNIQUE(client_id, app_name)
);

-- Instagram profile data
CREATE TABLE IF NOT EXISTS instagram_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  ig_account_id text NOT NULL,
  username text,
  name text,
  biography text,
  profile_picture_url text,
  followers_count int DEFAULT 0,
  follows_count int DEFAULT 0,
  media_count int DEFAULT 0,
  website text,
  updated_at timestamptz DEFAULT now()
);

-- Instagram posts with metrics
CREATE TABLE IF NOT EXISTS instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  ig_media_id text UNIQUE NOT NULL,
  media_type text,
  media_url text,
  thumbnail_url text,
  permalink text,
  caption text,
  timestamp timestamptz,
  like_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  saves_count int DEFAULT 0,
  reach int DEFAULT 0,
  impressions int DEFAULT 0,
  engagement int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Daily aggregated metrics
CREATE TABLE IF NOT EXISTS instagram_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  followers_count int,
  follows_count int,
  media_count int,
  reach int DEFAULT 0,
  impressions int DEFAULT 0,
  profile_views int DEFAULT 0,
  website_clicks int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_daily_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies: each user sees only their own data
CREATE POLICY "Users see own client" ON clients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users see own apps" ON client_apps FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "Users see own ig profile" ON instagram_profiles FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "Users see own ig posts" ON instagram_posts FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "Users see own ig metrics" ON instagram_daily_metrics FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
