import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-200/50 backdrop-blur-md border-t border-glass-100/20 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold mb-3">
              <span className="text-white/90">[</span>
              <span className="text-lime-accent/90">MINDY</span>
              <span className="text-white/90">]</span>
              <sup className="text-xs opacity-70">®</sup>
            </div>
            <p className="text-white/50 text-sm mb-4 max-w-md">
              A curated collection of design and development resources to help you build better projects.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-white/90 font-medium text-sm mb-3">Quick Links</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Submit Resource
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-white/90 font-medium text-sm mb-3">Categories</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/category/design" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Design
                </Link>
              </li>
              <li>
                <Link to="/category/development" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Development
                </Link>
              </li>
              <li>
                <Link to="/category/tools" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Tools
                </Link>
              </li>
              <li>
                <Link to="/category/resources" className="text-white/50 hover:text-lime-accent text-sm transition-colors duration-200">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-glass-100/20 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-xs mb-3 md:mb-0">
            © {currentYear} MINDY Resource Library. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/40 hover:text-lime-accent transition-colors duration-200"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/40 hover:text-lime-accent transition-colors duration-200"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>

        {/* Developer Tools (only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-6 border-t border-dark-300/50">
            <p className="text-xs text-gray-500 mb-2">Developer Tools</p>
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/test-supabase" 
                className="text-xs text-gray-500 hover:text-lime-accent transition-colors"
              >
                Supabase Test
              </Link>
              <Link 
                to="/test-user-journey" 
                className="text-xs text-gray-500 hover:text-lime-accent transition-colors"
              >
                User Journey Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
