import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import { getWebsiteFavicon } from '../utils/thumbnailUtils';

const FeaturedResourceSlider = ({ resources = [], onResourceClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favicons, setFavicons] = useState({});
  const sliderRef = useRef(null);
  
  // Fetch favicons for all resources
  useEffect(() => {
    const fetchFavicons = async () => {
      const icons = {};
      for (const resource of resources) {
        if (resource.url) {
          const favicon = getWebsiteFavicon(resource.url);
          if (favicon) {
            icons[resource.id] = favicon;
          }
        }
      }
      setFavicons(icons);
    };
    
    fetchFavicons();
  }, [resources]);
  
  // Auto-advance the slider every 5 seconds
  useEffect(() => {
    if (resources.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % resources.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [resources.length]);
  
  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? resources.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next slide
  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % resources.length
    );
  };
  
  // Handle resource click
  const handleClick = (resource) => {
    if (onResourceClick) {
      onResourceClick(resource);
    }
  };
  
  if (!resources || resources.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-400">Featured Resources</h2>
        
        {resources.length > 1 && (
          <div className="flex space-x-1">
            <button 
              onClick={prevSlide}
              className="p-1 rounded-full bg-dark-300 hover:bg-dark-400 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-1 rounded-full bg-dark-300 hover:bg-dark-400 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div 
        ref={sliderRef}
        className="overflow-hidden relative rounded-lg"
      >
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {resources.map((resource, index) => (
            <div 
              key={resource.id} 
              className="min-w-full"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div 
                className="bg-dark-300 rounded-lg h-24 flex items-center cursor-pointer hover:bg-dark-400 transition-colors p-4"
                onClick={() => handleClick(resource)}
              >
                {/* Favicon */}
                {favicons[resource.id] && (
                  <div className="w-10 h-10 rounded-full bg-dark-400 p-1 flex items-center justify-center mr-4">
                    <img 
                      src={favicons[resource.id]} 
                      alt="" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm mb-1 truncate">
                    {resource.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-1">
                    {resource.description}
                  </p>
                </div>
                
                {/* Category */}
                <div className="ml-4">
                  <span className="inline-block px-2 py-0.5 bg-dark-400 rounded text-xs text-gray-300">
                    {resource.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicators */}
        {resources.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
            {resources.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-lime-accent' : 'bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedResourceSlider; 