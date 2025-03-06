import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// Log environment variables for debugging (without showing full keys)
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Found ✓' : 'Not found ✗');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Found ✓' : 'Not found ✗');

// Initialize Supabase client with admin key for bulk operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and parse the CSV file
const fileContent = fs.readFileSync('database-content-formatted.csv', 'utf8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true
});

console.log(`Found ${records.length} records to import.`);

// Insert data into Supabase
async function importData() {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert(records);
      
    if (error) {
      console.error('Error importing data:', error);
    } else {
      console.log(`Successfully imported ${records.length} resources`);
    }
  } catch (err) {
    console.error('Unexpected error during import:', err);
  }
}

importData(); 