import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryBrowser = ({ categories = [] }) => {
  // Add "All" category
  const allCategories = [
    { id: 'all', name: 'All', slug: 'all', icon: '🌐' },
    ...categories
  ];
  
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="mb-8">
      <motion.h2 
        className="text-lg font-medium mb-4 text-gray-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Browse Categories
      </motion.h2>
      
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {allCategories.map(category => (
          <motion.div key={category.id || category.slug} variants={itemVariants}>
            <Link
              to={`/category/${category.slug}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors"
            >
              <span className="mr-1.5">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoryBrowser; 