import { motion } from 'framer-motion';

export default function CategorySelector({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="overflow-x-auto py-4 px-4">
      <div className="flex space-x-2 min-w-max mx-auto max-w-5xl">
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              backdrop-blur-sm border transition-all duration-300
              ${activeCategory === category 
                ? 'bg-[#bfff58]/20 border-[#bfff58]/50 text-[#bfff58]' 
                : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.15)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {category === 'all' ? 'All Resources' : category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>
    </div>
  );
} 