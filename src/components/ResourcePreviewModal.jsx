import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ExternalLinkIcon, ChatAltIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { supabase } from '../supabaseClient';
import { canEmbed } from '../utils/thumbnailUtils';
import CommentSection from './CommentSection';

const ResourcePreviewModal = ({ resource, onClose, session }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [commentCount, setCommentCount] = useState(0);
  const [isEmbeddable, setIsEmbeddable] = useState(true);
  
  useEffect(() => {
    // Check if the resource URL can be embedded
    if (resource?.url) {
      setIsEmbeddable(canEmbed(resource.url));
    }
    
    // Fetch comment count
    const fetchCommentCount = async () => {
      if (!resource?.id) return;
      
      try {
        const { count, error } = await supabase
          .from('comments')
          .select('*', { count: 'exact' })
          .eq('resource_id', resource.id);
          
        if (error) throw error;
        setCommentCount(count || 0);
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };
    
    fetchCommentCount();
  }, [resource]);
  
  if (!resource) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-dark-200 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-300">
            <h2 className="text-lg font-medium text-white truncate pr-4">
              {resource.title}
            </h2>
            
            <div className="flex items-center space-x-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-dark-300 transition-colors"
                aria-label="Open in new tab"
              >
                <ExternalLinkIcon className="w-5 h-5 text-gray-400" />
              </a>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-dark-300 transition-colors"
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-dark-300">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'preview' 
                  ? 'text-lime-accent' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
              {activeTab === 'preview' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-accent"
                  layoutId="activeTab"
                />
              )}
            </button>
            
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center ${
                activeTab === 'comments' 
                  ? 'text-lime-accent' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
              {commentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-dark-300">
                  {commentCount}
                </span>
              )}
              {activeTab === 'comments' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-accent"
                  layoutId="activeTab"
                />
              )}
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'preview' && (
              <div className="h-full">
                {isEmbeddable ? (
                  <iframe
                    src={resource.url}
                    title={resource.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-medium mb-2">This website cannot be embedded</h3>
                    <p className="text-gray-400 mb-4">
                      Due to security restrictions, this website cannot be displayed in the preview.
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors flex items-center"
                    >
                      Open Website
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'comments' && (
              <div className="p-4">
                <CommentSection 
                  resourceId={resource.id} 
                  session={session}
                  onCommentCountChange={setCommentCount}
                />
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-dark-300 bg-dark-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">{resource.title}</h3>
                <p className="text-xs text-gray-400 truncate">{resource.url}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-400">
                  <ChatAltIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{commentCount}</span>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <ThumbUpIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{resource.upvotes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResourcePreviewModal; 