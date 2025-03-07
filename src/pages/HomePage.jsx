import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/ui/GlassCard';
import ResourceSkeleton from '../components/ui/ResourceSkeleton';
import CategoryBadge from '../components/ui/CategoryBadge';
import Tooltip from '../components/ui/Tooltip';
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

// Main categories with emojis
const MAIN_CATEGORIES = [
  { id: 'assets', name: 'Assets', emoji: '🎨', icon: <CollectionIcon className="w-5 h-5" />, count: 42 },
  { id: 'tools', name: 'Tools', emoji: '🔧', icon: <CubeIcon className="w-5 h-5" />, count: 38 },
  { id: 'community', name: 'Community', emoji: '👥', icon: <UserGroupIcon className="w-5 h-5" />, count: 15 },
  { id: 'inspiration', name: 'Inspiration', emoji: '✨', icon: <LightBulbIcon className="w-5 h-5" />, count: 27 },
  { id: 'learn', name: 'Learn', emoji: '📚', icon: <BookOpenIcon className="w-5 h-5" />, count: 31 },
];

// Popular subcategories with emojis
const SUBCATEGORIES = [
  { id: 'ai', name: 'AI', emoji: '🤖', count: 18 },
  { id: 'moodboard', name: 'Moodboard', emoji: '🎭', count: 12 },
  { id: 'reference', name: 'Reference', emoji: '📌', count: 24 },
  { id: 'portfolio', name: 'Portfolio', emoji: '💼', count: 9 },
  { id: 'design', name: 'Design', emoji: '🎨', count: 36 },
  { id: 'fonts', name: 'Fonts', emoji: '🔤', count: 28 },
  { id: 'icons', name: 'Icons', emoji: '🔍', count: 22 },
  { id: 'textures', name: 'Textures', emoji: '🧩', count: 17 },
  { id: 'sfx', name: 'SFX', emoji: '🔊', count: 14 },
  { id: 'mockups', name: 'Mockups', emoji: '📱', count: 19 },
  { id: 'ui-ux', name: 'UI/UX', emoji: '📊', count: 25 },
  { id: '3d', name: '3D', emoji: '🧊', count: 16 },
  { id: 'photos-videos', name: 'Photos & Videos', emoji: '📸', count: 31 },
  { id: 'color', name: 'Color', emoji: '🎨', count: 11 },
  { id: 'productivity', name: 'Productivity', emoji: '⚡', count: 20 },
  { id: 'audiovisual', name: 'Audiovisual', emoji: '🎬', count: 15 },
  { id: 'typography', name: 'Typography', emoji: '🔠', count: 23 },
  { id: 'books', name: 'Books', emoji: '📚', count: 19 }
];

// Software categories with their respective icons
const SOFTWARE_CATEGORIES = [
  { id: 'figma', name: 'Figma', icon: '/icons/figma-icon.svg', color: '#F24E1E', count: 32 },
  { id: 'photoshop', name: 'Photoshop', icon: '/icons/photoshop-icon.svg', color: '#31A8FF', count: 28 },
  { id: 'blender', name: 'Blender', icon: '/icons/blender-icon.svg', color: '#F5792A', count: 14 },
  { id: 'cursor', name: 'Cursor', icon: '/icons/cursor-icon.svg', color: '#FFFFFF', count: 9 },
  { id: 'illustrator', name: 'Illustrator', icon: '/icons/illustrator-icon.svg', color: '#FF9A00', count: 21 },
  { id: 'indesign', name: 'InDesign', icon: '/icons/in-design-icon.svg', color: '#FF3366', count: 11 },
  { id: 'after-effects', name: 'After Effects', icon: '/icons/ae-icon.svg', color: '#9999FF', count: 17 },
  { id: 'premiere', name: 'Premiere', icon: '/icons/premiere-icon.svg', color: '#9999FF', count: 15 }
];

// Popular tags for suggestions
const POPULAR_TAGS = [
  'free', 'design', 'typography', 'ai', '3d', 'mockups', 
  'icons', 'templates', 'resources', 'tools'
];

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [trendingResources, setTrendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    subcategory: null,
    software: null
  });
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        // Fetch trending resources
        const { data: trendingData, error: trendingError } = await supabase
          .from('resources')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(6);
          
        if (trendingError) throw trendingError;
        setTrendingResources(trendingData || []);
        
        // Fetch recent resources
        const { data: recentData, error: recentError } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (recentError) throw recentError;
        setRecentResources(recentData || []);
        
        // Fetch popular resources
        const { data: popularData, error: popularError } = await supabase
          .from('resources')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(6);
          
        if (popularError) throw popularError;
        setPopularResources(popularData || []);
        
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
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
    navigate(`/category/all?tag=${encodeURIComponent(tag)}`);
  };
  
  // Handle filter selection
  const handleFilterSelect = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedFilters.category) {
      params.set('category', selectedFilters.category);
    }
    
    if (selectedFilters.subcategory) {
      params.set('subcategory', selectedFilters.subcategory);
    }
    
    if (selectedFilters.software) {
      params.set('tag', selectedFilters.software);
    }
    
    navigate(`/category/all?${params.toString()}`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      category: null,
      subcategory: null,
      software: null
    });
    navigate('/category/all');
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
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300/50 to-dark-100"></div>
        
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#bfff58_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Discover <span className="text-[#bfff58]">Creative Resources</span> for Your Projects
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Find the best tools, assets, and inspiration for designers, developers, and creators.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for resources, tools, or inspiration..."
                  className="w-full py-4 px-5 pr-12 rounded-xl bg-dark-200/80 backdrop-blur-sm border border-dark-300 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfff58]/30 focus:border-[#bfff58]/50 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#bfff58]/20 text-[#bfff58] hover:bg-[#bfff58]/30 transition-colors"
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
              <span className="text-sm text-gray-400">Popular:</span>
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
      
      <SectionDivider label="Filter Resources" />
      
      {/* Selected Filters */}
      {Object.values(selectedFilters).some(Boolean) && (
        <div className="container mx-auto px-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {Object.entries(selectedFilters).map(([type, value]) => {
              if (!value) return null;
              
              let displayText = '';
              let emoji = '';
              
              if (type === 'category') {
                const category = MAIN_CATEGORIES.find(c => c.id === value);
                displayText = category?.name || value;
                emoji = category?.emoji || '';
              } else if (type === 'subcategory') {
                const subcategory = SUBCATEGORIES.find(s => s.id === value);
                displayText = subcategory?.name || value;
                emoji = subcategory?.emoji || '';
              } else if (type === 'software') {
                const software = SOFTWARE_CATEGORIES.find(s => s.id === value);
                displayText = software?.name || value;
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
              Clear all
            </button>
          </div>
        </div>
      )}
      
      {/* Categories Filter */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium text-white">Categories</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {MAIN_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterSelect('category', category.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                selectedFilters.category === category.id
                  ? 'bg-[#bfff58]/20 text-[#bfff58] border border-[#bfff58]/30'
                  : 'bg-dark-200 text-white hover:bg-dark-300 border border-transparent'
              } transition-colors`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-xl" role="img" aria-label={category.name}>{category.emoji}</span>
                <span className="text-sm">{category.name}</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-300/80 text-gray-400">{category.count}</span>
            </button>
          ))}
        </div>
      </section>
      
      {/* Subcategories Filter */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium text-white">Subcategories</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SUBCATEGORIES.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => handleFilterSelect('subcategory', subcategory.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                selectedFilters.subcategory === subcategory.id
                  ? 'bg-[#bfff58]/20 text-[#bfff58] border border-[#bfff58]/30'
                  : 'bg-dark-200 text-white hover:bg-dark-300 border border-transparent'
              } transition-colors`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg" role="img" aria-label={subcategory.name}>{subcategory.emoji}</span>
                <span className="text-sm">{subcategory.name}</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-300/80 text-gray-400">{subcategory.count}</span>
            </button>
          ))}
        </div>
      </section>
      
      {/* Software Filter */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium text-white">Software</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {SOFTWARE_CATEGORIES.map((software) => (
            <button
              key={software.id}
              onClick={() => handleFilterSelect('software', software.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-lg ${
                selectedFilters.software === software.id
                  ? 'bg-dark-300 border border-[#bfff58]/30'
                  : 'bg-dark-200 hover:bg-dark-300 border border-transparent'
              } transition-all duration-200`}
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
                  alt={software.name} 
                  className={`w-6 h-6 object-contain ${
                    selectedFilters.software === software.id
                      ? 'filter brightness-0 invert sepia(100%) saturate(300%) brightness(80%) hue-rotate(60deg)'
                      : 'filter brightness-0 invert'
                  } transition-all duration-200`}
                />
              </div>
              <span className={`text-xs ${
                selectedFilters.software === software.id ? 'text-[#bfff58]' : 'text-gray-300'
              } transition-colors`}>
                {software.name}
              </span>
              <span className="absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full bg-dark-300/80 text-gray-400">
                {software.count}
              </span>
            </button>
          ))}
        </div>
      </section>
      
      <SectionDivider label="Trending Resources" />
      
      {/* Trending Resources */}
      {trendingResources.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-[#bfff58]" />
                Trending Resources
              </h2>
              <Link to="/category/all?sort=trending" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                View all <ChevronRightIcon className="w-4 h-4 ml-1" />
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
                Recent Uploads
              </h2>
              <Link to="/category/all?sort=newest" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                View all <ChevronRightIcon className="w-4 h-4 ml-1" />
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
                Most Liked Resources
              </h2>
              <Link to="/category/all?sort=popular" className="ml-auto text-sm text-[#bfff58] hover:underline flex items-center">
                View all <ChevronRightIcon className="w-4 h-4 ml-1" />
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
      <style jsx>{`
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
