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
      vector: 'vetor',
      library: 'biblioteca',
      web: 'web',
      illustrations: 'ilustrações',
      free: 'grátis',
      animated: 'animado',
      shapes: 'formas',
      design: 'design',
      png: 'png',
      repository: 'repositório',
      'material-design': 'material design',
      google: 'google',
      icons: 'ícones',
      typography: 'tipografia',
      ai: 'ia',
      '3d': '3d',
      mockups: 'mockups',
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
  },
  'pt-BR': {
    tags: {
      vector: 'vetor',
      library: 'biblioteca',
      web: 'web',
      illustrations: 'ilustrações',
      free: 'grátis',
      animated: 'animado',
      shapes: 'formas',
      design: 'design',
      png: 'png',
      repository: 'repositório',
      'material-design': 'material design',
      google: 'google',
      icons: 'ícones',
      typography: 'tipografia',
      ai: 'ia',
      '3d': '3d',
      mockups: 'mockups',
      templates: 'templates',
      resources: 'recursos',
      tools: 'ferramentas'
    },
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
      sections: {
        trendingResources: 'Recursos em Alta',
        filterResources: 'Filtrar Recursos',
        recentUploads: 'Adicionados Recentemente',
        mostLiked: 'Recursos Mais Curtidos',
        software: 'Software'
      },
      filters: {
        activeLabel: 'Filtros ativos',
        selected: 'selecionados',
        clear: 'Limpar',
        clearAll: 'Limpar todos',
        filterByTags: 'Filtrar por tags',
        noTags: 'Nenhuma tag disponível',
        selectedFilters: 'Filtros selecionados'
      },
      tags: {
        popular: 'Tags populares',
        all: 'Todas as tags',
        trending: 'Tags em alta',
        noTags: 'Nenhuma tag encontrada'
      }
    },
    categories: {
      allResources: 'Todos os Recursos',
      description: 'Navegue por nossa coleção selecionada de recursos de {category}',
      assets: 'Recursos',
      tools: 'Ferramentas',
      community: 'Comunidade',
      reference: 'Referência',
      inspiration: 'Inspiração',
      learn: 'Aprender',
      software: 'Software'
    },
    resources: {
      browseAll: 'Navegue por nossa coleção selecionada de recursos'
    },
    common: {
      search: 'Buscar recursos...',
      editProfile: 'Editar Perfil',
      loadMore: 'Mostrar mais',
      viewAll: 'Ver todos',
      backToHome: 'Voltar para a Página Inicial',
      na: 'N/D',
      share: 'Compartilhar',
      signIn: 'Entrar'
    },
    ui: {
      search: 'Pesquisar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      apply: 'Aplicar',
      clear: 'Limpar',
      add: 'Adicionar',
      optional: 'Opcional',
      retry: 'Tentar novamente',
      back: 'Voltar'
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