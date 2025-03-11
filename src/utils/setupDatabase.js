import { supabase } from '../main';

// Function to set up the database tables and seed data
export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // First, check if we have a working connection to the Supabase server
    const connectionStatus = await testConnection();
    
    if (!connectionStatus.success) {
      console.error('Cannot connect to Supabase:', connectionStatus.error);
      return false;
    }
    
    console.log('Connection to Supabase successful!');
    
    // Don't try to create the health_check table directly, use an RPC function
    // This avoids permissions issues with creating tables
    const { data: healthData, error: healthError } = await supabase
      .rpc('ensure_health_check_table', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
    if (healthError) {
      console.error('Error with health_check table:', healthError);
      
      // If RPC fails, try a direct approach as fallback
      // This will still fail if permissions aren't available, but it's worth a try
      try {
        const { error: directError } = await supabase
          .from('health_check')
          .upsert(
            [{ id: 1, status: 'ok', message: 'Health check created', created_at: new Date().toISOString() }],
            { 
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          
        if (directError) {
          console.error('Direct health_check insertion failed:', directError);
          return false;
        } else {
          console.log('Health check table created using direct insertion');
        }
      } catch (directError) {
        console.error('Cannot create health_check table via direct insertion:', directError);
        return false;
      }
    } else {
      console.log('Health check table operation successful');
    }
    
    // We'll only try to insert translations if health check succeeded
    // Use Content-Type headers for all operations
    const { error: enError } = await supabase
      .from('translations')
      .upsert(
        [
          { language: 'en', key: 'home.hero.title', value: 'Discover' },
          { language: 'en', key: 'home.hero.titleHighlight', value: 'Creative Resources' },
          { language: 'en', key: 'home.hero.titleEnd', value: 'for Your Projects' },
          { language: 'en', key: 'home.hero.subtitle', value: 'Find the best tools, assets, and inspiration for designers, developers, and creators.' },
          { language: 'en', key: 'home.search.placeholder', value: 'Search for resources, tools, or inspiration...' },
          { language: 'en', key: 'home.search.submit', value: 'Submit search' },
          { language: 'en', key: 'categories.assets', value: 'Assets' },
          { language: 'en', key: 'categories.tools', value: 'Tools' },
          { language: 'en', key: 'categories.community', value: 'Community' },
          { language: 'en', key: 'categories.reference', value: 'Reference' },
          { language: 'en', key: 'categories.inspiration', value: 'Inspiration' },
          { language: 'en', key: 'categories.learn', value: 'Learn' },
          { language: 'en', key: 'categories.software', value: 'Software' }
        ],
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
    if (enError) {
      if (enError.code === '42P01') {
        console.warn('Translation table does not exist, but that may be okay');
      } else {
        console.error('Error inserting English translations:', enError);
      }
    } else {
      console.log('English translations inserted successfully');
    }
    
    console.log('Database setup phase completed');
    return true;
  } catch (error) {
    console.error('Unexpected error in setupDatabase:', error);
    return false;
  }
};

// Helper function to test the database connection
const testConnection = async () => {
  try {
    console.log('Testing connection to Supabase...');
    const supabaseUrl = supabase.supabaseUrl;
    
    // Special handling for MCP server
    if (supabaseUrl.includes('mcp-supabase-server')) {
      console.log('Using MCP Supabase server');
      
      try {
        // Try to execute a simple query that works with MCP server
        const { data, error } = await supabase
          .from('resources')
          .select('count', { count: 'exact', head: true });
          
        if (error) {
          console.warn('MCP server query returned error:', error);
          return { success: false, error, server: 'mcp' };
        }
        
        return { 
          success: true, 
          message: 'MCP server connection successful',
          server: 'mcp'
        };
      } catch (mcpError) {
        console.error('Error connecting to MCP server:', mcpError);
        return { success: false, error: mcpError, server: 'mcp' };
      }
    }
    
    // Try to query something simple
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);
      
    if (error) {
      // If "relation does not exist", that's still a successful connection to the database
      if (error.code === '42P01') {
        return { success: true, message: 'Connected, but profiles table does not exist' };
      }
      
      return { success: false, error };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, error };
  }
};

// Function to check if the database is set up
export const checkDatabaseSetup = async () => {
  try {
    // Try to query the health_check table
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
      
    // If we get a "relation does not exist" error, the table doesn't exist
    if (error && error.code === '42P01') {
      console.log('Database not set up: health_check table does not exist');
      return false;
    }
    
    // Any other error means we couldn't connect properly
    if (error) {
      console.error('Error checking database setup:', error);
      return false;
    }
    
    // If we get here, the health_check table exists
    console.log('Database is set up: health_check table exists');
    return true;
  } catch (error) {
    console.error('Error checking database setup:', error);
    return false;
  }
}; 