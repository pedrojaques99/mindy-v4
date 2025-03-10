import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../main';
import { useUser } from './UserContext';

// Define available languages
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: 'us',
    locale: 'en-US'
  },
  pt: {
    code: 'pt',
    name: 'Português',
    flag: 'br',
    locale: 'pt-BR'
  }
};

// Create the context
const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { user, profile, updateUserProfile } = useUser();
  const [currentLanguage, setCurrentLanguage] = useState(languages.en);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Load translations for current language
  const loadTranslations = async (langCode) => {
    try {
      // Fetch translations from Supabase
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language', langCode);
      
      if (error) {
        console.error('Error fetching translations:', error);
        return {};
      }
      
      // Transform data into a key-value object
      const translationData = {};
      data.forEach(item => {
        translationData[item.key] = item.value;
      });
      
      return translationData;
    } catch (error) {
      console.error('Error loading translations:', error);
      return {};
    }
  };

  // Initialize language based on user preference or browser
  useEffect(() => {
    const initLanguage = async () => {
      try {
        setLoading(true);
        
        // Check user preference first if logged in
        if (profile?.language) {
          const userLang = profile.language;
          const selectedLang = languages[userLang] || languages.en;
          const langTranslations = await loadTranslations(selectedLang.code);
          
          setCurrentLanguage(selectedLang);
          setTranslations(langTranslations);
        } else {
          // Use browser language as fallback
          const browserLang = navigator.language.split('-')[0];
          const selectedLang = languages[browserLang] || languages.en;
          const langTranslations = await loadTranslations(selectedLang.code);
          
          setCurrentLanguage(selectedLang);
          setTranslations(langTranslations);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // Default to English
        const langTranslations = await loadTranslations('en');
        setCurrentLanguage(languages.en);
        setTranslations(langTranslations);
      } finally {
        setLoading(false);
      }
    };

    initLanguage();
  }, [profile]);

  // Change language function
  const changeLanguage = async (langCode) => {
    if (!languages[langCode] || currentLanguage.code === langCode) return;
    
    try {
      setLoading(true);
      const newLang = languages[langCode];
      const langTranslations = await loadTranslations(langCode);
      
      setCurrentLanguage(newLang);
      setTranslations(langTranslations);
      
      // Update user preference in Supabase if logged in
      if (user) {
        await updateUserProfile({ language: langCode });
      } else {
        // Store in localStorage for non-logged in users
        localStorage.setItem('preferredLanguage', langCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  // Translate function
  const t = (key, defaultText = key) => {
    return translations[key] || defaultText;
  };

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    t,
    loading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 