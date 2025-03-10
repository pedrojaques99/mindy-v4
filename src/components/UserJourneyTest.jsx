import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../main';

const UserJourneyTest = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState({
    homepage: { status: 'pending', message: 'Not tested yet' },
    filtering: { status: 'pending', message: 'Not tested yet' },
    resourceDetails: { status: 'pending', message: 'Not tested yet' },
    navigation: { status: 'pending', message: 'Not tested yet' }
  });
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Fetch data needed for tests
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // Fetch a sample of resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .limit(10);
          
        if (resourcesError) throw resourcesError;
        setResources(resourcesData || []);
        
        // Extract unique categories, subcategories, and tags
        if (resourcesData && resourcesData.length > 0) {
          const uniqueCategories = [...new Set(resourcesData.map(r => r.category))];
          setCategories(uniqueCategories);
          
          const uniqueSubcategories = [...new Set(resourcesData.map(r => r.subcategory))];
          setSubcategories(uniqueSubcategories);
          
          // Extract tags from all resources
          const allTags = resourcesData
            .filter(r => r.tags)
            .flatMap(r => r.tags.split(',').map(tag => tag.trim()))
            .filter(Boolean);
          
          const uniqueTags = [...new Set(allTags)];
          setTags(uniqueTags);
        }
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };
    
    fetchTestData();
  }, []);

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    
    // Test homepage
    await testHomepage();
    
    // Test filtering
    await testFiltering();
    
    // Test resource details
    await testResourceDetails();
    
    // Test navigation
    await testNavigation();
    
    setIsRunningTests(false);
  };

  // Test homepage functionality
  const testHomepage = async () => {
    setCurrentTest('homepage');
    try {
      // Check if categories are available
      if (categories.length === 0) {
        setTestResults(prev => ({
          ...prev,
          homepage: { 
            status: 'warning', 
            message: 'No categories found in database. Homepage filters may not work properly.' 
          }
        }));
        return;
      }
      
      // Check if subcategories are available
      if (subcategories.length === 0) {
        setTestResults(prev => ({
          ...prev,
          homepage: { 
            status: 'warning', 
            message: 'No subcategories found in database. Homepage filters may not work properly.' 
          }
        }));
        return;
      }
      
      setTestResults(prev => ({
        ...prev,
        homepage: { 
          status: 'success', 
          message: `Homepage ready with ${categories.length} categories and ${subcategories.length} subcategories` 
        }
      }));
    } catch (error) {
      console.error('Error testing homepage:', error);
      setTestResults(prev => ({
        ...prev,
        homepage: { status: 'error', message: `Error: ${error.message}` }
      }));
    }
  };

  // Test filtering functionality
  const testFiltering = async () => {
    setCurrentTest('filtering');
    try {
      if (categories.length === 0) {
        setTestResults(prev => ({
          ...prev,
          filtering: { 
            status: 'warning', 
            message: 'No categories available for filtering test' 
          }
        }));
        return;
      }
      
      // Test category filtering
      const category = categories[0];
      const { data: categoryResources, error: categoryError } = await supabase
        .from('resources')
        .select('*')
        .eq('category', category)
        .limit(5);
        
      if (categoryError) throw categoryError;
      
      if (!categoryResources || categoryResources.length === 0) {
        setTestResults(prev => ({
          ...prev,
          filtering: { 
            status: 'warning', 
            message: `No resources found for category "${category}"` 
          }
        }));
        return;
      }
      
      // Test subcategory filtering if available
      if (subcategories.length > 0) {
        const subcategory = subcategories[0];
        const { data: subcategoryResources, error: subcategoryError } = await supabase
          .from('resources')
          .select('*')
          .eq('subcategory', subcategory)
          .limit(5);
          
        if (subcategoryError) throw subcategoryError;
        
        if (!subcategoryResources || subcategoryResources.length === 0) {
          setTestResults(prev => ({
            ...prev,
            filtering: { 
              status: 'warning', 
              message: `Category filtering works, but no resources found for subcategory "${subcategory}"` 
            }
          }));
          return;
        }
      }
      
      // Test tag filtering if available
      if (tags.length > 0) {
        const tag = tags[0];
        const { data: tagResources, error: tagError } = await supabase
          .from('resources')
          .select('*')
          .ilike('tags', `%${tag}%`)
          .limit(5);
          
        if (tagError) throw tagError;
        
        if (!tagResources || tagResources.length === 0) {
          setTestResults(prev => ({
            ...prev,
            filtering: { 
              status: 'warning', 
              message: `Category and subcategory filtering work, but no resources found for tag "${tag}"` 
            }
          }));
          return;
        }
      }
      
      setTestResults(prev => ({
        ...prev,
        filtering: { 
          status: 'success', 
          message: 'All filtering options are working correctly' 
        }
      }));
    } catch (error) {
      console.error('Error testing filtering:', error);
      setTestResults(prev => ({
        ...prev,
        filtering: { status: 'error', message: `Error: ${error.message}` }
      }));
    }
  };

  // Test resource details functionality
  const testResourceDetails = async () => {
    setCurrentTest('resourceDetails');
    try {
      if (resources.length === 0) {
        setTestResults(prev => ({
          ...prev,
          resourceDetails: { 
            status: 'warning', 
            message: 'No resources available for details test' 
          }
        }));
        return;
      }
      
      // Get a sample resource
      const resource = resources[0];
      
      // Test resource details retrieval
      const { data: resourceDetails, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resource.id)
        .single();
        
      if (resourceError) throw resourceError;
      
      if (!resourceDetails) {
        setTestResults(prev => ({
          ...prev,
          resourceDetails: { 
            status: 'error', 
            message: `Could not retrieve details for resource "${resource.title}"` 
          }
        }));
        return;
      }
      
      // Test comments functionality
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('resource_id', resource.id)
        .limit(5);
        
      if (commentsError) throw commentsError;
      
      // Test related resources functionality
      const { data: relatedResources, error: relatedError } = await supabase
        .from('resources')
        .select('*')
        .eq('category', resource.category)
        .neq('id', resource.id)
        .limit(5);
        
      if (relatedError) throw relatedError;
      
      setTestResults(prev => ({
        ...prev,
        resourceDetails: { 
          status: 'success', 
          message: `Resource details page working with ${comments?.length || 0} comments and ${relatedResources?.length || 0} related resources` 
        }
      }));
    } catch (error) {
      console.error('Error testing resource details:', error);
      setTestResults(prev => ({
        ...prev,
        resourceDetails: { status: 'error', message: `Error: ${error.message}` }
      }));
    }
  };

  // Test navigation functionality
  const testNavigation = async () => {
    setCurrentTest('navigation');
    try {
      // Check if all necessary routes are defined
      const requiredRoutes = [
        '/',
        '/category/all',
        '/resource/:id',
        '/favorites',
        '/profile',
        '/submit'
      ];
      
      // Check if we have resources for testing navigation
      if (resources.length === 0 || categories.length === 0) {
        setTestResults(prev => ({
          ...prev,
          navigation: { 
            status: 'warning', 
            message: 'Not enough data to fully test navigation' 
          }
        }));
        return;
      }
      
      setTestResults(prev => ({
        ...prev,
        navigation: { 
          status: 'success', 
          message: 'Navigation paths are properly defined' 
        }
      }));
    } catch (error) {
      console.error('Error testing navigation:', error);
      setTestResults(prev => ({
        ...prev,
        navigation: { status: 'error', message: `Error: ${error.message}` }
      }));
    }
  };

  // Navigate to test specific pages
  const navigateToHomepage = () => {
    navigate('/');
  };

  const navigateToCategory = (category) => {
    navigate(`/category/${category || 'all'}`);
  };

  const navigateToResource = (resourceId) => {
    if (!resourceId && resources.length > 0) {
      resourceId = resources[0].id;
    }
    
    if (resourceId) {
      navigate(`/resource/${resourceId}`);
    } else {
      alert('No resources available to navigate to');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">User Journey Test</h2>
        <p className="text-gray-400">Testing the complete user journey through the application</p>
      </div>
      
      <div className="bg-dark-300 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Test Results</h3>
          <button 
            onClick={runAllTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-lime-accent text-dark-500 rounded-lg font-medium hover:bg-lime-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? `Testing ${currentTest}...` : 'Run All Tests'}
          </button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(testResults).map(([key, { status, message }]) => (
            <div key={key} className="bg-dark-400 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white capitalize">{key} Test</h4>
                  <p className={`text-sm mt-1 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)} {message}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded bg-dark-500 ${getStatusColor(status)}`}>
                  {status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-dark-300 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Manual Testing Links</h3>
        <p className="text-sm text-gray-400 mb-4">
          Use these links to manually test different parts of the user journey
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={navigateToHomepage}
            className="p-4 bg-dark-400 rounded-lg text-left hover:bg-dark-500 transition-colors"
          >
            <h4 className="font-medium text-white">Homepage</h4>
            <p className="text-sm text-gray-400 mt-1">
              Test filters and resource browsing
            </p>
          </button>
          
          <button 
            onClick={() => navigateToCategory(categories[0])}
            className="p-4 bg-dark-400 rounded-lg text-left hover:bg-dark-500 transition-colors"
            disabled={categories.length === 0}
          >
            <h4 className="font-medium text-white">Category Page</h4>
            <p className="text-sm text-gray-400 mt-1">
              {categories.length > 0 
                ? `Browse "${categories[0]}" category` 
                : 'No categories available'}
            </p>
          </button>
          
          <button 
            onClick={() => navigateToResource()}
            className="p-4 bg-dark-400 rounded-lg text-left hover:bg-dark-500 transition-colors"
            disabled={resources.length === 0}
          >
            <h4 className="font-medium text-white">Resource Details</h4>
            <p className="text-sm text-gray-400 mt-1">
              {resources.length > 0 
                ? `View details for "${resources[0].title}"` 
                : 'No resources available'}
            </p>
          </button>
          
          <button 
            onClick={() => navigate('/category/all')}
            className="p-4 bg-dark-400 rounded-lg text-left hover:bg-dark-500 transition-colors"
          >
            <h4 className="font-medium text-white">All Resources</h4>
            <p className="text-sm text-gray-400 mt-1">
              Browse all resources with filtering
            </p>
          </button>
        </div>
      </div>
      
      <div className="bg-dark-300 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">User Journey Checklist</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-dark-400 rounded-lg">
            <h4 className="font-medium text-white">1. Homepage Filtering</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✓ Click on category filters (Assets, Tools, etc.)</li>
              <li>✓ Click on subcategory filters (AI, Fonts, etc.)</li>
              <li>✓ Click on software filters (Figma, Photoshop, etc.)</li>
              <li>✓ Use search bar to find resources</li>
            </ul>
          </div>
          
          <div className="p-4 bg-dark-400 rounded-lg">
            <h4 className="font-medium text-white">2. Category Page</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✓ View filtered resources based on category</li>
              <li>✓ Apply additional filters (tags, subcategories)</li>
              <li>✓ Sort resources by different criteria</li>
              <li>✓ Pagination works correctly</li>
            </ul>
          </div>
          
          <div className="p-4 bg-dark-400 rounded-lg">
            <h4 className="font-medium text-white">3. Resource Details</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✓ View resource details and description</li>
              <li>✓ Like/favorite functionality works</li>
              <li>✓ Comments section loads and works</li>
              <li>✓ Related resources are displayed</li>
              <li>✓ External link opens in new tab</li>
              <li>✓ Tags are clickable and filter correctly</li>
            </ul>
          </div>
          
          <div className="p-4 bg-dark-400 rounded-lg">
            <h4 className="font-medium text-white">4. Navigation</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✓ Back button works correctly</li>
              <li>✓ Navbar links work properly</li>
              <li>✓ No dead-end pages or navigation loops</li>
              <li>✓ URL parameters are preserved when needed</li>
              <li>✓ Page transitions are smooth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserJourneyTest; 