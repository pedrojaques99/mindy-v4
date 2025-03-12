-- Add missing columns to resources table if they don't exist
DO $$
BEGIN
    -- Check if created_by column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'created_by'
    ) THEN
        -- Add the column
        ALTER TABLE resources 
        ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        
        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
        
        RAISE NOTICE 'Added created_by column to resources table';
    ELSE
        RAISE NOTICE 'created_by column already exists in resources table';
    END IF;

    -- Check if is_featured column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'is_featured'
    ) THEN
        -- Add the column
        ALTER TABLE resources 
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added is_featured column to resources table';
    ELSE
        RAISE NOTICE 'is_featured column already exists in resources table';
    END IF;

    -- Check if is_approved column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'is_approved'
    ) THEN
        -- Add the column
        ALTER TABLE resources 
        ADD COLUMN is_approved BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added is_approved column to resources table';
    ELSE
        RAISE NOTICE 'is_approved column already exists in resources table';
    END IF;

    -- Check if view_count column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'view_count'
    ) THEN
        -- Add the column
        ALTER TABLE resources 
        ADD COLUMN view_count INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added view_count column to resources table';
    ELSE
        RAISE NOTICE 'view_count column already exists in resources table';
    END IF;

    -- Check if subcategory column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'resources'
        AND column_name = 'subcategory'
    ) THEN
        -- Add the column
        ALTER TABLE resources 
        ADD COLUMN subcategory TEXT;
        
        RAISE NOTICE 'Added subcategory column to resources table';
    ELSE
        RAISE NOTICE 'subcategory column already exists in resources table';
    END IF;
END $$;

-- Update RLS policies for resources table
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