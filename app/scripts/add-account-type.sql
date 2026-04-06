-- Add account_type column to instagram_profiles
ALTER TABLE instagram_profiles
  ADD COLUMN IF NOT EXISTS account_type text;
