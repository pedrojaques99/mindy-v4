import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../main";
import { getAllResources } from "../utils/resourceUtils";
import { toast } from "react-hot-toast";

const HomePage = ({ session }) => {
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        // Check if we're using MCP server
        const supabaseUrl = supabase.supabaseUrl;
        const isMcpServer = supabaseUrl.includes('mcp-supabase-server');
        
        if (isMcpServer) {
          console.log('Using MCP server for resource fetching');
          
          // First check if MCP server is responsive
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
          } catch (pingError) {
            console.error('MCP server ping failed:', pingError);
            setError('Cannot connect to resource server. Please try again later.');
            setLoading(false);
            return;
          }
        }
        
        // Use the utility function to get all resources
        const result = await getAllResources();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch resources');
        }
        
        // Set all resources
        setResources(result.data || []);
        
        // Set featured resources (random selection of 3)
        const allResources = result.data || [];
        if (allResources.length > 0) {
          const shuffled = [...allResources].sort(() => 0.5 - Math.random());
          setFeaturedResources(shuffled.slice(0, 3));
        }
        
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
        toast.error('Error loading resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to Mindy Resource Library</h1>
        <p>Your central hub for resources and information</p>
        
        {!session && (
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        )}
      </section>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading resources...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {featuredResources.length > 0 && (
            <section className="featured-resources">
              <h2>Featured Resources</h2>
              <div className="resource-grid">
                {featuredResources.map(resource => (
                  <div key={resource.id} className="resource-card">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <div className="resource-meta">
                      <span className="resource-category">{resource.category}</span>
                    </div>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      View Resource
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          <section className="features">
            <h2>Features</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Resource Collection</h3>
                <p>Access a wide range of curated resources in one place</p>
              </div>
              <div className="feature-card">
                <h3>Personalized Experience</h3>
                <p>Customize your profile and save your favorite resources</p>
              </div>
              <div className="feature-card">
                <h3>Community Sharing</h3>
                <p>Share and discover resources with the community</p>
              </div>
            </div>
          </section>
          
          {resources.length > 0 && (
            <section className="browse-resources">
              <h2>Browse Resources</h2>
              <Link to="/resources" className="btn btn-primary">View All Resources</Link>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
