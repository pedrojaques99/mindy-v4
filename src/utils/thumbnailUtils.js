/**
 * Utility functions for handling website thumbnails and favicons
 */

/**
 * Get a thumbnail for a website URL
 * @param {string} url - The website URL
 * @param {Object} options - Options for the thumbnail
 * @param {string} options.size - Size of the thumbnail (small, medium, large)
 * @returns {string} The thumbnail URL
 */
export const getWebsiteThumbnail = (url, options = { size: 'medium' }) => {
  if (!url) return null;
  
  try {
    // Clean the URL
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Size mapping
    const sizeMap = {
      small: '320x240',
      medium: '640x480',
      large: '1280x960'
    };
    
    const size = sizeMap[options.size] || sizeMap.medium;
    
    // Use a screenshot service
    return `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&access_key=YOUR_SCREENSHOT_API_KEY&device_scale_factor=1&format=webp&image_quality=85&viewport_width=1280&viewport_height=720&no_cookie_banners=true&no_ads=true&cache=true`;
    
    // Fallback to a free service if you don't have an API key
    // return `https://image.thum.io/get/width/640/crop/480/viewportWidth/1280/png/${encodeURIComponent(url)}`;
  } catch (error) {
    console.error('Error generating thumbnail URL:', error);
    return null;
  }
};

/**
 * Get a favicon for a website URL
 * @param {string} url - The website URL
 * @returns {string} The favicon URL
 */
export const getWebsiteFavicon = (url) => {
  if (!url) return null;
  
  try {
    // Extract the domain
    const domain = new URL(url).hostname;
    
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error('Error generating favicon URL:', error);
    return null;
  }
};

/**
 * Determine if a URL can be embedded in an iframe
 * @param {string} url - The website URL
 * @returns {boolean} Whether the URL can be embedded
 */
export const canEmbed = (url) => {
  if (!url) return false;
  
  try {
    const domain = new URL(url).hostname;
    
    // List of domains known to block embedding
    const nonEmbeddableDomains = [
      'twitter.com',
      'x.com',
      'facebook.com',
      'instagram.com',
      'linkedin.com',
      'github.com'
    ];
    
    return !nonEmbeddableDomains.some(d => domain.includes(d));
  } catch (error) {
    return false;
  }
};

/**
 * Get a color for a category
 * @param {string} category - The category name
 * @returns {string} The color hex code
 */
export const getCategoryColor = (category) => {
  if (!category) return '#bfff58'; // Default lime accent
  
  const categoryColors = {
    design: '#FF6B6B',
    development: '#48dbfb',
    marketing: '#1dd1a1',
    productivity: '#feca57',
    business: '#5f27cd',
    education: '#54a0ff',
    entertainment: '#ff9ff3',
    finance: '#00b894',
    health: '#ff6b81',
    lifestyle: '#ff9f43',
    news: '#2e86de',
    social: '#5352ed',
    sports: '#ee5253',
    technology: '#01a3a4',
    travel: '#2e86de',
    other: '#a4b0be'
  };
  
  return categoryColors[category.toLowerCase()] || '#bfff58';
}; 