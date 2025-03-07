import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CollectionIcon, 
  HeartIcon, 
  UserIcon, 
  PlusCircleIcon,
  LogoutIcon
} from '@heroicons/react/outline';
import { supabase } from '../supabaseClient';

const Sidebar = ({ session, closeSidebar }) => {
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: HomeIcon 
    },
    { 
      name: 'Categories', 
      path: '/category/all', 
      icon: CollectionIcon 
    },
    { 
      name: 'Favorites', 
      path: '/favorites', 
      icon: HeartIcon,
      requiresAuth: true
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: UserIcon,
      requiresAuth: true
    },
    { 
      name: 'Submit Resource', 
      path: '/submit', 
      icon: PlusCircleIcon,
      requiresAuth: true
    }
  ];
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div className="h-full bg-dark-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-dark-300">
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <span className="text-xl font-bold text-lime-accent">MINDY</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Skip auth-required items if not logged in
            if (item.requiresAuth && !session) return null;
            
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-lime-accent text-dark-100' 
                      : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                  }`}
                  onClick={closeSidebar}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User section */}
      <div className="p-4 border-t border-dark-300">
        {session ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-dark-300 mr-3 flex items-center justify-center overflow-hidden">
                {session.user.user_metadata?.avatar_url ? (
                  <img 
                    src={session.user.user_metadata.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">
                    {session.user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.user_metadata?.username || session.user.email}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors"
            >
              <LogoutIcon className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center justify-center p-2 bg-lime-accent text-dark-100 rounded-lg hover:bg-lime-accent/90 transition-colors"
            onClick={closeSidebar}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 