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

  // Helper function to get nested object value by path
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

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
      
      if (!Array.isArray(data)) {
        console.error('Invalid translation data format');
        return {};
      }

      // Transform data into a nested object structure
      const translationData = {};
      
      data.forEach(item => {
        try {
          if (!item || typeof item.key !== 'string' || !item.value) {
            console.warn('Invalid translation item:', item);
            return;
          }

          const keys = item.key.split('.');
          let current = translationData;
          
          // Create nested structure
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            // If current key points to a string, convert it to an object
            if (typeof current[key] === 'string') {
              const oldValue = current[key];
              current[key] = { _value: oldValue };
            }
            // Create object if it doesn't exist
            current[key] = current[key] || {};
            current = current[key];
          }
          
          // Set the final value
          const lastKey = keys[keys.length - 1];
          if (typeof current === 'object') {
            current[lastKey] = item.value;
          }
        } catch (err) {
          console.warn('Error processing translation item:', item, err);
        }
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
        let selectedLang = languages.en;
        
        // First check user profile if logged in
        if (profile?.language && languages[profile.language]) {
          selectedLang = languages[profile.language];
        }
        // Then check localStorage
        else if (typeof window !== 'undefined' && !user) {
          const storedLang = localStorage.getItem('preferredLanguage');
          if (storedLang && languages[storedLang]) {
            selectedLang = languages[storedLang];
          }
          // Finally, try browser language
          else {
            const browserLang = navigator.language.split('-')[0];
            if (languages[browserLang]) {
              selectedLang = languages[browserLang];
            }
          }
        }
        
        const langTranslations = await loadTranslations(selectedLang.code);
        setCurrentLanguage(selectedLang);
        setTranslations(langTranslations);
      } catch (error) {
        console.error('Error initializing language:', error);
        // Default to English on error
        const langTranslations = await loadTranslations('en');
        setCurrentLanguage(languages.en);
        setTranslations(langTranslations);
      } finally {
        setLoading(false);
      }
    };

    initLanguage();
  }, [profile, user]);

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
      }
      
      // Always store in localStorage for persistence if in browser
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredLanguage', langCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced translate function with nested key support and interpolation
  const t = (key, defaultText = key, interpolations = {}) => {
    if (loading) return defaultText;
    
    try {
      // Get the translation from the nested structure
      const translation = getNestedValue(translations, key);
      
      // If no translation found or it's not a string, return default
      if (!translation || typeof translation !== 'string') {
        return defaultText;
      }
      
      // Handle interpolations if any
      if (Object.keys(interpolations).length > 0) {
        return translation.replace(/\{\{(\w+)\}\}/g, (_, key) => 
          interpolations[key] !== undefined ? interpolations[key] : `{{${key}}}`
        );
      }
      
      return translation;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return defaultText;
    }
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