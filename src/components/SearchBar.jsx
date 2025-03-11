import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import { useResources } from '../context/ResourcesContext';
import { Link } from 'react-router-dom';

export default function SearchBar({ onSearch, className = '', minimal = false }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [matchingResources, setMatchingResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { resources } = useResources();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
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
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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
  
  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setMatchingResources([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      // First try to search in the context resources (faster)
      if (resources && resources.length > 0) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        
        const matches = resources.filter(resource => {
          // Check if resource has all the required properties
          if (!resource || !resource.title) return false;
          
          // Check if title, description, or tags match all search terms
          return searchTerms.every(term => {
            const title = (resource.title || '').toLowerCase();
            const description = (resource.description || '').toLowerCase();
            const tags = Array.isArray(resource.tags) 
              ? resource.tags.join(' ').toLowerCase() 
              : (resource.tags || '').toLowerCase();
            
            return title.includes(term) || 
                   description.includes(term) || 
                   tags.includes(term);
          });
        });
        
        // Sort by relevance and limit to 5 results
        const sortedMatches = matches
          .sort((a, b) => {
            // Simple relevance sorting - resources with match in title come first
            const aTitle = (a.title || '').toLowerCase();
            const bTitle = (b.title || '').toLowerCase();
            
            if (aTitle.includes(searchQuery.toLowerCase()) && !bTitle.includes(searchQuery.toLowerCase())) {
              return -1;
            }
            if (!aTitle.includes(searchQuery.toLowerCase()) && bTitle.includes(searchQuery.toLowerCase())) {
              return 1;
            }
            return 0;
          })
          .slice(0, 5);
        
        setMatchingResources(sortedMatches);
        setIsLoading(false);
        return;
      }
      
      // If no context resources, try to fetch from Supabase
      const fetchFromSupabase = async () => {
        try {
          // Use text search if available, or fall back to simple filtering
          const { data, error } = await supabase
            .from('resources')
            .select('*')
            .textSearch('title', searchQuery)
            .limit(5);
          
          if (error) {
            console.error('Error searching resources:', error);
            setIsLoading(false);
            return;
          }
          
          setMatchingResources(data || []);
        } catch (err) {
          console.error('Error in resource search:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFromSupabase();
    }, 300); // 300ms debounce
  }, [resources]);
  
  // Update search results when query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!query.trim()) return;
    
    // Track search query for analytics if user is logged in
    if (user) {
      try {
        await supabase
          .from('search_queries')
          .insert([
            { 
              query: query.trim(),
              user_id: user.id,
              results_count: 0 // This will be updated after results are fetched
            }
          ], { 
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json' 
            }
          });
          
        // Update recent searches
        fetchRecentSearches();
      } catch (error) {
        console.error('Error tracking search:', error);
      }
    }
    
    // Execute the search callback
    if (typeof onSearch === 'function') {
      onSearch(query);
    } else {
      console.error('onSearch is not a function');
    }
    
    // Close the dropdown
    setShowRecent(false);
    setMatchingResources([]);
  };
  
  const handleRecentSearch = (recentQuery) => {
    setQuery(recentQuery);
    onSearch(recentQuery);
    setShowRecent(false);
    setMatchingResources([]);
  };
  
  const handleResourceSelect = (resource) => {
    // Optionally update the search query
    setQuery(resource.title);
    
    // Close the dropdown
    setShowRecent(false);
    setMatchingResources([]);
  };
  
  const clearSearch = () => {
    setQuery('');
    setMatchingResources([]);
    inputRef.current.focus();
  };
  
  const shouldShowDropdown = (showRecent && recentSearches.length > 0) || matchingResources.length > 0;
  
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
              setShowRecent(true);
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
              onClick={(e) => {
                // Ensure the button click triggers form submission
                if (query.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            >
              <SearchIcon className={`${minimal ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </motion.button>
          </div>
        </div>
      </form>
      
      {/* Recent searches and live search results dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            ref={dropdownRef}
            className="absolute mt-1 w-full bg-[#222222] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Recent searches */}
            {showRecent && recentSearches.length > 0 && (
              <div className="p-1">
                <div className="text-xs text-gray-400 px-2 py-1">Recent Searches</div>
                {recentSearches.map((recentQuery, index) => (
                  <motion.button
                    key={`recent-${index}`}
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
            )}
            
            {/* Live search results */}
            {query.length >= 2 && (
              <div className="p-1">
                {matchingResources.length > 0 && (
                  <div className="text-xs text-gray-400 px-2 py-1">
                    {showRecent && recentSearches.length > 0 ? 'Matching Resources' : 'Search Results'}
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-2">
                    <div className="spinner-sm mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {matchingResources.length > 0 ? (
                      matchingResources.map((resource) => (
                        <Link
                          key={`resource-${resource.id}`}
                          to={`/resource/${resource.id}`}
                          className="block w-full text-left px-2 py-1.5 hover:bg-[rgba(255,255,255,0.05)] rounded text-white text-sm transition-colors"
                          onClick={() => handleResourceSelect(resource)}
                        >
                          <div className="flex items-start space-x-2">
                            {resource.thumbnail && (
                              <div className="w-8 h-8 flex-shrink-0 bg-dark-300 rounded overflow-hidden">
                                <img
                                  src={resource.thumbnail}
                                  alt={resource.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/placeholder.png';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                              <div className="text-[#bfff58] text-sm font-medium truncate">{resource.title}</div>
                              {resource.description && (
                                <div className="text-gray-400 text-xs truncate">{resource.description}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : query.length >= 2 && !isLoading ? (
                      <div className="px-2 py-1.5 text-gray-400 text-sm">No matching resources found</div>
                    ) : null}
                  </>
                )}
                
                {/* Show "See all results" option when there are matches */}
                {matchingResources.length > 0 && (
                  <motion.button
                    className="w-full text-left px-2 py-1.5 mt-1 hover:bg-[rgba(255,255,255,0.05)] rounded text-[#bfff58] text-sm flex items-center space-x-2 transition-colors"
                    onClick={() => handleSubmit()}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchIcon className="h-3 w-3" />
                    <span>See all results for "{query}"</span>
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 