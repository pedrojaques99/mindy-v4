import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import AutoThumbnail from './ui/AutoThumbnail';
import { getResourceThumbnails } from '../utils/thumbnailUtils';

export default function RelatedResources({ resources }) {
  if (!resources || resources.length === 0) {
    return null;
  }
  
  // Set up a map to hold thumbnails for each resource
  const [thumbnails, setThumbnails] = useState({});
  
  // Generate thumbnails for all related resources when the component mounts
  useEffect(() => {
    const resourceThumbnails = {};
    
    resources.forEach(resource => {
      if (resource && !resource.image_url) {
        const { thumbnailUrl } = getResourceThumbnails(resource);
        resourceThumbnails[resource.id] = thumbnailUrl;
      }
    });
    
    setThumbnails(resourceThumbnails);
  }, [resources]);
  
  // Handle thumbnail errors
  const handleThumbnailError = (resourceId) => {
    setThumbnails(prev => ({
      ...prev,
      [resourceId]: null
    }));
  };
  
  return (
    <div className="space-y-4">
      {resources.map(resource => {
        // Skip invalid resources
        if (!resource || !resource.id) {
          console.warn('Invalid resource found in RelatedResources:', resource);
          return null;
        }
        
        return (
          <Link 
            key={resource.id}
            to={`/resource/${resource.id}`}
            className="block bg-dark-300 rounded-lg overflow-hidden hover:bg-dark-400 transition-colors"
          >
            <div className="flex items-center">
              {/* Thumbnail */}
              <div className="w-20 h-20 flex-shrink-0">
                {resource.image_url ? (
                  <img 
                    src={resource.image_url} 
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loops
                      e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                ) : (
                  <AutoThumbnail 
                    src={thumbnails[resource.id] || null}
                    alt={resource.title}
                    url={resource.url}
                    title={resource.title}
                    category={resource.category || ''}
                    subcategory={resource.subcategory || ''}
                    tags={resource.tags || []}
                    className="w-full h-full"
                    onError={() => handleThumbnailError(resource.id)}
                  />
                )}
              </div>
              
              {/* Content */}
              <div className="p-3 flex-1">
                <h3 className="text-sm font-medium text-white truncate">{resource.title}</h3>
                {resource.url && (
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                    <span className="truncate">
                      {(() => {
                        try {
                          // Ensure URL has a protocol
                          const urlToProcess = resource.url.startsWith('http') 
                            ? resource.url 
                            : `https://${resource.url}`;
                          return new URL(urlToProcess).hostname.replace('www.', '');
                        } catch (error) {
                          console.error('Invalid URL in RelatedResources:', resource.url, error);
                          return 'Link';
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 