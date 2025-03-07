import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ResourceCard from '../components/ResourceCard';
import CategoryBrowser from '../components/CategoryBrowser';
import FeaturedResourceSlider from '../components/FeaturedResourceSlider';
import FilterTags from '../components/FilterTags';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { session, handleResourcePreview } = useOutletContext();
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch resources and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
        
        // Fetch resources
        let query = supabase
          .from('resources')
          .select(`
            *,
            categories(*),
            profiles(username, avatar_url),
            comments(count)
          `)
          .order('created_at', { ascending: false });
          
        // Apply category filter if selected
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        
        const { data: resourcesData, error: resourcesError } = await query;
        
        if (resourcesError) throw resourcesError;
        
        // Extract all unique tags
        const allTags = resourcesData
          .flatMap(resource => resource.tags || [])
          .filter((tag, index, self) => self.indexOf(tag) === index);
          
        setAvailableTags(allTags);
        
        // Filter by selected tags if any
        let filteredResources = resourcesData;
        if (selectedTags.length > 0) {
          filteredResources = resourcesData.filter(resource => 
            resource.tags && selectedTags.every(tag => resource.tags.includes(tag))
          );
        }
        
        // Get featured resources (top 5 with highest upvotes)
        const featured = [...resourcesData]
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 5);
          
        setFeaturedResources(featured);
        setResources(filteredResources);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory, selectedTags]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };
  
  // Handle tag selection
  const handleTagSelect = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <FeaturedResourceSlider 
          resources={featuredResources} 
          onResourceClick={handleResourcePreview}
        />
      )}
      
      {/* Categories */}
      <CategoryBrowser 
        categories={categories} 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      
      {/* Filters */}
      {availableTags.length > 0 && (
        <FilterTags 
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onClearFilters={clearFilters}
        />
      )}
      
      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-lime-accent">Loading resources...</div>
        </div>
      ) : resources.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {resources.map(resource => (
            <motion.div key={resource.id} variants={itemVariants}>
              <ResourceCard 
                resource={resource} 
                onCardClick={() => handleResourcePreview(resource)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-dark-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No resources found</h3>
          <p className="text-gray-400 mb-4">
            {selectedCategory || selectedTags.length > 0 
              ? "Try changing your filters or category selection."
              : "Be the first to add resources to this collection!"}
          </p>
          {(selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
