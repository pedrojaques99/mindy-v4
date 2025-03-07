import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { supabase } from '../supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import ResourcePreviewModal from './ResourcePreviewModal';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-dark-100 text-white p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
            <p className="mb-4">We're sorry, but there was an error loading the application.</p>
            <pre className="bg-dark-200 p-4 rounded text-xs overflow-auto text-left mb-4">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [previewResource, setPreviewResource] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

      return () => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      };
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setError(err);
    }
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle resource preview
  const handleResourcePreview = (resource) => {
    setPreviewResource(resource);
  };

  // Close resource preview
  const closePreview = () => {
    setPreviewResource(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-dark-100 text-white p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Connection Error</h1>
          <p className="mb-4">We're having trouble connecting to our services.</p>
          <pre className="bg-dark-200 p-4 rounded text-xs overflow-auto text-left mb-4">
            {error.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-dark-100">
        <div className="animate-pulse text-lime-accent">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-dark-100 text-white">
        {/* Sidebar */}
        <motion.div 
          className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          initial={false}
        >
          <Sidebar 
            session={session} 
            closeSidebar={() => setIsSidebarOpen(false)} 
          />
        </motion.div>

        {/* Sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <Navbar 
            session={session} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
          
          <main className="flex-1 overflow-y-auto bg-dark-100 p-4 md:p-6">
            <div className="container mx-auto max-w-6xl">
              <Outlet context={{ session, handleResourcePreview }} />
            </div>
          </main>
        </div>

        {/* Resource Preview Modal */}
        <AnimatePresence>
          {previewResource && (
            <ResourcePreviewModal 
              resource={previewResource} 
              onClose={closePreview}
              session={session}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default Layout; 