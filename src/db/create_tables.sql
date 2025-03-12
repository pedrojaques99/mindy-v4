-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
-- Allow anyone to read categories
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT USING (true);

-- Allow only authenticated users with admin role to insert/update/delete categories
CREATE POLICY "Only admins can modify categories" 
  ON categories FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'));

-- Tags Table (for managing tags separately)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category_id ON tags(category_id);

-- Enable RLS (Row Level Security)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
-- Allow anyone to read tags
CREATE POLICY "Tags are viewable by everyone" 
  ON tags FOR SELECT USING (true);

-- Allow only authenticated users with admin role to insert/update/delete tags
CREATE POLICY "Only admins can modify tags" 
  ON tags FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'));

-- Translations Table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(language, key)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);

-- Enable RLS (Row Level Security)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations
-- Allow anyone to read translations
CREATE POLICY "Translations are viewable by everyone" 
  ON translations FOR SELECT USING (true);

-- Allow only authenticated users with admin role to insert/update/delete translations
CREATE POLICY "Only admins can modify translations" 
  ON translations FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'));

-- Resources Table (if not already exists)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN (tags);

-- Enable RLS (Row Level Security)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Approved resources are viewable by everyone" ON resources;
DROP POLICY IF EXISTS "Users can view their own resources" ON resources;
DROP POLICY IF EXISTS "Users can create their own resources" ON resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON resources;
DROP POLICY IF EXISTS "Admins can manage all resources" ON resources;

-- Create policies for resources
-- Allow anyone to read approved resources
CREATE POLICY "Approved resources are viewable by everyone" 
  ON resources FOR SELECT 
  USING (is_approved = true OR is_approved IS NULL);

-- Allow users to view their own resources even if not approved
CREATE POLICY "Users can view their own resources" 
  ON resources FOR SELECT 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Allow authenticated users to insert their own resources
CREATE POLICY "Users can create their own resources" 
  ON resources FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own resources
CREATE POLICY "Users can update their own resources" 
  ON resources FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Allow users to delete their own resources
CREATE POLICY "Users can delete their own resources" 
  ON resources FOR DELETE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Allow admins to manage all resources
CREATE POLICY "Admins can manage all resources" 
  ON resources FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'));

-- User Profiles Table (if not already exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  avatar_type SMALLINT DEFAULT 1, -- 1, 2, or 3 for different avatar types
  behance_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Allow anyone to view profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON user_profiles FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create their own profile" 
  ON user_profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON user_profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Note: Favorites and Resource Comments tables are now defined in fix_data_types.sql
-- to ensure proper data type compatibility with the resources table

-- Note: Functions are now defined in create_functions.sql
-- This includes update_updated_at_column, toggle_favorite, and increment_view_count

-- Create triggers for tables
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 