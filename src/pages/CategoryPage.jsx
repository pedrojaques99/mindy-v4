import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import SearchBar from '../components/SearchBar';
import TagCloud from '../components/TagCloud';
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
  const [allTags, setAllTags] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;
  
  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    const tagParam = queryParams.get('tag');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (tagParam) {
      setSelectedTags([tagParam]);
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
      
      // Fetch category data
      if (category !== 'all') {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', category)
          .single();
          
        if (catError) throw catError;
        setCategoryData(catData);
      }
      
      // Fetch resources with pagination
      let query = supabase
        .from('resources')
        .select('*')
        .range(page * ITEMS_PER_PAGE, (page * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);
      
      // Apply category filter
      if (category !== 'all') {
        // Get category ID
        const { data: catIdData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single();
          
        if (catIdData) {
          query = query.eq('category', catIdData.id);
        }
      }
      
      // Apply search query filter if present in URL
      const urlParams = new URLSearchParams(location.search);
      const urlSearchQuery = urlParams.get('search');
      if (urlSearchQuery) {
        query = query.or(`title.ilike.%${urlSearchQuery}%,description.ilike.%${urlSearchQuery}%`);
      }
      
      const { data: resourcesData, error: resourcesError } = await query;
      
      if (resourcesError) throw resourcesError;
      
      if (resourcesData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Filter by tag if present in URL
      const urlTagQuery = urlParams.get('tag');
      let filteredResources = resourcesData;
      
      if (urlTagQuery) {
        filteredResources = resourcesData.filter(resource => 
          resource.tags && resource.tags.includes(urlTagQuery)
        );
      }
      
      setResources(prev => [...prev, ...filteredResources]);
      
      // Extract all unique tags
      const tags = new Set();
      resourcesData?.forEach(resource => {
        resource.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(prev => Array.from(new Set([...prev, ...Array.from(tags)])));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchData();
  };
  
  // Filter resources based on search and tags
  const filteredResources = resources.filter(resource => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => resource.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    
    // Update URL with selected tag
    const params = new URLSearchParams(location.search);
    if (!prev.includes(tag)) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    
    // Clear URL parameters
    navigate(location.pathname);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category === 'all' 
            ? 'All Resources' 
            : categoryData?.name || 'Loading...'}
        </h1>
        <p className="text-white/70">
          {categoryData?.description || 
            'Browse our curated collection of resources'}
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search resources..."
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button 
              onClick={clearFilters}
              className="btn btn-secondary"
              disabled={!searchQuery && selectedTags.length === 0}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Tags */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Filter by tags:</h3>
          <TagCloud 
            tags={allTags} 
            selectedTags={selectedTags}
            onTagClick={handleTagToggle}
          />
        </div>
      </div>
      
      {/* Resources grid */}
      {loading && resources.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="spinner"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          
          {hasMore && !loading && filteredResources.length === resources.length && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={loadMore}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          
          {loading && resources.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="spinner"></div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-medium mb-4">No resources found</h2>
          <p className="text-white/70 mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button 
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
