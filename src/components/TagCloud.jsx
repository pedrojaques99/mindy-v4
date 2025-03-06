import { useState, useEffect } from 'react';
import { supabase } from '../main';

export default function TagCloud() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
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
    
    fetchTags();
  }, []);
  
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
        <a
          key={tag}
          href={`/?tag=${tag}`}
          className="px-3 py-1 text-sm rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          {tag} <span className="text-xs opacity-70">({count})</span>
        </a>
      ))}
      
      {tags.length === 0 && (
        <p className="text-gray-400 text-sm">No tags found</p>
      )}
    </div>
  );
} 