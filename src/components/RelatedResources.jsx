import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import AutoThumbnail from './ui/AutoThumbnail';

export default function RelatedResources({ resources }) {
  if (!resources || resources.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {resources.map(resource => (
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
                />
              ) : (
                <AutoThumbnail 
                  url={resource.url}
                  title={resource.title}
                  category={resource.category}
                  className="w-full h-full"
                />
              )}
            </div>
            
            {/* Content */}
            <div className="p-3 flex-1">
              <h3 className="text-sm font-medium text-white truncate">{resource.title}</h3>
              {resource.url && (
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <ExternalLinkIcon className="w-3 h-3 mr-1" />
                  <span className="truncate">{new URL(resource.url).hostname.replace('www.', '')}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 