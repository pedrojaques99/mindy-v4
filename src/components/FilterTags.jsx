import React from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';

const FilterTags = ({ availableTags = [], selectedTags = [], onTagSelect, onClearFilters }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  if (!availableTags || availableTags.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-400">Filter by tags</h3>
        
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-lime-accent hover:underline flex items-center"
          >
            Clear filters
            <XIcon className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
      
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {availableTags.map(tag => (
          <motion.button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-lime-accent text-dark-100'
                : 'bg-dark-300 text-gray-300 hover:bg-dark-400'
            }`}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tag}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default FilterTags; 