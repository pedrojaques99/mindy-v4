import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { ReplyIcon, TrashIcon } from '@heroicons/react/outline';

const CommentSection = ({ resourceId, session, onCommentCountChange }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `resource_id=eq.${resourceId}`
      }, () => {
        fetchComments();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [resourceId]);
  
  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    
    try {
      // Fetch comments with user profiles
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Update comments state
      setComments(data || []);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new comment
  const addComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: replyTo?.id || null
        });
        
      if (error) throw error;
      
      // Clear form
      setNewComment('');
      setReplyTo(null);
      
      // Fetch updated comments
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
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
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Fetch updated comments
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Group comments by parent/child relationship
  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.parent_id) {
      // This is a parent comment
      acc.push({
        ...comment,
        replies: comments.filter(c => c.parent_id === comment.id)
      });
    }
    return acc;
  }, []);
  
  // Comment component
  const Comment = ({ comment, isReply = false }) => (
    <motion.div 
      className={`p-3 rounded-lg ${isReply ? 'bg-dark-300' : 'bg-dark-300'} mb-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400 flex-shrink-0">
          {comment.profiles?.avatar_url ? (
            <img 
              src={comment.profiles.avatar_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="font-medium text-sm">
                {comment.profiles?.username || 'User'}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isReply && user && (
                <button
                  onClick={() => setReplyTo(comment)}
                  className="text-gray-400 hover:text-lime-accent transition-colors"
                >
                  <ReplyIcon className="w-4 h-4" />
                </button>
              )}
              
              {user && user.id === comment.user_id && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
      
      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-8 space-y-3">
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </motion.div>
  );
  
  return (
    <div className="space-y-4">
      {/* Comment form */}
      {user ? (
        <form onSubmit={addComment} className="mb-6">
          {replyTo && (
            <div className="mb-2 p-2 bg-dark-300 rounded-lg flex justify-between items-center text-sm">
              <span>
                Replying to <span className="font-medium">{replyTo.profiles?.username || 'User'}</span>
              </span>
              <button 
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-white"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400 flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                className="w-full p-3 bg-dark-400 rounded-lg text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-lime-accent"
                rows={3}
              />
              
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-dark-300 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-400 mb-2">Sign in to join the conversation</p>
          <button className="px-4 py-2 bg-lime-accent text-dark-100 rounded-md hover:bg-lime-accent/90 transition-colors text-sm">
            Sign In
          </button>
        </div>
      )}
      
      {/* Comments list */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-lime-accent">Loading comments...</div>
          </div>
        ) : groupedComments.length > 0 ? (
          <AnimatePresence>
            {groupedComments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 