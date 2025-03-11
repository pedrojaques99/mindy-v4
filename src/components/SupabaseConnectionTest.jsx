import { useState, useEffect } from 'react';
import { supabase } from '../main';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalResources: 0,
    categories: [],
    subcategories: []
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabaseUrl = supabase.supabaseUrl;
        console.log('Testing connection to Supabase:', supabaseUrl);
        
        // First check if network is available
        try {
          const networkTest = await fetch('https://www.google.com', { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            timeout: 5000
          });
          console.log('Network connection available');
        } catch (networkError) {
          console.error('Network connectivity issue detected:', networkError);
          setConnectionStatus('failed');
          setError('Internet connection appears to be unavailable. Please check your network connectivity.');
          return;
        }
        
        // Handle MCP server separately
        if (supabaseUrl.includes('mcp-supabase-server')) {
          console.log('Using MCP Supabase server');
          
          // First try with a short timeout to test if the server is responsive
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${supabaseUrl}/ping`, {
              method: 'GET',
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`MCP server responded with status: ${response.status}`);
            }
            
            console.log('MCP server is responsive');
          } catch (pingError) {
            console.error('MCP server ping failed:', pingError);
            setConnectionStatus('failed');
            setError(`Cannot connect to MCP server: ${pingError.message}. The server might be down or unreachable.`);
            return;
          }
          
          // Try a simple query that should work with MCP server
          const { data, error } = await supabase
            .from('resources')
            .select('*')
            .limit(1);
          
          if (error) throw error;
          
          console.log('MCP server connection successful:', data);
          setConnectionStatus('connected');
          
          // Fetch resources for display
          const { data: resourcesData, error: resourcesError } = await supabase
            .from('resources')
            .select('*')
            .limit(5);
            
          if (resourcesError) throw resourcesError;
          setResources(resourcesData || []);
          
          // Get statistics
          const { data: allResources, error: statsError } = await supabase
            .from('resources')
            .select('category, subcategory');
            
          if (statsError) throw statsError;
          
          // Calculate stats
          const totalCount = allResources.length;
          const categories = [...new Set(allResources.map(r => r.category))];
          const subcategories = [...new Set(allResources.map(r => r.subcategory))];
          
          setStats({
            totalResources: totalCount,
            categories,
            subcategories
          });
          
          return;
        }
        
        // Standard connection test (non-MCP)
        // Test connection by fetching a single resource
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .limit(1);

        if (error) throw error;
        
        setConnectionStatus('connected');
        
        // Fetch resources for display
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .limit(5);
          
        if (resourcesError) throw resourcesError;
        setResources(resourcesData || []);
        
        // Get statistics
        const { data: allResources, error: statsError } = await supabase
          .from('resources')
          .select('category, subcategory');
          
        if (statsError) throw statsError;
        
        // Calculate stats
        const totalCount = allResources.length;
        const categories = [...new Set(allResources.map(r => r.category))];
        const subcategories = [...new Set(allResources.map(r => r.subcategory))];
        
        setStats({
          totalResources: totalCount,
          categories,
          subcategories
        });
        
      } catch (err) {
        console.error('Supabase connection test failed:', err);
        setConnectionStatus('failed');
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Supabase Connection Test</h2>
        <p className="text-gray-400">Testing connection to your Supabase database</p>
      </div>
      
      <div className="bg-dark-300 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Connection Status</h3>
        
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            connectionStatus === 'checking' ? 'bg-yellow-400' :
            connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          
          <span className="font-medium">
            {connectionStatus === 'checking' ? 'Checking connection...' :
             connectionStatus === 'connected' ? 'Connected to Supabase' : 'Connection failed'}
          </span>
        </div>
        
        {error && (
          <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {connectionStatus === 'connected' && (
        <>
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Database Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-400 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Resources</p>
                <p className="text-2xl font-bold text-lime-400">{stats.totalResources}</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-lime-400">{stats.categories.length}</p>
              </div>
              <div className="bg-dark-400 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Subcategories</p>
                <p className="text-2xl font-bold text-lime-400">{stats.subcategories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Sample Resources</h3>
            
            {resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map(resource => (
                  <div key={resource.id} className="bg-dark-400 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{resource.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-dark-500 text-gray-300">
                        {resource.category}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {resource.tags && resource.tags.split(',').map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-dark-500 rounded-full text-xs text-gray-300">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm text-lime-400 hover:text-lime-300"
                    >
                      Visit resource
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No resources found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SupabaseConnectionTest; 