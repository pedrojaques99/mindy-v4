import { supabase } from '../main';
import toast from 'react-hot-toast';

/**
 * Utility functions for working with resources in Supabase
 */

// Get a single resource by ID
export const getResourceById = async (id) => {
  if (!id) {
    console.error('Resource ID is required');
    return { success: false, message: 'Resource ID is required' };
  }

  try {
    console.log(`Fetching resource with ID: ${id}`);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resource:', error);
      return { success: false, error };
    }

    if (!data) {
      console.log('Resource not found');
      return { success: false, message: 'Resource not found' };
    }

    console.log('Resource fetched successfully:', data);
    return { success: true, data };
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

// Track resource view
export const trackResourceView = async (resourceId, userId) => {
  if (!resourceId || !userId) {
    return { success: false, message: 'Resource ID and User ID are required' };
  }

  try {
    const { error } = await supabase
      .from('resource_views')
      .insert([
        { resource_id: resourceId, user_id: userId }
      ], { 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        }
      });

    if (error) {
      // Log but don't fail the operation - tracking views is non-critical
      console.error('Error tracking resource view:', error);
      return { success: false, error, critical: false };
    }

    try {
      // Try to increment popularity via RPC
      await supabase.rpc('increment_popularity', { resource_id: resourceId });
    } catch (rpcError) {
      console.error('Error incrementing popularity:', rpcError);
      // Non-critical operation, continue
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error tracking resource view:', error);
    return { success: false, error, critical: false };
  }
};

// Toggle favorite status
export const toggleFavorite = async (resourceId, userId, currentStatus) => {
  if (!resourceId || !userId) {
    toast.error('You must be logged in to favorite resources');
    return { success: false, message: 'Resource ID and User ID are required' };
  }

  try {
    if (currentStatus) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);

      if (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
        return { success: false, error };
      }

      toast('Removed from favorites', { icon: '💔' });
      return { success: true, isFavorited: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: userId, resource_id: resourceId }
        ], { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          }
        });

      if (error) {
        console.error('Error adding favorite:', error);
        toast.error('Failed to add to favorites');
        return { success: false, error };
      }

      toast('Added to favorites', { icon: '❤️' });
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error('Unexpected error toggling favorite:', error);
    toast.error('Something went wrong');
    return { success: false, error };
  }
}; 