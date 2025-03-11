import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAvatarPreviews, getAvatarUrl } from '../utils/avatarUtils';
import { supabase } from '../main';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import { useLanguage } from '../context/LanguageContext';

// Map of social media platform data
const SOCIAL_PLATFORMS = {
  behance: {
    name: 'Behance',
    prefix: 'https://behance.net/',
    placeholder: 'yourname',
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
    placeholder: 'handle',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
    )
  },
  linkedin: {
    name: 'LinkedIn',
    prefix: 'https://linkedin.com/in/',
    placeholder: 'yourname',
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
  const { t } = useLanguage();
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
  const [loadError, setLoadError] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const timeoutRef = useRef(null);
  
  // Check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Supabase connection error:", error);
          setSupabaseConnected(false);
          setLoadError(t('editProfile.errors.connection', 'Could not connect to database. Please check your internet connection.'));
        } else {
          console.log("Supabase connection successful");
          setSupabaseConnected(true);
        }
      } catch (error) {
        console.error("Supabase connection check failed:", error);
        setSupabaseConnected(false);
        setLoadError(t('editProfile.errors.connection', 'Could not connect to database. Please check your internet connection.'));
      }
    };
    
    checkConnection();
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (pageLoading) {
        console.warn("Loading timeout reached, forcing fallback");
        setPageLoading(false);
        setLoadError(t('editProfile.errors.timeout', 'Loading took too long. Please try refreshing the page.'));
      }
    }, 20000); // Increased from 10000 (10 seconds) to 20000 (20 seconds)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [t]);
  
  // Effect to check if user is authenticated
  useEffect(() => {
    if (!user) {
      console.log("No user detected, redirecting to profile page");
      navigate('/profile');
    }
  }, [user, navigate]);
  
  // Effect to fetch profile data if needed
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfileData = async () => {
      // Skip if there's no user or if Supabase isn't connected
      if (!user || !supabaseConnected) {
        setPageLoading(false);
        return;
      }
      
      setPageLoading(true);
      setLoadError(null);
      
      try {
        console.log("Fetching profile data directly for user ID:", user.id);
        
        // Create an abort controller for fetch timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 8000);
        
        // Direct Supabase query with correct table name 'profiles'
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Error fetching profile directly:", error);
          throw error;
        }
        
        if (data && isMounted) {
          console.log("Profile data fetched successfully:", data);
          
          // Update form with fetched data, handling both existing fields and potentially missing fields
          setFormData({
            username: data.username || '',
            // Use full_name if avatar_type doesn't exist
            avatar_type: data.avatar_type || 1,
            // Handle existing or missing social media fields
            behance_url: data.behance_url || '',
            instagram_url: data.instagram_url || '',
            twitter_url: data.twitter_url || '',
            linkedin_url: data.linkedin_url || '',
            github_url: data.github_url || ''
          });
          
          // Extract usernames from URLs
          setSocialUsernames({
            behance: extractUsername(data.behance_url || '', 'behance'),
            instagram: extractUsername(data.instagram_url || '', 'instagram'),
            twitter: extractUsername(data.twitter_url || '', 'twitter'),
            linkedin: extractUsername(data.linkedin_url || '', 'linkedin'),
            github: extractUsername(data.github_url || '', 'github')
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        if (isMounted) {
          if (error.name === 'AbortError') {
            setLoadError(t('editProfile.errors.timeout', 'Loading took too long. Please try refreshing the page.'));
          } else {
            setLoadError("Could not load your profile data. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };
    
    fetchProfileData();
    
    return () => {
      isMounted = false;
    };
  }, [user, supabaseConnected, t]);
  
  // Update avatar previews when username changes
  const avatarPreviews = useMemo(() => {
    return formData.username ? getAvatarPreviews(formData.username) : [];
  }, [formData.username]);
  
  // Remove the separate state and effect for avatarPreviews
  useEffect(() => {
    if (profile && !pageLoading) {
      console.log("Using profile data from context:", profile);
      
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
        behance: extractUsername(profile.behance_url || '', 'behance'),
        instagram: extractUsername(profile.instagram_url || '', 'instagram'),
        twitter: extractUsername(profile.twitter_url || '', 'twitter'),
        linkedin: extractUsername(profile.linkedin_url || '', 'linkedin'),
        github: extractUsername(profile.github_url || '', 'github')
      });
    }
  }, [profile, pageLoading]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialUsernameChange = (e) => {
    const { name, value } = e.target;
    const platform = name.replace('_username', '');
    
    // Validate username - remove spaces and special characters
    const sanitizedValue = value.trim().replace(/[^\w.-]/g, '');
    
    // Update the username in state
    setSocialUsernames(prev => ({
      ...prev,
      [platform]: sanitizedValue
    }));
    
    // Also update the full URL in formData
    const fullUrl = formatSocialUrl(sanitizedValue, platform);
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
    
    // Validate username
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }
    
    setLoading(true);
    
    try {
      // Format social URLs
      const updatedData = {
        ...formData,
        behance_url: formatSocialUrl(socialUsernames.behance, 'behance'),
        instagram_url: formatSocialUrl(socialUsernames.instagram, 'instagram'),
        twitter_url: formatSocialUrl(socialUsernames.twitter, 'twitter'),
        linkedin_url: formatSocialUrl(socialUsernames.linkedin, 'linkedin'),
        github_url: formatSocialUrl(socialUsernames.github, 'github')
      };
      
      const { error } = await updateUserProfile(updatedData);
      
      if (error) throw error;
      
      toast.success(t('editProfile.success', 'Profile updated successfully'));
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('editProfile.errors.update', 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRetry = () => {
    // Clear any previous errors
    setLoadError(null);
    // Reset loading state
    setPageLoading(true);
    // Reset connection state to trigger recheck
    setSupabaseConnected(true);
    
    // First check the connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Retry - Supabase connection error:", error);
          setSupabaseConnected(false);
          setLoadError(t('editProfile.errors.connection', 'Could not connect to database. Please check your internet connection.'));
          setPageLoading(false);
        } else {
          console.log("Retry - Supabase connection successful");
          setSupabaseConnected(true);
          // If we have the user, fetch their profile
          if (user) {
            fetchUserProfile(user.id); // Use the context method if available
            // Reset timeout for loading
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              if (pageLoading) {
                console.warn("Retry - Loading timeout reached");
                setPageLoading(false);
                setLoadError(t('editProfile.errors.timeout', 'Loading took too long. Please try refreshing the page.'));
              }
            }, 20000);
          } else {
            // No user, can't load profile
            setPageLoading(false);
            navigate('/profile');
          }
        }
      } catch (error) {
        console.error("Retry - Connection check failed:", error);
        setSupabaseConnected(false);
        setLoadError(t('editProfile.errors.connection', 'Could not connect to database. Please check your internet connection.'));
        setPageLoading(false);
      }
    };
    
    checkConnection();
  };
  
  const validateUsername = (username) => {
    if (!username) {
      return t('editProfile.validation.required', 'Username is required');
    }
    if (username.length < 3) {
      return t('editProfile.validation.tooShort', 'Username must be at least 3 characters long');
    }
    if (username.length > 20) {
      return t('editProfile.validation.tooLong', 'Username must be less than 20 characters long');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return t('editProfile.validation.invalidChars', 'Username can only contain letters, numbers, underscores, and hyphens');
    }
    return null;
  };
  
  if (!user) return null;
  
  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">{t('editProfile.errors.title', 'Error Loading Profile')}</h1>
            <p className="text-white/70 mb-6">{loadError}</p>
            <button onClick={handleRetry} className="btn btn-primary">
              <RefreshIcon className="w-5 h-5 mr-2" />
              {t('common.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/profile" className="flex items-center text-white/60 hover:text-lime-accent transition-colors mr-4">
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            <span>{t('common.backToProfile', 'Back to Profile')}</span>
          </Link>
          <h1 className="text-2xl font-bold">{t('editProfile.title', 'Edit Profile')}</h1>
        </div>
        
        <div className="glass-card p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeSection === 'profile'
                  ? 'bg-lime-accent text-dark-900'
                  : 'bg-dark-400 text-white/90 hover:bg-dark-300'
              }`}
            >
              {t('editProfile.sections.profile', 'Profile')}
            </button>
            <button
              onClick={() => setActiveSection('social')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeSection === 'social'
                  ? 'bg-lime-accent text-dark-900'
                  : 'bg-dark-400 text-white/90 hover:bg-dark-300'
              }`}
            >
              {t('editProfile.sections.social', 'Social Media')}
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {activeSection === 'profile' ? (
              <>
                {/* Username Field */}
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    {t('editProfile.form.username', 'Username')} *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                    required
                  />
                  <p className="mt-1 text-sm text-white/50">
                    {t('editProfile.form.usernameHelp', 'This will be your public display name')}
                  </p>
                </div>
                
                {/* Avatar Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    {t('editProfile.form.avatar', 'Avatar')}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {avatarPreviews.map((preview, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAvatarSelect(index + 1)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          formData.avatar_type === index + 1
                            ? 'border-lime-accent'
                            : 'border-transparent hover:border-white/20'
                        }`}
                      >
                        <img
                          src={preview}
                          alt={t('editProfile.form.avatarAlt', 'Avatar option {number}', { number: index + 1 })}
                          className="w-full h-full object-cover"
                        />
                        {formData.avatar_type === index + 1 && (
                          <div className="absolute inset-0 bg-lime-accent/20 flex items-center justify-center">
                            <CheckIcon className="w-6 h-6 text-lime-accent" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Social Media Links */}
                <div className="space-y-6">
                  {Object.entries(SOCIAL_PLATFORMS).map(([platform, data]) => (
                    <div key={platform}>
                      <label htmlFor={platform} className="block text-sm font-medium mb-2">
                        <span className="flex items-center">
                          {data.icon}
                          <span className="ml-2">{data.name}</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/40">
                              {data.prefix}
                            </span>
                            <input
                              type="text"
                              id={platform}
                              name={platform}
                              value={socialUsernames[platform]}
                              onChange={handleSocialUsernameChange}
                              placeholder={data.placeholder}
                              className="w-full pl-[120px] pr-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                            />
                          </div>
                        </div>
                        {socialUsernames[platform] && (
                          <a
                            href={formatSocialUrl(socialUsernames[platform], platform)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/60 hover:text-lime-accent"
                          >
                            <ExternalLinkIcon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-sm mr-2"></span>
                    {t('editProfile.form.saving', 'Saving...')}
                  </>
                ) : t('editProfile.form.save', 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage; 