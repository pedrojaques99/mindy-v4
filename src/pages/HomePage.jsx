import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/ui/GlassCard';
import FeaturedResource from '../components/FeaturedResource';
import ResourceSkeleton from '../components/ui/ResourceSkeleton';
import CategoryBadge from '../components/ui/CategoryBadge';
import Tooltip from '../components/ui/Tooltip';
import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/outline';

const HomePage = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainFeatured, setMainFeatured] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured resources with engagement metrics
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select(`
            *,
            resource_views(count),
            favorites(count),
            resource_comments(count)
          `)
          .eq('featured', true)
          .order('popularity', { ascending: false })
          .limit(10);

        if (resourcesError) throw resourcesError;
        
        if (resources && resources.length > 0) {
          // Calculate engagement score for each resource
          const resourcesWithEngagement = resources.map(resource => {
            const viewCount = resource.resource_views?.length || 0;
            const favoriteCount = resource.favorites?.length || 0;
            const commentCount = resource.resource_comments?.length || 0;
            
            // Calculate engagement score (customize weights as needed)
            const engagementScore = 
              (viewCount * 1) + 
              (favoriteCount * 3) + 
              (commentCount * 5) + 
              (resource.popularity || 0);
              
            return {
              ...resource,
              engagementScore
            };
          });
          
          // Sort by engagement score
          resourcesWithEngagement.sort((a, b) => b.engagementScore - a.engagementScore);
          
          // Set the first resource as the main featured one
          setMainFeatured(resourcesWithEngagement[0]);
          
          // Set the rest as regular featured resources
          setFeaturedResources(resourcesWithEngagement.slice(1) || []);
        }

        // Get unique categories from resources table
        const { data: resourceCategories, error: resourceCategoriesError } = await supabase
          .from('resources')
          .select('category')
          .order('category');

        if (resourceCategoriesError) throw resourceCategoriesError;
        
        // Extract unique categories
        const uniqueCategories = [];
        resourceCategories.forEach(item => {
          if (item.category && !uniqueCategories.some(cat => cat.slug === item.category)) {
            uniqueCategories.push({
              id: uniqueCategories.length + 1,
              name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
              slug: item.category,
              icon: getCategoryIcon(item.category)
            });
          }
        });
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'assets': return '🖼️';
      case 'community': return '👥';
      case 'design': return '🎨';
      case 'reference': return '📚';
      case 'tool': return '🔧';
      case 'tutorial': return '📝';
      case 'shop': return '🛒';
      default: return '📦';
    }
  };

  // Handle search
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Placeholder data for development
  const placeholderResources = [
    {
      id: 1,
      title: 'Figma Design System',
      description: 'A comprehensive design system for Figma with components and styles.',
      url: 'https://example.com/figma-design-system',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'design',
      subcategory: 'ui-ux',
      tags: ['figma', 'design-system', 'ui'],
    },
    {
      id: 2,
      title: 'React Component Library',
      description: 'A collection of reusable React components for building modern UIs.',
      url: 'https://example.com/react-components',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'development',
      subcategory: 'frontend',
      tags: ['react', 'components', 'ui'],
    },
    {
      id: 3,
      title: 'CSS Animation Toolkit',
      description: 'A toolkit for creating beautiful CSS animations with ease.',
      url: 'https://example.com/css-animations',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'development',
      subcategory: 'css',
      tags: ['css', 'animation', 'web'],
    },
  ];

  const displayResources = featuredResources.length > 0 ? featuredResources : placeholderResources;
  const displayCategories = categories.length > 0 ? categories : [];
  const displayMainFeatured = mainFeatured || (placeholderResources.length > 0 ? placeholderResources[0] : null);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="mb-16">
          <div className="glass-card p-8 md:p-12 overflow-hidden relative">
            <div className="h-10 bg-dark-300 rounded-md w-3/4 mb-4 animate-pulse" />
            <div className="h-4 bg-dark-300 rounded-md w-1/2 mb-8 animate-pulse" />
            <div className="h-12 bg-dark-300 rounded-full w-full mb-8 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-10 bg-dark-300 rounded-lg w-40 animate-pulse" />
              <div className="h-10 bg-dark-300 rounded-lg w-40 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Categories Section Skeleton */}
        <div className="mb-16">
          <div className="h-8 bg-dark-300 rounded-md w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="glass-card p-6 h-24 flex flex-col items-center justify-center">
                <div className="h-10 w-10 bg-dark-300 rounded-full mb-2 animate-pulse" />
                <div className="h-4 bg-dark-300 rounded-md w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Resources Section Skeleton */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-dark-300 rounded-md w-48 animate-pulse" />
            <div className="h-4 bg-dark-300 rounded-md w-20 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResourceSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 md:p-12 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-lime-accent/10 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-lime-accent/5 blur-3xl"></div>
          
          <div className="relative z-10">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Discover curated resources for designers and developers
            </motion.h1>
            
            <motion.p 
              className="text-white/80 text-lg mb-8 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              MINDY is a collection of high-quality resources, tools, and inspiration to help you build better projects.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <SearchBar onSearch={handleSearch} />
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link to="/category/all" className="btn btn-primary group">
                Explore All Resources
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {categories.length > 0 && (
                <Link to={`/category/${categories[0].slug}`} className="btn btn-secondary group">
                  Browse {categories[0].name}
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Featured Resource */}
      {displayMainFeatured && (
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-white/90">Featured Resources</h2>
            <Link 
              to="/category/all?featured=true" 
              className="text-lime-accent flex items-center text-xs hover:underline"
            >
              View all
              <ArrowRightIcon className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FeaturedResource resource={displayMainFeatured} />
            </div>
            
            {featuredResources.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {featuredResources.slice(0, 2).map((resource, index) => (
                  <FeaturedResource key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
          
          {featuredResources.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {featuredResources.slice(2, 5).map((resource, index) => (
                <FeaturedResource key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Categories Section */}
      <motion.section 
        className="mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <Tooltip content="Explore resources by category">
            <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Link
              key="all"
              to="/category/all"
              className="block h-full"
            >
              <GlassCard 
                hoverEffect={true} 
                glowOnHover={true}
                className="p-6 h-full flex flex-col items-center text-center"
              >
                <Tooltip content="View all resources">
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">🌐</div>
                </Tooltip>
                <h3 className="text-lg font-medium">All</h3>
              </GlassCard>
            </Link>
          </motion.div>
          
          {displayCategories.map((category, index) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={`/category/${category.slug}`}
                className="block h-full"
              >
                <GlassCard 
                  hoverEffect={true} 
                  glowOnHover={true}
                  delay={index}
                  className="p-6 h-full flex flex-col items-center text-center"
                >
                  <Tooltip content={`Browse ${category.name} resources`}>
                    <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  </Tooltip>
                  <CategoryBadge category={category.slug} size="sm" />
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Resources Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Explore Resources</h2>
          <Link 
            to="/category/all" 
            className="text-lime-accent hover:underline group flex items-center px-3 py-1 rounded-full hover:bg-lime-accent/10 transition-all"
            aria-label="View all resources"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResources.map((resource, index) => (
            <motion.div 
              key={resource.id} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GlassCard 
                hoverEffect={true} 
                glowOnHover={true}
                delay={index}
                className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <Link 
                  to={`/resource/${resource.id}`} 
                  className="block h-full focus:outline-none focus:ring-2 focus:ring-lime-accent/50 rounded-xl"
                  aria-label={`View details of ${resource.title}`}
                  onMouseMove={(e) => {
                    const spotlight = e.currentTarget.querySelector('.spotlight');
                    if (spotlight) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      spotlight.style.setProperty('--x', `${x}%`);
                      spotlight.style.setProperty('--y', `${y}%`);
                    }
                  }}
                >
                  <div className="aspect-video bg-dark-400 rounded-t-xl overflow-hidden relative">
                    {resource.image_url ? (
                      <img
                        src={resource.image_url}
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-300 to-dark-500 transition-transform duration-500 group-hover:scale-105">
                        <span className="text-4xl">{getCategoryIcon(resource.category)}</span>
                      </div>
                    )}
                    
                    {/* Spotlight effect */}
                    <div className="spotlight"></div>
                    
                    {/* Category badge - moved to top left for better visibility */}
                    <div className="absolute top-2 left-2">
                      <CategoryBadge category={resource.category} size="sm" />
                    </div>
                    
                    {/* Subcategory badge */}
                    <div className="absolute top-2 right-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-lime-accent/20 text-lime-accent backdrop-blur-sm">
                        {resource.subcategory}
                      </span>
                    </div>
                    
                    {/* Hover overlay with quick action */}
                    <div className="absolute inset-0 bg-dark-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <span className="px-4 py-2 rounded-full bg-lime-accent/20 text-lime-accent border border-lime-accent/30 flex items-center">
                        View Details
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-medium line-clamp-1 group-hover:text-lime-accent transition-colors">
                        {resource.title}
                      </h3>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {resource.tags && resource.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index} 
                          className="tag group-hover:bg-glass-200 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags && resource.tags.length > 3 && (
                        <span className="tag group-hover:bg-glass-200 transition-colors">
                          +{resource.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Added resource type indicator */}
                    <div className="mt-4 pt-3 border-t border-glass-200 flex justify-between items-center">
                      <div className="text-xs text-white/50">
                        {new Date(resource.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-lime-accent mr-1"></span>
                        <span className="text-xs text-white/70">
                          {resource.type || 'Resource'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        {/* Added "Load More" button for better UX */}
        {displayResources.length > 0 && (
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/category/all" 
              className="btn btn-secondary inline-flex items-center px-6 py-3"
            >
              Load More Resources
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default HomePage;
