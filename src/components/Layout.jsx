import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { supabase } from '../supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import ResourcePreviewModal from './ResourcePreviewModal';

const Layout = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [previewResource, setPreviewResource] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-dark-100">
        <div className="animate-pulse text-lime-accent">Loading...</div>
      </div>
    );
  }

  return (
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
  );
};

export default Layout; 