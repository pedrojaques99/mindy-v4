import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MenuIcon, 
  SearchIcon, 
  UserIcon, 
  LoginIcon 
} from '@heroicons/react/outline';
import { supabase } from '../supabaseClient';

const Navbar = ({ session, toggleSidebar }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Toggle search bar
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  return (
    <header className="bg-dark-200 border-b border-dark-300">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section - Menu button and logo */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors mr-2 md:hidden"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          
          <Link to="/" className="hidden md:flex items-center">
            <span className="text-xl font-bold text-lime-accent">MINDY</span>
          </Link>
        </div>
        
        {/* Center section - Search */}
        <div className={`flex-1 mx-4 transition-all duration-300 ${isSearchOpen ? 'max-w-2xl' : 'max-w-xs'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full bg-dark-300 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-lime-accent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* Right section - User actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors md:hidden"
            aria-label="Toggle search"
          >
            <SearchIcon className="w-6 h-6" />
          </button>
          
          {session ? (
            <Link
              to="/profile"
              className="flex items-center p-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-dark-300 flex items-center justify-center overflow-hidden">
                {session.user.user_metadata?.avatar_url ? (
                  <img 
                    src={session.user.user_metadata.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center p-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors"
            >
              <LoginIcon className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
