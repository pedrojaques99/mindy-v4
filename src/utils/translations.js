import { supabase } from '../main';

// Fallback translations in case database fails
export const FALLBACK_TRANSLATIONS = {
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
    }
  }
};

export const loadTranslations = async (langCode) => {
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('language', langCode);
      
    if (error) {
      console.error(`Error loading translations for ${langCode}:`, error);
      
      // If the error is that the table doesn't exist, return fallback translations
      if (error.code === '42P01') {
        console.warn('Translations table does not exist, using fallback translations');
        return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
      }
      
      return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
    }
    
    if (!data || data.length === 0) {
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
    
    // Check if we have all the required translations
    // If not, merge with fallback
    const fallback = FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
    const merged = mergeDeep(fallback, translationData);
    
    return merged;
  } catch (error) {
    console.error(`Error loading translations for ${langCode}:`, error);
    return FALLBACK_TRANSLATIONS[langCode] || FALLBACK_TRANSLATIONS.en;
  }
};

export const getDefaultLanguage = () => {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferredLanguage');
    if (stored) return stored;
  }
  
  // Fallback to browser language or 'en'
  try {
    const browserLang = navigator.language?.split('-')[0];
    return browserLang || 'en';
  } catch (error) {
    return 'en';
  }
};

export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' }
};

// Helper function to deep merge objects
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
} 