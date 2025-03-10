import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../main';

/**
 * StatusIndicator component displays the current status of:
 * 1. Server connection (by checking if the component can load)
 * 2. Supabase connection (by running a simple query)
 */
const StatusIndicator = () => {
  const [supabaseStatus, setSupabaseStatus] = useState('checking');
  const [serverStatus, setServerStatus] = useState('online'); // If component renders, server is online
  const [lastChecked, setLastChecked] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to check Supabase connection
  const checkSupabaseStatus = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      // Simple lightweight query to check if Supabase is responding
      const queryPromise = supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      // Race the query against the timeout
      const result = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);
      
      const { error } = result;
      
      if (error) {
        console.error('Supabase connection error:', error);
        setSupabaseStatus('offline');
      } else {
        console.log('Supabase connection successful');
        setSupabaseStatus('online');
      }
    } catch (error) {
      console.error('Failed to check Supabase status:', error);
      setSupabaseStatus('offline');
    }
    
    // Update last checked timestamp
    setLastChecked(new Date());
  };

  // Check status on component mount and every 5 minutes
  useEffect(() => {
    // Initial check
    checkSupabaseStatus();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(() => {
      checkSupabaseStatus();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format the last checked time
  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    
    const now = new Date();
    const seconds = Math.floor((now - lastChecked) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return lastChecked.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center bg-dark-200 rounded-full px-3 py-2 shadow-lg hover:bg-dark-300 transition-colors"
      >
        <div className="flex items-center">
          {/* Server status indicator */}
          <div className="flex items-center mr-2">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${
              serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-white/80">Server</span>
          </div>
          
          {/* Supabase status indicator */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${
              supabaseStatus === 'online' ? 'bg-green-500' :
              supabaseStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-white/80">Supabase</span>
          </div>
        </div>
      </button>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-2 bg-dark-200 rounded-md p-3 shadow-lg text-sm w-64">
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-white/60">Server Status:</span>
              <span className={serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                {serverStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Supabase Status:</span>
              <span className={
                supabaseStatus === 'online' ? 'text-green-400' :
                supabaseStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
              }>
                {supabaseStatus.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs mt-3 pt-2 border-t border-dark-300">
            <span className="text-white/50">Last checked:</span>
            <span className="text-white/70">{formatLastChecked()}</span>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={checkSupabaseStatus}
              className="w-full py-1.5 px-2 bg-dark-300 rounded-md hover:bg-dark-400 transition-colors text-xs"
            >
              Check Now
            </button>
            
            <Link 
              to="/status"
              className="w-full py-1.5 px-2 bg-dark-300 rounded-md hover:bg-dark-400 transition-colors text-xs text-center"
              onClick={() => setIsExpanded(false)}
            >
              View Detailed Status
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator; 