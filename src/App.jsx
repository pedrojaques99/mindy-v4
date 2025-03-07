import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';

// Components
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ui/ScrollToTop';
import PageTransition from './components/ui/PageTransition';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import SubmitResourcePage from './pages/SubmitResourcePage';
import NotFoundPage from './pages/NotFoundPage';

// Context
import { UserProvider } from './context/UserContext';

// Global error handler
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-dark-100 text-white p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Application Error</h1>
            <p className="mb-4">We're sorry, but something went wrong with the application.</p>
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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Supabase is initialized correctly
    try {
      // Test Supabase connection
      supabase.auth.getSession()
        .then(() => {
          console.log('Supabase connection successful');
        })
        .catch(err => {
          console.error('Supabase connection error:', err);
          setError(err);
        })
        .finally(() => {
          // Simulate loading resources
          const timer = setTimeout(() => {
            setIsLoading(false);
          }, 1000);
          return () => clearTimeout(timer);
        });
    } catch (err) {
      console.error('App initialization error:', err);
      setError(err);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-dark-100">
        <div className="animate-pulse text-lime-accent">Loading...</div>
      </div>
    );
  }

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

  return (
    <ErrorBoundary>
      <UserProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="category/:category" element={<CategoryPage />} />
              <Route path="resource/:id" element={<ResourceDetailPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="submit" element={<SubmitResourcePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </BrowserRouter>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App; 