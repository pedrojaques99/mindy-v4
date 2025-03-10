/**
 * Utility functions for user avatars
 */

// Avatar types
export const AVATAR_TYPES = {
  DEFAULT: 1,
  GEOMETRIC: 2,
  MINIMAL: 3
};

/**
 * Get the avatar URL based on type
 * @param {number} avatarType - The avatar type (1, 2, or 3)
 * @param {string} username - Optional username for customization
 * @returns {string} - URL to the avatar image
 */
export const getAvatarUrl = (avatarType = AVATAR_TYPES.DEFAULT, username = '') => {
  // Use username to generate consistent colors if available
  const seed = username || Math.random().toString(36).substring(2, 8);
  
  switch (avatarType) {
    case AVATAR_TYPES.GEOMETRIC:
      // Geometric abstract avatar
      return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      
    case AVATAR_TYPES.MINIMAL:
      // Minimal avatar
      return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=00897b,00acc1,039be5`;
      
    case AVATAR_TYPES.DEFAULT:
    default:
      // Default avatar
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=ffdfbf,ffd5dc,c0aede`;
  }
};

/**
 * Get preview URLs for all avatar types
 * @param {string} username - Optional username for customization
 * @returns {Array} - Array of avatar preview objects with type and URL
 */
export const getAvatarPreviews = (username = '') => {
  return [
    { 
      type: AVATAR_TYPES.DEFAULT, 
      url: getAvatarUrl(AVATAR_TYPES.DEFAULT, username),
      label: 'Robot'
    },
    { 
      type: AVATAR_TYPES.GEOMETRIC, 
      url: getAvatarUrl(AVATAR_TYPES.GEOMETRIC, username),
      label: 'Geometric'
    },
    { 
      type: AVATAR_TYPES.MINIMAL, 
      url: getAvatarUrl(AVATAR_TYPES.MINIMAL, username),
      label: 'Minimal'
    }
  ];
}; 