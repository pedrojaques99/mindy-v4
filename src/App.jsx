import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase, checkSupabaseConnection } from './main';
import { HelmetProvider } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { setupDatabase, checkDatabaseSetup } from './utils/setupDatabase';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ui/ScrollToTop';
import PageTransition from './components/ui/PageTransition';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ResourcePage from './pages/ResourcePage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SubmitResourcePage from './pages/SubmitResourcePage';
import NotFoundPage from './pages/NotFoundPage';
import TestPage from './pages/TestPage';
import UserJourneyTestPage from './pages/UserJourneyTestPage';
import StatusPage from './pages/StatusPage';

// Context
import { UserProvider } from './context/UserContext';
import { LanguageProvider } from './context/LanguageContext';

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <HomePage />
          </PageTransition>
        } />
        <Route path="/category/:category" element={
          <PageTransition>
            <CategoryPage />
          </PageTransition>
        } />
        <Route path="/resource/:id" element={
          <PageTransition>
            <ResourcePage />
          </PageTransition>
        } />
        <Route path="/favorites" element={
          <PageTransition>
            <FavoritesPage />
          </PageTransition>
        } />
        <Route path="/profile" element={
          <PageTransition>
            <ProfilePage />
          </PageTransition>
        } />
        <Route path="/edit-profile" element={
          <PageTransition>
            <EditProfilePage />
          </PageTransition>
        } />
        <Route path="/submit" element={
          <PageTransition>
            <SubmitResourcePage />
          </PageTransition>
        } />
        <Route path="/status" element={
          <PageTransition>
            <StatusPage />
          </PageTransition>
        } />
        <Route path="/test-supabase" element={
          <PageTransition>
            <TestPage />
          </PageTransition>
        } />
        <Route path="/test-user-journey" element={
          <PageTransition>
            <UserJourneyTestPage />
          </PageTransition>
        } />
        <Route path="*" element={
          <PageTransition>
            <NotFoundPage />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize database and check connection
    const initializeApp = async () => {
      try {
        // Check if database is connected
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          console.warn('Database connection failed. Using fallback data.');
          // Don't show error toast on initial load to avoid overwhelming the user
          // toast.error('Database connection failed. Using fallback data.');
        } else {
          console.log('Database connection successful');
          
          // Check if database is set up
          const isSetUp = await checkDatabaseSetup();
          
          if (!isSetUp) {
            console.log('Database not set up. Attempting to set up...');
            // Set up database
            try {
              const setupSuccess = await setupDatabase();
              
              if (setupSuccess) {
                console.log('Database setup successful');
                // Don't show success toast on initial load
                // toast.success('Database setup successful');
              } else {
                console.warn('Database setup failed. Using fallback data.');
                // Don't show error toast on initial load
                // toast.error('Database setup failed. Using fallback data.');
              }
            } catch (setupError) {
              console.error('Error setting up database:', setupError);
              // Continue with fallback data
            }
          } else {
            console.log('Database already set up');
          }
          
          setDbInitialized(true);
        }
        
        // Simulate loading resources
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // Reduced loading time for better UX
      } catch (error) {
        console.error('Error initializing app:', error);
        // Don't show error toast on initial load
        // toast.error('Error initializing app. Using fallback data.');
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  if (isLoading) {
    return null; // The loading screen is already in index.html
  }

  return (
    <UserProvider>
      <LanguageProvider>
        <HelmetProvider>
          <BrowserRouter>
            <div className="app-container min-h-screen flex flex-col grid-bg minimal-scrollbar">
              <Navbar onOpenAuth={() => setShowAuthModal(true)} />
              
              <main id="main-content" className="flex-grow">
                <AnimatedRoutes />
              </main>
              
              <Footer />
              
              <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
              />
              
              <ScrollToTop />
            </div>
          </BrowserRouter>
        </HelmetProvider>
      </LanguageProvider>
    </UserProvider>
  );
}

export default App; 