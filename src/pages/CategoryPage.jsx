import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import FilterTags from '../components/FilterTags';
import ResourceCard from '../components/ResourceCard';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, HomeIcon, ChevronRightIcon } from '@heroicons/react/outline';

const CategoryPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categoryData, setCategoryData] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;
  
  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    const tagParam = queryParams.get('tag');
    const subcategoryParam = queryParams.get('subcategory');
    const filterParam = queryParams.get('filter');
    
    // Set search query if present
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
    
    // Set tag filters if present
    if (tagParam) {
      // Split comma-separated tags into an array
      const tags = tagParam.split(',').map(tag => tag.trim()).filter(Boolean);
      setSelectedTags(tags);
    } else {
      setSelectedTags([]);
    }
    
    // Set subcategory filter if present
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    } else {
      setSelectedSubcategory(null);
    }
    
    // Reset pagination when URL changes
    setPage(0);
    setResources([]);
    setHasMore(true);
    
    // Fetch data with the new filters
    fetchData();
  }, [location.search, category]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch category data if not 'all'
      if (category !== 'all') {
        // Don't use .single() as it throws an error when no rows are found
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', category);
          
        if (catError) throw catError;
        
        // Set category data if found, otherwise create a default one based on the slug
        if (catData && catData.length > 0) {
          setCategoryData(catData[0]);
        } else {
          // Create a default category object based on the slug
          setCategoryData({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            description: `Browse our curated collection of ${category} resources`,
            slug: category
          });
        }
      }
      
      // Parse URL parameters
      const urlParams = new URLSearchParams(location.search);
      const urlSearchQuery = urlParams.get('search');
      const urlTagQuery = urlParams.get('tag');
      const urlSubcategoryQuery = urlParams.get('subcategory');
      
      // Fetch resources with pagination
      let query = supabase
        .from('resources')
        .select('*');
      
      // Apply category filter
      if (category !== 'all') {
        // Filter directly by category
        query = query.eq('category', category);
      }
      
      // Apply search query filter if present in URL
      if (urlSearchQuery) {
        query = query.or(`title.ilike.%${urlSearchQuery}%,description.ilike.%${urlSearchQuery}%`);
      }
      
      // Apply subcategory filter if present - FIXED to use proper column name and comparison
      if (urlSubcategoryQuery) {
        query = query.eq('subcategory', urlSubcategoryQuery);
      }
      
      // Apply tag filtering at the database level if possible
      if (urlTagQuery) {
        const tags = urlTagQuery.split(',').map(tag => tag.trim()).filter(Boolean);
        if (tags.length === 1) {
          // For single tag, we can use contains in the query
          query = query.contains('tags', [tags[0]]);
        }
      }
      
      // Add pagination
      query = query.range(page * ITEMS_PER_PAGE, (page * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);
      
      const { data: resourcesData, error: resourcesError } = await query;
      
      if (resourcesError) throw resourcesError;
      
      if (resourcesData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // For multiple tags, we need to filter in memory
      let filteredResources = resourcesData;
      if (urlTagQuery) {
        const tags = urlTagQuery.split(',').map(tag => tag.trim()).filter(Boolean);
        
        if (tags.length > 1) {
          filteredResources = resourcesData.filter(resource => {
            // Check if resource has all the selected tags
            return tags.every(tag => resource.tags && resource.tags.includes(tag));
          });
        }
      }
      
      // Extract all unique tags from resources
      const tags = new Set();
      resourcesData.forEach(resource => {
        if (resource.tags && Array.isArray(resource.tags)) {
          resource.tags.forEach(tag => tags.add(tag));
        }
      });
      
      // Extract all unique subcategories
      const subCats = new Set();
      resourcesData.forEach(resource => {
        if (resource.subcategory) {
          subCats.add(resource.subcategory);
        }
      });
      
      setAllTags(Array.from(tags));
      setSubcategories(Array.from(subCats));
      setResources(filteredResources);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      setLoading(true);
      
      // Parse URL parameters
      const urlParams = new URLSearchParams(location.search);
      const urlSearchQuery = urlParams.get('search');
      const urlTagQuery = urlParams.get('tag');
      const urlSubcategoryQuery = urlParams.get('subcategory');
      
      // Fetch next page of resources
      let query = supabase
        .from('resources')
        .select('*');
      
      // Apply category filter
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      
      // Apply search query filter if present
      if (urlSearchQuery) {
        query = query.or(`title.ilike.%${urlSearchQuery}%,description.ilike.%${urlSearchQuery}%`);
      }
      
      // Apply subcategory filter if present
      if (urlSubcategoryQuery) {
        query = query.eq('subcategory', urlSubcategoryQuery);
      }
      
      // Apply tag filtering at the database level if possible
      if (urlTagQuery) {
        const tags = urlTagQuery.split(',').map(tag => tag.trim()).filter(Boolean);
        if (tags.length === 1) {
          // For single tag, we can use contains in the query
          query = query.contains('tags', [tags[0]]);
        }
      }
      
      // Add pagination
      query = query.range(nextPage * ITEMS_PER_PAGE, (nextPage * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);
      
      const { data: newResources, error } = await query;
      
      if (error) throw error;
      
      if (newResources.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // For multiple tags, we need to filter in memory
      let filteredNewResources = newResources;
      if (urlTagQuery) {
        const tags = urlTagQuery.split(',').map(tag => tag.trim()).filter(Boolean);
        
        if (tags.length > 1) {
          filteredNewResources = newResources.filter(resource => {
            // Check if resource has all the selected tags
            return tags.every(tag => resource.tags && resource.tags.includes(tag));
          });
        }
      }
      
      // Add new resources to existing ones
      setResources(prev => [...prev, ...filteredNewResources]);
      
      // Extract and add new tags
      const newTags = new Set();
      newResources.forEach(resource => {
        if (resource.tags && Array.isArray(resource.tags)) {
          resource.tags.forEach(tag => newTags.add(tag));
        }
      });
      
      // Extract and add new subcategories
      const newSubcats = new Set();
      newResources.forEach(resource => {
        if (resource.subcategory) {
          newSubcats.add(resource.subcategory);
        }
      });
      
      setAllTags(prev => Array.from(new Set([...prev, ...Array.from(newTags)])));
      setSubcategories(prev => Array.from(new Set([...prev, ...Array.from(newSubcats)])));
    } catch (error) {
      console.error('Error loading more resources:', error);
      toast.error('Failed to load more resources');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tag toggle
  const handleTagToggle = (tag) => {
    // Create a copy of the current selected tags
    let newTags = [...selectedTags];
    
    // Check if tag is already selected
    if (newTags.includes(tag)) {
      // Remove tag if already selected
      newTags = newTags.filter(t => t !== tag);
    } else {
      // Add tag if not already selected
      newTags.push(tag);
    }
    
    // Update URL with new tags
    const params = new URLSearchParams(location.search);
    
    if (newTags.length > 0) {
      params.set('tag', newTags.join(','));
    } else {
      params.delete('tag');
    }
    
    // Keep other parameters
    const searchParam = params.get('search');
    const subcategoryParam = params.get('subcategory');
    
    // Preserve filter parameter if it exists
    if (params.has('filter')) {
      params.set('filter', 'true');
    }
    
    // Navigate to updated URL
    navigate({
      pathname: `/category/${category}`,
      search: params.toString()
    });
    
    // Update state
    setSelectedTags(newTags);
    
    // Reset pagination
    setPage(0);
    setResources([]);
    setHasMore(true);
  };
  
  // Handle subcategory toggle
  const handleSubcategorySelect = (subcategory) => {
    const params = new URLSearchParams(location.search);
    
    if (selectedSubcategory === subcategory) {
      // Deselect if already selected
      params.delete('subcategory');
      setSelectedSubcategory(null);
    } else {
      // Select new subcategory
      params.set('subcategory', subcategory);
      setSelectedSubcategory(subcategory);
    }
    
    // Keep existing search term if any
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    // Keep existing tags if any
    if (selectedTags.length > 0) {
      params.set('tag', selectedTags.join(','));
    }
    
    // Preserve filter parameter if it exists
    if (params.has('filter')) {
      params.set('filter', 'true');
    }
    
    // Update URL and trigger a page fetch
    navigate(`/category/${category}?${params.toString()}`);
    
    // Reset pagination
    setPage(0);
    setResources([]);
    setHasMore(true);
  };
  
  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Update URL with search query
    const queryParams = new URLSearchParams(location.search);
    
    if (query) {
      queryParams.set('search', query);
    } else {
      queryParams.delete('search');
    }
    
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedSubcategory(null);
    setPage(0);
    setResources([]);
    setHasMore(true);
    
    // Navigate without any query parameters
    navigate(`/category/${category}`);
    
    // Fetch fresh data
    fetchData();
  };
  
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation */}
      <div className="flex items-center mb-6 text-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-lime-accent transition-colors mr-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>{t('common.back', 'Back')}</span>
        </button>
        
        <div className="flex items-center text-gray-400">
          <Link to="/" className="flex items-center hover:text-lime-accent transition-colors">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>{t('common.home', 'Home')}</span>
          </Link>
          
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          
          <Link 
            to="/category/all" 
            className={`hover:text-lime-accent transition-colors ${
              category === 'all' && !selectedSubcategory ? 'text-lime-accent' : ''
            }`}
          >
            {t('common.resources', 'Resources')}
          </Link>
          
          {category !== 'all' && (
            <>
              <ChevronRightIcon className="h-3 w-3 mx-2" />
              <Link 
                to={`/category/${category}`}
                className={`hover:text-lime-accent transition-colors ${
                  !selectedSubcategory ? 'text-lime-accent' : ''
                }`}
              >
                {t(`categories.${category}`, categoryData?.name || category)}
              </Link>
            </>
          )}
          
          {selectedSubcategory && (
            <>
              <ChevronRightIcon className="h-3 w-3 mx-2" />
              <span className="text-lime-accent">{t(`subcategories.${selectedSubcategory}`, selectedSubcategory)}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category === 'all' ? 'All Resources' : categoryData?.name || category}
          {selectedSubcategory && <span className="text-lime-accent"> / {selectedSubcategory}</span>}
        </h1>
        <p className="text-gray-300">
          {category === 'all' 
            ? 'Browse our curated collection of resources' 
            : categoryData?.description || `Browse our curated collection of ${category} resources`}
        </p>
      </div>
      
      <div className="glass-card p-4 mb-8">
        <div className="mb-4">
          <SearchBar 
            initialValue={searchQuery}
            onSearch={handleSearch}
            placeholder="Search in this category..."
          />
        </div>
        
        <FilterTags 
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={handleTagToggle}
          onClearFilters={clearFilters}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bfff58]"></div>
        </div>
      ) : resources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                delay={index % 9} // Stagger animation in groups of 9
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-8 text-center">
              <button 
                onClick={loadMore}
                className="px-6 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full text-white transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No resources found matching your criteria.</p>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full text-white text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
