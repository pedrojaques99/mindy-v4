import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function ResourceSkeleton({ count = 3 }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GlassCard className="h-full overflow-hidden">
            <div className="aspect-video bg-dark-300 rounded-t-xl overflow-hidden relative shimmer">
              {/* Empty for shimmer effect */}
            </div>
            <div className="p-4">
              {/* Title skeleton */}
              <div className="h-6 bg-dark-400 rounded-md w-3/4 mb-3 shimmer" />
              
              {/* Description skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-dark-400 rounded-md w-full shimmer" />
                <div className="h-4 bg-dark-400 rounded-md w-5/6 shimmer" />
              </div>
              
              {/* Tags skeleton */}
              <div className="flex flex-wrap gap-2">
                <div className="h-5 bg-dark-400 rounded-full w-16 shimmer" />
                <div className="h-5 bg-dark-400 rounded-full w-20 shimmer" />
                <div className="h-5 bg-dark-400 rounded-full w-12 shimmer" />
              </div>
              
              {/* Footer skeleton */}
              <div className="mt-4 pt-3 border-t border-glass-200 flex justify-between">
                <div className="h-4 bg-dark-400 rounded-md w-20 shimmer" />
                <div className="h-4 bg-dark-400 rounded-md w-16 shimmer" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </>
  );
} 