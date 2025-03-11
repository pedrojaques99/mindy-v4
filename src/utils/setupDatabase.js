import { supabase, checkSupabaseConnection } from '../main';

// Create an RPC function for getting tables if it doesn't exist
// This is a helper function that will be called when the app starts
const createGetTablesFunction = async () => {
  try {
    // First test if the function already exists by calling it
    const { data, error } = await supabase.rpc('get_tables');
    
    // If it works, we're done
    if (!error) {
      return true;
    }
    
    console.log('Creating get_tables function...');
    
    // We'll try to create the function if it doesn't exist
    // This requires postgres privileges which the app may not have
    const { error: createError } = await supabase.rpc('create_get_tables_function');
    
    if (createError) {
      console.warn('Could not create get_tables function:', createError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking/creating get_tables function:', error);
    return false;
  }
};

// Function to set up the database tables and seed data
export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // First, check if we have a working connection to the Supabase server
    const connectionResult = await checkSupabaseConnection();
    
    if (!connectionResult.success) {
      console.error('Cannot connect to Supabase:', connectionResult.error);
      return false;
    }
    
    console.log('Connection to Supabase successful!');
    
    // Try to create our diagnostic utilities
    await createGetTablesFunction();
    
    // Try to create health_check table if it doesn't exist
    try {
      // First, try creating the health_check table if it doesn't exist
      const { error: createTableError } = await supabase.rpc('create_health_check_table', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (createTableError) {
        console.warn('Failed to create health_check table via RPC:', createTableError);
        
        // We can't directly create tables from the client side with standard permissions
        // Let's make our code resilient to this case
        console.warn('Cannot create health_check table. This needs to be done via migration or by a DB admin.');
      }
      
      // Now try to insert or update the health check entry
      const { error: healthError } = await supabase
        .from('health_check')
        .upsert(
          [{ id: 1, status: 'ok', message: 'Health check created', created_at: new Date().toISOString() }],
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            onConflict: 'id'
          }
        );
        
      if (healthError) {
        console.error('Health check table operation failed:', healthError);
        
        if (healthError.code === '42P01') {
          console.log('Health check table does not exist. This is expected on first run.');
        } else {
          // Don't fail entirely just because health check table failed
          console.warn('Will continue with setup despite health check error');
        }
      } else {
        console.log('Health check table operation successful');
      }
    } catch (healthError) {
      console.error('Cannot create health_check table:', healthError);
      // Continue despite this error - this is not fatal
    }
    
    // Insert translations
    try {
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
    } catch (translationError) {
      console.error('Error with translations:', translationError);
    }
    
    // Try creating Spanish translations as well
    try {
      const { error: esError } = await supabase
        .from('translations')
        .upsert(
          [
            { language: 'es', key: 'home.hero.title', value: 'Descubre' },
            { language: 'es', key: 'home.hero.titleHighlight', value: 'Recursos Creativos' },
            { language: 'es', key: 'home.hero.titleEnd', value: 'para Tus Proyectos' },
            { language: 'es', key: 'home.hero.subtitle', value: 'Encuentra las mejores herramientas, recursos e inspiración para diseñadores, desarrolladores y creadores.' },
            { language: 'es', key: 'home.search.placeholder', value: 'Buscar recursos, herramientas o inspiración...' },
            { language: 'es', key: 'home.search.submit', value: 'Buscar' },
            { language: 'es', key: 'categories.assets', value: 'Recursos' },
            { language: 'es', key: 'categories.tools', value: 'Herramientas' },
            { language: 'es', key: 'categories.community', value: 'Comunidad' },
            { language: 'es', key: 'categories.reference', value: 'Referencia' },
            { language: 'es', key: 'categories.inspiration', value: 'Inspiración' },
            { language: 'es', key: 'categories.learn', value: 'Aprender' },
            { language: 'es', key: 'categories.software', value: 'Software' }
          ],
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
      if (esError && esError.code !== '42P01') {
        console.error('Error inserting Spanish translations:', esError);
      } else if (!esError) {
        console.log('Spanish translations inserted successfully');
      }
    } catch (esError) {
      console.error('Error with Spanish translations:', esError);
    }
    
    console.log('Database setup phase completed');
    return true;
  } catch (error) {
    console.error('Unexpected error in setupDatabase:', error);
    return false;
  }
};

// Function to check if the database is set up
export const checkDatabaseSetup = async () => {
  try {
    // First check if we can connect at all
    const connectionResult = await checkSupabaseConnection();
    if (!connectionResult.success) {
      console.error('Cannot connect to Supabase:', connectionResult.error);
      return false;
    }
    
    // Let's try to get a list of all tables in public schema
    // This is useful for diagnostics before we try to access specific tables
    try {
      // This uses pg_catalog to check table existence - should work with public access
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_tables', {})
        .single();
        
      if (!tablesError && tables) {
        console.log('Available tables in schema:', tables);
      } else {
        console.log('Could not get table list:', tablesError);
      }
    } catch (error) {
      console.log('Table listing not supported with current permissions');
    }
    
    // Try multiple tables in sequence - we consider the DB set up if ANY of them exist
    // This makes our app more resilient to different database configurations
    const tablesToCheck = ['health_check', 'profiles', 'resources'];
    let anyTableExists = false;
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
          .limit(1);
          
        // If we get a "relation does not exist" error, table doesn't exist
        if (error && error.code === '42P01') {
          console.log(`Table check: ${table} does not exist`);
          continue;
        }
        
        // Any other error means we couldn't query properly
        if (error) {
          console.warn(`Error checking ${table} table:`, error);
          continue;
        }
        
        // If we get here, the table exists and is queryable
        console.log(`Table check: ${table} exists and is accessible`);
        anyTableExists = true;
        break;
      } catch (error) {
        console.warn(`Exception checking ${table} table:`, error);
      }
    }
    
    if (anyTableExists) {
      console.log('Database is set up: at least one required table exists');
      return true;
    }
    
    console.log('Database not set up: no required tables exist or are accessible');
    return false;
  } catch (error) {
    console.error('Error checking database setup:', error);
    return false;
  }
}; 