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
import { getResourceById, trackResourceView, toggleFavorite, checkAuthStatus } from '../utils/resourceUtils';

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
      
      if (!id) {
        console.error('Missing resource ID in URL');
        setError(t('errors.missingId', 'Missing resource ID'));
        setIsLoading(false);
        return;
      }
      
      console.log(`ResourcePage: Loading resource with ID: ${id}`);
      
      try {
        // Use our utility function to get the resource by ID
        const result = await getResourceById(id);
        
        if (!result.success) {
          console.error('Error loading resource:', result.message || result.error);
          setError(result.message || t('errors.errorLoadingResource', 'Error loading resource'));
          setIsLoading(false);
          return;
        }
        
        let resourceData = result.data;
        
        // If resourceData is an array, take the first element
        if (Array.isArray(resourceData)) {
          console.log('Resource data came as array, taking first item:', resourceData);
          if (resourceData.length > 0) {
            resourceData = resourceData[0];
          } else {
            console.error('Resource data array is empty');
            setError(t('errors.resourceNotFound', 'Resource not found'));
            setIsLoading(false);
            return;
          }
        }
        
        // Verify we have valid resource data
        if (!resourceData || !resourceData.id) {
          console.error('Invalid resource data returned from Supabase:', resourceData);
          setError(t('errors.invalidData', 'Invalid resource data returned from database'));
          setIsLoading(false);
          return;
        }
        
        console.log('Resource data loaded successfully:', resourceData);
        setResource(resourceData);
        
        // Get thumbnail and favicon
        const { thumbnailUrl: thumbUrl, faviconUrl: favUrl } = getResourceThumbnails(resourceData);
        setThumbnailUrl(thumbUrl);
        setFaviconUrl(favUrl);
        
        // Track view
        if (user) {
          try {
            const result = await trackResourceView(resourceData.id, user.id);
            if (!result.success && !result.policyError) {
              // Log non-policy errors but don't block user experience
              console.warn('Error tracking view (non-critical):', result.error || result.message);
            }
          } catch (trackError) {
            // Just log tracking errors, don't block user experience
            console.warn('Error tracking view (non-critical):', trackError);
          }
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
      // Get current auth status
      const authStatus = checkAuthStatus();
      if (!authStatus.authenticated) {
        console.warn('Cannot check favorite status: Not authenticated');
        return;
      }
      
      console.log(`Checking favorite status for resource ${resourceId}`);
      
      const { data, error } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .maybeSingle();
        
      if (error) {
        // Handle different types of errors
        if (error.code === '401' || error.status === 401) {
          console.error('Authentication error checking favorite status:', error);
          // Don't show error toast as this is a background operation
        } else if (error.code === '42501' || error.message?.includes('policy')) {
          console.error('Permission error checking favorite status:', error);
        } else {
          console.error('Error checking favorite status:', error);
        }
        return;
      }
      
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Unexpected error checking favorite status:', error);
      // Don't show toast for background operations
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
      console.log(`Fetching related resources for: ${currentResource.title} (ID: ${currentResource.id})`);
      
      // Try to get resources in the same category first
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('category', currentResource.category)
        .neq('id', currentResource.id)
        .limit(4);
        
      if (error) {
        console.error('Error fetching related resources by category:', error);
        
        // Fall back to get any resources as a backup
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('resources')
            .select('*')
            .neq('id', currentResource.id)
            .limit(4);
            
          if (fallbackError) {
            console.error('Error fetching fallback related resources:', fallbackError);
            throw fallbackError;
          }
          
          if (fallbackData && fallbackData.length > 0) {
            console.log(`Fetched ${fallbackData.length} fallback related resources`);
            setRelatedResources(fallbackData);
            return;
          }
        } catch (fallbackError) {
          console.error('Error in fallback related resources fetch:', fallbackError);
          // Continue to throw the original error
        }
        
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} related resources in category: ${currentResource.category}`);
        setRelatedResources(data);
      } else {
        // If no resources in the same category, try subcategory
        if (currentResource.subcategory) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('resources')
            .select('*')
            .eq('subcategory', currentResource.subcategory)
            .neq('id', currentResource.id)
            .limit(4);
            
          if (!subcategoryError && subcategoryData && subcategoryData.length > 0) {
            console.log(`Fetched ${subcategoryData.length} related resources by subcategory`);
            setRelatedResources(subcategoryData);
            return;
          }
        }
        
        // If still no results, get any 4 resources
        const { data: anyData, error: anyError } = await supabase
          .from('resources')
          .select('*')
          .neq('id', currentResource.id)
          .limit(4);
          
        if (!anyError && anyData && anyData.length > 0) {
          console.log(`Fetched ${anyData.length} general related resources`);
          setRelatedResources(anyData);
        } else {
          console.log('No related resources found');
          setRelatedResources([]);
        }
      }
    } catch (error) {
      console.error('Error fetching related resources:', error);
      // Set empty array to avoid undefined errors
      setRelatedResources([]);
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
      console.log(`Attempting to toggle favorite for resource ${resource.id} by user ${user.id}`);
      
      // Ensure we have a valid Supabase session - using the updated method
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        console.error('No valid Supabase session found when toggling favorite');
        toast.error(t('auth.sessionExpired', 'Your session has expired. Please sign in again.'));
        setIsLoadingFavorite(false);
        return;
      }
      
      // Call the utility function
      const result = await toggleFavorite(resource.id, user.id, isFavorited);
      
      if (result.success) {
        console.log(`Successfully ${result.isFavorited ? 'added to' : 'removed from'} favorites`);
        setIsFavorited(result.isFavorited);
        toast.success(
          result.isFavorited 
            ? t('resource.favorites.added', 'Added to favorites') 
            : t('resource.favorites.removed', 'Removed from favorites')
        );
      } else if (result.authError) {
        // Handle authentication errors
        console.error('Authentication error when toggling favorite:', result.error);
        toast.error(t('auth.sessionExpired', 'Your session has expired. Please sign in again.'));
      } else if (result.policyError) {
        // Handle row-level security policy errors
        console.error('Policy error when toggling favorite:', result.error);
        
        // Use the message from the result if available, or a default message
        const errorMessage = result.message || t('errors.permissionDenied', 'You do not have permission to perform this action.');
        toast.error(errorMessage);
      } else {
        // Handle other errors
        console.error('Error toggling favorite:', result.error);
        toast.error(result.message || t('common.error', 'An error occurred. Please try again.'));
      }
    } catch (error) {
      console.error('Unexpected error in handleToggleFavorite:', error);
      toast.error(t('common.error', 'An error occurred. Please try again.'));
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
                              className="flex items-center px-4 py-2 rounded-md bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.category}
                            </button>
                          )}
                          {resource.subcategory && (
                            <button
                              onClick={() => navigate(`/category/${resource.subcategory}`)}
                              className="flex items-center px-4 py-2 rounded-md bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.subcategory}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="mt-8">
            <CommentSection 
              comments={comments} 
              resourceId={resource.id}
              isLoading={isLoadingComments}
              onCommentAdded={() => fetchComments(resource.id)}
            />
          </div>
        </div>
        
        {/* Sidebar with Related Resources */}
        <div className="lg:col-span-1">
          <div className="bg-dark-200 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-medium mb-4 text-white">{t('resource.relatedResources', 'Related Resources')}</h2>
            
            <RelatedResources 
              resources={relatedResources}
              category={resource.category}
              currentResourceId={resource.id}
            />
          </div>
        </div>
      </div>
    </>
  );
}