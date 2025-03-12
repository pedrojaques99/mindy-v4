import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to preview a table
async function previewTable(tableName, limit = 5) {
  try {
    console.log(`\n=== Previewing ${tableName} table (${limit} rows) ===`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} rows in ${tableName}:`);
      console.table(data);
    } else {
      console.log(`No data found in ${tableName}`);
    }
  } catch (err) {
    console.error(`Error previewing ${tableName}:`, err);
  }
}

// Function to count rows in a table
async function countRows(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error counting rows in ${tableName}:`, error);
      return 'Error';
    }
    
    return count;
  } catch (err) {
    console.error(`Error counting rows in ${tableName}:`, err);
    return 'Error';
  }
}

// Main function to preview the database
async function previewDatabase() {
  console.log('=== Database Preview ===');
  
  // List of tables to preview
  const tables = [
    'resources',
    'categories',
    'tags',
    'translations',
    'user_profiles',
    'favorites',
    'resource_comments'
  ];
  
  // Count rows in each table
  console.log('\n=== Table Row Counts ===');
  for (const table of tables) {
    const count = await countRows(table);
    console.log(`${table}: ${count} rows`);
  }
  
  // Preview each table
  for (const table of tables) {
    await previewTable(table);
  }
  
  console.log('\n=== Database Preview Complete ===');
}

// Run the preview
previewDatabase().catch(err => {
  console.error('Unexpected error during database preview:', err);
  process.exit(1);
}); 