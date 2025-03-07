import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './main';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
            <ResourceDetailPage />
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
        <Route path="/submit" element={
          <PageTransition>
            <SubmitResourcePage />
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

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return null; // The loading screen is already in index.html
  }

  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app-container min-h-screen flex flex-col grid-bg minimal-scrollbar">
          <Navbar onOpenAuth={() => setShowAuthModal(true)} />
          
          <main className="flex-grow">
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
    </UserProvider>
  );
}

export default App; 