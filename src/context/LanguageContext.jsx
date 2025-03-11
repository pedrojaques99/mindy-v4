import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../main';
import { useUser } from './UserContext';
import toast from 'react-hot-toast';

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

// Fallback translations in case database fails
const FALLBACK_TRANSLATIONS = {
  en: {
    home: {
      hero: {
        title: 'Discover',
        titleHighlight: 'Creative Resources',
        titleEnd: 'for Your Projects',
        subtitle: 'Find the best tools, assets, and inspiration for designers, developers, and creators.'
      },
      search: {
        placeholder: 'Search for resources, tools, or inspiration...',
        submit: 'Submit search'
      }
    },
    categories: {
      assets: 'Assets',
      tools: 'Tools',
      community: 'Community',
      reference: 'Reference',
      inspiration: 'Inspiration',
      learn: 'Learn',
      software: 'Software'
    },
    resource: {
      detailsTitle: 'Details',
      details: 'Details',
      description: 'Description',
      category: 'Category',
      tags: 'Tags',
      comments: 'Comments',
      loading: 'Loading...',
      notFound: 'Resource not found',
      visitWebsite: 'Visit Website',
      share: 'Share',
      save: 'Save',
      saved: 'Saved',
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
      addedToFavorites: 'Added to favorites',
      removedFromFavorites: 'Removed from favorites',
      share: {
        copied: 'Link copied to clipboard'
      }
    },
    ui: {
      back: 'Back'
    },
    common: {
      backToHome: 'Back to Home',
      error: 'An error occurred'
    },
    errors: {
      resourceNotFound: 'Resource not found',
      resourceNotFoundDesc: 'The resource you are looking for does not exist or has been removed.'
    },
    auth: {
      signInRequired: 'Sign in required to perform this action'
    }
  },
  pt: {
    home: {
      hero: {
        title: 'Descubra',
        titleHighlight: 'Recursos Criativos',
        titleEnd: 'para seus Projetos',
        subtitle: 'Encontre as melhores ferramentas, recursos e inspiração para designers, desenvolvedores e criadores.'
      },
      search: {
        placeholder: 'Busque por recursos, ferramentas ou inspiração...',
        submit: 'Buscar'
      },
      tags: {
        popular: 'Tags populares',
        noTags: 'Nenhuma tag encontrada'
      },
      sections: {
        filterResources: 'Filtrar Recursos',
        trendingResources: 'Recursos em Destaque',
        recentUploads: 'Uploads Recentes',
        software: 'Software'
      },
      filters: {
        activeLabel: 'Filtros ativos',
        remove: 'Remover filtro',
        clearAll: 'Limpar todos',
        selectSubcategory: 'Selecionar subcategoria: {{name}}',
        selectSoftware: 'Selecionar software: {{name}}',
        filterByTags: 'Filtrar por tags',
        selected: 'selecionados',
        clear: 'Limpar',
        noTags: 'Nenhuma tag disponível',
        selectedFilters: 'Filtros selecionados'
      }
    },
    categories: {
      assets: 'Recursos',
      tools: 'Ferramentas',
      community: 'Comunidade',
      reference: 'Referência',
      inspiration: 'Inspiração',
      learn: 'Aprender',
      software: 'Software'
    },
    subcategories: {
      fonts: 'Fontes',
      icons: 'Ícones',
      textures: 'Texturas',
      sfx: 'Efeitos Sonoros',
      mockups: 'Mockups',
      '3d': '3D',
      'photos-videos': 'Imagens',
      color: 'Cores',
      ai: 'IA',
      productivity: 'Produtividade',
      portfolio: 'Portfólio',
      design: 'Design',
      ui: 'UI',
      audiovisual: 'Audiovisual',
      moodboard: 'Moodboard',
      reference: 'Referência',
      'ui-ux': 'UI/UX',
      typography: 'Tipografia',
      books: 'Livros'
    },
    tags: {
      free: 'grátis',
      design: 'design',
      typography: 'tipografia',
      ai: 'ia',
      '3d': '3d',
      mockups: 'mockups',
      icons: 'ícones',
      templates: 'templates',
      resources: 'recursos',
      tools: 'ferramentas'
    },
    software: {
      figma: 'Figma',
      photoshop: 'Photoshop',
      blender: 'Blender',
      cursor: 'Cursor',
      illustrator: 'Illustrator',
      indesign: 'InDesign',
      'after-effects': 'After Effects',
      premiere: 'Premiere'
    },
    resource: {
      detailsTitle: 'Detalhes',
      details: 'Detalhes',
      description: 'Descrição',
      category: 'Categoria',
      tags: 'Tags',
      comments: 'Comentários',
      loading: 'Carregando...',
      notFound: 'Recurso não encontrado',
      visitWebsite: 'Visitar Site',
      share: 'Compartilhar',
      save: 'Salvar',
      saved: 'Salvo',
      addFavorite: 'Adicionar aos favoritos',
      removeFavorite: 'Remover dos favoritos',
      addedToFavorites: 'Adicionado aos favoritos',
      removedFromFavorites: 'Removido dos favoritos',
      share: {
        copied: 'Link copiado para a área de transferência'
      }
    },
    ui: {
      back: 'Voltar'
    },
    common: {
      backToHome: 'Voltar para a Página Inicial',
      error: 'Ocorreu um erro',
      viewAll: 'Ver todos'
    },
    errors: {
      resourceNotFound: 'Recurso não encontrado',
      resourceNotFoundDesc: 'O recurso que você está procurando não existe ou foi removido.'
    },
    auth: {
      signInRequired: 'É necessário fazer login para realizar esta ação'
    }
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
  const [translations, setTranslations] = useState(FALLBACK_TRANSLATIONS.en);
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
        
        // If the error is that the table doesn't exist, return fallback translations
        if (error.code === '42P01') {
          console.warn('Translations table does not exist, using fallback translations');
          return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
        }
        
        return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`No translations found for ${langCode}, using fallback`);
        return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
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
      return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
    }
  };

  // Initialize language based on user preference or browser
  useEffect(() => {
    const initLanguage = async () => {
      try {
        setLoading(true);
        let selectedLang = languages.en; // Always start with English as default
        
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
          // We're no longer checking browser language by default
          // This ensures English is the default unless explicitly changed
        }
        
        // Always load English translations first as a base
        const englishTranslations = await loadTranslations('en');
        
        // If the selected language is not English, load and merge with English
        if (selectedLang.code !== 'en') {
          const langTranslations = await loadTranslations(selectedLang.code);
          // Merge English with the selected language, giving priority to the selected language
          const mergedTranslations = { ...englishTranslations, ...langTranslations };
          setTranslations(mergedTranslations);
        } else {
          setTranslations(englishTranslations);
        }
        
        setCurrentLanguage(selectedLang);
      } catch (error) {
        console.error('Error initializing language:', error);
        // Default to English on error
        toast.error('Failed to load translations. Using English fallback.');
        setCurrentLanguage(languages.en);
        setTranslations(FALLBACK_TRANSLATIONS.en);
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
      
      // Always load English translations first as a base
      const englishTranslations = await loadTranslations('en');
      
      // If the selected language is not English, load and merge with English
      if (langCode !== 'en') {
        const langTranslations = await loadTranslations(langCode);
        // Merge English with the selected language, giving priority to the selected language
        const mergedTranslations = { ...englishTranslations, ...langTranslations };
        setTranslations(mergedTranslations);
      } else {
        setTranslations(englishTranslations);
      }
      
      setCurrentLanguage(newLang);
      
      // Update user preference in Supabase if logged in
      if (user) {
        await updateUserProfile({ language: langCode });
      }
      
      // Always store in localStorage for persistence if in browser
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredLanguage', langCode);
      }
      
      toast.success(`Language changed to ${newLang.name}`);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(`Failed to change language: ${error.message}`);
      
      // Use fallback translations
      setTranslations(FALLBACK_TRANSLATIONS.en);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced translate function with nested key support and interpolation
  const t = (key, defaultText = key, interpolations = {}) => {
    if (loading) return defaultText !== key ? defaultText : "Loading...";
    
    try {
      // Get the translation from the nested structure
      const translation = getNestedValue(translations, key);
      
      // If no translation found or it's not a string, return default
      if (!translation || typeof translation !== 'string') {
        // Make sure we never return the key itself
        if (defaultText === key) {
          // Try to get English translation as fallback
          const englishTranslation = getNestedValue(FALLBACK_TRANSLATIONS.en, key);
          if (englishTranslation && typeof englishTranslation === 'string') {
            return englishTranslation;
          }
          
          // If we can't find an English translation, convert the key to a readable format
          return key.split('.').pop().replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2');
        }
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
      // Make sure we never return the key itself
      if (defaultText === key) {
        // Try to get English translation as fallback
        try {
          const englishTranslation = getNestedValue(FALLBACK_TRANSLATIONS.en, key);
          if (englishTranslation && typeof englishTranslation === 'string') {
            return englishTranslation;
          }
        } catch (e) {
          // Ignore error and continue with fallback
        }
        
        // If we can't find an English translation, convert the key to a readable format
        return key.split('.').pop().replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/([a-z])([A-Z])/g, '$1 $2');
      }
      return defaultText;
    }
  };

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    t,
    loading,
    setTranslations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 