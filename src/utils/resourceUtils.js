import { supabase } from '../main';
import toast from 'react-hot-toast';

/**
 * Utility functions for working with resources in Supabase
 */

/**
 * Check if a user is currently authenticated
 * @returns {Promise<Object>} Authentication status object
 */
export const checkAuthStatus = async () => {
  try {
    // Use the current method from Supabase v2
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking authentication status:", error);
      return {
        authenticated: false,
        error,
        message: "Failed to verify authentication status"
      };
    }
    
    if (!data.session) {
      return {
        authenticated: false,
        message: "No active session found"
      };
    }
    
    return {
      authenticated: true,
      user: data.session.user,
      session: data.session
    };
  } catch (error) {
    console.error("Unexpected error checking auth status:", error);
    return {
      authenticated: false,
      error,
      message: "An error occurred while checking authentication"
    };
  }
};

// Get a single resource by ID
export const getResourceById = async (id) => {
  if (!id) {
    console.error('Resource ID is required');
    return { success: false, message: 'Resource ID is required' };
  }

  try {
    console.log(`Fetching resource with ID: ${id}`);
    
    // Try with retries in case of network issues
    const MAX_RETRIES = 2;
    let attempt = 0;
    let error;
    
    while (attempt <= MAX_RETRIES) {
      try {
        // First try with .single() - this is the preferred approach
        const { data, error: fetchError } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1}: Error fetching resource with single():`, fetchError);
          
          // If we got a "Results not found" from single(), try another approach
          if (fetchError.code === 'PGRST116') {
            console.log('Resource not found with single(), trying alternative approach');
            
            // Try the alternative approach - getting as array and taking first element
            const { data: arrayData, error: arrayError } = await supabase
              .from('resources')
              .select('*')
              .eq('id', id);
              
            if (arrayError) {
              console.error('Error with alternative fetch approach:', arrayError);
              error = arrayError;
            } else if (arrayData && arrayData.length > 0) {
              console.log('Resource fetched successfully via array method:', arrayData[0]);
              return { success: true, data: arrayData[0] };
            } else {
              console.log('Resource not found with either method');
              return { success: false, message: 'Resource not found' };
            }
          } else {
            error = fetchError;
          }
          
          attempt++;
          
          if (attempt <= MAX_RETRIES) {
            // Wait a bit before retrying (increasing delay with each attempt)
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue;
          }
          break;
        }
        
        if (!data) {
          console.log('Resource not found');
          return { success: false, message: 'Resource not found' };
        }
        
        console.log('Resource fetched successfully:', data);
        return { success: true, data };
      } catch (attemptError) {
        console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1}: Unexpected error:`, attemptError);
        error = attemptError;
        attempt++;
        
        if (attempt <= MAX_RETRIES) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          continue;
        }
        break;
      }
    }
    
    // If we got here with an error, all attempts failed
    return { success: false, error };
  } catch (error) {
    console.error('Unexpected error fetching resource:', error);
    return { success: false, error };
  }
};

// Get all resources
export const getAllResources = async () => {
  try {
    console.log('Fetching all resources');
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return { success: false, error };
    }

    console.log(`Fetched ${data?.length || 0} resources`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching resources:', error);
    return { success: false, error };
  }
};

// Get resources by category
export const getResourcesByCategory = async (category) => {
  if (!category) {
    return await getAllResources();
  }

  try {
    console.log(`Fetching resources in category: ${category}`);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources by category:', error);
      return { success: false, error };
    }

    console.log(`Fetched ${data?.length || 0} resources in category: ${category}`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching resources by category:', error);
    return { success: false, error };
  }
};

/**
 * Track a view of a resource by a user
 * @param {string} resourceId - ID of the resource
 * @param {string} userId - ID of the user (optional, if authenticated)
 * @returns {Promise<Object>} Result object with success status and error info
 */
export const trackResourceView = async (resourceId, userId = null) => {
  // Validate the resource ID is provided
  if (!resourceId) {
    console.error("resourceId must be provided to trackResourceView function");
    return {
      success: false,
      error: "Missing resource ID",
      message: "Cannot track view without resource ID",
    };
  }

  try {
    console.log(`Tracking view for resource ${resourceId}${userId ? ` by user ${userId}` : ' (anonymous)'}`);
    
    // Check authentication status if no userId provided
    if (!userId) {
      const authStatus = await checkAuthStatus();
      if (authStatus.authenticated && authStatus.user?.id) {
        userId = authStatus.user.id;
      } else {
        console.log("User not authenticated when tracking resource view");
      }
    }
    
    // Track anonymous view first - this always works regardless of auth
    const { error: incrementError } = await supabase.rpc('increment_resource_popularity', {
      resource_id: resourceId
    });
    
    if (incrementError) {
      console.warn("Failed to increment resource popularity:", incrementError);
      // Non-critical error, we can continue
    }
    
    // If we have a userId, also track the specific user view
    if (userId) {
      const { error: viewError } = await supabase
        .from('resource_views')
        .insert([
          { resource_id: resourceId, user_id: userId }
        ]);
        
      if (viewError) {
        // Check for policy violations
        if (viewError.code === '42501' || viewError.message?.includes('policy')) {
          console.warn("RLS policy prevented tracking user view:", viewError);
          // This is non-critical, we already tracked anonymous view
          return {
            success: true,
            partial: true,
            message: "View counted anonymously due to permissions"
          };
        }
        
        // Check for auth errors
        if (viewError.code === '401' || viewError.message?.includes('auth') || viewError.message?.includes('session')) {
          console.warn("Authentication error when tracking view:", viewError);
          return {
            success: true,
            partial: true, 
            message: "View counted anonymously due to authentication issue"
          };
        }
        
        console.error("Error tracking resource view:", viewError);
        return {
          success: true,
          partial: true,
          error: viewError,
          message: "View tracked anonymously only"
        };
      }
    }
    
    return {
      success: true,
      anonymous: !userId,
      message: userId ? "View tracked successfully" : "Anonymous view tracked"
    };
  } catch (error) {
    console.error("Unexpected error in trackResourceView:", error);
    return {
      success: false,
      error,
      message: "Failed to track resource view"
    };
  }
};

/**
 * Toggle a resource's favorite status for a user
 * @param {string} resourceId - ID of the resource
 * @param {string} userId - ID of the user
 * @param {boolean} currentStatus - Current favorite status (optional)
 * @returns {Promise<Object>} Result object with success status and error info
 */
export const toggleFavorite = async (resourceId, userId, currentStatus = null) => {
  // Validate inputs
  if (!resourceId || !userId) {
    console.error("Both resourceId and userId must be provided to toggleFavorite function");
    return {
      success: false,
      error: "Missing required parameters",
      message: "Unable to update favorite status due to missing information",
    };
  }

  // Check authentication status
  const authStatus = await checkAuthStatus();
  if (!authStatus.authenticated) {
    console.warn("User not authenticated when attempting to toggle favorite");
    return {
      success: false,
      authError: true,
      error: "User not authenticated",
      message: "You must be signed in to add favorites",
    };
  }

  // First, try to use our RPC function if available
  try {
    console.log(`Attempting to toggle favorite for resource ${resourceId} by user ${userId}, current status: ${currentStatus}`);
    
    // First check if the user has a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        success: false,
        authError: true,
        error: "No active session",
        message: "You must be signed in to add favorites",
      };
    }
    
    // Try the RPC function first
    const { data, error } = await supabase.rpc('toggle_favorite', {
      p_resource_id: resourceId,
      p_user_id: userId
    });
    
    if (!error) {
      return {
        success: true,
        isFavorited: data,
      };
    } else {
      // If RPC call fails, fall back to direct operations
      console.warn("RPC toggle_favorite failed, falling back to direct operations", error);
    }
    
    // Determine if we're adding or removing based on current status
    const isRemoving = currentStatus === true;
    
    if (isRemoving) {
      // Remove favorite
      const { error: removeError } = await supabase
        .from('favorites')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', userId);
        
      if (removeError) {
        console.error("Error removing favorite:", removeError);
        
        // Check for permission denied or RLS policy violation
        if (removeError.code === '42501' || removeError.message?.includes('policy')) {
          return {
            success: false,
            policyError: true,
            error: removeError,
            message: "You don't have permission to remove this favorite",
          };
        }
        
        // Check for auth/session errors
        if (removeError.code === '401' || removeError.message?.includes('auth') || removeError.message?.includes('session')) {
          return {
            success: false,
            authError: true,
            error: removeError,
            message: "Your session has expired. Please sign in again.",
          };
        }
        
        return {
          success: false,
          error: removeError,
          message: "Failed to remove from favorites",
        };
      }
      
      return {
        success: true,
        isFavorited: false,
      };
    } else {
      // Add favorite
      const { error: addError } = await supabase
        .from('favorites')
        .insert([
          { resource_id: resourceId, user_id: userId }
        ]);
        
      if (addError) {
        console.error("Error adding favorite:", addError);
        
        // Check for permission denied or RLS policy violation
        if (addError.code === '42501' || addError.message?.includes('policy')) {
          return {
            success: false,
            policyError: true,
            error: addError,
            message: "You don't have permission to add this favorite. This may be due to a Row Level Security policy.",
          };
        }
        
        // Check for auth/session errors
        if (addError.code === '401' || addError.message?.includes('auth') || addError.message?.includes('session')) {
          return {
            success: false,
            authError: true,
            error: addError,
            message: "Your session has expired. Please sign in again.",
          };
        }
        
        return {
          success: false,
          error: addError,
          message: "Failed to add to favorites",
        };
      }
      
      return {
        success: true,
        isFavorited: true,
      };
    }
  } catch (error) {
    console.error("Unexpected error in toggleFavorite:", error);
    return {
      success: false,
      error,
      message: "An unexpected error occurred while updating favorites",
    };
  }
}; 