import { supabase } from '../main';

/**
 * Utility functions for working with Supabase
 */

// Test if a table exists in the database
export const tableExists = async (tableName) => {
  try {
    // Using a special query structure that should work even with limited permissions
    // This query will return an error with code '42P01' if the table doesn't exist
    const { error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true })
      .limit(1);
      
    // If error code is 42P01, table doesn't exist
    if (error && error.code === '42P01') {
      return false;
    }
    
    // Any other error means we have other issues
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return null; // Return null to indicate an error
    }
    
    // No error means table exists
    return true;
  } catch (error) {
    console.error(`Unexpected error checking if table ${tableName} exists:`, error);
    return null;
  }
};

// Verify resource table exists
export const verifyResourceTable = async () => {
  const exists = await tableExists('resources');
  
  if (exists === true) {
    console.log('Resources table exists.');
    return true;
  } else if (exists === false) {
    console.log('Resources table does not exist.');
    return false;
  } else {
    console.error('Error checking resources table.');
    return false;
  }
};

// Helper function to fetch a sample resource for testing
export const fetchSampleResource = async () => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === '42P01') {
        return { success: false, message: 'Resources table does not exist' };
      }
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create a test resource to verify we can write to the database
export const createTestResource = async () => {
  try {
    const testResource = {
      title: 'Test Resource',
      description: 'This is a test resource to verify database write access',
      url: 'https://example.com/test',
      category: 'test',
      tags: ['test'],
      // Include other required fields
      is_test: true
    };
    
    const { data, error } = await supabase
      .from('resources')
      .insert([testResource], { 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .select();
      
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

// Check if we can query the profile table (common in Supabase)
export const checkProfileAccess = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);
      
    if (error && error.code !== '42P01') {
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Verify full database access
export const verifyDatabaseAccess = async () => {
  try {
    // Check profile access
    const profileAccess = await checkProfileAccess();
    
    // Check resource table
    const resourceExists = await verifyResourceTable();
    
    // Try to fetch a sample resource
    const sampleResource = await fetchSampleResource();
    
    return {
      success: profileAccess.success && (resourceExists || sampleResource.success),
      profileAccess,
      resourceExists,
      sampleResource
    };
  } catch (error) {
    return { success: false, error };
  }
}; 