import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

// Initialize Supabase client with appropriate options
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mindy-auth-storage'
  }
});

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