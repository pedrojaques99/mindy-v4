import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShareIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import GlassCard from './ui/GlassCard';

export default function ResourceCard({ resource, delay = 0 }) {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(resource.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate placeholder thumbnail if none exists
  const thumbnail = resource.image_url || 
    `https://via.placeholder.com/300x200/1a1a1a/bfff58?text=${encodeURIComponent(resource.title.substring(0, 15))}`;
  
  // Track resource view
  const trackView = async () => {
    if (!user) return;
    
    await supabase
      .from('resource_views')
      .insert([
        { resource_id: resource.id, user_id: user.id }
      ]);
      
    // Update popularity
    await supabase
      .rpc('increment_popularity', { resource_id: resource.id })
      .catch(error => console.error('Error incrementing popularity:', error));
  };
  
  // Toggle favorite
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast('Please sign in to save favorites', { icon: '🔒' });
      return;
    }
    
    setIsLoading(true);
    
    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resource.id);
        
      if (!error) {
        setIsFavorited(false);
        toast('Removed from favorites', { icon: '💔' });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: user.id, resource_id: resource.id }
        ]);
        
      if (!error) {
        setIsFavorited(true);
        toast('Added to favorites', { icon: '❤️' });
      }
    }
    
    setIsLoading(false);
  };
  
  // Share resource
  const shareResource = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: `/resource/${resource.id}`,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(`${window.location.origin}/resource/${resource.id}`);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={trackView}
    >
      <GlassCard 
        className="h-full overflow-hidden hover:border-[#bfff58]/50 transition-all duration-300"
        hoverEffect={true}
        delay={delay}
      >
        <div className="relative aspect-video">
          <img 
            src={thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a1a1a]/90 to-transparent p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#bfff58]/20 text-[#bfff58]">
                {resource.subcategory}
              </span>
              
              <div className="flex space-x-2">
                <button 
                  onClick={toggleFavorite}
                  disabled={isLoading}
                  className="p-1.5 rounded-full bg-[#222222]/80 backdrop-blur-sm hover:bg-[#2a2a2a]/80 transition-colors"
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-4 h-4 text-[#bfff58]" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-white" />
                  )}
                </button>
                
                <button 
                  onClick={shareResource}
                  className="p-1.5 rounded-full bg-[#222222]/80 backdrop-blur-sm hover:bg-[#2a2a2a]/80 transition-colors"
                >
                  <ShareIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-white line-clamp-1 mb-1">
            {resource.title}
          </h3>
          
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">
            {resource.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {resource.tags && resource.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300"
              >
                {tag}
              </span>
            ))}
            
            {resource.tags && resource.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </a>
  );
} 