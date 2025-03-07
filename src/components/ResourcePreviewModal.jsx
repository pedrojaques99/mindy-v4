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
  ThumbUpIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import SoftwareIcon from './ui/SoftwareIcon';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';

export default function ResourcePreviewModal({ resource, isOpen, onClose }) {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(resource?.favorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'comments'
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  
  // Fetch comments when the modal opens
  useEffect(() => {
    if (isOpen && resource?.id) {
      fetchComments();
    }
  }, [isOpen, resource?.id]);
  
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
        url: resource.url,
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(resource.url);
      toast('Link copied to clipboard', { icon: '📋' });
    }
  };
  
  // Handle iframe load events
  const handleIframeLoad = () => {
    setPreviewLoading(false);
  };
  
  const handleIframeError = () => {
    setPreviewLoading(false);
    setPreviewError(true);
  };
  
  // Check if a tag is a software name
  const isSoftwareTag = (tag) => {
    const softwareNames = ['figma', 'photoshop', 'illustrator', 'sketch', 'adobe', 'react', 'cursor', 'vscode'];
    return softwareNames.includes(tag.toLowerCase());
  };
  
  if (!resource) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-4xl max-h-[90vh] bg-dark-200 rounded-xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-glass-300">
              <h2 className="text-xl font-bold text-white truncate">{resource.title}</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-glass-300 transition-colors"
              >
                <XIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex flex-col md:flex-row h-[calc(90vh-120px)]">
              {/* Left panel - Preview */}
              <div className="w-full md:w-2/3 h-full overflow-hidden relative bg-dark-300">
                {/* Website preview */}
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-300">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
                  </div>
                )}
                
                {previewError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-300 p-6 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-lg font-medium mb-2">Preview Unavailable</h3>
                    <p className="text-gray-400 mb-4">This website doesn't allow embedding in iframes.</p>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-lime-accent/20 text-lime-accent rounded-full flex items-center"
                    >
                      Visit Website
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={resource.url}
                    title={resource.title}
                    className="w-full h-full border-0"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
              
              {/* Right panel - Details & Comments */}
              <div className="w-full md:w-1/3 h-full flex flex-col border-l border-glass-300">
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
                    onClick={() => setActiveTab('comments')}
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
                        <div className="flex items-center text-sm text-gray-400">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          <span>Added: {new Date(resource.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {resource.author && (
                          <div className="flex items-center text-sm text-gray-400">
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span>Author: {resource.author}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-400">
                          <ThumbUpIcon className="w-4 h-4 mr-2" />
                          <span>Popularity: {resource.popularity || 0}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2 text-gray-400">Tags:</h3>
                        <div className="flex flex-wrap gap-1">
                          {resource.tags && resource.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-glass-100 text-gray-300"
                            >
                              {isSoftwareTag(tag) ? (
                                <SoftwareIcon name={tag} />
                              ) : (
                                tag
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2 mt-6">
                        <button
                          onClick={toggleFavorite}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg bg-glass-100 hover:bg-glass-300 transition-colors"
                        >
                          {isFavorited ? (
                            <>
                              <HeartSolidIcon className="w-5 h-5 text-lime-accent mr-2" />
                              <span>Favorited</span>
                            </>
                          ) : (
                            <>
                              <HeartIcon className="w-5 h-5 mr-2" />
                              <span>Favorite</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={shareResource}
                          className="flex items-center justify-center py-2 px-3 rounded-lg bg-glass-100 hover:bg-glass-300 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                        
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center py-2 px-3 rounded-lg bg-lime-accent/20 text-lime-accent hover:bg-lime-accent/30 transition-colors"
                        >
                          <ExternalLinkIcon className="w-5 h-5 mr-2" />
                          <span>Visit</span>
                        </a>
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 