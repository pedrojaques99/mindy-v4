import { motion } from 'framer-motion';
import { useState } from 'react';

export default function GlassCard({ 
  children, 
  className = '', 
  hoverEffect = false,
  delay = 0,
  glowOnHover = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1,
        ease: [0.25, 0.1, 0.25, 1.0] // Smooth easing
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative backdrop-blur-md bg-[rgba(255,255,255,0.1)]
        border border-[rgba(255,255,255,0.15)] rounded-xl shadow-xl
        ${hoverEffect ? 'hover:bg-[rgba(255,255,255,0.15)] transition-all duration-300' : ''}
        ${className}
      `}
      style={{
        boxShadow: glowOnHover && isHovered 
          ? '0 0 20px rgba(191, 255, 88, 0.2), 0 4px 20px rgba(0, 0, 0, 0.1)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div 
          className={`
            absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-30' : 'opacity-20'}
          `}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
} 