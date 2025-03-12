import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Using service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL files to execute in order
const sqlFiles = [
  'update_resources_table.sql', // First update the resources table
  'create_functions.sql',       // Create functions before they're used
  'fix_data_types.sql',         // Fix data type mismatches
  'create_tables.sql',          // Then create other tables
  'seed_categories.sql',        // Seed categories and tags
  'seed_translations.sql'       // Seed translations
];

// Function to execute SQL from a file
async function executeSqlFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Executing ${filename}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error executing ${filename}:`, error);
      return false;
    }
    
    console.log(`Successfully executed ${filename}`);
    return true;
  } catch (err) {
    console.error(`Error reading or executing ${filename}:`, err);
    return false;
  }
}

// Main function to set up the database
async function setupDatabase() {
  console.log('Starting database setup...');
  
  // Execute SQL files in order
  for (const file of sqlFiles) {
    const success = await executeSqlFile(file);
    if (!success) {
      console.error(`Failed to execute ${file}. Stopping setup.`);
      process.exit(1);
    }
  }
  
  console.log('Database setup completed successfully!');
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Unexpected error during database setup:', err);
  process.exit(1);
}); 