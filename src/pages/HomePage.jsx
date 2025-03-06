import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import SearchBar from '../components/SearchBar';

// Category mapping from database categories to displayed categories with icons
const categoryMapping = {
  'assets': { name: 'Design', slug: 'design', icon: '🎨' },
  'community': { name: 'Resources', slug: 'resources', icon: '📚' },
  'design': { name: 'Design', slug: 'design', icon: '🎨' },
  'reference': { name: 'Resources', slug: 'resources', icon: '📚' },
  'tool': { name: 'Tools', slug: 'tools', icon: '🔧' },
  'tutorial': { name: 'Development', slug: 'development', icon: '💻' },
  'shop': { name: 'Resources', slug: 'resources', icon: '📚' }
};

// Display categories that should appear on the home page
const displayCategories = [
  { id: 'design', name: 'Design', slug: 'design', icon: '🎨' },
  { id: 'development', name: 'Development', slug: 'development', icon: '💻' },
  { id: 'tools', name: 'Tools', slug: 'tools', icon: '🔧' },
  { id: 'resources', name: 'Resources', slug: 'resources', icon: '📚' }
];

const HomePage = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured resources
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('featured', true)
          .limit(6);

        if (resourcesError) throw resourcesError;
        setFeaturedResources(resources || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Placeholder data for development
  const placeholderResources = [
    {
      id: 1,
      title: 'Figma Design System',
      description: 'A comprehensive design system for Figma with components and styles.',
      url: 'https://example.com/figma-design-system',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'design',
      tags: ['figma', 'design-system', 'ui'],
    },
    {
      id: 2,
      title: 'React Component Library',
      description: 'A collection of reusable React components for building modern UIs.',
      url: 'https://example.com/react-components',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'development',
      tags: ['react', 'components', 'ui'],
    },
    {
      id: 3,
      title: 'CSS Animation Toolkit',
      description: 'A toolkit for creating beautiful CSS animations with ease.',
      url: 'https://example.com/css-animations',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'development',
      tags: ['css', 'animation', 'web'],
    },
    {
      id: 4,
      title: 'Color Palette Generator',
      description: 'Generate beautiful color palettes for your design projects.',
      url: 'https://example.com/color-palette',
      image_url: 'https://via.placeholder.com/300x200',
      category: 'tools',
      tags: ['colors', 'design', 'palette'],
    },
  ];

  const displayResources = featuredResources.length > 0 ? featuredResources : placeholderResources;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Discover curated resources for designers and developers
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl">
            MINDY is a collection of high-quality resources, tools, and inspiration to help you build better projects.
          </p>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/category/design" className="btn btn-primary">
              Explore Design Resources
            </Link>
            <Link to="/category/development" className="btn btn-secondary">
              Browse Development Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="glass-card p-6 hover:bg-glass-300 transition-all"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="text-lg font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Resources</h2>
          <Link to="/category/all" className="text-lime-accent hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResources.map((resource) => (
            <Link key={resource.id} to={`/resource/${resource.id}`} className="glass-card hover:bg-glass-300 transition-all">
              <div className="aspect-video bg-dark-400 rounded-t-xl overflow-hidden">
                <img
                  src={resource.image_url || 'https://via.placeholder.com/300x200'}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags && resource.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
