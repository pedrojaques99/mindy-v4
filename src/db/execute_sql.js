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
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Using service key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get the filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  console.error('Error: No SQL file specified.');
  console.error('Usage: node execute_sql.js <filename.sql>');
  process.exit(1);
}

// Function to execute SQL from a file
async function executeSqlFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${filename} not found.`);
      return false;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Executing ${filename}...`);
    
    // Execute SQL directly using the REST API
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

// Execute the SQL file
executeSqlFile(filename)
  .then(success => {
    if (success) {
      console.log('SQL execution completed successfully!');
      process.exit(0);
    } else {
      console.error('SQL execution failed.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error during SQL execution:', err);
    process.exit(1);
  }); 