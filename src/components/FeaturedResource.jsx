import { motion } from 'framer-motion';
import { ExternalLinkIcon, StarIcon, ClockIcon } from '@heroicons/react/outline';
import GlassCard from './ui/GlassCard';
import AutoThumbnail from './ui/AutoThumbnail';
import CategoryBadge from './ui/CategoryBadge';
import { useState } from 'react';

export default function FeaturedResource({ resource }) {
  if (!resource) return null;
  
  const [imageError, setImageError] = useState(!resource.image_url);
  const [isHovered, setIsHovered] = useState(false);
  
  // Track mouse position for spotlight effect
  const handleMouseMove = (e) => {
    const spotlight = e.currentTarget.querySelector('.spotlight');
    if (spotlight) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--x', `${x}%`);
      spotlight.style.setProperty('--y', `${y}%`);
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <GlassCard 
        className="overflow-hidden group" 
        glowOnHover={true}
      >
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block h-full focus:outline-none focus:ring-2 focus:ring-lime-accent/50 rounded-xl"
          aria-label={`Visit featured resource: ${resource.title}`}
          onMouseMove={handleMouseMove}
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            {resource.image_url && !imageError ? (
              <img 
                src={resource.image_url} 
                alt={resource.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <AutoThumbnail 
                title={resource.title}
                category={resource.category}
                subcategory={resource.subcategory}
                tags={resource.tags}
                className="w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            {/* Spotlight effect on hover */}
            <div className="spotlight"></div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/60 to-transparent flex flex-col justify-end p-6 md:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                <motion.span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-accent/30 text-lime-accent backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <StarIcon className="w-3 h-3 mr-1" />
                  Featured
                </motion.span>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <CategoryBadge category={resource.category} size="sm" />
                </motion.div>
                
                {resource.subcategory && (
                  <motion.span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.1)] text-white backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {resource.subcategory}
                  </motion.span>
                )}
              </div>
              
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white mb-2 text-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {resource.title}
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 mb-4 max-w-2xl line-clamp-3 md:line-clamp-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {resource.description}
              </motion.p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags && resource.tags.slice(0, 5).map((tag, index) => (
                  <motion.span 
                    key={tag} 
                    className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-between items-center">
                <motion.div
                  className="flex items-center text-lime-accent group-hover:underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="font-medium">Visit Resource</span>
                  <ExternalLinkIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
                
                {resource.created_at && (
                  <motion.div
                    className="flex items-center text-white/50 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>
                      {new Date(resource.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </a>
      </GlassCard>
    </motion.div>
  );
} 