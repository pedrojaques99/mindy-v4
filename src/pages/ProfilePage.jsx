import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import { getAvatarUrl } from '../utils/avatarUtils';
import { PencilIcon } from '@heroicons/react/outline';
import ResourceCard from '../components/ResourceCard';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const ProfilePage = () => {
  const { user, profile, signOut } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
        
        // Process the data to ensure resource has favorited property
        const processedData = (data || []).map(favorite => ({
          ...favorite,
          resources: {
            ...favorite.resources,
            favorited: true // Mark as favorited for the ResourceCard component
          }
        }));
        
        setFavorites(processedData);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error(t('profile.errors.loadFavorites', 'Failed to load favorites'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user, navigate, t]);
  
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      console.log('Calling signOut function');
      const result = await signOut();
      
      if (result.success) {
        console.log('Sign out successful, navigating to home');
        navigate('/');
      } else {
        console.error('Sign out returned error:', result.error);
        toast.error(t('profile.errors.signOut', 'Failed to sign out: {error}', { error: result.error }));
      }
    } catch (error) {
      console.error('Exception in handleSignOut:', error);
      toast.error(t('profile.errors.unexpectedSignOut', 'An unexpected error occurred during sign out'));
    } finally {
      setSigningOut(false);
    }
  };
  
  if (!user) return null;
  
  const currentAvatarUrl = profile ? getAvatarUrl(profile.avatar_type, profile.username) : '';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-card p-8 mb-8">
        <h1 className="text-2xl font-bold mb-6">{t('profile.title', 'Profile')}</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Information */}
          <div className="w-full md:w-1/3">
            <div className="bg-dark-400 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-lime-accent">
                  <img 
                    src={currentAvatarUrl} 
                    alt={t('profile.avatar.alt', 'User Avatar')}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-medium">
                  {profile?.username || user?.email?.split('@')[0] || t('profile.defaultUsername', 'User')}
                </h3>
                
                <div className="flex mt-4 space-x-4">
                  {profile?.behance_url && (
                    <a href={profile.behance_url} target="_blank" rel="noopener noreferrer" aria-label="Behance">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-lime-accent">
                        <path d="M8.228 15.01h-2.228v-2.01h2.261c1.878 0 2.003 2.01-.033 2.01zm6.758-2.677h3.018c-.117-1.715-2.73-1.977-3.018 0zm-6.804-3.333h-2.182v2h2.389c1.673 0 1.937-2-.207-2zm15.818-4v14c0 2.761-2.238 5-5 5h-14c-2.762 0-5-2.239-5-5v-14c0-2.761 2.238-5 5-5h14c2.762 0 5 2.239 5 5zm-10 3h5v-1h-5v1zm-3.552 3.618c1.907-.974 1.837-4.55-1.813-4.604h-4.635v9.978h4.311c4.522 0 4.445-4.534 2.137-5.374zm9.487.602c-.274-1.763-1.528-2.95-3.583-2.95-2.094 0-3.352 1.34-3.352 3.947 0 2.631 1.367 3.783 3.416 3.783s3.106-1.135 3.4-2h-2.111c-.736.855-2.893.521-2.767-1.353h5.06c.01-.634-.012-1.089-.063-1.427z"/>
                      </svg>
                    </a>
                  )}
                  
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-lime-accent">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-lime-accent">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                  )}
                  
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-lime-accent">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-lime-accent">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                </div>
                
                <Link to="/edit-profile" className="mt-6 btn btn-primary text-sm flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  {t('profile.editProfile', 'Edit Profile')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Account Information */}
          <div className="w-full md:w-2/3">
            <div className="bg-dark-400 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-medium mb-4">{t('profile.accountInfo.title', 'Account Information')}</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                  <span className="w-full md:w-1/3 text-white/60">{t('profile.accountInfo.email', 'Email')}:</span>
                  <span className="md:w-2/3">{user.email}</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                  <span className="w-full md:w-1/3 text-white/60">{t('profile.accountInfo.memberSince', 'Member since')}:</span>
                  <span className="md:w-2/3">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                  <span className="w-full md:w-1/3 text-white/60">{t('profile.accountInfo.username', 'Username')}:</span>
                  <span className="md:w-2/3">
                    {profile?.username || t('profile.accountInfo.notSet', 'Not set')}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-dark-300">
                <button 
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  disabled={signingOut}
                >
                  {signingOut ? (
                    <>
                      <span className="spinner-sm mr-2"></span>
                      {t('profile.signOut.inProgress', 'Signing Out...')}
                    </>
                  ) : t('profile.signOut.button', 'Sign Out')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{t('profile.favorites.title', 'Your Favorites')}</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite, index) => (
              <ResourceCard 
                key={favorite.id} 
                resource={favorite.resources} 
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-white/60 mb-4">{t('profile.favorites.empty', "You haven't added any favorites yet.")}</p>
            <a href="/" className="text-lime-accent hover:underline">
              {t('profile.favorites.browse', 'Browse resources')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
