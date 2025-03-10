import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAvatarPreviews, getAvatarUrl } from '../utils/avatarUtils';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon } from '@heroicons/react/outline';

// Map of social media platform data
const SOCIAL_PLATFORMS = {
  behance: {
    name: 'Behance',
    prefix: 'https://behance.net/',
    placeholder: 'username',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.228 15.01h-2.228v-2.01h2.261c1.878 0 2.003 2.01-.033 2.01zm6.758-2.677h3.018c-.117-1.715-2.73-1.977-3.018 0zm-6.804-3.333h-2.182v2h2.389c1.673 0 1.937-2-.207-2zm15.818-4v14c0 2.761-2.238 5-5 5h-14c-2.762 0-5-2.239-5-5v-14c0-2.761 2.238-5 5-5h14c2.762 0 5 2.239 5 5zm-10 3h5v-1h-5v1zm-3.552 3.618c1.907-.974 1.837-4.55-1.813-4.604h-4.635v9.978h4.311c4.522 0 4.445-4.534 2.137-5.374zm9.487.602c-.274-1.763-1.528-2.95-3.583-2.95-2.094 0-3.352 1.34-3.352 3.947 0 2.631 1.367 3.783 3.416 3.783s3.106-1.135 3.4-2h-2.111c-.736.855-2.893.521-2.767-1.353h5.06c.01-.634-.012-1.089-.063-1.427z"/>
      </svg>
    )
  },
  instagram: {
    name: 'Instagram',
    prefix: 'https://instagram.com/',
    placeholder: 'username',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  twitter: {
    name: 'Twitter/X',
    prefix: 'https://twitter.com/',
    placeholder: 'username',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
    )
  },
  linkedin: {
    name: 'LinkedIn',
    prefix: 'https://linkedin.com/in/',
    placeholder: 'username',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  github: {
    name: 'GitHub',
    prefix: 'https://github.com/',
    placeholder: 'username',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  }
};

// Helper function to extract username from URL
const extractUsername = (url, platform) => {
  if (!url) return '';
  
  const prefix = SOCIAL_PLATFORMS[platform].prefix;
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  
  // If it doesn't have the prefix, return as is (might be just a username)
  return url;
};

// Helper function to format full URL
const formatSocialUrl = (username, platform) => {
  if (!username) return '';
  
  // If it already has the prefix, return as is
  const prefix = SOCIAL_PLATFORMS[platform].prefix;
  if (username.startsWith(prefix)) {
    return username;
  }
  
  // Otherwise, add the prefix
  return `${prefix}${username}`;
};

const EditProfilePage = () => {
  const { user, profile, updateUserProfile, profileLoading, fetchUserProfile } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    avatar_type: 1,
    behance_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    github_url: ''
  });
  
  // Store usernames instead of full URLs in the UI
  const [socialUsernames, setSocialUsernames] = useState({
    behance: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    github: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false);
  const [avatarPreviews, setAvatarPreviews] = useState([]);
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'social'
  
  // Effect to check if user is authenticated
  useEffect(() => {
    if (!user) {
      console.log("No user detected, redirecting to profile page");
      navigate('/profile');
    }
  }, [user, navigate]);
  
  // Effect to fetch profile data if needed
  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      // Skip if we've already fetched profile data or if we're already loading
      if (profileFetched || !user || profileLoading) {
        return;
      }
      
      // If profile doesn't exist, fetch it
      if (!profile) {
        console.log("Profile data not found, fetching from server...");
        setPageLoading(true);
        
        try {
          console.log("Calling fetchUserProfile with user ID:", user.id);
          await fetchUserProfile(user.id);
        } catch (error) {
          console.error("Error fetching profile data:", error);
          toast.error("Could not load profile data. Please try again.");
          navigate('/profile');
        }
      }
      
      // Mark profile as fetched to prevent infinite loop
      setProfileFetched(true);
    };
    
    fetchProfileIfNeeded();
  }, [user, profile, profileLoading, profileFetched, fetchUserProfile, navigate]);
  
  // Effect to populate form data when profile is loaded
  useEffect(() => {
    if (profile && user) {
      console.log("Profile data loaded, updating form");
      
      // Set form data from profile
      setFormData({
        username: profile.username || '',
        avatar_type: profile.avatar_type || 1,
        behance_url: profile.behance_url || '',
        instagram_url: profile.instagram_url || '',
        twitter_url: profile.twitter_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || ''
      });
      
      // Extract usernames from URLs
      setSocialUsernames({
        behance: extractUsername(profile.behance_url, 'behance'),
        instagram: extractUsername(profile.instagram_url, 'instagram'),
        twitter: extractUsername(profile.twitter_url, 'twitter'),
        linkedin: extractUsername(profile.linkedin_url, 'linkedin'),
        github: extractUsername(profile.github_url, 'github')
      });
      
      // Load avatar previews
      setAvatarPreviews(getAvatarPreviews(profile.username));
      
      // End loading state
      setPageLoading(false);
    }
  }, [profile, user]);
  
  // Update avatar previews when username changes
  useEffect(() => {
    if (formData.username) {
      setAvatarPreviews(getAvatarPreviews(formData.username));
    }
  }, [formData.username]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialUsernameChange = (e) => {
    const { name, value } = e.target;
    const platform = name.replace('_username', '');
    
    // Update the username in state
    setSocialUsernames(prev => ({
      ...prev,
      [platform]: value
    }));
    
    // Also update the full URL in formData
    const fullUrl = formatSocialUrl(value, platform);
    setFormData(prev => ({
      ...prev,
      [`${platform}_url`]: fullUrl
    }));
  };
  
  const handleAvatarSelect = (avatarType) => {
    setFormData(prev => ({ ...prev, avatar_type: avatarType }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { success, error } = await updateUserProfile(formData);
      
      if (success) {
        toast.success('Profile updated successfully');
        navigate('/profile');
      } else {
        toast.error(error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // If loading, show spinner
  if (pageLoading || profileLoading) {
    console.log("Rendering loading state. pageLoading:", pageLoading, "profileLoading:", profileLoading);
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="spinner mb-4"></div>
        <p className="text-white/60">Loading profile data...</p>
      </div>
    );
  }
  
  // If no user or profile, redirect
  if (!user || !profile) {
    console.log("No user or profile data available, redirecting");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/profile" className="flex items-center text-white/60 hover:text-lime-accent transition-colors mr-4">
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
        
        {/* Form container */}
        <div className="glass-card p-6 md:p-8">
          {/* Tab navigation */}
          <div className="flex border-b border-dark-300 mb-6">
            <button
              className={`pb-3 px-4 font-medium transition-colors ${
                activeSection === 'profile' ? 'text-lime-accent border-b-2 border-lime-accent' : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveSection('profile')}
            >
              Profile Info
            </button>
            <button
              className={`pb-3 px-4 font-medium transition-colors ${
                activeSection === 'social' ? 'text-lime-accent border-b-2 border-lime-accent' : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveSection('social')}
            >
              Social Media
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Profile section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Avatar preview section */}
                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dark-300">
                    <img 
                      src={getAvatarUrl(formData.avatar_type, formData.username || 'preview')} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Username field */}
                <div>
                  <label className="block mb-2 text-sm font-medium">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full p-3 rounded-md bg-dark-500 border border-dark-300 text-white"
                    autoComplete="off"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    This username will be visible to others and will affect your avatar.
                  </p>
                </div>
                
                {/* Avatar selection */}
                <div>
                  <label className="block mb-3 text-sm font-medium">Choose Avatar Style</label>
                  <div className="flex justify-center gap-6">
                    {avatarPreviews.map((avatar) => (
                      <div 
                        key={avatar.type}
                        onClick={() => handleAvatarSelect(avatar.type)}
                        className="relative"
                      >
                        <div className={`w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 transition-all ${
                          formData.avatar_type === avatar.type 
                            ? 'border-lime-accent scale-110 shadow-lg shadow-lime-accent/20' 
                            : 'border-dark-300 opacity-60 hover:opacity-100'
                        }`}>
                          <img 
                            src={avatar.url} 
                            alt={`Avatar ${avatar.label}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {formData.avatar_type === avatar.type && (
                          <div className="absolute -top-2 -right-2 bg-lime-accent text-dark-500 rounded-full p-1">
                            <CheckIcon className="w-4 h-4" />
                          </div>
                        )}
                        <p className="text-center mt-2 text-sm">{avatar.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Social Media section */}
            {activeSection === 'social' && (
              <div className="space-y-5">
                <p className="text-white/60 mb-4">
                  Add your social media profiles. Just enter your username, not the full URL.
                </p>
                
                {Object.entries(SOCIAL_PLATFORMS).map(([platform, data]) => (
                  <div key={platform} className="group">
                    <label className="block mb-1 text-sm font-medium flex items-center">
                      <span className="text-white/80 mr-2">{data.name}</span>
                      {socialUsernames[platform] && (
                        <a 
                          href={formatSocialUrl(socialUsernames[platform], platform)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-lime-accent/60 hover:text-lime-accent flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </label>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40">
                        {data.icon}
                      </div>
                      
                      <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                        <span className="text-white/40">{data.prefix}</span>
                      </div>
                      
                      <input
                        type="text"
                        name={`${platform}_username`}
                        value={socialUsernames[platform]}
                        onChange={handleSocialUsernameChange}
                        placeholder={data.placeholder}
                        className="w-full pl-[140px] pr-3 py-3 rounded-md bg-dark-500 border border-dark-300 text-white group-hover:border-dark-200 transition-colors"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-dark-300">
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-md bg-dark-300 text-white hover:bg-dark-200 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                className="px-5 py-2.5 rounded-md bg-lime-accent text-dark-500 font-medium hover:bg-lime-accent/90 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-sm"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage; 