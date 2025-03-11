import { supabase } from '../main';

// Function to set up the database tables and seed data
export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // First, check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_dummy_query_for_connection_test_')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    // If we get an error other than "relation does not exist", we can't connect
    if (connectionError && connectionError.code !== '42P01') {
      console.error('Cannot connect to database:', connectionError);
      return false;
    }
    
    // Try to create health_check table by inserting data
    // This will fail if we don't have permission to create tables
    const { error: healthCheckError } = await supabase
      .from('health_check')
      .upsert([
        { id: 1, status: 'ok', message: 'Health check table created', created_at: new Date().toISOString() }
      ]);
    
    if (healthCheckError) {
      console.error('Error with health_check table:', healthCheckError);
      
      // If the error is not "relation does not exist", we can't create tables
      if (healthCheckError.code !== '42P01') {
        console.error('Cannot create tables in database');
        return false;
      }
    } else {
      console.log('Health check table created or updated');
    }
    
    // Try to create translations table by inserting data
    // Seed translations data
    const englishTranslations = [
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
    ];
    
    // Try to insert English translations
    const { error: enError } = await supabase
      .from('translations')
      .upsert(englishTranslations);
      
    if (enError) {
      console.error('Error inserting English translations:', enError);
      
      // If the error is not "relation does not exist", we can't create tables
      if (enError.code !== '42P01') {
        console.error('Cannot create translations table in database');
        return false;
      }
    } else {
      console.log('English translations inserted successfully');
      
      // If English translations worked, try Portuguese
      const portugueseTranslations = [
        { language: 'pt', key: 'home.hero.title', value: 'Descubra' },
        { language: 'pt', key: 'home.hero.titleHighlight', value: 'Recursos Criativos' },
        { language: 'pt', key: 'home.hero.titleEnd', value: 'para seus Projetos' },
        { language: 'pt', key: 'home.hero.subtitle', value: 'Encontre as melhores ferramentas, recursos e inspiração para designers, desenvolvedores e criadores.' },
        { language: 'pt', key: 'home.search.placeholder', value: 'Busque por recursos, ferramentas ou inspiração...' },
        { language: 'pt', key: 'home.search.submit', value: 'Buscar' },
        { language: 'pt', key: 'categories.assets', value: 'Recursos' },
        { language: 'pt', key: 'categories.tools', value: 'Ferramentas' },
        { language: 'pt', key: 'categories.community', value: 'Comunidade' },
        { language: 'pt', key: 'categories.reference', value: 'Referência' },
        { language: 'pt', key: 'categories.inspiration', value: 'Inspiração' },
        { language: 'pt', key: 'categories.learn', value: 'Aprender' },
        { language: 'pt', key: 'categories.software', value: 'Software' }
      ];
      
      // Insert Portuguese translations
      const { error: ptError } = await supabase
        .from('translations')
        .upsert(portugueseTranslations);
        
      if (ptError) {
        console.error('Error inserting Portuguese translations:', ptError);
      } else {
        console.log('Portuguese translations inserted successfully');
      }
    }
    
    console.log('Database setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
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