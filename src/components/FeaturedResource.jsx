import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLinkIcon, 
  ChatAltIcon, 
  XIcon, 
  HeartIcon, 
  ShareIcon,
  ThumbUpIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import GlassCard from './ui/GlassCard';
import AutoThumbnail from './ui/AutoThumbnail';
import { useState, useEffect } from 'react';
import { getWebsiteThumbnail, getWebsiteFavicon } from '../utils/thumbnailUtils';
import { Link } from 'react-router-dom';
import SoftwareIcon from './ui/SoftwareIcon';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { supabase } from '../main';

// Map categories to emojis
const categoryEmojis = {
  design: '🎨',
  development: '💻',
  productivity: '⚡',
  ai: '🤖',
  tools: '🔧',
  resources: '📚',
  // Add more categories as needed
};

export default function FeaturedResource({ resource }) {
  if (!resource) return null;
  
  const { user } = useUser();
  const [imageError, setImageError] = useState(!resource.image_url);
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(resource.image_url || null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'comments'
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isFavorited, setIsFavorited] = useState(resource?.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // For demo purposes, assume there are some comments
  const commentCount = resource.commentCount || Math.floor(Math.random() * 10);
  
  // Fetch website thumbnail and favicon when component mounts
  useEffect(() => {
    if (!resource.image_url && resource.url) {
      // Get website thumbnail
      const thumbnail = getWebsiteThumbnail(resource.url, { size: 'medium' });
      if (thumbnail) {
        setThumbnailUrl(thumbnail);
      }
      
      // Get website favicon
      const favicon = getWebsiteFavicon(resource.url);
      if (favicon) {
        setFaviconUrl(favicon);
      }
    }
  }, [resource.url, resource.image_url]);
  
  // Fetch comments when the details panel opens
  useEffect(() => {
    if (isDetailsOpen && resource?.id && activeTab === 'comments') {
      fetchComments();
    }
  }, [isDetailsOpen, resource?.id, activeTab]);
  
  // Fetch comments for the resource
  const fetchComments = async () => {
    if (!resource?.id) return;
    
    setIsLoadingComments(true);
    
    try {
      const { data, error } = await supabase
        .from('resource_comments')
        .select(`
          *,
          user:user_id (
            id,
            email,
            username,
            avatar_url
          )
        `)
        .eq('resource_id', resource.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  // Toggle favorite
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast('Please sign in to save favorites', { icon: '🔒' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resource.id);
          
        if (error) throw error;
        
        setIsFavorited(false);
        toast('Removed from favorites', { icon: '💔' });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, resource_id: resource.id }
          ]);
          
        if (error) throw error;
        
        setIsFavorited(true);
        toast('Added to favorites', { icon: '❤️' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Share resource
  const shareResource = (e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: resource.url,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(resource.url);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  // Get emoji for category or default
  const categoryEmoji = resource.category && categoryEmojis[resource.category.toLowerCase()] 
    ? categoryEmojis[resource.category.toLowerCase()] 
    : '✨';
  
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
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode'];
    return softwareNames.some(software => tag.toLowerCase().includes(software));
  };
  
  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <GlassCard 
          className="overflow-hidden group" 
          glowOnHover={true}
        >
          {/* Main card content - clickable to view resource details */}
          <div 
            className="block h-full focus:outline-none focus:ring-1 focus:ring-lime-accent/50 rounded-xl cursor-pointer"
            aria-label={`View details for: ${resource.title}`}
            onMouseMove={handleMouseMove}
            onClick={() => setIsDetailsOpen(true)}
          >
            <div className="relative aspect-[21/9] overflow-hidden">
              {thumbnailUrl ? (
                <img 
                  src={thumbnailUrl} 
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <AutoThumbnail 
                  title={resource.title}
                  category={resource.category}
                  subcategory={resource.subcategory}
                  tags={resource.tags}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              )}
              
              {/* Software icon (Figma) in top right */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-dark-100/80 backdrop-blur-sm p-1 shadow-lg z-10 flex items-center justify-center">
                <svg viewBox="0 0 38 57" className="w-3.5 h-3.5" fill="white">
                  <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z"/>
                  <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z"/>
                  <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z"/>
                  <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z"/>
                  <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z"/>
                </svg>
              </div>
              
              {/* Spotlight effect on hover */}
              <div className="spotlight"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-dark-100/95 via-dark-100/60 to-transparent flex flex-col justify-end p-3 md:p-4">
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {/* Monocolor div with emoji - clickable to filter by category */}
                  <Link 
                    to={`/resources?category=${resource.category}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center rounded-full text-xs font-medium bg-[#323232] backdrop-blur-sm overflow-hidden hover:bg-[#3a3a3a] transition-colors"
                  >
                    <span className="inline-flex items-center justify-center px-2 py-0.5">
                      {categoryEmoji}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-white/90">
                      {resource.category || 'Resource'}
                    </span>
                  </Link>
                  
                  {/* Subcategory - clickable to filter by subcategory */}
                  <Link
                    to={`/resources?subcategory=${resource.subcategory}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
                  >
                    {resource.subcategory || 'Featured'}
                  </Link>
                </div>
                
                <motion.h2 
                  className="text-base font-bold text-white mb-1 text-shadow line-clamp-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {resource.title}
                </motion.h2>
                
                <motion.p 
                  className="text-[#D1D5DB] mb-2 max-w-2xl text-xs line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {resource.description}
                </motion.p>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags && resource.tags.slice(0, 3).map((tag, index) => (
                      <Link 
                        key={tag}
                        to={`/resources?tag=${tag}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] hover:bg-white/10 hover:text-white/70 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Comments link */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDetailsOpen(true);
                        setActiveTab('comments');
                      }}
                      className="flex items-center text-white/50 hover:text-white/80 transition-colors"
                    >
                      <ChatAltIcon className="w-3 h-3 mr-1" />
                      <span className="text-[10px]">{commentCount}</span>
                    </button>
                    
                    {/* External link */}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center text-lime-accent hover:underline"
                    >
                      <span className="font-medium text-xs">Explore</span>
                      <ExternalLinkIcon className="ml-0.5 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      
      {/* Slide-in drawer for resource details */}
      <AnimatePresence>
        {isDetailsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
            />
            
            {/* Drawer panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-dark-200 shadow-xl z-50 overflow-hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-glass-300">
                <h2 className="text-xl font-bold text-white truncate">{resource.title}</h2>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1 rounded-full hover:bg-glass-300 transition-colors"
                >
                  <XIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview image */}
                <div className="relative w-full h-48 md:h-64 overflow-hidden">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AutoThumbnail 
                      title={resource.title}
                      category={resource.category}
                      subcategory={resource.subcategory}
                      tags={resource.tags}
                      className="w-full h-full"
                    />
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent"></div>
                  
                  {/* Quick actions */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                      onClick={toggleFavorite}
                      disabled={isLoading}
                      className="p-2 rounded-full bg-glass-100 hover:bg-glass-300 transition-colors"
                    >
                      {isFavorited ? (
                        <HeartSolidIcon className="w-5 h-5 text-lime-accent" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={shareResource}
                      className="p-2 rounded-full bg-glass-100 hover:bg-glass-300 transition-colors"
                    >
                      <ShareIcon className="w-5 h-5 text-white" />
                    </button>
                    
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-lime-accent/20 text-lime-accent hover:bg-lime-accent/30 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLinkIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-glass-300">
                  <button
                    className={`flex-1 py-3 text-center text-sm font-medium ${
                      activeTab === 'details' 
                        ? 'text-lime-accent border-b-2 border-lime-accent' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                  <button
                    className={`flex-1 py-3 text-center text-sm font-medium ${
                      activeTab === 'comments' 
                        ? 'text-lime-accent border-b-2 border-lime-accent' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => {
                      setActiveTab('comments');
                      if (comments.length === 0) {
                        fetchComments();
                      }
                    }}
                  >
                    Comments ({comments.length})
                  </button>
                </div>
                
                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'details' ? (
                    <div className="p-4">
                      {/* Resource details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-gray-300 text-sm">{resource.description}</p>
                      </div>
                      
                      {/* Metadata */}
                      <div className="mb-4 space-y-2">
                        {resource.created_at && (
                          <div className="flex items-center text-sm text-gray-400">
                            <span>Added: {new Date(resource.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {resource.author && (
                          <div className="flex items-center text-sm text-gray-400">
                            <span>Author: {resource.author}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-400">
                          <ThumbUpIcon className="w-4 h-4 mr-2" />
                          <span>Popularity: {resource.popularity || 0}</span>
                        </div>
                      </div>
                      
                      {/* Category and subcategory */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Link 
                          to={`/resources?category=${resource.category}`}
                          onClick={() => setIsDetailsOpen(false)}
                          className="flex items-center rounded-full text-xs font-medium bg-[#323232] backdrop-blur-sm overflow-hidden hover:bg-[#3a3a3a] transition-colors"
                        >
                          <span className="inline-flex items-center justify-center px-2 py-1">
                            {categoryEmoji}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 text-white/90">
                            {resource.category || 'Resource'}
                          </span>
                        </Link>
                        
                        {resource.subcategory && (
                          <Link
                            to={`/resources?subcategory=${resource.subcategory}`}
                            onClick={() => setIsDetailsOpen(false)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
                          >
                            {resource.subcategory}
                          </Link>
                        )}
                      </div>
                      
                      {/* Tags */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2 text-gray-400">Tags:</h3>
                        <div className="flex flex-wrap gap-1">
                          {resource.tags && resource.tags.map(tag => (
                            <Link 
                              key={tag}
                              to={`/resources?tag=${tag}`}
                              onClick={() => setIsDetailsOpen(false)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
                            >
                              {isSoftwareTag(tag) && (
                                <SoftwareIcon name={tag} className="mr-1 w-3 h-3" />
                              )}
                              {tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CommentSection 
                      resourceId={resource.id}
                      comments={comments}
                      setComments={setComments}
                      isLoading={isLoadingComments}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 