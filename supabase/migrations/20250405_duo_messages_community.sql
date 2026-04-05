-- Table for duo chat messages
CREATE TABLE IF NOT EXISTS duo_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) <= 500),
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE duo_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender or recipient" ON duo_messages FOR ALL 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Table for community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week integer NOT NULL,
  type text CHECK (type IN ('question', 'vecu', 'conseil', 'soutien')) DEFAULT 'vecu',
  content text NOT NULL CHECK (length(content) <= 400),
  anonymous_name text NOT NULL,
  reactions jsonb DEFAULT '{"heart":0,"hug":0,"strong":0,"laugh":0}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read all" ON community_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth insert" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Update reactions" ON community_posts FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE duo_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
