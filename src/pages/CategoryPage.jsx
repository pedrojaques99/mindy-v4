import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import SearchBar from '../components/SearchBar';
import FilterTags from '../components/FilterTags';
import ResourceCard from '../components/ResourceCard';
import toast from 'react-hot-toast';

const CategoryPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (tagParam) {
      // Split comma-separated tags into an array
      const tags = tagParam.split(',').map(tag => tag.trim()).filter(Boolean);
      setSelectedTags(tags);
    } else {
      setSelectedTags([]);
    }
    
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    } else {
      setSelectedSubcategory(null);
    }
    
    // Reset pagination when URL changes
    setPage(0);
    setResources([]);
    setHasMore(true);
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
      
      // Fetch resources with pagination
      let query = supabase
        .from('resources')
        .select('*')
        .range(page * ITEMS_PER_PAGE, (page * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);
      
      // Apply category filter
      if (category !== 'all') {
        // Filter directly by category
        query = query.eq('category', category);
      }
      
      // Apply search query filter if present in URL
      const urlParams = new URLSearchParams(location.search);
      const urlSearchQuery = urlParams.get('search');
      if (urlSearchQuery) {
        query = query.or(`title.ilike.%${urlSearchQuery}%,description.ilike.%${urlSearchQuery}%`);
      }
      
      // Apply subcategory filter if present
      const urlSubcategoryQuery = urlParams.get('subcategory');
      if (urlSubcategoryQuery) {
        query = query.eq('subcategory', urlSubcategoryQuery);
      }
      
      const { data: resourcesData, error: resourcesError } = await query;
      
      if (resourcesError) throw resourcesError;
      
      if (resourcesData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Filter by tags if present in URL
      const urlTagQuery = urlParams.get('tag');
      let filteredResources = resourcesData;
      
      if (urlTagQuery) {
        const tags = urlTagQuery.split(',').map(tag => tag.trim()).filter(Boolean);
        
        if (tags.length > 0) {
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
      
      // Fetch next page of resources
      let query = supabase
        .from('resources')
        .select('*')
        .range(nextPage * ITEMS_PER_PAGE, (nextPage * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);
      
      // Apply category filter
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      
      // Apply search query filter if present
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      // Apply subcategory filter if present
      if (selectedSubcategory) {
        query = query.eq('subcategory', selectedSubcategory);
      }
      
      const { data: newResources, error } = await query;
      
      if (error) throw error;
      
      if (newResources.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Filter by selected tags
      let filteredNewResources = newResources;
      
      if (selectedTags.length > 0) {
        filteredNewResources = newResources.filter(resource => {
          // Check if resource has all the selected tags
          return selectedTags.every(tag => resource.tags && resource.tags.includes(tag));
        });
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
    let newSelectedTags;
    
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      // Add tag if not already selected
      newSelectedTags = [...selectedTags, tag];
    }
    
    setSelectedTags(newSelectedTags);
    
    // Update URL with selected tags
    const queryParams = new URLSearchParams(location.search);
    
    if (newSelectedTags.length > 0) {
      queryParams.set('tag', newSelectedTags.join(','));
    } else {
      queryParams.delete('tag');
    }
    
    navigate(`${location.pathname}?${queryParams.toString()}`);
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
    
    // Update URL without reloading page
    navigate(`/category/${category}?${params.toString()}`, { replace: true });
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
    navigate(`/category/${category}`);
  };
  
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
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
