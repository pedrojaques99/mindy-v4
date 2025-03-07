import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import ResourcePreviewModal from '../components/ResourcePreviewModal';
import ResourceCard from '../components/ResourceCard';
import toast from 'react-hot-toast';
import { 
  HeartIcon, 
  ShareIcon, 
  ExternalLinkIcon,
  ArrowLeftIcon,
  TagIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import SoftwareIcon from '../components/ui/SoftwareIcon';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [showPreview, setShowPreview] = useState(true); // Auto-open preview modal
  
  useEffect(() => {
    const fetchResource = async () => {
      try {
        // Fetch resource
        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();
          
        if (resourceError) throw resourceError;
        setResource(resourceData);
        
        // Fetch category
        if (resourceData.category) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', resourceData.category)
            .single();
            
          if (!categoryError) {
            setCategory(categoryData);
          }
        }
        
        // Check if favorited
        if (user) {
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('favorites')
            .select('id')
            .eq('resource_id', id)
            .eq('user_id', user.id);
            
          if (!favoriteError && favoriteData && favoriteData.length > 0) {
            setIsFavorite(true);
            setFavoriteId(favoriteData[0].id);
          }
        }
        
        // Fetch related resources
        if (resourceData) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('resources')
            .select('*')
            .eq('category', resourceData.category)
            .neq('id', id)
            .limit(6);
            
          if (!relatedError) {
            setRelatedResources(relatedData || []);
          }
        }
        
        // Track view
        if (user) {
          await supabase
            .from('resource_views')
            .insert([
              { resource_id: id, user_id: user.id }
            ]);
            
          // Update popularity
          await supabase
            .rpc('increment_popularity', { resource_id: id })
            .catch(error => console.error('Error incrementing popularity:', error));
        }
      } catch (error) {
        console.error('Error fetching resource:', error);
        toast.error('Resource not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResource();
  }, [id, user, navigate]);
  
  const handleToggleFavorite = async () => {
    if (!user) {
      toast('Please sign in to save favorites', { icon: '🔒' });
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);
          
        if (error) throw error;
        
        setIsFavorite(false);
        setFavoriteId(null);
        toast('Removed from favorites', { icon: '💔' });
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, resource_id: id }
          ])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setIsFavorite(true);
          setFavoriteId(data[0].id);
          toast('Added to favorites', { icon: '❤️' });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode'];
    return softwareNames.includes(tag.toLowerCase());
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource not found</h1>
        <p className="text-gray-400 mb-8">The resource you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            to={`/category/${resource.category}`}
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to {category?.name || resource.category}
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-lime-accent/20 text-lime-accent">
              <TagIcon className="w-4 h-4 mr-1" />
              {resource.category}
            </span>
            
            {resource.subcategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-glass-100 text-white">
                {resource.subcategory}
              </span>
            )}
          </div>
          
          <p className="text-gray-300 mb-6 max-w-3xl">{resource.description}</p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Visit Resource
              <ExternalLinkIcon className="w-5 h-5 ml-2" />
            </a>
            
            <button
              onClick={() => setShowPreview(true)}
              className="btn btn-secondary"
            >
              Preview
            </button>
            
            <button
              onClick={handleToggleFavorite}
              className="btn btn-secondary"
            >
              {isFavorite ? (
                <>
                  <HeartSolidIcon className="w-5 h-5 mr-2 text-lime-accent" />
                  Favorited
                </>
              ) : (
                <>
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Add to Favorites
                </>
              )}
            </button>
            
            <button
              onClick={handleShare}
              className="btn btn-secondary"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              Share
            </button>
          </div>
          
          {resource.tags && resource.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/category/all?tag=${tag}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-glass-100 text-white hover:bg-glass-300 transition-colors"
                  >
                    {isSoftwareTag(tag) ? (
                      <span className="flex items-center gap-1.5">
                        <SoftwareIcon name={tag} />
                        <span>{tag}</span>
                      </span>
                    ) : (
                      tag
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {relatedResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((relatedResource, index) => (
                <ResourceCard 
                  key={relatedResource.id} 
                  resource={relatedResource}
                  delay={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      <ResourcePreviewModal 
        resource={resource}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export default ResourceDetailPage;
