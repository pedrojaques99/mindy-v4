import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ExternalLinkIcon, 
  HeartIcon, 
  ShareIcon,
  ClockIcon,
  UserIcon,
  ThumbUpIcon,
  ChatIcon,
  TagIcon,
  ChatAltIcon,
  RefreshIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import SoftwareIcon from '../components/ui/SoftwareIcon';
import AutoThumbnail from '../components/ui/AutoThumbnail';
import CommentSection from '../components/CommentSection';
import RelatedResources from '../components/RelatedResources';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { getResourceThumbnails } from '../utils/thumbnailUtils';
import { getResourceById, trackResourceView, toggleFavorite } from '../utils/resourceUtils';

export default function ResourcePage() {
  const { id } = useParams();
  const { user } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState(null);

  // Set initial page title
  useEffect(() => {
    document.title = `${t('resource.viewingResource')} | Mindy`;
  }, [t]);
  
  // Update title when resource loads
  useEffect(() => {
    if (resource) {
      document.title = `${resource.title} | Mindy`;
    }
  }, [resource]);
  
  // Check for tab in URL
  useEffect(() => {
    // Just reset the view when location changes
    if (location.search) {
      window.scrollTo(0, 0);
    }
  }, [location]);
  
  // Fetch resource details
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      setIsLoading(true);
      setError(null);
      
      try {
        // Use our utility function to get the resource by ID
        const result = await getResourceById(id);
        
        if (!result.success) {
          setError(result.message || t('errors.errorLoadingResource', 'Error loading resource'));
          setIsLoading(false);
          return;
        }
        
        const resourceData = result.data;
        
        console.log('Resource data loaded successfully:', resourceData);
        setResource(resourceData);
        
        // Get thumbnail and favicon
        const { thumbnailUrl: thumbUrl, faviconUrl: favUrl } = getResourceThumbnails(resourceData);
        setThumbnailUrl(thumbUrl);
        setFaviconUrl(favUrl);
        
        // Track view
        if (user) {
          trackResourceView(resourceData.id, user.id);
        }
        
        // Check if favorited
        if (user) {
          checkFavoriteStatus(resourceData.id);
        }
        
        // Fetch related resources and comments
        if (resourceData && resourceData.id) {
          // Fetch related resources
          fetchRelatedResources(resourceData);
          
          // Fetch comments
          fetchComments(resourceData.id);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message || t('errors.errorLoadingResource', 'Error loading resource'));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, user, t]);
  
  // Check if the resource is favorited by the user
  const checkFavoriteStatus = async (resourceId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .maybeSingle();
        
      if (!error && data) {
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };
  
  // Fetch related resources
  const fetchRelatedResources = async (currentResource) => {
    if (!currentResource?.id || !currentResource?.category) {
      console.log('Cannot fetch related resources: Invalid resource data', {
        id: currentResource?.id,
        category: currentResource?.category
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('category', currentResource.category)
        .neq('id', currentResource.id)
        .limit(4);
        
      if (error) throw error;
      
      if (data) {
        setRelatedResources(data);
      }
    } catch (error) {
      console.error('Error fetching related resources:', error);
    }
  };
  
  // Fetch comments
  const fetchComments = async (resourceId) => {
    if (!resourceId) return;
    
    setIsLoadingComments(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(t('common.error.comments', 'Failed to load comments'));
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  // Toggle favorite using our utility function
  const handleToggleFavorite = async () => {
    if (!user) {
      toast(t('auth.signInRequired'), { icon: '🔒' });
      return;
    }
    
    setIsLoadingFavorite(true);
    
    try {
      const result = await toggleFavorite(resource.id, user.id, isFavorited);
      
      if (result.success) {
        setIsFavorited(result.isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  
  // Share resource
  const shareResource = () => {
    const shareUrl = `${window.location.origin}/resource/${resource.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: shareUrl,
      })
      .catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast(t('resource.share.copied'), { icon: '📋' });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast(t('resource.share.copied'), { icon: '📋' });
    }
  };
  
  // Navigate to tag filter
  const handleTagClick = (tag) => {
    // Ensure tag is properly encoded for URL
    const encodedTag = encodeURIComponent(tag.trim());
    navigate(`/category/all?tag=${encodedTag}`);
  };
  
  // Open external URL
  const openExternalUrl = () => {
    if (resource?.url) {
      // Track view before opening external URL
      if (user) {
        trackResourceView(resource.id, user.id);
      }
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareTags = ['figma', 'photoshop', 'illustrator', 'after-effects', 'premiere', 'blender', 'cursor', 'indesign'];
    return softwareTags.includes(tag.toLowerCase());
  };
  
  // Handle back button click
  const handleBack = () => {
    // Check if we have a previous location in history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      // If no history, go to home page
      navigate('/');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-lime-accent border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">{t('errors.error', 'Error')}</h1>
        <p className="text-gray-400 mb-8">{error}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-lime-accent text-dark-900 rounded-md flex items-center"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            {t('common.retry', 'Retry')}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-dark-300 text-white rounded-md flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('common.backToHome', 'Back to Home')}
          </button>
        </div>
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">{t('errors.resourceNotFound')}</h1>
        <p className="text-gray-400 mb-8">{t('errors.resourceNotFoundDesc')}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-dark-300 text-white rounded-md flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {t('common.backToHome')}
        </button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>
          {resource 
            ? `${resource.title} - Mindy`
            : t('resource.loading')}
        </title>
        <meta 
          name="description" 
          content={resource ? `${resource.title} - View details and related resources` : ''} 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Back button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            {t('ui.back')}
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggleFavorite}
              disabled={isLoadingFavorite}
              className="flex items-center px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              aria-label={t(isFavorited ? 'resource.removeFavorite' : 'resource.addFavorite')}
            >
              {isFavorited ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500 mr-2" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400 mr-2" />
              )}
              {t(isFavorited ? 'resource.saved' : 'resource.save')}
            </button>
            
            <button 
              onClick={shareResource}
              className="flex items-center px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              aria-label={t('resource.share')}
            >
              <ShareIcon className="w-5 h-5 text-gray-400 mr-2" />
              {t('resource.share')}
            </button>
            
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openExternalUrl}
              className="flex items-center px-4 py-2 rounded-lg bg-lime-accent text-dark-900 hover:bg-lime-accent/90 transition-colors"
            >
              <ExternalLinkIcon className="w-5 h-5 mr-2" />
              {t('resource.visitWebsite')}
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Resource header */}
            <div className="bg-dark-200 rounded-xl overflow-hidden shadow-xl">
              {/* Resource image */}
              <div className="relative h-56 md:h-96 overflow-hidden">
                {resource.image_url ? (
                  <img 
                    src={resource.image_url} 
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AutoThumbnail 
                    src={thumbnailUrl}
                    alt={resource.title}
                    url={resource.url}
                    title={resource.title}
                    category={resource.category || ''}
                    subcategory={resource.subcategory || ''}
                    tags={resource.tags || []}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Thumbnail error in ResourcePage:', e);
                      setThumbnailUrl(null);
                    }}
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent"></div>
                
                {/* Action buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{resource.title}</h1>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleToggleFavorite}
                      disabled={isLoadingFavorite}
                      className="p-3 rounded-full bg-dark-300/80 hover:bg-dark-400 transition-colors"
                      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorited ? (
                        <HeartSolidIcon className="w-6 h-6 text-lime-accent" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-white" />
                      )}
                    </button>
                    
                    <button 
                      onClick={shareResource}
                      className="p-3 rounded-full bg-dark-300/80 hover:bg-dark-400 transition-colors"
                      aria-label="Share resource"
                    >
                      <ShareIcon className="w-6 h-6 text-white" />
                    </button>
                    
                    <button
                      onClick={openExternalUrl}
                      className="px-5 py-3 bg-lime-accent text-dark-100 rounded-lg text-sm font-medium hover:bg-lime-accent/90 transition-colors flex items-center shadow-lg"
                    >
                      Visit Website
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Remove tabs navigation, show details directly */}
              <div className="p-6">
                <div className="space-y-8">
                  {/* Description */}
                  {resource.description && (
                    <div>
                      <h2 className="text-xl font-medium mb-4 text-white">{t('resource.description')}</h2>
                      <p className="text-gray-300 leading-relaxed">{resource.description}</p>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-4 text-white flex items-center">
                        <TagIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {t('resource.tags')}
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {resource.tags.map((tag) => {
                          // Check if tag has a translation
                          const translatedTag = t(`tags.${tag.toLowerCase()}`, tag);
                          
                          return (
                            <button
                              key={tag}
                              onClick={() => handleTagClick(tag)}
                              className="flex items-center px-4 py-2 rounded-md bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {isSoftwareTag(tag) && (
                                <SoftwareIcon name={tag} className="mr-2 w-4 h-4" />
                              )}
                              {translatedTag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categories */}
                    {(resource.category || resource.subcategory) && (
                      <div>
                        <h2 className="text-lg font-medium mb-4 text-white">{t('resource.category')}</h2>
                        <div className="flex flex-wrap gap-3">
                          {resource.category && (
                            <button
                              onClick={() => navigate(`/category/${resource.category}`)}
                              className="px-4 py-2 rounded-md bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.category}
                            </button>
                          )}
                          
                          {resource.subcategory && (
                            <button
                              onClick={() => navigate(`/category/all?subcategory=${resource.subcategory}`)}
                              className="px-4 py-2 rounded-md bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.subcategory}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div>
                      <h2 className="text-lg font-medium mb-4 text-white">{t('resource.details')}</h2>
                      <ul className="space-y-4 text-sm text-gray-300">
                        {resource.created_at && (
                          <li className="flex items-center">
                            <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{t('resource.date')}: {new Date(resource.created_at).toLocaleDateString()}</span>
                          </li>
                        )}
                        
                        {resource.author && (
                          <li className="flex items-center">
                            <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{t('resource.author')}: {resource.author}</span>
                          </li>
                        )}
                        
                        <li className="flex items-center">
                          <ThumbUpIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{t('resource.likes')}: {resource.likes_count || 0}</span>
                        </li>
                        
                        {resource.url && (
                          <li className="flex items-center">
                            <ExternalLinkIcon className="w-5 h-5 mr-3 text-gray-400" />
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-lime-accent hover:underline"
                            >
                              {new URL(resource.url).hostname.replace('www.', '')}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments section - now outside the tabs */}
            <div className="bg-dark-200 rounded-xl overflow-hidden shadow-xl p-6 mt-8">
              <h2 className="text-xl font-medium mb-4 text-white flex items-center">
                <ChatAltIcon className="w-5 h-5 mr-2 text-gray-400" />
                {t('resource.comments')} ({comments.length})
              </h2>
              <CommentSection 
                resourceId={resource.id}
                comments={comments}
                setComments={setComments}
                isLoading={isLoadingComments}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related resources */}
            <div className="bg-dark-200 rounded-xl overflow-hidden shadow-xl p-6">
              <h2 className="text-lg font-medium mb-4 text-white">{t('resource.related')}</h2>
              {relatedResources.length > 0 ? (
                <div className="space-y-4">
                  <RelatedResources resources={relatedResources} />
                </div>
              ) : (
                <p className="text-gray-400">{t('resource.noRelated')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 