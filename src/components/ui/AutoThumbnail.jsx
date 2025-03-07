import React, { useMemo, useState } from 'react';

/**
 * AutoThumbnail - Displays an image thumbnail or generates a visually appealing one when no image is available
 * 
 * @param {Object} props
 * @param {string} props.src - URL of the thumbnail image
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.url - URL of the resource
 * @param {string} props.title - The title of the resource
 * @param {string} props.category - The category of the resource
 * @param {string} props.subcategory - The subcategory of the resource
 * @param {Array} props.tags - Array of tags for the resource
 * @param {function} props.onError - Error handler for image loading
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - An image or a generated thumbnail
 */
export default function AutoThumbnail({ 
  src, 
  alt = '', 
  url = '', 
  title = 'Resource', 
  category = '', 
  subcategory = '', 
  tags = [], 
  onError,
  className = '' 
}) {
  // Safety check - ensure tags is always an array
  const safeTags = Array.isArray(tags) ? tags : [];
  
  const [imgError, setImgError] = useState(false);
  
  // Handle image error
  const handleImageError = (e) => {
    setImgError(true);
    // Call passed onError handler if it exists
    if (onError && typeof onError === 'function') {
      onError(e);
    }
  };

  // Check if we should use a real image or generate one
  const useRealImage = src && !imgError;
  
  // IMPORTANT: All hooks must be called before any conditional returns
  // Generate a unique ID for this thumbnail instance
  const uniqueId = useMemo(() => {
    return `thumb-${Math.random().toString(36).substring(2, 9)}`;
  }, []);
  
  // Generate a consistent color based on category
  const bgColor = useMemo(() => {
    // If no category is provided, use a default category
    const safeCategory = category?.toLowerCase() || 'default';
    
    const colors = {
      'design': '#FF5A5F',
      'assets': '#00A699',
      'tool': '#FC642D',
      'reference': '#7B61FF',
      'tutorial': '#FFBD45',
      'community': '#00B8D9',
      'shop': '#6554C0',
      // Default color if category doesn't match
      'default': '#1a1a1a'
    };
    
    return colors[safeCategory] || colors.default;
  }, [category]);
  
  // Get a secondary color for accents
  const accentColor = useMemo(() => {
    // Lighten the main color for the accent
    const lightenColor = (color, percent) => {
      try {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
      } catch (error) {
        console.error('Error creating accent color:', error);
        return '#333333'; // Fallback dark color
      }
    };
    
    return lightenColor(bgColor, 20);
  }, [bgColor]);
  
  // Get first letter of each word for the icon
  const initials = useMemo(() => {
    if (!title) return '?';
    
    try {
      return title
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    } catch (error) {
      console.error('Error generating initials:', error);
      return '?';
    }
  }, [title]);
  
  // Get a tag to display (if available)
  const primaryTag = safeTags.length > 0 ? safeTags[0] : subcategory;
  
  // Generate a unique pattern based on the category
  const patternType = useMemo(() => {
    // If no category is provided, use a default pattern
    const safeCategory = category?.toLowerCase() || 'default';
    
    const patterns = {
      'design': 'circles',
      'assets': 'grid',
      'tool': 'triangles',
      'reference': 'dots',
      'tutorial': 'zigzag',
      'community': 'waves',
      'shop': 'diamonds',
      'default': 'grid'
    };
    
    return patterns[safeCategory] || patterns.default;
  }, [category]);
  
  // Generate pattern SVG based on type - wrapped in try-catch for safety
  const patternElement = useMemo(() => {
    try {
      const patternId = `${patternType}-${uniqueId}`;
      
      switch (patternType) {
        case 'circles':
          return (
            <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="5" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          );
        case 'triangles':
          return (
            <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M0,0 L15,30 L30,0 Z" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          );
        case 'dots':
          return (
            <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1.5" fill="white" />
              <circle cx="15" cy="15" r="1.5" fill="white" />
            </pattern>
          );
        case 'zigzag':
          return (
            <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 L5,0 L10,10 L15,0 L20,10" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          );
        case 'waves':
          return (
            <pattern id={patternId} width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 Q10,20 20,10 Q30,0 40,10" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          );
        case 'diamonds':
          return (
            <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          );
        case 'grid':
        default:
          return (
            <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          );
      }
    } catch (error) {
      console.error('Error rendering pattern:', error);
      // Return simple fallback pattern
      return (
        <pattern id={`default-${uniqueId}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" stroke="white" strokeWidth="1"/>
        </pattern>
      );
    }
  }, [patternType, uniqueId]);
  
  // Get pattern ID for the rect fill - with safety
  const patternId = `${patternType}-${uniqueId}`;

  // NOW we can do conditional rendering after all hooks have been called
  if (useRealImage) {
    return (
      <img 
        src={src} 
        alt={alt || title || 'Resource thumbnail'} 
        className={className || 'w-full h-full object-cover'}
        onError={handleImageError} 
      />
    );
  }
  
  // Wrap the entire render in try/catch as a last resort safety measure
  try {
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden ${className}`}
        style={{ 
          background: `linear-gradient(135deg, ${bgColor} 0%, ${accentColor} 100%)` 
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {patternElement}
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mr-8 -mt-8 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 -ml-16 -mb-16 blur-xl"></div>
        
        {/* Main content */}
        <div className="z-10 text-center p-4">
          <div 
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 mx-auto backdrop-blur-sm"
            style={{ boxShadow: `0 0 20px ${accentColor}40` }}
          >
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 text-shadow">
            {title || alt || 'Resource'}
          </h3>
          
          {primaryTag && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
              {primaryTag}
            </span>
          )}
        </div>
        
        {/* Category indicator */}
        {category && (
          <div className="absolute bottom-2 right-2 text-xs text-white/70 font-medium px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-sm">
            {category}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Fatal error in AutoThumbnail rendering:', error);
    // Ultimate fallback - extremely simple thumbnail
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800 ${className}`}>
        <div className="text-white text-center p-4">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-sm opacity-80">Resource</div>
        </div>
      </div>
    );
  }
} 