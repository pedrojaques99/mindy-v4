-- Fix RLS policies for the favorites table

-- Enable RLS (Row Level Security) if not already enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they have issues
DROP POLICY IF EXISTS "Users can view all favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create proper RLS policies
-- 1. Allow users to view all favorites (useful for resource pages showing popularity)
CREATE POLICY "Users can view all favorites" 
ON favorites FOR SELECT 
USING (true);

-- 2. Allow authenticated users to add their own favorites
CREATE POLICY "Users can add their own favorites" 
ON favorites FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to delete only their own favorites
CREATE POLICY "Users can delete their own favorites" 
ON favorites FOR DELETE 
USING (auth.uid() = user_id);

-- If the table doesn't exist yet, create it with proper structure
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, resource_id)
);

-- Drop the function if it exists to recreate it properly
DROP FUNCTION IF EXISTS toggle_favorite;

-- Create the toggle_favorite function with fixed parameter naming to avoid ambiguity
CREATE OR REPLACE FUNCTION toggle_favorite(p_resource_id uuid, p_user_id uuid)
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