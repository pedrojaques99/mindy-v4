import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

// Initialize Supabase client with appropriate options
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mcp-supabase-server.vercel.app';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcC1zdXBhYmFzZS1zZXJ2ZXIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.mcp-supabase-server-key';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mindy-auth-storage'
  }
});

// Add a helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    // Try a simple query that doesn't require specific functions
    // Just check if we can connect at all
    const { data, error } = await supabase.from('_dummy_query_for_connection_test_')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    // If we get a "relation does not exist" error (42P01), that's actually good!
    // It means we connected to the database but the table doesn't exist
    if (error && error.code === '42P01') {
      console.log('Supabase connection successful (table does not exist)');
      return true;
    }
    
    // Any other error means we couldn't connect properly
    if (error && error.code !== '42P01') {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    // If no error, we somehow have a _dummy_query_for_connection_test_ table!
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#2a2a2a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    />
  </React.StrictMode>
); 