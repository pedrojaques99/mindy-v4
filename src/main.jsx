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

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
