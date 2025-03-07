import { motion } from 'framer-motion';

export default function CategoryBadge({ category, size = 'md' }) {
  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'assets': return '🖼️';
      case 'community': return '👥';
      case 'design': return '🎨';
      case 'reference': return '📚';
      case 'tool': return '🔧';
      case 'tutorial': return '📝';
      case 'shop': return '🛒';
      default: return '📦';
    }
  };
  
  // Get color for category
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'assets': return { bg: 'bg-teal-500/20', text: 'text-teal-400' };
      case 'community': return { bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'design': return { bg: 'bg-pink-500/20', text: 'text-pink-400' };
      case 'reference': return { bg: 'bg-purple-500/20', text: 'text-purple-400' };
      case 'tool': return { bg: 'bg-orange-500/20', text: 'text-orange-400' };
      case 'tutorial': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
      case 'shop': return { bg: 'bg-indigo-500/20', text: 'text-indigo-400' };
      default: return { bg: 'bg-lime-accent/20', text: 'text-lime-accent' };
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-base px-3 py-1.5 space-x-2'
  };
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const { bg, text } = getCategoryColor(category);
  const icon = getCategoryIcon(category);
  
  return (
    <motion.span
      className={`
        inline-flex items-center rounded-full 
        ${bg} ${text} backdrop-blur-sm
        font-medium ${sizeClasses[size]}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className={iconSizes[size]}>{icon}</span>
      <span>{category?.charAt(0).toUpperCase() + category?.slice(1)}</span>
    </motion.span>
  );
} 