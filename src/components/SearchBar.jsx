import { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';

export default function SearchBar({ onSearch, className = '', minimal = false }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const { user } = useUser();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Fetch recent searches when component mounts
  useEffect(() => {
    if (user) {
      fetchRecentSearches();
    }
  }, [user]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowRecent(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchRecentSearches = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('search_queries')
      .select('query, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (!error && data) {
      // Get unique queries
      const uniqueQueries = [...new Set(data.map(item => item.query))].slice(0, 5);
      setRecentSearches(uniqueQueries);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Track search query for analytics if user is logged in
    if (user) {
      await supabase
        .from('search_queries')
        .insert([
          { 
            query: query.trim(),
            user_id: user.id,
            results_count: 0 // This will be updated after results are fetched
          }
        ])
        .catch(error => console.error('Error tracking search:', error));
        
      // Update recent searches
      fetchRecentSearches();
    }
    
    onSearch(query);
    setShowRecent(false);
  };
  
  const handleRecentSearch = (recentQuery) => {
    setQuery(recentQuery);
    onSearch(recentQuery);
    setShowRecent(false);
  };
  
  const clearSearch = () => {
    setQuery('');
    inputRef.current.focus();
  };
  
  return (
    <div className={`w-full relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <motion.div
              animate={{ scale: isFocused ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <SearchIcon className={`${minimal ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
            </motion.div>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (user && recentSearches.length > 0) {
                setShowRecent(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={minimal ? "Search..." : "Search for resources, tools, assets..."}
            className={`
              block w-full 
              ${minimal ? 'pl-9 pr-9 py-2 text-sm' : 'pl-10 pr-10 py-3'} 
              bg-[rgba(255,255,255,0.05)] backdrop-blur-sm 
              border border-[rgba(255,255,255,0.1)] rounded-full
              text-white placeholder-gray-400
              focus:outline-none focus:ring-1 focus:ring-[#bfff58]/30 focus:border-[#bfff58]/30
              transition-all duration-200
            `}
          />
          <AnimatePresence>
            {query && (
              <motion.div 
                className={`absolute inset-y-0 right-8 flex items-center`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] text-gray-400 transition-colors"
                >
                  <XIcon className={`${minimal ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className={`
                ${minimal ? 'p-1.5' : 'p-2'} rounded-full 
                ${query.trim() ? 'bg-[#bfff58]/20 text-[#bfff58]' : 'bg-transparent text-gray-400'}
                transition-colors duration-200
              `}
              disabled={!query.trim()}
            >
              <SearchIcon className={`${minimal ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </motion.button>
          </div>
        </div>
      </form>
      
      {/* Recent searches dropdown */}
      <AnimatePresence>
        {showRecent && recentSearches.length > 0 && (
          <motion.div
            ref={dropdownRef}
            className="absolute mt-1 w-full bg-[#222222] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-1">
              <div className="text-xs text-gray-400 px-2 py-1">Recent Searches</div>
              {recentSearches.map((recentQuery, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left px-2 py-1.5 hover:bg-[rgba(255,255,255,0.05)] rounded text-white text-sm flex items-center space-x-2 transition-colors"
                  onClick={() => handleRecentSearch(recentQuery)}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchIcon className="h-3 w-3 text-gray-400" />
                  <span>{recentQuery}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 