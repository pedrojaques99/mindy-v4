-- Add avatar_type and social media columns to the profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_type SMALLINT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS behance_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Make sure Row Level Security (RLS) is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies if they don't exist already
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone'
  ) THEN
    -- Create the policy if it doesn't exist
    CREATE POLICY "Profiles are viewable by everyone" 
      ON profiles FOR SELECT USING (true);
  END IF;
  
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    -- Create the policy if it doesn't exist
    CREATE POLICY "Users can update their own profile" 
      ON profiles FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;
END
$$; 