/**
 * Utility functions for fetching website thumbnails
 */

/**
 * Get a thumbnail URL for a website using various services
 * 
 * @param {string} url - The URL of the website
 * @param {Object} options - Options for thumbnail generation
 * @param {string} options.size - Size of the thumbnail (small, medium, large)
 * @param {boolean} options.fallbackToScreenshot - Whether to fallback to screenshot service if URL is invalid
 * @returns {string} - URL of the thumbnail
 */
export const getWebsiteThumbnail = (url, options = {}) => {
  if (!url) return null;
  
  const { 
    size = 'medium',
    fallbackToScreenshot = true 
  } = options;
  
  // Ensure URL has a protocol
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = `https://${url}`;
  }
  
  // Clean the URL for display (not for API calls)
  let cleanUrl = url;
  try {
    // Remove protocol and trailing slashes for cleaner URLs
    cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  } catch (error) {
    console.error('Error cleaning URL:', error);
  }
  
  // Size mappings for different services
  const sizes = {
    small: { width: 320, height: 240 },
    medium: { width: 640, height: 480 },
    large: { width: 1280, height: 720 }
  };
  
  const { width, height } = sizes[size] || sizes.medium;
  
  try {
    // Always use encodeURIComponent for the full URL to ensure special characters are properly encoded
    const encodedUrl = encodeURIComponent(fullUrl);
    
    // Try to use Microlink API first (high quality, supports most sites)
    return `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&embed=screenshot.url`;
  } catch (error) {
    console.error('Error generating Microlink URL:', error);
    
    // Fallback to screenshot service if needed
    if (fallbackToScreenshot) {
      try {
        const encodedUrl = encodeURIComponent(fullUrl);
        return `https://api.apiflash.com/v1/urltoimage?access_key=free&url=${encodedUrl}&width=${width}&height=${height}&response_type=image`;
      } catch (fallbackError) {
        console.error('Error generating fallback screenshot URL:', fallbackError);
        return null;
      }
    }
    return null;
  }
};

/**
 * Get a favicon URL for a website
 * 
 * @param {string} url - The URL of the website
 * @returns {string} - URL of the favicon
 */
export const getWebsiteFavicon = (url) => {
  if (!url) return null;
  
  try {
    // Ensure URL has a protocol for proper URL parsing
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }
    
    // Extract domain from URL
    const domain = new URL(fullUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  } catch (error) {
    console.error('Error getting favicon:', error);
    
    // Try a simpler fallback method for the domain
    try {
      // Just use the raw URL as the domain, might work in some cases
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=64`;
    } catch (fallbackError) {
      console.error('Error in favicon fallback:', fallbackError);
      return null;
    }
  }
}; 