import React from 'react';
import { XIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import SoftwareIcon from './ui/SoftwareIcon';

/**
 * FilterTags - A component for displaying and managing filter tags
 * 
 * @param {Object} props
 * @param {Array} props.tags - Array of tag strings
 * @param {Array} props.selectedTags - Array of selected tag strings
 * @param {Function} props.onToggleTag - Function to call when a tag is toggled
 * @param {Function} props.onClearFilters - Function to call when filters are cleared
 * @returns {JSX.Element}
 */
export default function FilterTags({ 
  tags = [], 
  selectedTags = [], 
  onToggleTag, 
  onClearFilters 
}) {
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode'];
    return softwareNames.includes(tag.toLowerCase());
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };
  
  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-gray-400 font-medium">
          Filter by tags: {selectedTags.length > 0 && <span className="text-lime-accent">({selectedTags.length} selected)</span>}
        </h3>
        {selectedTags.length > 0 && (
          <motion.button
            onClick={onClearFilters}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XIcon className="h-3 w-3" />
            <span>Clear</span>
          </motion.button>
        )}
      </div>
      
      <motion.div 
        className="flex flex-wrap gap-1.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tags.map((tag) => (
          <motion.button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs
              ${selectedTags.includes(tag) 
                ? 'bg-[#bfff58]/20 text-[#bfff58] border border-[#bfff58]/30' 
                : 'bg-[rgba(255,255,255,0.05)] text-gray-300 border border-transparent'}
              transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]
              relative
            `}
            variants={tagVariants}
          >
            {isSoftwareTag(tag) ? (
              <span className="flex items-center gap-1">
                <SoftwareIcon name={tag} />
                <span className="sr-only">{tag}</span>
              </span>
            ) : (
              <span>{tag}</span>
            )}
            
            {/* Selection indicator */}
            {selectedTags.includes(tag) && (
              <AnimatePresence>
                <motion.span 
                  className="absolute -top-1 -right-1 w-2 h-2 bg-lime-accent rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              </AnimatePresence>
            )}
          </motion.button>
        ))}
        
        {/* Empty state */}
        {tags.length === 0 && (
          <div className="text-gray-400 text-xs italic">No tags available</div>
        )}
      </motion.div>
      
      {/* Selected tags summary */}
      {selectedTags.length > 0 && (
        <motion.div 
          className="mt-3 flex flex-wrap gap-1.5 bg-[rgba(255,255,255,0.03)] p-2 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="w-full text-xs text-gray-400 mb-1">Selected filters:</div>
          {selectedTags.map((tag) => (
            <div 
              key={`selected-${tag}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#bfff58]/10 text-[#bfff58]"
            >
              {isSoftwareTag(tag) ? (
                <span className="flex items-center gap-1">
                  <SoftwareIcon name={tag} />
                  <span className="sr-only">{tag}</span>
                </span>
              ) : (
                <span>{tag}</span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTag(tag);
                }}
                className="hover:text-white"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 