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
  const shareResource = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/resource/${resource.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast('Link copied to clipboard', { icon: '🔗' }))
      .catch(error => console.error('Error copying to clipboard:', error));
  };
  
  // Handle card click
  const handleCardClick = (e) => {
    // If the click is on a button, don't open the preview
    if (e.target.closest('button')) return;
    
    // Track view
    trackView();
    
    // Show preview modal
    setShowPreview(true);
  };
  
  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    
    // Try to get a thumbnail from the URL
    if (resource.url) {
      const thumbnail = getWebsiteThumbnail(resource.url, { size: 'medium' });
      if (thumbnail) {
        setThumbnailUrl(thumbnail);
      }
    }
  };
  
  return (
    <>
      <div 
        className="group"
        style={{ animationDelay: `${delay * 0.1}s` }}
      >
        <GlassCard 
          onClick={handleCardClick}
          className="relative overflow-hidden transition-all duration-300 cursor-pointer h-full"
        >
          {/* Spotlight effect */}
          <div className="spotlight" style={{ '--x': '50%', '--y': '50%' }}></div>
          
          {/* Resource Image */}
          <div className="relative aspect-video overflow-hidden rounded-t-xl bg-dark-300/50">
            <AutoThumbnail 
              src={thumbnailUrl} 
              alt={resource.title}
              url={resource.url}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Favicon */}
            {faviconUrl && (
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-dark-100/80 backdrop-blur-sm p-1 shadow-lg">
                <img 
                  src={faviconUrl} 
                  alt="Site icon" 
                  className="w-full h-full object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            
            {/* Actions */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <button 
                onClick={toggleFavorite}
                disabled={isLoading}
                className="p-1.5 rounded-full bg-dark-100/70 backdrop-blur-sm text-white/80 hover:text-lime-accent transition-colors duration-200"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? (
                  <HeartSolidIcon className="w-4 h-4 text-lime-accent" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </button>
              
              <button 
                onClick={shareResource}
                className="p-1.5 rounded-full bg-dark-100/70 backdrop-blur-sm text-white/80 hover:text-lime-accent transition-colors duration-200"
                aria-label="Share resource"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-white group-hover:text-lime-accent transition-colors duration-200 line-clamp-2">
                {resource.title}
              </h3>
            </div>
            
            <p className="mt-1 text-sm text-white/60 line-clamp-2">
              {resource.description}
            </p>
            
            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag">
                    {tag.includes(':') ? (
                      <SoftwareIcon name={tag.split(':')[1]} className="mr-1" />
                    ) : null}
                    {tag.includes(':') ? tag.split(':')[1] : tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="tag">+{resource.tags.length - 3}</span>
                )}
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-white/50">
              <div className="flex items-center">
                <ChatAltIcon className="w-3.5 h-3.5 mr-1" />
                <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center">
                <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                <span className="truncate max-w-[120px]">
                  {resource.url ? new URL(resource.url).hostname.replace('www.', '') : 'No URL'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Resource Preview Modal */}
      {showPreview && (
        <ResourcePreviewModal
          resource={resource}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
} 