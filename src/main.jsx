import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

// Initialize Supabase client as requested
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// Create the Supabase client with auth persistence enabled
export const supabase = createClient(supabaseUrl, supabaseKey, {
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
});

// Listen for auth state changes to handle token refreshes
supabase.auth.onAuthStateChange((event, session) => {
  // Log auth events for debugging
  console.log(`Supabase auth state changed: ${event}`, {
    userId: session?.user?.id || 'none',
    hasToken: !!session?.access_token,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none'
  });
  
  // Handle specific auth events
  if (event === 'SIGNED_IN') {
    console.log('User signed in - RLS policies now active');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out - RLS policies will restrict access');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed - continuing with existing session');
  } else if (event === 'USER_UPDATED') {
    console.log('User data updated');
  }
});

// Add a connection check throttling mechanism
const connectionCheckStatus = {
  lastCheckedAt: 0,
  result: null,
  inProgress: false
};

// Add a helper function to check connection
export const checkSupabaseConnection = async () => {
  const now = Date.now();
  
  // If we've checked within the last 10 seconds, return the cached result
  if (connectionCheckStatus.result && now - connectionCheckStatus.lastCheckedAt < 10000) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('Using cached connection status (checked within last 10s)');
    }
    return connectionCheckStatus.result;
  }
  
  // If a check is already in progress, don't start another one
  if (connectionCheckStatus.inProgress) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('Connection check already in progress, waiting...');
    }
    // Wait for the existing check to complete with a safety timeout
    return new Promise((resolve) => {
      const maxWaitTime = 8000; // Maximum wait time: 8 seconds
      const startWaitTime = Date.now();
      
      const checkInterval = setInterval(() => {
        // If check completed or we've waited too long, resolve
        if (!connectionCheckStatus.inProgress || (Date.now() - startWaitTime > maxWaitTime)) {
          clearInterval(checkInterval);
          
          // If we timed out waiting, return a failure
          if (Date.now() - startWaitTime > maxWaitTime) {
            console.warn('Timed out waiting for connection check to complete');
            resolve({ success: false, error: 'Timeout waiting for connection check' });
          } else {
            resolve(connectionCheckStatus.result);
          }
        }
      }, 100);
    });
  }
  
  // Set flag to indicate a check is in progress
  connectionCheckStatus.inProgress = true;
  
  try {
    console.log('Testing Supabase connection to:', supabaseUrl);
    console.log('API Key available:', !!supabaseKey);
    
    // First, try a simple connection test
    const startTime = Date.now();
    
    // Set up a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection test timed out after 5 seconds'));
      }, 5000);
    });
    
    // Try a simple auth status check - this should work with any Supabase project
    // Even if no tables are set up yet
    const queryPromise = supabase.auth.getSession();
      
    // Race the query against the timeout
    const result = await Promise.race([
      queryPromise,
      timeoutPromise
    ]);
    
    // Check if we got a response (doesn't matter if user is logged in or not)
    if (result) {
      console.log('Supabase connection successful (auth service reachable)');
      connectionCheckStatus.result = { 
        success: true, 
        responseTime: Date.now() - startTime,
      };
      connectionCheckStatus.lastCheckedAt = now;
      connectionCheckStatus.inProgress = false;
      return connectionCheckStatus.result;
    }
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    connectionCheckStatus.result = { success: false, error };
    connectionCheckStatus.lastCheckedAt = now;
  } finally {
    connectionCheckStatus.inProgress = false;
  }
  
  return connectionCheckStatus.result;
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-center" />
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
); 