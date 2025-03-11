import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/outline';

export default function CommentSection({ resourceId, comments, setComments, isLoading }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add a new comment
  const addComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast('Please sign in to add a comment', { icon: '🔒' });
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    if (!resourceId) {
      console.error('Missing resource ID for comment');
      toast.error('Cannot add comment: Missing resource information');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        resource_id: resourceId,
        user_id: user.id,
        content: newComment.trim()
      };
      
      console.log('Adding comment:', commentData);
      
      // Fix for Content-Type error
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData], {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          returning: true
        })
        .select();
        
      if (error) throw error;
      
      // Add the new comment to the list
      if (data && data.length > 0) {
        setComments(prev => [data[0], ...prev]);
        setNewComment('');
        toast.success('Comment added');
      } else {
        toast.error('Comment was not added properly');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // More descriptive error message based on the error type
      if (error.message?.includes('Content-Type')) {
        toast.error('Server communication error. Please try again.');
      } else if (error.code === 'PGRST102') {
        toast.error('Server response format error. Try refreshing the page.');
      } else {
        toast.error('Failed to add comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a comment
  const deleteComment = async (commentId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure the user can only delete their own comments
        
      if (error) throw error;
      
      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  };
  
  // Get random color for avatar based on username
  const getAvatarColor = (username) => {
    if (!username) return '#1a1a1a';
    
    const colors = [
      '#FF5A5F', '#00A699', '#FC642D', '#7B61FF', 
      '#FFBD45', '#00B8D9', '#6554C0', '#4C9AFF'
    ];
    
    // Simple hash function to get consistent color for a username
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Get username from user_id
  const getUserInfo = (userId) => {
    if (user && userId === user.id) {
      return {
        username: user.email?.split('@')[0] || 'You',
        email: user.email || ''
      };
    }
    
    return {
      username: 'User',
      email: ''
    };
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Comment form */}
      <div className="p-4 border-b border-glass-300">
        <form onSubmit={addComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            disabled={!user || isSubmitting}
            className="w-full p-3 bg-dark-300 border border-glass-300 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-lime-accent/30"
            rows={3}
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!user || !newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-lime-accent/20 text-lime-accent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-accent"></div>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => {
              const userInfo = getUserInfo(comment.user_id);
              
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-dark-300"
                >
                  <div className="flex items-start space-x-3">
                    {/* User avatar */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getAvatarColor(userInfo.username) }}
                    >
                      {getUserInitials(userInfo.username)}
                    </div>
                    
                    {/* Comment content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">
                            {userInfo.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-2">
                          {user && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
} 