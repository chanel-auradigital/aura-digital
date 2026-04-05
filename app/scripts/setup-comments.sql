-- Comments table linked to instagram_posts
CREATE TABLE IF NOT EXISTS instagram_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES instagram_posts(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    ig_comment_id text UNIQUE NOT NULL,
    parent_comment_id uuid REFERENCES instagram_comments(id) ON DELETE CASCADE,
    username text,
    text text,
    like_count int DEFAULT 0,
    timestamp timestamptz,
    is_reply boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON instagram_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_client_id ON instagram_comments(client_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON instagram_comments(parent_comment_id);

-- RLS
ALTER TABLE instagram_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ig comments" ON instagram_comments
    FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
