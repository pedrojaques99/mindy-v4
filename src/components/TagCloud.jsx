import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../main';

export default function TagCloud({ tags: propTags, selectedTags, onTagClick }) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // If tags are provided as props, use them
  useEffect(() => {
    if (propTags) {
      setTags(propTags.map(tag => ({ tag, count: 1 })));
      setIsLoading(false);
    } else {
      fetchTags();
    }
  }, [propTags]);
  
  const fetchTags = async () => {
    setIsLoading(true);
    
    try {
      // Get all resources with tags
      const { data, error } = await supabase
        .from('resources')
        .select('tags');
        
      if (error) throw error;
      
      // Count tag occurrences
      const tagCounts = {};
      data.forEach(resource => {
        if (Array.isArray(resource.tags)) {
          resource.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 tags
      
      setTags(sortedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTagClick = (tag) => {
    if (onTagClick) {
      // If onTagClick is provided, use it (for filtering)
      onTagClick(tag);
    } else {
      // Otherwise, navigate to search results
      navigate(`/category/all?tag=${encodeURIComponent(tag)}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.1)] border-t-[#bfff58] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedTags?.includes(tag)
              ? 'bg-[#bfff58]/20 text-[#bfff58]'
              : 'bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'
          }`}
        >
          {tag} {count > 1 && <span className="text-xs opacity-70">({count})</span>}
        </button>
      ))}
      
      {tags.length === 0 && (
        <p className="text-gray-400 text-sm">No tags found</p>
      )}
    </div>
  );
} 