# Supabase Database Setup Instructions

## Fixing the Database Setup Issues

You've encountered a few errors during the database setup:

1. `ERROR: 42703: column "created_by" does not exist` - Your existing resources table doesn't have the `created_by` column
2. `ERROR: 42710: policy "Approved resources are viewable by everyone" for table "resources" already exists` - Duplicate policy
3. `ERROR: 42804: foreign key constraint "favorites_resource_id_fkey" cannot be implemented` - Data type mismatch between `resources.id` (TEXT) and `favorites.resource_id` (UUID)
4. `ERROR: 42804: foreign key constraint "resource_comments_resource_id_fkey" cannot be implemented` - Similar data type mismatch

Follow these steps to fix all these issues and set up all the necessary tables:

### Step 1: Create the exec_sql Function

First, you need to create a function that allows executing SQL from JavaScript:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `create_exec_sql_function.sql`
3. Run the SQL

### Step 2: Update the Resources Table

Next, update your existing resources table to add the missing columns:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `update_resources_table.sql`
3. Run the SQL

This will add the following columns to your resources table if they don't exist:
- `created_by` - Reference to the user who created the resource
- `is_featured` - Boolean flag for featured resources
- `is_approved` - Boolean flag for approved resources
- `view_count` - Integer for tracking view count
- `subcategory` - Text field for subcategory

### Step 3: Fix Data Type Mismatches

Fix the data type mismatches in the foreign key constraints:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `fix_data_types.sql`
3. Run the SQL

This will:
- Drop and recreate the `favorites` table with `resource_id` as TEXT instead of UUID
- Drop and recreate the `resource_comments` table with `resource_id` as TEXT instead of UUID
- Update the `toggle_favorite` function to use the correct data types

### Step 4: Create the Other Tables

Now, create the remaining tables:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `create_tables.sql`
3. Run the SQL

This will create the following tables if they don't exist:
- `categories` - For resource categories
- `tags` - For managing tags
- `translations` - For multilingual support
- `user_profiles` - For user profile information

### Step 5: Seed the Categories and Tags

Populate the categories and tags tables with initial data:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `seed_categories.sql`
3. Run the SQL

### Step 6: Seed the Translations

Finally, populate the translations table with initial data:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `seed_translations.sql`
3. Run the SQL

## Alternative: Using the Setup Script

If you prefer to use the setup script instead of manually running the SQL files:

1. Make sure you have the following environment variables in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_KEY=your_service_key
   ```

2. Run the setup script:
   ```
   node src/db/setup_database.js
   ```

This script will execute all SQL files in the correct order.

## Verifying the Setup

To verify that the setup was successful:

1. Go to the "Table Editor" in your Supabase dashboard
2. Check that all the tables have been created
3. Check that the categories, tags, and translations tables have been populated with data

## Troubleshooting

### Common Errors

#### Error: column "created_by" does not exist

This error occurs because your existing resources table doesn't have the `created_by` column. Run the `update_resources_table.sql` script to add this column.

#### Error: policy already exists

This error occurs because you're trying to create a policy that already exists. The scripts now include `DROP POLICY IF EXISTS` statements to prevent this error.

#### Error: foreign key constraint cannot be implemented

This error occurs because of a data type mismatch between the `resources.id` column (TEXT) and the `resource_id` columns in the `favorites` and `resource_comments` tables (UUID). The `fix_data_types.sql` script fixes this issue by recreating these tables with the correct data types.

### Other Issues

If you encounter other issues during the setup:

1. Check the error messages in the SQL Editor
2. Make sure you have the UUID extension enabled in your Supabase project
3. Ensure that the Auth functionality is enabled in your Supabase project
4. Check that the RLS policies have been properly configured

For more detailed information, refer to the `README.md` file in this directory. 