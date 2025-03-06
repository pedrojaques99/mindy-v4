import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

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
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!favoriteError && favoriteData) {
            setIsFavorite(true);
            setFavoriteId(favoriteData.id);
          }
        }
        
        // Fetch related resources
        const { data: relatedData, error: relatedError } = await supabase
          .from('resources')
          .select('*')
          .eq('category', resourceData.category)
          .neq('id', id)
          .limit(3);
          
        if (!relatedError) {
          setRelatedResources(relatedData || []);
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
      toast.error('You must be signed in to save favorites');
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
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              resource_id: id,
            },
          ])
          .select();
          
        if (error) throw error;
        
        setIsFavorite(true);
        setFavoriteId(data[0].id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
        <p className="text-white/70 mb-6">
          The resource you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-white/60">
          <Link to="/" className="hover:text-lime-accent">Home</Link>
          <span className="mx-2">/</span>
          {category && (
            <>
              <Link to={`/category/${category.slug}`} className="hover:text-lime-accent">
                {category.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-white/80">{resource.title}</span>
        </div>
      </div>
      
      {/* Resource header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="aspect-video bg-dark-400 rounded-xl overflow-hidden">
              <img
                src={resource.image_url || 'https://via.placeholder.com/600x400'}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>
            
            <p className="text-white/70 mb-6">
              {resource.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {resource.tags && resource.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Visit Resource
              </a>
              
              <button
                onClick={handleToggleFavorite}
                className={`btn ${isFavorite ? 'btn-secondary' : 'btn-outline'}`}
              >
                {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related resources */}
      {relatedResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Related Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedResources.map((related) => (
              <Link key={related.id} to={`/resource/${related.id}`} className="glass-card hover:bg-glass-300 transition-all">
                <div className="aspect-video bg-dark-400 rounded-t-xl overflow-hidden">
                  <img
                    src={related.image_url || 'https://via.placeholder.com/300x200'}
                    alt={related.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{related.title}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {related.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;
