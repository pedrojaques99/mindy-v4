import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import ProfileEditor from '../components/ProfileEditor';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/');
      return;
    }
    
    // Fetch user's favorites
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
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
  }, [user, navigate]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-card p-8 mb-8">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <ProfileEditor />
        
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Account Information</h2>
          <div className="bg-dark-400 p-4 rounded-lg">
            <div className="mb-4">
              <span className="text-white/60">Email:</span>
              <span className="ml-2">{user.email}</span>
            </div>
            <div>
              <span className="text-white/60">Member since:</span>
              <span className="ml-2">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={handleSignOut}
              className="btn btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Favorites</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : favorites.length > 0 ? (
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
                  <div className="flex justify-between">
                    <a 
                      href={favorite.resources.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lime-accent hover:underline"
                    >
                      Visit Resource
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-white/60 mb-4">You haven't added any favorites yet.</p>
            <a href="/" className="text-lime-accent hover:underline">
              Browse resources
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
