import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = ({ onOpenAuth }) => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-200/80 backdrop-blur-md border-b border-glass-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-xl font-bold">
            <span className="text-white">[</span>
            <span className="text-lime-accent">MINDY</span>
            <span className="text-white">]</span>
            <sup className="text-xs">®</sup>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white/80 hover:text-lime-accent transition-colors">
            Home
          </Link>
          <Link to="/favorites" className="text-white/80 hover:text-lime-accent transition-colors">
            Favorites
          </Link>
          <Link to="/submit" className="text-white/80 hover:text-lime-accent transition-colors">
            Submit
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-white/80 hover:text-lime-accent"
              >
                <span>{user.email?.split('@')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card">
                  <Link to="/profile" className="block px-4 py-2 text-white/80 hover:text-lime-accent">
                    Profile
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-white/80 hover:text-lime-accent"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="btn btn-primary"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-300 border-t border-glass-100">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            <Link to="/" className="py-2 text-white/80 hover:text-lime-accent">
              Home
            </Link>
            <Link to="/favorites" className="py-2 text-white/80 hover:text-lime-accent">
              Favorites
            </Link>
            <Link to="/submit" className="py-2 text-white/80 hover:text-lime-accent">
              Submit
            </Link>
            
            {user ? (
              <>
                <Link to="/profile" className="py-2 text-white/80 hover:text-lime-accent">
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="py-2 text-left text-white/80 hover:text-lime-accent"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="py-2 text-left text-white/80 hover:text-lime-accent"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
