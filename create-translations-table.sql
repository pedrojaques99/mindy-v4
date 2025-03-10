-- Create translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  language VARCHAR(10) NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(language, key)
);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON translations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON translations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON translations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for service role only" ON translations
  FOR DELETE USING (auth.role() = 'service_role');

-- Add language column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN language VARCHAR(10) DEFAULT 'en';
  END IF;
END $$;

-- Insert translations
INSERT INTO translations (language, key, value) VALUES
-- English translations
('en', 'common.home', 'Home'),
('en', 'common.favorites', 'Favorites'),
('en', 'common.submit', 'Submit'),
('en', 'common.signOut', 'Sign Out'),
('en', 'common.viewAll', 'View all'),
('en', 'common.back', 'Back'),
('en', 'common.resources', 'Resources'),
('en', 'common.backToHome', 'Back to Home'),

-- Error Pages
('en', 'errors.pageNotFound', 'Page Not Found'),
('en', 'errors.pageNotFoundDesc', 'The page you''re looking for doesn''t exist or has been moved.'),

-- Homepage Hero Section
('en', 'home.hero.title', 'Discover'),
('en', 'home.hero.titleHighlight', 'Creative Resources'),
('en', 'home.hero.titleEnd', 'for Your Projects'),
('en', 'home.hero.subtitle', 'Find the best tools, assets, and inspiration for designers, developers, and creators.'),
('en', 'home.search.placeholder', 'Search for resources, tools, or inspiration...'),
('en', 'home.popular.label', 'Popular'),

-- Homepage Sections
('en', 'home.sections.filterResources', 'Filter Resources'),
('en', 'home.sections.software', 'Software'),
('en', 'home.sections.trendingResources', 'Trending Resources'),
('en', 'home.sections.recentUploads', 'Recent Uploads'),
('en', 'home.sections.mostLiked', 'Most Liked Resources'),

-- Homepage Filters
('en', 'home.filters.activeLabel', 'Active filters'),
('en', 'home.filters.clearAll', 'Clear all'),

-- Categories
('en', 'categories.assets', 'Assets'),
('en', 'categories.tools', 'Tools'),
('en', 'categories.community', 'Community'),
('en', 'categories.reference', 'Reference'),
('en', 'categories.inspiration', 'Inspiration'),
('en', 'categories.learn', 'Learn'),

-- Subcategories
('en', 'subcategories.fonts', 'Fonts'),
('en', 'subcategories.icons', 'Icons'),
('en', 'subcategories.textures', 'Textures'),
('en', 'subcategories.sfx', 'SFX'),
('en', 'subcategories.mockups', 'Mockups'),
('en', 'subcategories.3d', '3D'),
('en', 'subcategories.photos-videos', 'Images'),
('en', 'subcategories.color', 'Color'),
('en', 'subcategories.ai', 'AI'),
('en', 'subcategories.productivity', 'Productivity'),
('en', 'subcategories.portfolio', 'Portfolio'),
('en', 'subcategories.design', 'Design'),
('en', 'subcategories.ui', 'UI'),
('en', 'subcategories.audiovisual', 'Audiovisual'),
('en', 'subcategories.moodboard', 'Moodboard'),
('en', 'subcategories.reference', 'Reference'),
('en', 'subcategories.ui-ux', 'UI/UX'),
('en', 'subcategories.typography', 'Typography'),
('en', 'subcategories.books', 'Books'),

-- Software
('en', 'software.figma', 'Figma'),
('en', 'software.photoshop', 'Photoshop'),
('en', 'software.blender', 'Blender'),
('en', 'software.cursor', 'Cursor'),
('en', 'software.illustrator', 'Illustrator'),
('en', 'software.indesign', 'InDesign'),
('en', 'software.after-effects', 'After Effects'),
('en', 'software.premiere', 'Premiere'),

-- Portuguese translations
('pt-BR', 'common.home', 'Início'),
('pt-BR', 'common.favorites', 'Favoritos'),
('pt-BR', 'common.submit', 'Enviar'),
('pt-BR', 'common.signOut', 'Sair'),
('pt-BR', 'common.viewAll', 'Ver tudo'),
('pt-BR', 'common.back', 'Voltar'),
('pt-BR', 'common.resources', 'Recursos'),
('pt-BR', 'common.backToHome', 'Voltar para o Início'),

-- Error Pages
('pt-BR', 'errors.pageNotFound', 'Página Não Encontrada'),
('pt-BR', 'errors.pageNotFoundDesc', 'A página que você está procurando não existe ou foi movida.'),

-- Homepage Hero Section
('pt-BR', 'home.hero.title', 'Descubra'),
('pt-BR', 'home.hero.titleHighlight', 'Recursos Criativos'),
('pt-BR', 'home.hero.titleEnd', 'para seus Projetos'),
('pt-BR', 'home.hero.subtitle', 'Encontre as melhores ferramentas, recursos e inspiração para designers, desenvolvedores e criadores.'),
('pt-BR', 'home.search.placeholder', 'Busque por recursos, ferramentas ou inspiração...'),
('pt-BR', 'home.popular.label', 'Popular'),

-- Homepage Sections
('pt-BR', 'home.sections.filterResources', 'Filtrar Recursos'),
('pt-BR', 'home.sections.software', 'Softwares'),
('pt-BR', 'home.sections.trendingResources', 'Recursos em Alta'),
('pt-BR', 'home.sections.recentUploads', 'Uploads Recentes'),
('pt-BR', 'home.sections.mostLiked', 'Recursos Mais Curtidos'),

-- Homepage Filters
('pt-BR', 'home.filters.activeLabel', 'Filtros ativos'),
('pt-BR', 'home.filters.clearAll', 'Limpar tudo'),

-- Categories
('pt-BR', 'categories.assets', 'Recursos'),
('pt-BR', 'categories.tools', 'Ferramentas'),
('pt-BR', 'categories.community', 'Comunidade'),
('pt-BR', 'categories.reference', 'Referência'),
('pt-BR', 'categories.inspiration', 'Inspiração'),
('pt-BR', 'categories.learn', 'Aprender'),

-- Subcategories
('pt-BR', 'subcategories.fonts', 'Fontes'),
('pt-BR', 'subcategories.icons', 'Ícones'),
('pt-BR', 'subcategories.textures', 'Texturas'),
('pt-BR', 'subcategories.sfx', 'Efeitos Sonoros'),
('pt-BR', 'subcategories.mockups', 'Mockups'),
('pt-BR', 'subcategories.3d', '3D'),
('pt-BR', 'subcategories.photos-videos', 'Imagens'),
('pt-BR', 'subcategories.color', 'Cores'),
('pt-BR', 'subcategories.ai', 'IA'),
('pt-BR', 'subcategories.productivity', 'Produtividade'),
('pt-BR', 'subcategories.portfolio', 'Portfólio'),
('pt-BR', 'subcategories.design', 'Design'),
('pt-BR', 'subcategories.ui', 'UI'),
('pt-BR', 'subcategories.audiovisual', 'Audiovisual'),
('pt-BR', 'subcategories.moodboard', 'Moodboard'),
('pt-BR', 'subcategories.reference', 'Referência'),
('pt-BR', 'subcategories.ui-ux', 'UI/UX'),
('pt-BR', 'subcategories.typography', 'Tipografia'),
('pt-BR', 'subcategories.books', 'Livros'),

-- Software
('pt-BR', 'software.figma', 'Figma'),
('pt-BR', 'software.photoshop', 'Photoshop'),
('pt-BR', 'software.blender', 'Blender'),
('pt-BR', 'software.cursor', 'Cursor'),
('pt-BR', 'software.illustrator', 'Illustrator'),
('pt-BR', 'software.indesign', 'InDesign'),
('pt-BR', 'software.after-effects', 'After Effects'),
('pt-BR', 'software.premiere', 'Premiere')

ON CONFLICT (language, key) DO UPDATE 
SET value = EXCLUDED.value,
    updated_at = TIMEZONE('utc'::text, NOW()); 