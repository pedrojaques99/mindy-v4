import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { SearchIcon } from '@heroicons/react/outline';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ onOpenAuth }) => {
  const { user, signOut } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-100/90 backdrop-blur-lg border-b border-glass-100/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="text-xl font-bold transition-all duration-300">
            <span className="text-white opacity-90 group-hover:opacity-100">[</span>
            <span className="text-lime-accent opacity-90 group-hover:opacity-100">MINDY</span>
            <span className="text-white opacity-90 group-hover:opacity-100">]</span>
            <sup className="text-xs opacity-70">®</sup>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block flex-grow max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search', 'Search resources...')}
              className="w-full py-1.5 px-4 pl-9 bg-dark-300/80 border border-glass-200/50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-lime-accent/50 transition-all duration-200"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          </form>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white/60 hover:text-lime-accent transition-colors duration-200">
            {t('common.home', 'Home')}
          </Link>
          <Link to="/favorites" className="text-white/60 hover:text-lime-accent transition-colors duration-200">
            {t('common.favorites', 'Favorites')}
          </Link>
          <Link to="/submit" className="text-white/60 hover:text-lime-accent transition-colors duration-200">
            {t('common.submit', 'Submit')}
          </Link>
          
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {user ? (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-white/60 hover:text-lime-accent transition-all duration-200"
              >
                <span>{user.email?.split('@')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card py-1 border-glass-300/50">
                  <Link to="/profile" className="block px-4 py-2 text-white/70 hover:text-lime-accent transition-colors duration-200">
                    {t('common.profile', 'Profile')}
                  </Link>
                  <Link to="/edit-profile" className="block px-4 py-2 text-white/70 hover:text-lime-accent transition-colors duration-200">
                    {t('common.editProfile', 'Edit Profile')}
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-white/70 hover:text-lime-accent transition-colors duration-200"
                  >
                    {t('common.signOut', 'Sign Out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="btn btn-primary"
            >
              {t('common.signIn', 'Sign In')}
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white/70 hover:text-white transition-colors duration-200"
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-200/90 backdrop-blur-lg border-t border-glass-100/30">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search', 'Search resources...')}
                className="w-full py-2 px-4 pl-9 bg-dark-300/80 border border-glass-200/50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-lime-accent/50 transition-all duration-200"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            </form>
            
            <Link to="/" className="py-2 text-white/60 hover:text-lime-accent transition-colors duration-200">
              {t('common.home', 'Home')}
            </Link>
            <Link to="/favorites" className="py-2 text-white/60 hover:text-lime-accent transition-colors duration-200">
              {t('common.favorites', 'Favorites')}
            </Link>
            <Link to="/submit" className="py-2 text-white/60 hover:text-lime-accent transition-colors duration-200">
              {t('common.submit', 'Submit')}
            </Link>
            
            {/* Language Switcher - Mobile */}
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            
            {user ? (
              <>
                <Link to="/profile" className="py-2 text-white/60 hover:text-lime-accent transition-colors duration-200">
                  {t('common.profile', 'Profile')}
                </Link>
                <Link to="/edit-profile" className="py-2 text-white/60 hover:text-lime-accent transition-colors duration-200">
                  {t('common.editProfile', 'Edit Profile')}
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="py-2 text-left text-white/60 hover:text-lime-accent transition-colors duration-200"
                >
                  {t('common.signOut', 'Sign Out')}
                </button>
              </>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="py-2 text-left text-white/60 hover:text-lime-accent transition-colors duration-200"
              >
                {t('common.signIn', 'Sign In')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
