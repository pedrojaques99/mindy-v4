-- Fix data type mismatches in foreign key constraints

-- 1. Fix the favorites table
-- Drop the existing favorites table if it exists
DROP TABLE IF EXISTS favorites;

-- Create the favorites table with the correct data type
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id TEXT REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource_id ON favorites(resource_id);

-- Enable RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites (drop first if they exist)
DROP POLICY IF EXISTS "Users can view all favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Allow users to view all favorites (useful for resource pages showing popularity)
CREATE POLICY "Users can view all favorites" 
  ON favorites FOR SELECT 
  USING (true);

-- Allow authenticated users to add their own favorites
CREATE POLICY "Users can add their own favorites" 
  ON favorites FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own favorites
CREATE POLICY "Users can delete their own favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Fix the resource_comments table
-- Drop the existing resource_comments table if it exists
DROP TABLE IF EXISTS resource_comments;

-- Create the resource_comments table with the correct data type
CREATE TABLE IF NOT EXISTS resource_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES resource_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource_id ON resource_comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_user_id ON resource_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_parent_id ON resource_comments(parent_id);

-- Enable RLS (Row Level Security)
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for resource_comments (drop first if they exist)
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON resource_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON resource_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON resource_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON resource_comments;

-- Allow anyone to read comments
CREATE POLICY "Comments are viewable by everyone" 
  ON resource_comments FOR SELECT USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can create their own comments" 
  ON resource_comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" 
  ON resource_comments FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON resource_comments FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at on comment update if the function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_resource_comments_updated_at ON resource_comments;
    CREATE TRIGGER update_resource_comments_updated_at
    BEFORE UPDATE ON resource_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 