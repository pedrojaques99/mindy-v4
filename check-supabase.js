import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key for read operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStatus() {
  console.log('Checking Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Test the connection by fetching data from the resources table
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Fetched ${data.length} records from resources table`);
    
    // Display the column names from the first record
    if (data.length > 0) {
      console.log('\nTable columns:');
      const columns = Object.keys(data[0]);
      columns.forEach(column => console.log(`- ${column}`));
    }
    
    // Fetch a sample of data from the resources table
    console.log('\nSample data:');
    data.slice(0, 3).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        // Truncate long values for better display
        const displayValue = typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkSupabaseStatus(); 