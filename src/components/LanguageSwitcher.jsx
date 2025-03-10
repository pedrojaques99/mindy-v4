import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { USFlag, BRFlag } from './ui/FlagIcons';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    setIsOpen(false);
    changeLanguage(langCode);
  };
  
  // Get flag component based on language code
  const getFlagComponent = (langCode) => {
    switch (langCode) {
      case 'en':
        return <USFlag className="w-6 h-4" />;
      case 'pt':
        return <BRFlag className="w-6 h-4" />;
      default:
        return <USFlag className="w-6 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white/70 hover:text-lime-accent transition-colors duration-200 px-2 py-1"
        aria-label="Select language"
      >
        {getFlagComponent(currentLanguage.code)}
        <span className="sr-only md:not-sr-only md:inline-block text-sm">{currentLanguage.name}</span>
        
        <svg 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 glass-card py-1 border-glass-300/50 rounded-md shadow-xl z-50">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-left text-white/70 hover:text-lime-accent transition-colors duration-200 ${
                currentLanguage.code === lang.code ? 'text-lime-accent' : ''
              }`}
            >
              {getFlagComponent(lang.code)}
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 