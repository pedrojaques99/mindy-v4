import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XIcon, 
  ExternalLinkIcon, 
  HeartIcon, 
  ShareIcon, 
  ChatAltIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  ThumbUpIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import SoftwareIcon from './ui/SoftwareIcon';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AutoThumbnail from './ui/AutoThumbnail';

export default function ResourcePreviewModal({ resource, isOpen, onClose, initialTab = 'details' }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(resource?.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'details' or 'comments'
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Fetch comments when the modal opens or when switching to comments tab
  useEffect(() => {
    if (isOpen && resource?.id && activeTab === 'comments') {
      fetchComments();
    }
  }, [isOpen, resource?.id, activeTab]);
  
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
  const toggleFavorite = async () => {
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
  const shareResource = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.origin + '/resource/' + resource.id,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(window.location.origin + '/resource/' + resource.id);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  // Navigate to tag filter
  const handleTagClick = (tag) => {
    navigate(`/category/all?tag=${encodeURIComponent(tag)}`);
    onClose();
  };
  
  // Open external URL
  const openExternalUrl = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode', 'blender', 'indesign', 'after-effects', 'premiere'];
    return softwareNames.some(software => tag.toLowerCase().includes(software));
  };
  
  if (!resource) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Slide-in drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-dark-200 shadow-xl overflow-hidden flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-dark-300">
              <div className="flex items-center">
                <button 
                  onClick={onClose}
                  className="p-1.5 mr-2 rounded-full hover:bg-dark-300 transition-colors"
                  aria-label="Close"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl font-bold text-white truncate">{resource.title}</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleFavorite}
                  disabled={isLoading}
                  className="p-1.5 rounded-full hover:bg-dark-300 transition-colors"
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-5 h-5 text-lime-accent" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <button 
                  onClick={shareResource}
                  className="p-1.5 rounded-full hover:bg-dark-300 transition-colors"
                  aria-label="Share resource"
                >
                  <ShareIcon className="w-5 h-5 text-gray-400" />
                </button>
                
                <button 
                  onClick={openExternalUrl}
                  className="p-1.5 rounded-full hover:bg-dark-300 transition-colors"
                  aria-label="Open external link"
                >
                  <ExternalLinkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Resource image/thumbnail */}
              <div className="relative w-full h-48 md:h-64 overflow-hidden">
                {resource.image_url ? (
                  <img 
                    src={resource.image_url} 
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AutoThumbnail 
                    url={resource.url}
                    title={resource.title}
                    category={resource.category}
                    subcategory={resource.subcategory}
                    tags={resource.tags}
                    className="w-full h-full"
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent"></div>
                
                {/* Visit website button */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={openExternalUrl}
                    className="px-4 py-2 bg-lime-accent text-dark-100 rounded-lg text-sm font-medium hover:bg-lime-accent/90 transition-colors flex items-center"
                  >
                    Visit Website
                    <ExternalLinkIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-dark-300">
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
                  onClick={() => setActiveTab('comments')}
                >
                  Comments ({comments.length})
                </button>
              </div>
              
              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'details' ? (
                  <div className="p-4">
                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2 text-white">Description</h3>
                      <p className="text-gray-300 text-sm">{resource.description}</p>
                    </div>
                    
                    {/* Category & Subcategory */}
                    {(resource.category || resource.subcategory) && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2 text-gray-400">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {resource.category && (
                            <button
                              onClick={() => {
                                navigate(`/category/${resource.category}`);
                                onClose();
                              }}
                              className="px-3 py-1 rounded-lg bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.category}
                            </button>
                          )}
                          
                          {resource.subcategory && (
                            <button
                              onClick={() => {
                                navigate(`/category/all?subcategory=${resource.subcategory}`);
                                onClose();
                              }}
                              className="px-3 py-1 rounded-lg bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {resource.subcategory}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2 text-gray-400">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagClick(tag)}
                              className="flex items-center px-3 py-1 rounded-lg bg-dark-300 text-white hover:bg-dark-400 transition-colors text-sm"
                            >
                              {isSoftwareTag(tag) && (
                                <SoftwareIcon name={tag} className="mr-1.5 w-4 h-4" />
                              )}
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2 text-gray-400">Details</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        {resource.created_at && (
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Added: {new Date(resource.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {resource.author && (
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Author: {resource.author}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ThumbUpIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Popularity: {resource.popularity || 0}</span>
                        </div>
                        
                        {resource.url && (
                          <div className="flex items-center">
                            <ExternalLinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-lime-accent hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {new URL(resource.url).hostname.replace('www.', '')}
                            </a>
                          </div>
                        )}
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
  );
} 