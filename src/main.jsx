import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createClient } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { TempoDevtools } from "tempo-devtools";
import "./index.css";

// Initialize Tempo Devtools
TempoDevtools.init();

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('Environment variables loaded:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY available:', !!supabaseKey);
console.log('VITE_SUPABASE_ANON_KEY length:', supabaseKey ? supabaseKey.length : 0);

// Validate that we have a proper API key
const isValidKey = (key) => {
  return typeof key === 'string' && key.length > 20 && key.includes('.');
};

// Log API key status for debugging
if (!isValidKey(supabaseKey)) {
  console.warn('Warning: Supabase API key appears to be invalid or malformed');
  console.log('API Key length:', supabaseKey ? supabaseKey.length : 0);
  console.log('First characters:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');
} else {
  console.log('Supabase API key format appears valid');
}

// Ensure URL is available before creating client
if (!supabaseUrl) {
  console.error('Error: supabaseUrl is not defined. Check your .env file.');
  // Provide a fallback URL to prevent crashes
  console.log('Using fallback Supabase URL');
}

// Create the Supabase client with auth persistence enabled
export const supabase = createClient(
  supabaseUrl || 'https://jeajiorijfosgziebhyr.supabase.co', 
  supabaseKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mindy-auth-storage'
    },
    // Add fetch options with timeouts to prevent hanging requests
    global: {
      fetch: (url, options = {}) => {
        // Monitor which endpoints we're calling
        const endpoint = url.replace(supabaseUrl, '');
        const isDataEndpoint = endpoint.includes('/rest/v1/');
        
        console.log(`Supabase request to: ${endpoint}`, { 
          method: options?.method || 'GET',
          url: url
        });

        const timeout = 30000; // 30 seconds timeout
        const controller = new AbortController();
        const { signal } = controller;
        
        // Create timeout that aborts the fetch
        const timeoutId = setTimeout(() => {
          console.error(`Supabase request timeout after ${timeout}ms:`, { endpoint });
          controller.abort();
        }, timeout);
        
        // Ensure headers object exists
        const headers = options.headers || {};
        
        // Get the current session - needed for RLS policies
        const currentSession = supabase.auth.session?.();
        const authToken = currentSession?.access_token;
        
        // Fix: Explicitly include the API key and content-type in all requests
        const requestHeaders = {
          ...headers,
          'apikey': supabaseKey,
          'Authorization': authToken ? `Bearer ${authToken}` : `Bearer ${supabaseKey}`,
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        // Execute fetch with improved error handling and catch network errors
        return new Promise((resolve, reject) => {
          fetch(url, { 
            ...options, 
            signal,
            headers: requestHeaders
          })
          .then(response => {
            // Log any non-200 responses for debugging
            if (!response.ok) {
              console.warn(`Supabase request failed: ${response.status} ${response.statusText}`, {
                endpoint,
                status: response.status
              });
            }
            resolve(response);
          })
          .catch(error => {
            // Log network errors
            if (error.name === 'AbortError') {
              console.error('Supabase request aborted (timeout):', { endpoint });
            } else {
              console.error('Supabase fetch error:', error, { endpoint });
            }
            // Don't reject, return a mock response to prevent app crashes
            if (error.message === 'Failed to fetch') {
              console.log('Network error occurred. Creating fallback response.');
              // Create a mock Response object that indicates a network error
              const mockResponse = new Response(JSON.stringify({
                error: 'Network error',
                message: 'Failed to connect to Supabase server',
                status: 503
              }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              });
              resolve(mockResponse);
            } else {
              reject(error);
            }
          })
          .finally(() => {
            clearTimeout(timeoutId);
          });
        });
      }
    },
    // More detailed client logging
    debug: import.meta.env.DEV
  }
);

// Simple connection check function
export const checkSupabaseConnection = async () => {
  try {
    const startTime = Date.now();
    const { data } = await supabase.auth.getSession();
    return {
      success: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return { success: false, error };
  }
};

// Render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster position="top-center" />
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
);
