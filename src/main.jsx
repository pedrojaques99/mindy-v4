import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

// Initialize Supabase client with appropriate options
// Use a valid, accessible URL and ensure the MCP server is reachable
const supabaseUrl = 'https://bweemuqoelppnyeyeysr.supabase.co'; // Directly use the known working URL
// const supabaseUrl = 'https://mcp-supabase-server.vercel.app' || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZWVtdXFvZWxwcG55ZXlleXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjc4MDMsImV4cCI6MjA1Njg0MzgwM30.MlURpcY2M_kVmilyR0WBEyJe5rDjuVcg5e4gW8ke1g8';

// Validate that we have a proper API key
const isValidKey = (key) => {
  return typeof key === 'string' && key.length > 20 && key.includes('.');
};

// Log API key status for debugging
if (!isValidKey(supabaseAnonKey)) {
  console.warn('Warning: Supabase API key appears to be invalid or malformed');
  console.log('API Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
  console.log('First characters:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined');
} else {
  console.log('Supabase API key format appears valid');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
      console.log(`Supabase request to: ${endpoint}`, { 
        method: options?.method || 'GET',
        url: url
      });

      const timeout = 30000; // 30 seconds timeout (increased from 15s)
      const controller = new AbortController();
      const { signal } = controller;
      
      // Create timeout that aborts the fetch
      const timeoutId = setTimeout(() => {
        console.error(`Supabase request timeout after ${timeout}ms:`, { endpoint });
        controller.abort();
      }, timeout);
      
      // Ensure headers object exists
      const headers = options.headers || {};
      
      // Fix: Explicitly include the API key and content-type in all requests
      const requestHeaders = {
        ...headers,
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
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
    console.log('API Key available:', !!supabaseAnonKey);
    
    // First, try a simple health check
    const startTime = Date.now();
    
    // Set up a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection test timed out after 5 seconds'));
      }, 5000);
    });
    
    // MCP server special handling
    if (supabaseUrl.includes('mcp-supabase-server')) {
      console.log('Using MCP Supabase server - testing specific MCP endpoints');
      
      try {
        // First try a simple health ping (should work on MCP server)
        const response = await fetch(`${supabaseUrl}/ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        
        if (response.ok) {
          console.log('MCP Supabase server connection successful');
          connectionCheckStatus.result = { 
            success: true, 
            responseTime: Date.now() - startTime,
            server: 'mcp'
          };
          connectionCheckStatus.lastCheckedAt = now;
          return connectionCheckStatus.result;
        }
      } catch (mcpErr) {
        console.warn('MCP server health check failed, trying standard query:', mcpErr);
      }
    }
    
    // Standard query approach - use profiles table which should exist
    const queryPromise = supabase.from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);
      
    // Race the query against the timeout
    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise
    ]).catch(err => {
      console.error('Connection test failed:', err.message);
      return { error: err };
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`Supabase response time: ${responseTime}ms`);
    
    // Check for API key errors
    if (error && (error.message?.includes('No API key found') || error.hint?.includes('apikey'))) {
      console.error('API key authentication error:', error);
      connectionCheckStatus.result = { 
        success: false, 
        error: {
          type: 'auth_error',
          message: error.message,
          hint: error.hint,
          details: error.details
        },
        responseTime 
      };
    }
    // If we get a "relation does not exist" error (42P01), that's actually good!
    // It means we connected to the database but the table doesn't exist
    else if (error && error.code === '42P01') {
      console.log('Supabase connection successful (table does not exist)');
      connectionCheckStatus.result = { success: true, responseTime };
    }
    // Any other error means we couldn't connect properly
    else if (error && error.code !== '42P01') {
      console.error('Supabase connection error:', error);
      connectionCheckStatus.result = { 
        success: false, 
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        },
        responseTime 
      };
    }
    // If no error, we somehow have a profiles table!
    else {
      console.log('Supabase connection successful');
      connectionCheckStatus.result = { success: true, responseTime };
    }
    
    // Update timestamp
    connectionCheckStatus.lastCheckedAt = now;
    return connectionCheckStatus.result;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    connectionCheckStatus.result = { 
      success: false, 
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    };
    return connectionCheckStatus.result;
  } finally {
    // Clear the in-progress flag
    connectionCheckStatus.inProgress = false;
  }
};

// Only run the ReactDOM.render in browser environments, not SSR
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

if (isClient) {
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
} else {
  console.log('Not rendering React in non-browser environment');
} 