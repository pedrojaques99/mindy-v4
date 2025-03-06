import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*, resources(*)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        setFavorites(data || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
        
      if (error) throw error;
      
      // Update local state
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
      
      {!user ? (
        <div className="glass-card p-6 text-center">
          <p className="text-white/70 mb-4">
            Sign in to save and view your favorite resources.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <p className="text-white/70 mb-4">
            You haven't added any favorites yet.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Resources
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="glass-card">
              <div className="aspect-video bg-dark-400 rounded-t-xl overflow-hidden">
                <img
                  src={favorite.resources.image_url || 'https://via.placeholder.com/300x200'}
                  alt={favorite.resources.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">{favorite.resources.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {favorite.resources.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {favorite.resources.tags && favorite.resources.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Link 
                    to={`/resource/${favorite.resources.id}`}
                    className="text-lime-accent hover:underline"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="text-white/60 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
