import { motion } from 'framer-motion';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import GlassCard from './ui/GlassCard';

export default function FeaturedResource({ resource }) {
  if (!resource) return null;
  
  // Generate placeholder thumbnail if none exists
  const thumbnail = resource.image_url || 
    `https://via.placeholder.com/1200x600/1a1a1a/bfff58?text=${encodeURIComponent(resource.title)}`;
  
  return (
    <GlassCard className="overflow-hidden group">
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/40 to-transparent flex flex-col justify-end p-6">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#bfff58]/20 text-[#bfff58]">
                Featured
              </span>
              <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.05)] text-white">
                {resource.category}
              </span>
            </div>
            
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {resource.title}
            </motion.h2>
            
            <motion.p 
              className="text-gray-300 mb-4 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {resource.description}
            </motion.p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags && resource.tags.slice(0, 5).map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <motion.div
              className="flex items-center text-[#bfff58] group-hover:underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span>Visit Resource</span>
              <ExternalLinkIcon className="ml-1 h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </a>
    </GlassCard>
  );
} 