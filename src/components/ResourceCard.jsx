import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShareIcon, ExternalLinkIcon, ChatAltIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import GlassCard from './ui/GlassCard';
import AutoThumbnail from './ui/AutoThumbnail';
import SoftwareIcon from './ui/SoftwareIcon';
import ResourcePreviewModal from './ResourcePreviewModal';
import { getWebsiteThumbnail, getWebsiteFavicon } from '../utils/thumbnailUtils';

export default function ResourceCard({ resource, delay = 0 }) {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(resource.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(!resource.image_url);
  const [thumbnailUrl, setThumbnailUrl] = useState(resource.image_url || null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  // Fetch website thumbnail and favicon when component mounts
  useEffect(() => {
    if (!resource.image_url && resource.url) {
      // Get website thumbnail
      const thumbnail = getWebsiteThumbnail(resource.url, { size: 'medium' });
      if (thumbnail) {
        setThumbnailUrl(thumbnail);
      }
      
      // Get website favicon
      const favicon = getWebsiteFavicon(resource.url);
      if (favicon) {
        setFaviconUrl(favicon);
      }
    }
    
    // Fetch comment count
    fetchCommentCount();
  }, [resource.url, resource.image_url, resource.id]);
  
  // Fetch comment count
  const fetchCommentCount = async () => {
    if (!resource.id) return;
    
    try {
      const { count, error } = await supabase
        .from('resource_comments')
        .select('id', { count: 'exact' })
        .eq('resource_id', resource.id);
        
      if (error) throw error;
      
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };
  
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
        url: resource.url,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(resource.url);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode'];
    return softwareNames.includes(tag.toLowerCase());
  };
  
  // Open preview modal
  const openPreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
    trackView();
  };
  
  return (
    <>
      <div onClick={openPreview}>
        <GlassCard 
          className="h-full overflow-hidden hover:border-[#bfff58]/50 transition-all duration-300 cursor-pointer"
          hoverEffect={true}
          delay={delay}
          glowOnHover={true}
        >
          <div className="relative aspect-video">
            {thumbnailUrl && !imageError ? (
              <img 
                src={thumbnailUrl} 
                alt={resource.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <AutoThumbnail 
                title={resource.title}
                category={resource.category}
                subcategory={resource.subcategory}
                tags={resource.tags}
                className="w-full h-full"
              />
            )}
            
            {/* Favicon overlay */}
            {faviconUrl && (
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm p-0.5">
                <img 
                  src={faviconUrl} 
                  alt="Site favicon" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            )}
            
            {/* Preview overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-lime-accent/20 text-lime-accent border border-lime-accent/30 flex items-center">
                Preview Resource
                <ExternalLinkIcon className="w-4 h-4 ml-1" />
              </span>
            </div>
            
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
            <h3 className="font-bold text-lg text-white line-clamp-1 mb-1 flex items-center gap-2">
              {resource.title}
              <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
            </h3>
            
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
              {resource.description}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {resource.tags && resource.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300"
                  >
                    {isSoftwareTag(tag) ? (
                      <SoftwareIcon name={tag} />
                    ) : (
                      tag
                    )}
                  </span>
                ))}
                
                {resource.tags && resource.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>
              
              {/* Comment count */}
              {commentCount > 0 && (
                <div className="flex items-center text-gray-400 text-xs">
                  <ChatAltIcon className="w-4 h-4 mr-1" />
                  <span>{commentCount}</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Preview Modal */}
      <ResourcePreviewModal 
        resource={resource}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
} 