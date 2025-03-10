import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/outline';

// This component ensures that the page scrolls to the top when navigating to a new route
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname, search } = useLocation();

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Focus on main content for accessibility
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Set focus without scrolling (which would conflict with our smooth scroll)
      setTimeout(() => {
        mainContent.focus({ preventScroll: true });
      }, 100);
    }
  }, [pathname, search]);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-lime-accent/20 text-lime-accent backdrop-blur-md border border-lime-accent/30 shadow-lg z-50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          whileHover={{ 
            scale: 1.1,
            backgroundColor: 'rgba(191, 255, 88, 0.3)'
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUpIcon className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
} 