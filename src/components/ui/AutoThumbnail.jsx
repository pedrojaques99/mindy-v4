import React, { useMemo } from 'react';

/**
 * AutoThumbnail - Generates a visually appealing thumbnail when no image is available
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the resource
 * @param {string} props.category - The category of the resource
 * @param {string} props.subcategory - The subcategory of the resource
 * @param {Array} props.tags - Array of tags for the resource
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - A visually appealing thumbnail
 */
export default function AutoThumbnail({ title, category, subcategory, tags = [], className = '' }) {
  // Generate a unique ID for this thumbnail instance to avoid pattern ID conflicts
  const uniqueId = useMemo(() => {
    return `thumb-${Math.random().toString(36).substring(2, 9)}`;
  }, []);
  
  // Generate a consistent color based on category
  const bgColor = useMemo(() => {
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
    
    return colors[category?.toLowerCase()] || colors.default;
  }, [category]);
  
  // Get a secondary color for accents
  const accentColor = useMemo(() => {
    // Lighten the main color for the accent
    const lightenColor = (color, percent) => {
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
    };
    
    return lightenColor(bgColor, 20);
  }, [bgColor]);
  
  // Get first letter of each word for the icon
  const initials = useMemo(() => {
    if (!title) return '?';
    return title
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }, [title]);
  
  // Get a tag to display (if available)
  const primaryTag = tags && tags.length > 0 ? tags[0] : subcategory;
  
  // Generate a unique pattern based on the category
  const patternType = useMemo(() => {
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
    
    return patterns[category?.toLowerCase()] || patterns.default;
  }, [category]);
  
  // Generate pattern SVG based on type
  const renderPattern = () => {
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
  };
  
  // Get pattern ID for the rect fill
  const patternId = `${patternType}-${uniqueId}`;
  
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
            {renderPattern()}
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
          {title}
        </h3>
        
        {primaryTag && (
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
            {primaryTag}
          </span>
        )}
      </div>
      
      {/* Category indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-white/70 font-medium px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-sm">
        {category}
      </div>
    </div>
  );
} 