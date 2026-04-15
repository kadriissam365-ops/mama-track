-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('question', 'vecu', 'conseil', 'soutien')),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 42),
  reactions JSONB DEFAULT '{"❤️": 0, "🤗": 0, "💪": 0, "😂": 0}'::jsonb,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reactions table (tracks who reacted what)
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) <= 500),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Auto-hide posts with 3+ reports
CREATE OR REPLACE FUNCTION auto_hide_reported_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET hidden = TRUE
  WHERE id = NEW.post_id
  AND (SELECT COUNT(*) FROM community_reports WHERE post_id = NEW.post_id) >= 3;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_hide_posts
AFTER INSERT ON community_reports
FOR EACH ROW EXECUTE FUNCTION auto_hide_reported_posts();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_week ON community_posts(week);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user ON community_reactions(user_id);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read non-hidden posts
CREATE POLICY "read_posts" ON community_posts FOR SELECT
  USING (hidden = FALSE);

-- Users can insert their own posts
CREATE POLICY "create_posts" ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can read all reactions
CREATE POLICY "read_reactions" ON community_reactions FOR SELECT
  USING (TRUE);

-- Users can manage their own reactions
CREATE POLICY "manage_reactions" ON community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_reactions" ON community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can report posts
CREATE POLICY "create_reports" ON community_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
