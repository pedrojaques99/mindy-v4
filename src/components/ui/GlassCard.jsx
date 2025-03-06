import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hoverEffect = false,
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className={`
        relative backdrop-blur-md bg-[rgba(255,255,255,0.1)]
        border border-[rgba(255,255,255,0.15)] rounded-xl shadow-xl
        ${hoverEffect ? 'hover:bg-[rgba(255,255,255,0.15)] transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
} 