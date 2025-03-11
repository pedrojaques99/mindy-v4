import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../main';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    if (!userId) return;
    
    try {
      setProfileLoading(true);
      console.log("Fetching user profile for ID:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile from 'profiles' table:", error);
        throw error;
      }
      
      console.log("Profile data retrieved:", data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (data?.session) {
          console.log('Found existing session');
          setUser(data.session.user);
          await fetchUserProfile(data.session.user.id);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'with session' : 'no session');
        
        // Handle session events
        if (session) {
          if (event === 'SIGNED_IN') {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
            toast.success('Signed in successfully!');
          } else if (event === 'USER_UPDATED') {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
            toast.success('Profile updated!');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Auth token refreshed automatically');
            // Update user state with fresh session data
            setUser(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state on sign out
          setUser(null);
          setProfile(null);
          toast.success('Signed out successfully!');
          
          // Clear any cached user data
          try {
            localStorage.removeItem('user-profile-cache');
          } catch (e) {
            console.warn('Failed to clear user profile cache:', e);
          }
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Make sure we update the state immediately rather than waiting for the listener
      if (data.session) {
        setUser(data.session.user);
        await fetchUserProfile(data.session.user.id);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Verification email sent! Please check your inbox.');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error(`Sign out failed: ${error.message}`);
        throw error;
      }
      
      console.log('Sign out successful');
      // Explicitly clear user state
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Exception during sign out:', error);
      toast.error(`Sign out failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      console.log("Updating profile with data:", profileData);
      
      // Check which fields actually exist in the database first
      const { data: existingData, error: existingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (existingError && existingError.code !== 'PGRST116') {
        console.error("Error checking existing profile:", existingError);
        throw existingError;
      }
      
      // Filter out any fields that aren't in the database schema
      const cleanedData = {};
      if (existingData) {
        // Only include fields that exist in the database
        Object.keys(profileData).forEach(key => {
          if (key === 'id' || key in existingData) {
            cleanedData[key] = profileData[key];
          }
        });
      } else {
        // If we can't check the schema, just use username which definitely exists
        cleanedData.username = profileData.username;
      }
      
      console.log("Sending cleaned profile data:", cleanedData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanedData)
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile in 'profiles' table:", error);
        throw error;
      }
      
      console.log("Profile updated successfully");
      
      // Update local state - but keep any fields that weren't in the database
      setProfile({ ...profile, ...profileData });
      toast.success('Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    fetchUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

