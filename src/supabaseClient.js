import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback values for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add error handling for initialization
try {
  // Test connection
  supabase.auth.getSession().catch(error => {
    console.error('Supabase initialization error:', error);
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
} 