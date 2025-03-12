# Supabase Database Setup

This directory contains SQL scripts to set up and seed the database tables for the Mindy application.

## Table Structure

The application uses the following tables:

1. **resources** - Main table for storing resource information
2. **categories** - Categories for resources
3. **tags** - Tags for resources
4. **translations** - Multilingual support
5. **user_profiles** - User profile information
6. **favorites** - User favorites
7. **resource_comments** - Comments on resources

## Setup Instructions

### Prerequisite: Create the exec_sql Function

Before running any of the setup scripts, you need to create the `exec_sql` function in your Supabase database. This function allows the JavaScript scripts to execute SQL commands.

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `create_exec_sql_function.sql`
3. Run the SQL

### Option 1: Using the Setup Script

The easiest way to set up the database is to use the provided setup script:

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

### Option 2: Manual Setup

If you prefer to set up the database manually, follow these steps:

#### 1. Update Resources Table

First, run the `update_resources_table.sql` script to add any missing columns to the existing resources table:

```sql
-- Copy and paste the contents of update_resources_table.sql here
```

#### 2. Create Tables

Run the `create_tables.sql` script in the Supabase SQL Editor to create all necessary tables with proper structure, indexes, and Row Level Security (RLS) policies.

```sql
-- Copy and paste the contents of create_tables.sql here
```

#### 3. Seed Categories and Tags

Run the `seed_categories.sql` script to populate the categories and tags tables with initial data.

```sql
-- Copy and paste the contents of seed_categories.sql here
```

#### 4. Seed Translations

Run the `seed_translations.sql` script to populate the translations table with initial data for English and Portuguese.

```sql
-- Copy and paste the contents of seed_translations.sql here
```

## Executing Individual SQL Files

You can execute individual SQL files using the provided script:

```
node src/db/execute_sql.js filename.sql
```

For example:
```
node src/db/execute_sql.js update_resources_table.sql
```

## Row Level Security (RLS) Policies

All tables have RLS policies to control access:

- **Public read access** for most tables
- **User-specific write access** for user-generated content
- **Admin-only access** for sensitive operations

## Functions

The setup includes several utility functions:

1. `update_updated_at_column()` - Updates the `updated_at` timestamp on record updates
2. `handle_new_user()` - Creates a user profile when a new user signs up
3. `toggle_favorite()` - Toggles a resource as a favorite for a user
4. `increment_view_count()` - Increments the view count for a resource
5. `exec_sql()` - Allows executing SQL from JavaScript (used by setup scripts)

## Indexes

Indexes are created for frequently queried columns to improve performance.

## Troubleshooting

### Common Errors

#### Error: column "created_by" does not exist

If you encounter this error, it means your existing resources table doesn't have the `created_by` column. Run the `update_resources_table.sql` script first to add this column:

```
node src/db/execute_sql.js update_resources_table.sql
```

#### Error: function exec_sql does not exist

If you encounter this error, you need to create the `exec_sql` function first:

```
-- Run this in the Supabase SQL Editor
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
```

#### Error: relation "auth.users" does not exist

This error occurs if you're trying to reference the auth.users table but haven't enabled the Auth functionality in your Supabase project. Make sure to enable Auth in your Supabase dashboard.

### Other Issues

If you encounter other issues with the setup:

1. Check that the UUID extension is enabled in your Supabase project
2. Verify that all tables were created successfully
3. Check for any error messages in the SQL Editor
4. Ensure that RLS policies are properly configured

For more information, refer to the [Supabase documentation](https://supabase.com/docs). 