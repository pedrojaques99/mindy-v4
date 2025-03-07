-- Resource Comments Table
CREATE TABLE IF NOT EXISTS resource_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
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

-- Create policies for resource_comments
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on comment update
CREATE TRIGGER update_resource_comments_updated_at
BEFORE UPDATE ON resource_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 