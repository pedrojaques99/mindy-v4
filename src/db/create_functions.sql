-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle favorite function with TEXT parameter for resource_id
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

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_resource_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = p_resource_id;
END;
$$; 