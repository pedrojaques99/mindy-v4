import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShareIcon, ExternalLinkIcon, ChatAltIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import GlassCard from './ui/GlassCard';
import AutoThumbnail from './ui/AutoThumbnail';
import SoftwareIcon from './ui/SoftwareIcon';
import { getWebsiteThumbnail, getWebsiteFavicon } from '../utils/thumbnailUtils';

export default function ResourceCard({ resource, delay = 0 }) {
  const { user } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(resource?.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(resource.image_url || null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    // Check if resource is favorited
    if (user && resource) {
      const checkFavorite = async () => {
        const { data, error } = await supabase
          .from('favorites')
          .select()
          .eq('user_id', user.id)
          .eq('resource_id', resource.id)
          .maybeSingle();
          
        if (!error && data) {
          setIsFavorited(true);
        }
      };
      
      checkFavorite();
    }
    
    // Fetch comment count
    fetchCommentCount();
  }, [user, resource]);
  
  // Fetch comment count
  const fetchCommentCount = async () => {
    if (!resource?.id) return;
    
    try {
      const { count, error } = await supabase
        .from('comments')
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
    
    try {
      await supabase
        .from('resource_views')
        .insert([
          { resource_id: resource.id, user_id: user.id }
        ]);
        
      // Update popularity
      try {
        await supabase.rpc('increment_popularity', { resource_id: resource.id });
      } catch (error) {
        console.error('Error incrementing popularity:', error);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };
  
  // Toggle favorite
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast(t('auth.signInRequired'), { icon: '🔒' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resource.id);
          
        if (error) throw error;
        
        setIsFavorited(false);
        toast(t('resource.removedFromFavorites'), { icon: '💔' });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, resource_id: resource.id }
          ]);
          
        if (error) throw error;
        
        setIsFavorited(true);
        toast(t('resource.addedToFavorites'), { icon: '❤️' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
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
          url: shareUrl,
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
    navigator.clipboard.writeText(text);
    toast(t('resource.share.copied'), { icon: '📋' });
  };
  
  // Handle card click
  const handleCardClick = () => {
    // Track view
    trackView();
    
    // Navigate to resource page
    navigate(`/resource/${resource.id}`);
  };
  
  // Handle comments click
  const handleCommentsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to resource page with comments tab active
    navigate(`/resource/${resource.id}?tab=comments`);
  };
  
  // Handle tag click
  const handleTagClick = (e, tag) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure tag is properly encoded for URL
    const encodedTag = encodeURIComponent(tag.trim());
    navigate(`/category/all?tag=${encodedTag}`);
  };
  
  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
    
    // Clear the thumbnailUrl on error to ensure we fall back to the generated thumbnail
    if (thumbnailUrl) {
      console.log(`Thumbnail error for resource: ${resource.title}`);
      setThumbnailUrl(null);
    }
  };
  
  if (!resource) return null;
  
  // External URL click
  const openExternalUrl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (resource.url) {
      trackView();
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Fetch website thumbnail and favicon when component mounts
  useEffect(() => {
    if (!resource.image_url && resource.url) {
      // Get website thumbnail
      try {
        const thumbnail = getWebsiteThumbnail(resource.url, { size: 'medium' });
        if (thumbnail) {
          setThumbnailUrl(thumbnail);
        }
      } catch (error) {
        console.error('Error getting website thumbnail:', error);
      }
      
      // Get website favicon
      try {
        const favicon = getWebsiteFavicon(resource.url);
        if (favicon) {
          setFaviconUrl(favicon);
        }
      } catch (error) {
        console.error('Error getting website favicon:', error);
      }
    }
  }, [resource.url, resource.image_url, resource.id]);
  
  return (
    <>
      <div 
        className="group"
        style={{ animationDelay: `${delay * 0.1}s` }}
      >
        <GlassCard 
          className="relative overflow-hidden transition-all duration-300 cursor-pointer h-full"
          aria-label={t('resource.cardAriaLabel', { title: resource.title })}
        >
          <div 
            className="h-full w-full"
            onClick={handleCardClick}
          >
            {/* Spotlight effect */}
            <div className="spotlight" style={{ '--x': '50%', '--y': '50%' }}></div>
            
            {/* Resource Image */}
            <div className="relative aspect-video overflow-hidden rounded-t-xl bg-dark-300/50">
              <AutoThumbnail 
                src={thumbnailUrl} 
                alt={resource.title}
                url={resource.url}
                title={resource.title}
                category={resource.category || ''}
                subcategory={resource.subcategory || ''}
                tags={resource.tags || []}
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
                  aria-label={t(isFavorited ? 'resource.removeFavorite' : 'resource.addFavorite')}
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-white" />
                  )}
                </button>
                
                <button 
                  onClick={shareResource}
                  className="p-1.5 rounded-full bg-dark-100/70 backdrop-blur-sm text-white/80 hover:text-lime-accent transition-colors duration-200"
                  aria-label={t('resource.share')}
                >
                  <ShareIcon className="w-4 h-4 text-white" />
                </button>
                
                <button 
                  onClick={openExternalUrl}
                  className="p-1.5 rounded-full bg-dark-100/70 backdrop-blur-sm text-white/80 hover:text-lime-accent transition-colors duration-200"
                  aria-label={t('resource.visit')}
                >
                  <ExternalLinkIcon className="w-4 h-4 text-white" />
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
                    <button 
                      key={index} 
                      className="tag hover:bg-glass-200 transition-colors"
                      onClick={(e) => handleTagClick(e, tag)}
                    >
                      {tag.includes(':') ? (
                        <SoftwareIcon name={tag.split(':')[1]} className="mr-1" />
                      ) : null}
                      {tag.includes(':') ? tag.split(':')[1] : tag}
                    </button>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="tag">+{resource.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              {/* Footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <button 
                  className="flex items-center hover:text-white transition-colors"
                  onClick={handleCommentsClick}
                >
                  <ChatAltIcon className="w-3.5 h-3.5 mr-1" />
                  <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
                </button>
                
                <div className="flex items-center">
                  <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                  <span className="truncate max-w-[120px]">
                    {resource.url ? (
                      (() => {
                        try {
                          // Ensure URL has a protocol
                          const urlToProcess = resource.url.startsWith('http') 
                            ? resource.url 
                            : `https://${resource.url}`;
                          return new URL(urlToProcess).hostname.replace('www.', '');
                        } catch (error) {
                          console.error('Invalid URL:', resource.url);
                          return 'Invalid URL';
                        }
                      })()
                    ) : 'No URL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
} 