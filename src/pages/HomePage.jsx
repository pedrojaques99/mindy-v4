import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, checkSupabaseConnection } from '../main';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { loadTranslations } from '../utils/translations';
import { updateUserProfile } from '../utils/user';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/ui/GlassCard';
import ResourceSkeleton from '../components/ui/ResourceSkeleton';
import CategoryBadge from '../components/ui/CategoryBadge';
import Tooltip from '../components/ui/Tooltip';
import CodeBackground from '../components/ui/CodeBackground';
import { 
  ArrowRightIcon, 
  InformationCircleIcon, 
  SearchIcon, 
  ClockIcon, 
  HeartIcon, 
  ChevronRightIcon, 
  FireIcon, 
  CollectionIcon, 
  TagIcon,
  CubeIcon,
  BookOpenIcon,
  UserGroupIcon,
  LightBulbIcon,
  DesktopComputerIcon,
  FilterIcon,
  AdjustmentsIcon,
  XIcon
} from '@heroicons/react/outline';
import ResourceCard from '../components/ResourceCard';
import SoftwareIcon from '../components/ui/SoftwareIcon';
import toast from 'react-hot-toast';

// Move these outside the component to avoid recreating on each render
const resourceHasTag = (resource, tagToCheck) => {
  if (!resource?.tags || !tagToCheck) return false;
  const normalizedTag = tagToCheck.toLowerCase();
  return Array.isArray(resource.tags) 
    ? resource.tags.some(tag => tag?.toLowerCase() === normalizedTag)
    : resource.tags.split(',').map(t => t.trim().toLowerCase()).includes(normalizedTag);
};

const HomePage = () => {
  const { user } = useUser();
  const { t, currentLanguage, setCurrentLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const isBrowser = typeof window !== 'undefined';
  
  // Add missing state for translations
  const [translations, setTranslations] = useState({});
  const [connectionError, setConnectionError] = useState(false);
  
  // Move POPULAR_TAGS outside useEffect to avoid recreation
  const POPULAR_TAGS = useMemo(() => [
    t('tags.free', 'free'), 
    t('tags.design', 'design'), 
    t('tags.typography', 'typography'), 
    t('tags.ai', 'ai'), 
    t('tags.3d', '3d'), 
    t('tags.mockups', 'mockups'),
    t('tags.icons', 'icons'), 
    t('tags.templates', 'templates'), 
    t('tags.resources', 'resources'), 
    t('tags.tools', 'tools')
  ], [t]);

  // Move INITIAL_SOFTWARE_CATEGORIES inside component to use t function
  const INITIAL_SOFTWARE_CATEGORIES = [
    { id: 'figma', name: t('software.figma', 'Figma'), icon: '/icons/figma-icon.svg', color: '#F24E1E', count: 0 },
    { id: 'photoshop', name: t('software.photoshop', 'Photoshop'), icon: '/icons/photoshop-icon.svg', color: '#31A8FF', count: 0 },
    { id: 'blender', name: t('software.blender', 'Blender'), icon: '/icons/blender-icon.svg', color: '#F5792A', count: 0 },
    { id: 'cursor', name: t('software.cursor', 'Cursor'), icon: '/icons/cursor-icon.svg', color: '#FFFFFF', count: 0 },
    { id: 'illustrator', name: t('software.illustrator', 'Illustrator'), icon: '/icons/illustrator-icon.svg', color: '#FF9A00', count: 0 },
    { id: 'indesign', name: t('software.indesign', 'InDesign'), icon: '/icons/in-design-icon.svg', color: '#FF3366', count: 0 },
    { id: 'after-effects', name: t('software.after-effects', 'After Effects'), icon: '/icons/ae-icon.svg', color: '#9999FF', count: 0 },
    { id: 'premiere', name: t('software.premiere', 'Premiere'), icon: '/icons/premiere-icon.svg', color: '#9999FF', count: 0 }
  ];

  // Move INITIAL_CATEGORIES inside component to use t function
  const INITIAL_CATEGORIES = {
    assets: { 
      name: t('categories.assets', 'Assets'), 
      emoji: '🎨', 
      icon: <CollectionIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'fonts', name: t('subcategories.fonts', 'Fonts'), emoji: '🔤', count: 0 },
        { id: 'icons', name: t('subcategories.icons', 'Icons'), emoji: '🔍', count: 0 },
        { id: 'textures', name: t('subcategories.textures', 'Textures'), emoji: '🧩', count: 0 },
        { id: 'sfx', name: t('subcategories.sfx', 'SFX'), emoji: '🔊', count: 0 },
        { id: 'mockups', name: t('subcategories.mockups', 'Mockups'), emoji: '📱', count: 0 },
        { id: '3d', name: t('subcategories.3d', '3D'), emoji: '🧊', count: 0 },
        { id: 'photos-videos', name: t('subcategories.photos-videos', 'Images'), emoji: '📸', count: 0 },
        { id: 'color', name: t('subcategories.color', 'Color'), emoji: '🎨', count: 0 },
      ]
    },
    tools: { 
      name: t('categories.tools', 'Tools'), 
      emoji: '🔧', 
      icon: <CubeIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'ai', name: t('subcategories.ai', 'AI'), emoji: '🤖', count: 0 },
        { id: 'productivity', name: t('subcategories.productivity', 'Productivity'), emoji: '⚡', count: 0 },
      ]
    },
    community: { 
      name: t('categories.community', 'Community'), 
      emoji: '👥', 
      icon: <UserGroupIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'portfolio', name: t('subcategories.portfolio', 'Portfolio'), emoji: '💼', count: 0 },
      ]
    },
    reference: { 
      name: t('categories.reference', 'Reference'), 
      emoji: '📌', 
      icon: <LightBulbIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'design', name: t('subcategories.design', 'Design'), emoji: '🎨', count: 0 },
        { id: 'ui', name: t('subcategories.ui', 'UI'), emoji: '📊', count: 0 },
        { id: 'audiovisual', name: t('subcategories.audiovisual', 'Audiovisual'), emoji: '🎬', count: 0 },
      ]
    },
    inspiration: { 
      name: t('categories.inspiration', 'Inspiration'), 
      emoji: '✨', 
      icon: <LightBulbIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'moodboard', name: t('subcategories.moodboard', 'Moodboard'), emoji: '🎭', count: 0 },
        { id: 'reference', name: t('subcategories.reference', 'Reference'), emoji: '📌', count: 0 },
      ]
    },
    learn: { 
      name: t('categories.learn', 'Learn'), 
      emoji: '📚', 
      icon: <BookOpenIcon className="w-5 h-5" />, 
      count: 0, 
      subcategories: [
        { id: 'design', name: t('subcategories.design', 'Design'), emoji: '🎨', count: 0 },
        { id: 'ui-ux', name: t('subcategories.ui-ux', 'UI/UX'), emoji: '📊', count: 0 },
        { id: 'typography', name: t('subcategories.typography', 'Typography'), emoji: '🔠', count: 0 },
        { id: 'books', name: t('subcategories.books', 'Books'), emoji: '📚', count: 0 }
      ]
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [trendingResources, setTrendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [softwareCategories, setSoftwareCategories] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    subcategory: null,
    software: null
  });
  const [selectedFilterDisplay, setSelectedFilterDisplay] = useState({});
  
  // Get flattened subcategories
  const subcategories = Object.values(categories).flatMap(category => category.subcategories);
  
  // Check database connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setConnectionError(true);
        toast.error('Database connection failed. Using fallback data.');
      }
    };
    
    checkConnection();
  }, []);

  // Fetch counts for all categories and subcategories
  const fetchCategoryCounts = useCallback(async () => {
    try {
      // Get all resources first (we need to count locally because of array filters)
      const { data: allResources, error } = await supabase
        .from('resources')
        .select('*');
      
      if (error) {
        console.error('Error fetching category counts:', error);
        
        // If the table doesn't exist, just use the initial categories
        if (error.code === '42P01') {
          console.warn('Resources table does not exist, using initial categories');
          return;
        }
        
        throw error;
      }
      
      if (!allResources) return;
      
      // Create a deep copy of the categories structure without React elements
      const updatedCategories = {};
      Object.entries(INITIAL_CATEGORIES).forEach(([key, category]) => {
        updatedCategories[key] = {
          ...category,
          // Don't include the icon in the copy since it's a React element
          icon: category.icon,
          subcategories: [...category.subcategories]
        };
      });
      
      // Count resources for each category and subcategory
      Object.keys(updatedCategories).forEach(categoryKey => {
        // Find resources for this category
        const resourcesInCategory = allResources.filter(r => {
          if (!r.category) return false;
          const normalizedCategory = r.category.toLowerCase();
          return normalizedCategory === categoryKey.toLowerCase();
        });
        
        updatedCategories[categoryKey].count = resourcesInCategory.length;
        
        // Count for each subcategory
        updatedCategories[categoryKey].subcategories.forEach((subcategory, index) => {
          // Case-insensitive matching for subcategory
          const resourcesInSubcategory = allResources.filter(r => 
            r.subcategory && r.subcategory.toLowerCase() === subcategory.id.toLowerCase()
          );
          updatedCategories[categoryKey].subcategories[index].count = resourcesInSubcategory.length;
        });
      });
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      // Use fallback data if there's an error
      setConnectionError(true);
    }
  }, [INITIAL_CATEGORIES]);
  
  // Fetch counts for software categories
  const fetchSoftwareCounts = useCallback(async () => {
    try {
      // Get all resources first
      const { data: allResources, error } = await supabase
        .from('resources')
        .select('*');
      
      if (error) {
        console.error('Error fetching software counts:', error);
        
        // If the table doesn't exist, just use the initial software categories
        if (error.code === '42P01') {
          console.warn('Resources table does not exist, using initial software categories');
          setSoftwareCategories(INITIAL_SOFTWARE_CATEGORIES);
          return;
        }
        
        throw error;
      }
      
      if (!allResources) {
        setSoftwareCategories(INITIAL_SOFTWARE_CATEGORIES);
        return;
      }
      
      // Create a deep copy of software categories
      const updatedSoftware = JSON.parse(JSON.stringify(INITIAL_SOFTWARE_CATEGORIES));
      
      // Count resources for each software
      updatedSoftware.forEach((software, index) => {
        // Use the utility function to check for tag matches
        const resourcesWithSoftware = allResources.filter(r => resourceHasTag(r, software.id));
        updatedSoftware[index].count = resourcesWithSoftware.length;
      });
      
      setSoftwareCategories(updatedSoftware);
    } catch (error) {
      console.error('Error fetching software counts:', error);
      // Use fallback data if there's an error
      setConnectionError(true);
      setSoftwareCategories(INITIAL_SOFTWARE_CATEGORIES);
    }
  }, [INITIAL_SOFTWARE_CATEGORIES]);

  // Move fetchResources outside useEffect and memoize it
  const fetchResources = useCallback(async () => {
    if (!isBrowser) return;
    
    try {
      setLoading(true);
      
      // First check if we can connect to the database
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        console.error('Database connection failed. Using fallback data.');
        setConnectionError(true);
        setLoading(false);
        return;
      }
      
      // Try to fetch resources
      try {
        const [trendingData, recentData, popularData] = await Promise.all([
          supabase.from('resources')
            .select('*')
            .order('popularity', { ascending: false })
            .limit(6),
            
          supabase.from('resources')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6),
            
          supabase.from('resources')
            .select('*')
            .order('popularity', { ascending: false })
            .limit(6)
        ]);

        // Check for errors in each query
        if (trendingData.error) {
          console.error('Error fetching trending resources:', trendingData.error);
          if (trendingData.error.code === '42P01') {
            // Table doesn't exist, use empty array
            setTrendingResources([]);
          } else {
            throw trendingData.error;
          }
        } else {
          setTrendingResources(trendingData.data || []);
        }

        if (recentData.error) {
          console.error('Error fetching recent resources:', recentData.error);
          if (recentData.error.code === '42P01') {
            // Table doesn't exist, use empty array
            setRecentResources([]);
          } else {
            throw recentData.error;
          }
        } else {
          setRecentResources(recentData.data || []);
        }

        if (popularData.error) {
          console.error('Error fetching popular resources:', popularData.error);
          if (popularData.error.code === '42P01') {
            // Table doesn't exist, use empty array
            setPopularResources([]);
          } else {
            throw popularData.error;
          }
        } else {
          setPopularResources(popularData.data || []);
        }
        
        // Try to fetch category and software counts
        try {
          await Promise.all([
            fetchCategoryCounts(),
            fetchSoftwareCounts()
          ]);
        } catch (countsError) {
          console.error('Error fetching counts:', countsError);
          // Continue with what we have
        }
      } catch (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        setConnectionError(true);
        
        // Use empty arrays for resources
        setTrendingResources([]);
        setRecentResources([]);
        setPopularResources([]);
      }
    } catch (error) {
      console.error('Error in fetchResources:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, [isBrowser, fetchCategoryCounts, fetchSoftwareCounts]);

  // Update useEffect dependencies
  useEffect(() => {
    fetchResources();
  }, [fetchResources, currentLanguage]); // Add currentLanguage dependency
  
  // Apply filters whenever they change
  useEffect(() => {
    if (Object.values(selectedFilters).some(Boolean)) {
      applyFilters();
    }
  }, [selectedFilters]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Show tag suggestions based on input
    if (query.length > 1) {
      const matchedTags = POPULAR_TAGS.filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestedTags(matchedTags);
    } else {
      setSuggestedTags([]);
    }
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Handle tag selection
  const handleTagSelect = (tag) => {
    navigate(`/category/all?tag=${encodeURIComponent(tag.trim())}`);
  };
  
  // Handle filter selection
  const handleFilterSelect = (type, value) => {
    // Create a copy of the current filters
    const newFilters = { ...selectedFilters };
    
    // Toggle filter selection
    if (newFilters[type] === value) {
      // If already selected, deselect it
      newFilters[type] = null;
    } else {
      // Otherwise, select it
      newFilters[type] = value;
    }
    
    // Update filters
    setSelectedFilters(newFilters);
    
    // Apply filters
    applyFilters(newFilters);
    
    // Update display text for selected filter
    if (newFilters[type]) {
      let displayText = value;
      let emoji = '';
      
      if (type === 'category') {
        const category = categories[value];
        displayText = category?.name || value;
        emoji = category?.emoji || '';
      } else if (type === 'subcategory') {
        const subcategory = subcategories.find(s => s.id === value);
        displayText = subcategory?.name || value;
        emoji = subcategory?.emoji || '';
      } else if (type === 'software') {
        const software = softwareCategories.find(s => s.id === value);
        displayText = software?.name || value;
      }
      
      // Add to selected filter display
      setSelectedFilterDisplay(prev => ({
        ...prev,
        [type]: { value, displayText, emoji }
      }));
    } else {
      // Remove from selected filter display
      const newDisplay = { ...selectedFilterDisplay };
      delete newDisplay[type];
      setSelectedFilterDisplay(newDisplay);
    }
  };
  
  // Apply filters
  const applyFilters = (filters = selectedFilters) => {
    const params = new URLSearchParams();
    
    // We use filter: true parameter to indicate that filters are being applied
    // This helps distinguish from regular navigation
    params.set('filter', 'true');
    
    // Handle category filter
    if (filters.category) {
      // For category, we'll use it in the path rather than as a query parameter
      const categoryPath = filters.category;
      
      // Add subcategory as a query parameter if present
      if (filters.subcategory) {
        params.set('subcategory', filters.subcategory);
      }
      
      // Add software as a tag parameter if present
      if (filters.software) {
        params.set('tag', filters.software);
      }
      
      // Navigate to category page with appropriate parameters
      navigate(`/category/${categoryPath}?${params.toString()}`);
    } else {
      // If no category is selected, we use the 'all' category
      
      // Add subcategory as a query parameter if present
      if (filters.subcategory) {
        params.set('subcategory', filters.subcategory);
      }
      
      // Add software as a tag parameter if present
      if (filters.software) {
        params.set('tag', filters.software);
      }
      
      // Navigate to 'all' category with appropriate parameters
      navigate(`/category/all?${params.toString()}`);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      category: null,
      subcategory: null,
      software: null
    });
    setSelectedFilterDisplay({});
    setSearchQuery('');
    
    // Clear URL parameters
    navigate('/');
    
    // Reset resources to initial state
    fetchResources();
  };
  
  // Section divider component for better organization
  const SectionDivider = ({ label }) => (
    <div className="flex items-center my-8">
      <div className="flex-grow h-px bg-dark-300/70"></div>
      {label && (
        <div className="px-4 text-sm text-gray-400 font-medium">{label}</div>
      )}
      <div className="flex-grow h-px bg-dark-300/70"></div>
    </div>
  );
  
  // Format timestamp with browser check
  const formatTime = (date) => {
    if (!isBrowser) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Update changeLanguage function with proper error handling
  const changeLanguage = async (langCode) => {
    if (!languages?.[langCode] || currentLanguage?.code === langCode) return;
    
    try {
      setLoading(true);
      const newLang = languages[langCode];
      const langTranslations = await loadTranslations(langCode);
      
      if (!langTranslations) {
        throw new Error(`Failed to load translations for ${langCode}`);
      }
      
      setCurrentLanguage(newLang);
      setTranslations(langTranslations);
      
      if (user) {
        await updateUserProfile({ language: langCode });
      }
      
      if (isBrowser) {
        localStorage.setItem('preferredLanguage', langCode);
      }
      
      toast.success(`Language changed to ${newLang.name}`);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(`Failed to change language: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient with reduced opacity to make code effect more visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300/60 to-dark-100/80"></div>
        
        {/* Interactive code background - ensure it spans full width/height */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <CodeBackground />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
              {t('home.hero.title', 'Discover')}{' '}
              <span className="text-[#bfff58] drop-shadow-lg">
                {t('home.hero.titleHighlight', 'Creative Resources')}
              </span>{' '}
              {t('home.hero.titleEnd', 'for Your Projects')}
            </h1>
            <p className="text-lg text-gray-300 mb-8 drop-shadow-sm">
              {t('home.hero.subtitle', 'Find the best tools, assets, and inspiration for designers, developers, and creators.')}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('home.search.placeholder', 'Search for resources, tools, or inspiration...')}
                  className="w-full py-4 px-5 pr-12 rounded-xl bg-dark-200/80 backdrop-blur-sm border border-dark-300 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfff58]/30 focus:border-[#bfff58]/50 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#bfff58]/20 text-[#bfff58] hover:bg-[#bfff58]/30 transition-colors"
                  aria-label={t('home.search.submit', 'Submit search')}
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
              </form>
              
              {/* Tag suggestions */}
              {suggestedTags.length > 0 && (
                <motion.div 
                  className="absolute z-10 mt-2 w-full rounded-xl bg-dark-200/95 backdrop-blur-sm border border-dark-300 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ul>
                    {suggestedTags.map((tag) => (
                      <li key={tag}>
                        <button
                          onClick={() => handleTagSelect(tag)}
                          className="w-full px-4 py-3 text-left hover:bg-dark-300 flex items-center text-gray-200"
                        >
                          <TagIcon className="w-4 h-4 mr-2 text-[#bfff58]" />
                          {tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
            
            {/* Popular tags */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-400">{t('home.tags.popular', 'Popular tags')}:</span>
              {POPULAR_TAGS.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className="px-3 py-1 text-sm rounded-full bg-dark-300/80 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      <SectionDivider label={t('home.sections.filterResources', 'Filter Resources')} />
      
      {/* Selected Filters */}
      {Object.values(selectedFilters).some(Boolean) && (
        <div className="container mx-auto px-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">{t('home.filters.activeLabel', 'Active filters')}:</span>
            {Object.entries(selectedFilters).map(([type, value]) => {
              if (!value) return null;
              
              let displayText = '';
              let emoji = '';
              
              if (type === 'category') {
                const category = categories[value];
                displayText = t(`categories.${value}`, category?.name || value);
                emoji = category?.emoji || '';
              } else if (type === 'subcategory') {
                const subcategory = subcategories.find(s => s.id === value);
                displayText = t(`subcategories.${value}`, subcategory?.name || value);
                emoji = subcategory?.emoji || '';
              } else if (type === 'software') {
                const software = softwareCategories.find(s => s.id === value);
                displayText = t(`software.${value}`, software?.name || value);
              }
              
              return (
                <div 
                  key={type} 
                  className="flex items-center bg-[#bfff58]/10 text-[#bfff58] px-2 py-1 rounded-lg text-sm"
                >
                  {emoji && <span className="mr-1">{emoji}</span>}
                  <span>{displayText}</span>
                  <button 
                    onClick={() => handleFilterSelect(type, value)}
                    className="ml-1 p-0.5 hover:bg-dark-300 rounded-full"
                    aria-label={t('home.filters.remove', 'Remove filter')}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            
            <button 
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white ml-2 flex items-center"
            >
              <XIcon className="h-3 w-3 mr-1" />
              {t('home.filters.clearAll', 'Clear all')}
            </button>
          </div>
        </div>
      )}
      
      {/* Subcategories Filter */}
      <section className="container mx-auto px-4 mb-8">
        {Object.entries(categories).map(([categoryId, category]) => (
          <div key={categoryId} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white/90 uppercase tracking-wider">
                {t(`categories.${categoryId}`, category.name)}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-300/80 text-gray-400">
                {category.count}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {category.subcategories.map((subcategory) => {
                const translatedName = t(`subcategories.${subcategory.id}`, subcategory.name);
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleFilterSelect('subcategory', subcategory.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      selectedFilters.subcategory === subcategory.id
                        ? 'bg-[#bfff58]/20 text-[#bfff58] border border-[#bfff58]/30'
                        : 'bg-dark-200 text-white hover:bg-dark-300 border border-transparent'
                    } transition-colors`}
                    aria-label={t('home.filters.selectSubcategory', 'Select subcategory: {{name}}', { name: translatedName })}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-lg" role="img" aria-label={translatedName}>
                        {subcategory.emoji}
                      </span>
                      <span className="text-sm">{translatedName}</span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-300/80 text-gray-400">
                      {subcategory.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
      
      {/* Software Filter */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">
            {t('home.sections.software', 'Software')}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-dark-300/80 text-gray-400">
            {softwareCategories.reduce((sum, sw) => sum + sw.count, 0)}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {softwareCategories.map((software) => (
            <button
              key={software.id}
              onClick={() => handleFilterSelect('software', software.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-lg ${
                selectedFilters.software === software.id
                  ? 'bg-dark-300 border border-[#bfff58]/30'
                  : 'bg-dark-200 hover:bg-dark-300 border border-transparent'
              } transition-all duration-200`}
              aria-label={t('home.filters.selectSoftware', 'Select software: {{name}}', { name: software.name })}
            >
              <div 
                className={`w-10 h-10 mb-2 flex items-center justify-center rounded-lg overflow-hidden ${
                  selectedFilters.software === software.id
                    ? 'bg-[#bfff58]/10'
                    : 'bg-dark-300/50 group-hover:bg-dark-300'
                } transition-colors`}
              >
                <img 
                  src={software.icon} 
                  alt={t(`software.${software.id}`, software.name)}
                  className={`w-6 h-6 object-contain ${
                    selectedFilters.software === software.id
                      ? 'filter brightness-0 invert sepia(100%) saturate(300%) brightness(80%) hue-rotate(60deg)'
                      : 'filter brightness-0 invert'
                  } transition-all duration-200`}
                />
              </div>
              <span className={`text-xs ${
                selectedFilters.software === software.id ? 'text-[#bfff58]' : 'text-gray-300'
              }`}>
                {t(`software.${software.id}`, software.name)}
              </span>
              <span className="absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full bg-dark-300/80 text-gray-400">
                {software.count}
              </span>
            </button>
          ))}
        </div>
      </section>
      
      <SectionDivider label={t('home.sections.trendingResources', 'Trending Resources')} />
      
      {/* Trending Resources */}
      {trendingResources.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-[#bfff58]" />
                {t('home.sections.trendingResources', 'Trending Resources')}
              </h2>
              <Link to="/category/all?sort=trending" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                {t('common.viewAll', 'View all')} <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingResources.map((resource, index) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <SectionDivider />
      
      {/* Recent Uploads */}
      {recentResources.length > 0 && (
        <section className="py-12 bg-dark-200/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-[#bfff58]" />
                {t('home.sections.recentUploads', 'Recent Uploads')}
              </h2>
              <Link to="/category/all?sort=newest" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                {t('common.viewAll', 'View all')} <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentResources.map((resource, index) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <SectionDivider />
      
      {/* Most Liked Resources */}
      {popularResources.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <HeartIcon className="w-6 h-6 mr-2 text-[#bfff58]" />
                {t('home.sections.mostLiked', 'Most Liked Resources')}
              </h2>
              <Link to="/category/all?sort=popular" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                {t('common.viewAll', 'View all')} <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularResources.map((resource, index) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CSS for hiding scrollbars while maintaining functionality */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
