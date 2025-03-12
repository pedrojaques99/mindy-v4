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

-- Create policies for favorites
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

-- Recreate the toggle_favorite function with the correct data type
CREATE OR REPLACE FUNCTION toggle_favorite(p_resource_id text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  favorite_exists boolean;
BEGIN
  -- Check if the favorite already exists
  SELECT EXISTS(
    SELECT 1 FROM favorites
    WHERE favorites.user_id = p_user_id
    AND favorites.resource_id = p_resource_id
  ) INTO favorite_exists;
  
  -- If it exists, delete it
  IF favorite_exists THEN
    DELETE FROM favorites
    WHERE favorites.user_id = p_user_id
    AND favorites.resource_id = p_resource_id;
    RETURN false;
  -- Otherwise, insert it
  ELSE
    INSERT INTO favorites (user_id, resource_id)
    VALUES (p_user_id, p_resource_id);
    RETURN true;
  END IF;
END;
$$;