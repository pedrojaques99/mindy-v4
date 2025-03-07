import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatAltIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { getWebsiteFavicon, getWebsiteThumbnail } from '../utils/thumbnailUtils';

const ResourceCard = ({ resource, onCardClick }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [favicon, setFavicon] = useState(null);
  
  useEffect(() => {
    // Get website thumbnail
    if (resource.url) {
      const thumbnailUrl = getWebsiteThumbnail(resource.url);
      setThumbnail(thumbnailUrl);
      
      // Get favicon
      const faviconUrl = getWebsiteFavicon(resource.url);
      setFavicon(faviconUrl);
    }
  }, [resource.url]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get comment count
  const commentCount = resource.comments?.[0]?.count || 0;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="bg-dark-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
      onClick={() => onCardClick(resource)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-dark-300 relative overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={resource.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-300">
            {favicon ? (
              <img 
                src={favicon} 
                alt="" 
                className="w-12 h-12 opacity-50"
              />
            ) : (
              <div className="text-3xl opacity-30">🔗</div>
            )}
          </div>
        )}
        
        {/* Category tag */}
        <div className="absolute top-2 left-2">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-md bg-dark-400/80 text-gray-300 backdrop-blur-sm">
            {resource.category || resource.categories?.name || 'Resource'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title and favicon */}
        <div className="flex items-start gap-3 mb-2">
          {favicon && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-dark-400 p-0.5">
              <img 
                src={favicon} 
                alt="" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <h3 className="text-white font-medium text-base leading-tight flex-1">
            {resource.title}
          </h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {resource.description}
        </p>
        
        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-block px-2 py-0.5 text-xs bg-dark-300 text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs bg-dark-300 text-gray-400 rounded">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dark-300">
          {/* User and date */}
          <div className="flex items-center">
            {resource.profiles?.avatar_url && (
              <img 
                src={resource.profiles.avatar_url} 
                alt="" 
                className="w-4 h-4 rounded-full mr-1"
              />
            )}
            <span>
              {resource.profiles?.username || 'User'} • {formatDate(resource.created_at)}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-3">
            {/* Comments count */}
            <div className="flex items-center">
              <ChatAltIcon className="w-3 h-3 mr-1" />
              <span>{commentCount}</span>
            </div>
            
            {/* Upvotes count */}
            <div className="flex items-center">
              <ThumbUpIcon className="w-3 h-3 mr-1" />
              <span>{resource.upvotes || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard; 