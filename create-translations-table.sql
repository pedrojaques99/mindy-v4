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

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Check and create read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translations' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON translations
      FOR SELECT USING (true);
  END IF;

  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translations' 
    AND policyname = 'Enable insert for authenticated users only'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users only" ON translations
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  -- Check and create update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translations' 
    AND policyname = 'Enable update for authenticated users only'
  ) THEN
    CREATE POLICY "Enable update for authenticated users only" ON translations
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;

  -- Check and create delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translations' 
    AND policyname = 'Enable delete for service role only'
  ) THEN
    CREATE POLICY "Enable delete for service role only" ON translations
      FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

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
('en', 'common.error', 'An error occurred'),
('en', 'common.anonymous', 'Anonymous'),

-- Auth
('en', 'auth.signInRequired', 'Please sign in to continue'),

-- Error Pages
('en', 'errors.pageNotFound', 'Page Not Found'),
('en', 'errors.pageNotFoundDesc', 'The page you''re looking for doesn''t exist or has been moved.'),
('en', 'errors.resourceNotFound', 'Resource Not Found'),
('en', 'errors.resourceNotFoundDesc', 'The resource you''re looking for doesn''t exist or has been moved.'),

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
('en', 'home.sections.trending', 'Trending Now'),
('en', 'home.sections.recent', 'Recently Added'),
('en', 'home.sections.popular', 'Most Popular'),
('en', 'home.sections.viewAll', 'View All'),
('en', 'home.sections.loading', 'Loading resources...'),
('en', 'home.sections.error', 'Error loading resources'),
('en', 'home.sections.empty', 'No resources found'),

-- Homepage Filters
('en', 'home.filters.activeLabel', 'Active filters'),
('en', 'home.filters.clearAll', 'Clear all'),
('en', 'home.filters.title', 'Filter Resources'),
('en', 'home.filters.category', 'Category'),
('en', 'home.filters.subcategory', 'Subcategory'),
('en', 'home.filters.software', 'Software'),
('en', 'home.filters.clear', 'Clear filters'),
('en', 'home.filters.apply', 'Apply filters'),
('en', 'home.filters.noResults', 'No resources found with selected filters'),
('en', 'home.filters.selected', 'Selected filters'),
('en', 'home.filters.remove', 'Remove filter'),

-- Categories
('en', 'categories.assets', 'Assets'),
('en', 'categories.tools', 'Tools'),
('en', 'categories.community', 'Community'),
('en', 'categories.reference', 'Reference'),
('en', 'categories.inspiration', 'Inspiration'),
('en', 'categories.learn', 'Learn'),

-- Home Page Categories
('en', 'home.categories.all', 'All Categories'),
('en', 'home.categories.assets', 'Assets'),
('en', 'home.categories.tools', 'Tools'),
('en', 'home.categories.community', 'Community'),
('en', 'home.categories.reference', 'Reference'),
('en', 'home.categories.inspiration', 'Inspiration'),
('en', 'home.categories.learn', 'Learn'),

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

-- Resource Cards and Page
('en', 'resource.visit', 'Visit'),
('en', 'resource.share', 'Share'),
('en', 'resource.like', 'Like'),
('en', 'resource.liked', 'Liked'),
('en', 'resource.save', 'Save'),
('en', 'resource.saved', 'Saved'),
('en', 'resource.category', 'Category'),
('en', 'resource.subcategory', 'Subcategory'),
('en', 'resource.tags', 'Tags'),
('en', 'resource.description', 'Description'),
('en', 'resource.author', 'Author'),
('en', 'resource.date', 'Date'),
('en', 'resource.views', 'Views'),
('en', 'resource.likes', 'Likes'),
('en', 'resource.saves', 'Saves'),
('en', 'resource.related', 'Related Resources'),
('en', 'resource.noRelated', 'No related resources found'),
('en', 'resource.report', 'Report'),
('en', 'resource.share.title', 'Share Resource'),
('en', 'resource.share.copy', 'Copy Link'),
('en', 'resource.share.copied', 'Link copied to clipboard'),
('en', 'resource.addFavorite', 'Add to favorites'),
('en', 'resource.removeFavorite', 'Remove from favorites'),
('en', 'resource.addedToFavorites', 'Added to favorites'),
('en', 'resource.removedFromFavorites', 'Removed from favorites'),
('en', 'resource.details', 'Details'),
('en', 'resource.comments', 'Comments'),
('en', 'resource.cardAriaLabel', 'View {title} details'),

-- Common Tags
('en', 'tags.free', 'Free'),
('en', 'tags.premium', 'Premium'),
('en', 'tags.new', 'New'),
('en', 'tags.trending', 'Trending'),
('en', 'tags.featured', 'Featured'),
('en', 'tags.popular', 'Popular'),
('en', 'tags.recommended', 'Recommended'),
('en', 'tags.all', 'All'),
('en', 'tags.other', 'Other'),

-- Home Page Tags
('en', 'home.tags.popular', 'Popular tags'),
('en', 'home.tags.trending', 'Trending tags'),
('en', 'home.tags.all', 'All tags'),
('en', 'home.tags.more', 'More tags'),
('en', 'home.tags.selected', 'Selected tags'),
('en', 'home.tags.clear', 'Clear tags'),

-- Home Page Stats
('en', 'home.stats.resources', 'Resources'),
('en', 'home.stats.categories', 'Categories'),
('en', 'home.stats.users', 'Users'),

-- Additional UI Elements
('en', 'ui.loading', 'Loading...'),
('en', 'ui.error', 'Error'),
('en', 'ui.empty', 'No items found'),
('en', 'ui.more', 'Show more'),
('en', 'ui.less', 'Show less'),
('en', 'ui.close', 'Close'),
('en', 'ui.open', 'Open'),
('en', 'ui.select', 'Select'),
('en', 'ui.selected', 'Selected'),
('en', 'ui.clear', 'Clear'),
('en', 'ui.apply', 'Apply'),
('en', 'ui.cancel', 'Cancel'),
('en', 'ui.confirm', 'Confirm'),
('en', 'ui.save', 'Save'),
('en', 'ui.delete', 'Delete'),
('en', 'ui.edit', 'Edit'),
('en', 'ui.add', 'Add'),
('en', 'ui.remove', 'Remove'),
('en', 'ui.search', 'Search'),
('en', 'ui.filter', 'Filter'),
('en', 'ui.sort', 'Sort'),

-- Portuguese translations
('pt-BR', 'common.home', 'Início'),
('pt-BR', 'common.favorites', 'Favoritos'),
('pt-BR', 'common.submit', 'Enviar'),
('pt-BR', 'common.signOut', 'Sair'),
('pt-BR', 'common.viewAll', 'Ver todos'),
('pt-BR', 'common.back', 'Voltar'),
('pt-BR', 'common.resources', 'Recursos'),
('pt-BR', 'common.backToHome', 'Voltar para o Início'),
('pt-BR', 'common.error', 'Ocorreu um erro'),
('pt-BR', 'common.anonymous', 'Anônimo'),

-- Auth
('pt-BR', 'auth.signInRequired', 'Faça login para continuar'),

-- Error Pages
('pt-BR', 'errors.pageNotFound', 'Página Não Encontrada'),
('pt-BR', 'errors.pageNotFoundDesc', 'A página que você está procurando não existe ou foi movida.'),
('pt-BR', 'errors.resourceNotFound', 'Recurso Não Encontrado'),
('pt-BR', 'errors.resourceNotFoundDesc', 'O recurso que você está procurando não existe ou foi movido.'),

-- Homepage Hero Section
('pt-BR', 'home.hero.title', 'Descubra'),
('pt-BR', 'home.hero.titleHighlight', 'Recursos Criativos'),
('pt-BR', 'home.hero.titleEnd', 'para seus Projetos'),
('pt-BR', 'home.hero.subtitle', 'Encontre as melhores ferramentas, recursos e inspiração para designers, desenvolvedores e criadores.'),
('pt-BR', 'home.search.placeholder', 'Pesquisar recursos, ferramentas ou inspiração...'),
('pt-BR', 'home.popular.label', 'Populares'),

-- Homepage Sections
('pt-BR', 'home.sections.filterResources', 'Filtrar Recursos'),
('pt-BR', 'home.sections.software', 'Softwares'),
('pt-BR', 'home.sections.trendingResources', 'Em Destaque'),
('pt-BR', 'home.sections.recentUploads', 'Adicionados Recentemente'),
('pt-BR', 'home.sections.mostLiked', 'Mais Curtidos'),
('pt-BR', 'home.sections.trending', 'Em Alta'),
('pt-BR', 'home.sections.recent', 'Adicionados Recentemente'),
('pt-BR', 'home.sections.popular', 'Mais Populares'),
('pt-BR', 'home.sections.viewAll', 'Ver Todos'),
('pt-BR', 'home.sections.loading', 'Carregando recursos...'),
('pt-BR', 'home.sections.error', 'Erro ao carregar recursos'),
('pt-BR', 'home.sections.empty', 'Nenhum recurso encontrado'),

-- Homepage Filters
('pt-BR', 'home.filters.activeLabel', 'Filtros ativos'),
('pt-BR', 'home.filters.clearAll', 'Limpar tudo'),
('pt-BR', 'home.filters.title', 'Filtrar Recursos'),
('pt-BR', 'home.filters.category', 'Categoria'),
('pt-BR', 'home.filters.subcategory', 'Subcategoria'),
('pt-BR', 'home.filters.software', 'Software'),
('pt-BR', 'home.filters.clear', 'Limpar filtros'),
('pt-BR', 'home.filters.apply', 'Aplicar filtros'),
('pt-BR', 'home.filters.noResults', 'Nenhum recurso encontrado com os filtros selecionados'),
('pt-BR', 'home.filters.selected', 'Filtros selecionados'),
('pt-BR', 'home.filters.remove', 'Remover filtro'),

-- Categories
('pt-BR', 'categories.assets', 'Recursos'),
('pt-BR', 'categories.tools', 'Ferramentas'),
('pt-BR', 'categories.community', 'Comunidade'),
('pt-BR', 'categories.reference', 'Referências'),
('pt-BR', 'categories.inspiration', 'Inspiração'),
('pt-BR', 'categories.learn', 'Aprendizado'),

-- Home Page Categories
('pt-BR', 'home.categories.all', 'Todas as Categorias'),
('pt-BR', 'home.categories.assets', 'Recursos'),
('pt-BR', 'home.categories.tools', 'Ferramentas'),
('pt-BR', 'home.categories.community', 'Comunidade'),
('pt-BR', 'home.categories.reference', 'Referências'),
('pt-BR', 'home.categories.inspiration', 'Inspiração'),
('pt-BR', 'home.categories.learn', 'Aprendizado'),

-- Subcategories
('pt-BR', 'subcategories.fonts', 'Fontes'),
('pt-BR', 'subcategories.icons', 'Ícones'),
('pt-BR', 'subcategories.textures', 'Texturas'),
('pt-BR', 'subcategories.sfx', 'Efeitos Sonoros'),
('pt-BR', 'subcategories.mockups', 'Mockups'),
('pt-BR', 'subcategories.3d', '3D'),
('pt-BR', 'subcategories.photos-videos', 'Imagens e Vídeos'),
('pt-BR', 'subcategories.color', 'Cores'),
('pt-BR', 'subcategories.ai', 'IA'),
('pt-BR', 'subcategories.productivity', 'Produtividade'),
('pt-BR', 'subcategories.portfolio', 'Portfólio'),
('pt-BR', 'subcategories.design', 'Design'),
('pt-BR', 'subcategories.ui', 'UI'),
('pt-BR', 'subcategories.audiovisual', 'Audiovisual'),
('pt-BR', 'subcategories.moodboard', 'Moodboard'),
('pt-BR', 'subcategories.reference', 'Referências'),
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
('pt-BR', 'software.premiere', 'Premiere'),

-- Resource Cards and Page
('pt-BR', 'resource.visit', 'Visitar'),
('pt-BR', 'resource.share', 'Compartilhar'),
('pt-BR', 'resource.like', 'Curtir'),
('pt-BR', 'resource.liked', 'Curtido'),
('pt-BR', 'resource.save', 'Salvar'),
('pt-BR', 'resource.saved', 'Salvo'),
('pt-BR', 'resource.category', 'Categoria'),
('pt-BR', 'resource.subcategory', 'Subcategoria'),
('pt-BR', 'resource.tags', 'Tags'),
('pt-BR', 'resource.description', 'Descrição'),
('pt-BR', 'resource.author', 'Autor'),
('pt-BR', 'resource.date', 'Data'),
('pt-BR', 'resource.views', 'Visualizações'),
('pt-BR', 'resource.likes', 'Curtidas'),
('pt-BR', 'resource.saves', 'Salvos'),
('pt-BR', 'resource.related', 'Recursos Relacionados'),
('pt-BR', 'resource.noRelated', 'Nenhum recurso relacionado encontrado'),
('pt-BR', 'resource.report', 'Reportar'),
('pt-BR', 'resource.share.title', 'Compartilhar Recurso'),
('pt-BR', 'resource.share.copy', 'Copiar Link'),
('pt-BR', 'resource.share.copied', 'Link copiado!'),
('pt-BR', 'resource.addFavorite', 'Adicionar aos favoritos'),
('pt-BR', 'resource.removeFavorite', 'Remover dos favoritos'),
('pt-BR', 'resource.addedToFavorites', 'Adicionado aos favoritos'),
('pt-BR', 'resource.removedFromFavorites', 'Removido dos favoritos'),
('pt-BR', 'resource.details', 'Detalhes'),
('pt-BR', 'resource.comments', 'Comentários'),
('pt-BR', 'resource.cardAriaLabel', 'Ver detalhes de {title}'),

-- Common Tags
('pt-BR', 'tags.free', 'Grátis'),
('pt-BR', 'tags.premium', 'Premium'),
('pt-BR', 'tags.new', 'Novo'),
('pt-BR', 'tags.trending', 'Em Alta'),
('pt-BR', 'tags.featured', 'Destaque'),
('pt-BR', 'tags.popular', 'Popular'),
('pt-BR', 'tags.recommended', 'Recomendado'),
('pt-BR', 'tags.all', 'Todos'),
('pt-BR', 'tags.other', 'Outros'),

-- Home Page Tags
('pt-BR', 'home.tags.popular', 'Tags populares'),
('pt-BR', 'home.tags.trending', 'Tags em alta'),
('pt-BR', 'home.tags.all', 'Todas as tags'),
('pt-BR', 'home.tags.more', 'Mais tags'),
('pt-BR', 'home.tags.selected', 'Tags selecionadas'),
('pt-BR', 'home.tags.clear', 'Limpar tags'),

-- Home Page Stats
('pt-BR', 'home.stats.resources', 'Recursos'),
('pt-BR', 'home.stats.categories', 'Categorias'),
('pt-BR', 'home.stats.users', 'Usuários'),

-- Additional UI Elements
('pt-BR', 'ui.loading', 'Carregando...'),
('pt-BR', 'ui.error', 'Erro'),
('pt-BR', 'ui.empty', 'Nenhum item encontrado'),
('pt-BR', 'ui.more', 'Mostrar mais'),
('pt-BR', 'ui.less', 'Mostrar menos'),
('pt-BR', 'ui.close', 'Fechar'),
('pt-BR', 'ui.open', 'Abrir'),
('pt-BR', 'ui.select', 'Selecionar'),
('pt-BR', 'ui.selected', 'Selecionado'),
('pt-BR', 'ui.clear', 'Limpar'),
('pt-BR', 'ui.apply', 'Aplicar'),
('pt-BR', 'ui.cancel', 'Cancelar'),
('pt-BR', 'ui.confirm', 'Confirmar'),
('pt-BR', 'ui.save', 'Salvar'),
('pt-BR', 'ui.delete', 'Excluir'),
('pt-BR', 'ui.edit', 'Editar'),
('pt-BR', 'ui.add', 'Adicionar'),
('pt-BR', 'ui.remove', 'Remover'),
('pt-BR', 'ui.search', 'Pesquisar'),
('pt-BR', 'ui.filter', 'Filtrar'),
('pt-BR', 'ui.sort', 'Ordenar')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Status Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'common.backToHome', 'Back to Home'),
  ('en', 'common.refresh', 'Refresh'),
  ('en', 'common.na', 'N/A'),
  ('en', 'status.title', 'System Status'),
  ('en', 'status.lastChecked', 'Last Checked'),
  ('en', 'status.server.title', 'Server Status'),
  ('en', 'status.server.responseTime', 'Response Time'),
  ('en', 'status.server.uptime', 'Uptime'),
  ('en', 'status.server.uptimeValue', '{hours} hours'),
  ('en', 'status.server.memoryUsage', 'Memory Usage'),
  ('en', 'status.server.version', 'Version'),
  ('en', 'status.server.status.online', 'ONLINE'),
  ('en', 'status.server.status.offline', 'OFFLINE'),
  ('en', 'status.supabase.title', 'Supabase Status'),
  ('en', 'status.supabase.responseTime', 'Response Time'),
  ('en', 'status.supabase.status.online', 'ONLINE'),
  ('en', 'status.supabase.status.offline', 'OFFLINE'),
  ('en', 'status.supabase.status.degraded', 'DEGRADED'),
  ('en', 'status.supabase.status.checking', 'CHECKING'),
  ('en', 'status.supabase.status.error', 'ERROR'),
  ('en', 'status.errors.prefix', 'Error'),
  ('en', 'status.errors.supabaseQuery', 'Supabase query error: {error}'),
  ('en', 'status.errors.tableInfo', 'Connected but could not fetch table info'),
  ('en', 'status.errors.connectionFailed', 'Connection failed'),
  ('en', 'status.tables.title', 'Database Tables'),
  ('en', 'status.tables.name', 'Table Name'),
  ('en', 'status.tables.rows', 'Rows'),
  ('en', 'status.tables.status', 'Status'),
  ('en', 'status.tables.status.accessible', 'Accessible'),
  ('en', 'status.tables.status.inaccessible', 'Inaccessible'),
  ('en', 'errors.pageNotFoundDesc', 'The page you''re looking for doesn''t exist or has been moved.'),

  -- Portuguese translations
  ('pt-BR', 'common.backToHome', 'Voltar para Início'),
  ('pt-BR', 'common.refresh', 'Atualizar'),
  ('pt-BR', 'common.na', 'N/D'),
  ('pt-BR', 'status.title', 'Status do Sistema'),
  ('pt-BR', 'status.lastChecked', 'Última Verificação'),
  ('pt-BR', 'status.server.title', 'Status do Servidor'),
  ('pt-BR', 'status.server.responseTime', 'Tempo de Resposta'),
  ('pt-BR', 'status.server.uptime', 'Tempo Online'),
  ('pt-BR', 'status.server.uptimeValue', '{hours} horas'),
  ('pt-BR', 'status.server.memoryUsage', 'Uso de Memória'),
  ('pt-BR', 'status.server.version', 'Versão'),
  ('pt-BR', 'status.server.status.online', 'ONLINE'),
  ('pt-BR', 'status.server.status.offline', 'OFFLINE'),
  ('pt-BR', 'status.supabase.title', 'Status do Supabase'),
  ('pt-BR', 'status.supabase.responseTime', 'Tempo de Resposta'),
  ('pt-BR', 'status.supabase.status.online', 'ONLINE'),
  ('pt-BR', 'status.supabase.status.offline', 'OFFLINE'),
  ('pt-BR', 'status.supabase.status.degraded', 'DEGRADADO'),
  ('pt-BR', 'status.supabase.status.checking', 'VERIFICANDO'),
  ('pt-BR', 'status.supabase.status.error', 'ERRO'),
  ('pt-BR', 'status.errors.prefix', 'Erro'),
  ('pt-BR', 'status.errors.supabaseQuery', 'Erro na consulta do Supabase: {error}'),
  ('pt-BR', 'status.errors.tableInfo', 'Conectado mas não foi possível buscar informações das tabelas'),
  ('pt-BR', 'status.errors.connectionFailed', 'Falha na conexão'),
  ('pt-BR', 'status.tables.title', 'Tabelas do Banco de Dados'),
  ('pt-BR', 'status.tables.name', 'Nome da Tabela'),
  ('pt-BR', 'status.tables.rows', 'Linhas'),
  ('pt-BR', 'status.tables.status', 'Status'),
  ('pt-BR', 'status.tables.status.accessible', 'Acessível'),
  ('pt-BR', 'status.tables.status.inaccessible', 'Inacessível')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Submit Resource Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'submit.title', 'Submit a Resource'),
  ('en', 'submit.description', 'Share a valuable resource with the community. All submissions are reviewed before being published.'),
  ('en', 'submit.signInRequired', 'You need to be signed in to submit a resource.'),
  ('en', 'submit.form.title', 'Title'),
  ('en', 'submit.form.description', 'Description'),
  ('en', 'submit.form.url', 'URL'),
  ('en', 'submit.form.imageUrl', 'Image URL'),
  ('en', 'submit.form.imageUrlHelp', 'Optional. Leave blank to use a default image.'),
  ('en', 'submit.form.category', 'Category'),
  ('en', 'submit.form.selectCategory', 'Select a category'),
  ('en', 'submit.form.tags', 'Tags'),
  ('en', 'submit.form.tagsHelp', 'Separate tags with commas (e.g., design, tools, productivity)'),
  ('en', 'submit.form.submit', 'Submit Resource'),
  ('en', 'submit.form.submitting', 'Submitting...'),
  ('en', 'submit.success', 'Resource submitted successfully!'),
  ('en', 'submit.errors.loadCategories', 'Failed to load categories'),
  ('en', 'submit.errors.notSignedIn', 'You must be signed in to submit a resource'),
  ('en', 'submit.errors.submitFailed', 'Failed to submit resource'),

  -- Portuguese translations
  ('pt-BR', 'submit.title', 'Enviar um Recurso'),
  ('pt-BR', 'submit.description', 'Compartilhe um recurso valioso com a comunidade. Todas as submissões são revisadas antes de serem publicadas.'),
  ('pt-BR', 'submit.signInRequired', 'Você precisa estar conectado para enviar um recurso.'),
  ('pt-BR', 'submit.form.title', 'Título'),
  ('pt-BR', 'submit.form.description', 'Descrição'),
  ('pt-BR', 'submit.form.url', 'URL'),
  ('pt-BR', 'submit.form.imageUrl', 'URL da Imagem'),
  ('pt-BR', 'submit.form.imageUrlHelp', 'Opcional. Deixe em branco para usar uma imagem padrão.'),
  ('pt-BR', 'submit.form.category', 'Categoria'),
  ('pt-BR', 'submit.form.selectCategory', 'Selecione uma categoria'),
  ('pt-BR', 'submit.form.tags', 'Tags'),
  ('pt-BR', 'submit.form.tagsHelp', 'Separe as tags com vírgulas (ex: design, ferramentas, produtividade)'),
  ('pt-BR', 'submit.form.submit', 'Enviar Recurso'),
  ('pt-BR', 'submit.form.submitting', 'Enviando...'),
  ('pt-BR', 'submit.success', 'Recurso enviado com sucesso!'),
  ('pt-BR', 'submit.errors.loadCategories', 'Falha ao carregar categorias'),
  ('pt-BR', 'submit.errors.notSignedIn', 'Você precisa estar conectado para enviar um recurso'),
  ('pt-BR', 'submit.errors.submitFailed', 'Falha ao enviar recurso')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- NotFound Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'errors.pageNotFound', 'Page Not Found'),
  ('en', 'errors.pageNotFoundDesc', 'The page you''re looking for doesn''t exist or has been moved.'),

  -- Portuguese translations
  ('pt-BR', 'errors.pageNotFound', 'Página Não Encontrada'),
  ('pt-BR', 'errors.pageNotFoundDesc', 'A página que você está procurando não existe ou foi movida.')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Category Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'categories.allResources', 'All Resources'),
  ('en', 'categories.description', 'Browse our curated collection of {category} resources'),
  ('en', 'category.search.placeholder', 'Search in {category}...'),
  ('en', 'category.filters.active', 'Active Filters'),
  ('en', 'category.filters.search', 'Search'),
  ('en', 'category.filters.subcategory', 'Subcategory'),
  ('en', 'category.filters.tag', 'Tag'),
  ('en', 'category.filters.clear', 'Clear all filters'),
  ('en', 'category.filters.subcategories', 'Subcategories'),
  ('en', 'category.filters.popularTags', 'Popular Tags'),
  ('en', 'category.noResultsFiltered', 'No resources found matching your filters.'),
  ('en', 'category.noResults', 'No resources found in this category.'),
  ('en', 'category.clearFilters', 'Clear all filters'),

  -- Portuguese translations
  ('pt-BR', 'categories.allResources', 'Todos os Recursos'),
  ('pt-BR', 'categories.description', 'Navegue por nossa coleção selecionada de recursos de {category}'),
  ('pt-BR', 'category.search.placeholder', 'Pesquisar em {category}...'),
  ('pt-BR', 'category.filters.active', 'Filtros Ativos'),
  ('pt-BR', 'category.filters.search', 'Pesquisa'),
  ('pt-BR', 'category.filters.subcategory', 'Subcategoria'),
  ('pt-BR', 'category.filters.tag', 'Tag'),
  ('pt-BR', 'category.filters.clear', 'Limpar todos os filtros'),
  ('pt-BR', 'category.filters.subcategories', 'Subcategorias'),
  ('pt-BR', 'category.filters.popularTags', 'Tags Populares'),
  ('pt-BR', 'category.noResultsFiltered', 'Nenhum recurso encontrado com seus filtros.'),
  ('pt-BR', 'category.noResults', 'Nenhum recurso encontrado nesta categoria.'),
  ('pt-BR', 'category.clearFilters', 'Limpar todos os filtros')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Profile Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'profile.title', 'Profile'),
  ('en', 'profile.avatar.alt', 'User Avatar'),
  ('en', 'profile.defaultUsername', 'User'),
  ('en', 'profile.editProfile', 'Edit Profile'),
  ('en', 'profile.accountInfo.title', 'Account Information'),
  ('en', 'profile.accountInfo.email', 'Email'),
  ('en', 'profile.accountInfo.memberSince', 'Member since'),
  ('en', 'profile.accountInfo.username', 'Username'),
  ('en', 'profile.accountInfo.notSet', 'Not set'),
  ('en', 'profile.signOut.button', 'Sign Out'),
  ('en', 'profile.signOut.inProgress', 'Signing Out...'),
  ('en', 'profile.favorites.title', 'Your Favorites'),
  ('en', 'profile.favorites.empty', 'You haven''t added any favorites yet.'),
  ('en', 'profile.favorites.browse', 'Browse resources'),
  ('en', 'profile.errors.loadFavorites', 'Failed to load favorites'),
  ('en', 'profile.errors.signOut', 'Failed to sign out: {error}'),
  ('en', 'profile.errors.unexpectedSignOut', 'An unexpected error occurred during sign out'),

  -- Portuguese translations
  ('pt-BR', 'profile.title', 'Perfil'),
  ('pt-BR', 'profile.avatar.alt', 'Avatar do Usuário'),
  ('pt-BR', 'profile.defaultUsername', 'Usuário'),
  ('pt-BR', 'profile.editProfile', 'Editar Perfil'),
  ('pt-BR', 'profile.accountInfo.title', 'Informações da Conta'),
  ('pt-BR', 'profile.accountInfo.email', 'Email'),
  ('pt-BR', 'profile.accountInfo.memberSince', 'Membro desde'),
  ('pt-BR', 'profile.accountInfo.username', 'Nome de usuário'),
  ('pt-BR', 'profile.accountInfo.notSet', 'Não definido'),
  ('pt-BR', 'profile.signOut.button', 'Sair'),
  ('pt-BR', 'profile.signOut.inProgress', 'Saindo...'),
  ('pt-BR', 'profile.favorites.title', 'Seus Favoritos'),
  ('pt-BR', 'profile.favorites.empty', 'Você ainda não adicionou nenhum favorito.'),
  ('pt-BR', 'profile.favorites.browse', 'Explorar recursos'),
  ('pt-BR', 'profile.errors.loadFavorites', 'Falha ao carregar favoritos'),
  ('pt-BR', 'profile.errors.signOut', 'Falha ao sair: {error}'),
  ('pt-BR', 'profile.errors.unexpectedSignOut', 'Ocorreu um erro inesperado ao sair')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Edit Profile Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'editProfile.title', 'Edit Profile'),
  ('en', 'editProfile.sections.profile', 'Profile'),
  ('en', 'editProfile.sections.social', 'Social Media'),
  ('en', 'editProfile.form.username', 'Username'),
  ('en', 'editProfile.form.usernameHelp', 'This will be your public display name'),
  ('en', 'editProfile.form.avatar', 'Avatar'),
  ('en', 'editProfile.form.avatarAlt', 'Avatar option {number}'),
  ('en', 'editProfile.form.save', 'Save Changes'),
  ('en', 'editProfile.form.saving', 'Saving...'),
  ('en', 'editProfile.success', 'Profile updated successfully'),
  ('en', 'editProfile.errors.title', 'Error Loading Profile'),
  ('en', 'editProfile.errors.connection', 'Could not connect to database. Please check your internet connection.'),
  ('en', 'editProfile.errors.timeout', 'Loading took too long. Please try refreshing the page.'),
  ('en', 'editProfile.errors.update', 'Failed to update profile'),
  ('en', 'editProfile.validation.required', 'Username is required'),
  ('en', 'editProfile.validation.tooShort', 'Username must be at least 3 characters long'),
  ('en', 'editProfile.validation.tooLong', 'Username must be less than 20 characters long'),
  ('en', 'editProfile.validation.invalidChars', 'Username can only contain letters, numbers, underscores, and hyphens'),

  -- Portuguese translations
  ('pt-BR', 'editProfile.title', 'Editar Perfil'),
  ('pt-BR', 'editProfile.sections.profile', 'Perfil'),
  ('pt-BR', 'editProfile.sections.social', 'Redes Sociais'),
  ('pt-BR', 'editProfile.form.username', 'Nome de usuário'),
  ('pt-BR', 'editProfile.form.usernameHelp', 'Este será seu nome público'),
  ('pt-BR', 'editProfile.form.avatar', 'Avatar'),
  ('pt-BR', 'editProfile.form.avatarAlt', 'Opção de avatar {number}'),
  ('pt-BR', 'editProfile.form.save', 'Salvar Alterações'),
  ('pt-BR', 'editProfile.form.saving', 'Salvando...'),
  ('pt-BR', 'editProfile.success', 'Perfil atualizado com sucesso'),
  ('pt-BR', 'editProfile.errors.title', 'Erro ao Carregar Perfil'),
  ('pt-BR', 'editProfile.errors.connection', 'Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.'),
  ('pt-BR', 'editProfile.errors.timeout', 'O carregamento demorou muito. Por favor, atualize a página.'),
  ('pt-BR', 'editProfile.errors.update', 'Falha ao atualizar perfil'),
  ('pt-BR', 'editProfile.validation.required', 'Nome de usuário é obrigatório'),
  ('pt-BR', 'editProfile.validation.tooShort', 'Nome de usuário deve ter pelo menos 3 caracteres'),
  ('pt-BR', 'editProfile.validation.tooLong', 'Nome de usuário deve ter menos de 20 caracteres'),
  ('pt-BR', 'editProfile.validation.invalidChars', 'Nome de usuário pode conter apenas letras, números, underlines e hífens')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Favorites Page translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'favorites.title', 'Your Favorites'),
  ('en', 'favorites.signInPrompt', 'Sign in to save and view your favorite resources.'),
  ('en', 'favorites.empty', 'You haven''t added any favorites yet.'),
  ('en', 'favorites.browseResources', 'Browse Resources'),
  ('en', 'favorites.removed', 'Removed from favorites'),
  ('en', 'favorites.errors.loadFavorites', 'Failed to load favorites'),
  ('en', 'favorites.errors.removeFavorite', 'Failed to remove from favorites'),

  -- Portuguese translations
  ('pt-BR', 'favorites.title', 'Seus Favoritos'),
  ('pt-BR', 'favorites.signInPrompt', 'Faça login para salvar e visualizar seus recursos favoritos.'),
  ('pt-BR', 'favorites.empty', 'Você ainda não adicionou nenhum favorito.'),
  ('pt-BR', 'favorites.browseResources', 'Explorar Recursos'),
  ('pt-BR', 'favorites.removed', 'Removido dos favoritos'),
  ('pt-BR', 'favorites.errors.loadFavorites', 'Falha ao carregar favoritos'),
  ('pt-BR', 'favorites.errors.removeFavorite', 'Falha ao remover dos favoritos')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Common translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'common.loading', 'Loading...'),
  ('en', 'common.error.loading', 'Failed to load resources'),
  ('en', 'common.error.comments', 'Failed to load comments'),
  ('en', 'common.loadMore', 'Show more'),
  ('en', 'common.retry', 'Retry'),
  ('en', 'common.cancel', 'Cancel'),
  ('en', 'common.save', 'Save'),
  ('en', 'common.delete', 'Delete'),
  ('en', 'common.edit', 'Edit'),
  ('en', 'common.view', 'View'),
  ('en', 'common.share', 'Share'),
  ('en', 'common.backToHome', 'Back to Home'),
  ('en', 'common.backToProfile', 'Back to Profile'),
  ('en', 'common.signIn', 'Sign In'),
  ('en', 'common.signOut', 'Sign Out'),
  ('en', 'common.signUp', 'Sign Up'),
  ('en', 'common.na', 'N/A'),
  ('en', 'errors.resourceNotFound', 'Resource not found'),
  ('en', 'errors.pageNotFound', 'Page not found'),
  ('en', 'errors.unauthorized', 'You are not authorized to view this page'),
  ('en', 'errors.somethingWentWrong', 'Something went wrong'),

  -- Portuguese translations
  ('pt-BR', 'common.loading', 'Carregando...'),
  ('pt-BR', 'common.error.loading', 'Falha ao carregar recursos'),
  ('pt-BR', 'common.error.comments', 'Falha ao carregar comentários'),
  ('pt-BR', 'common.loadMore', 'Mostrar mais'),
  ('pt-BR', 'common.retry', 'Tentar novamente'),
  ('pt-BR', 'common.cancel', 'Cancelar'),
  ('pt-BR', 'common.save', 'Salvar'),
  ('pt-BR', 'common.delete', 'Excluir'),
  ('pt-BR', 'common.edit', 'Editar'),
  ('pt-BR', 'common.view', 'Visualizar'),
  ('pt-BR', 'common.share', 'Compartilhar'),
  ('pt-BR', 'common.backToHome', 'Voltar para Início'),
  ('pt-BR', 'common.backToProfile', 'Voltar para Perfil'),
  ('pt-BR', 'common.signIn', 'Entrar'),
  ('pt-BR', 'common.signOut', 'Sair'),
  ('pt-BR', 'common.signUp', 'Cadastrar'),
  ('pt-BR', 'common.na', 'N/D'),
  ('pt-BR', 'errors.resourceNotFound', 'Recurso não encontrado'),
  ('pt-BR', 'errors.pageNotFound', 'Página não encontrada'),
  ('pt-BR', 'errors.unauthorized', 'Você não está autorizado a visualizar esta página'),
  ('pt-BR', 'errors.somethingWentWrong', 'Algo deu errado')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Add missing translations for resource pages
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'resource.pageTitle', '{title} - {appName}'),
  ('en', 'resource.visitWebsite', 'Visit Website'),
  ('en', 'resource.loading', 'Loading resource...'),
  ('en', 'resource.error', 'Error loading resource'),
  ('en', 'resource.notFound', 'Resource not found'),
  ('en', 'resource.commentsTitle', 'Comments ({count})'),
  ('en', 'resource.detailsTitle', 'Resource Details'),
  ('en', 'resource.metaDescription', '{title} - View details and related resources'),

  -- Portuguese translations
  ('pt-BR', 'resource.pageTitle', '{title} - {appName}'),
  ('pt-BR', 'resource.visitWebsite', 'Visitar Website'),
  ('pt-BR', 'resource.loading', 'Carregando recurso...'),
  ('pt-BR', 'resource.error', 'Erro ao carregar recurso'),
  ('pt-BR', 'resource.notFound', 'Recurso não encontrado'),
  ('pt-BR', 'resource.commentsTitle', 'Comentários ({count})'),
  ('pt-BR', 'resource.detailsTitle', 'Detalhes do Recurso'),
  ('pt-BR', 'resource.metaDescription', '{title} - Ver detalhes e recursos relacionados')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value;

-- Add missing UI translations
INSERT INTO translations (language, key, value)
VALUES
  -- English translations
  ('en', 'ui.loading', 'Loading...'),
  ('en', 'ui.error', 'Error'),
  ('en', 'ui.retry', 'Retry'),
  ('en', 'ui.close', 'Close'),
  ('en', 'ui.save', 'Save'),
  ('en', 'ui.cancel', 'Cancel'),
  ('en', 'ui.confirm', 'Confirm'),
  ('en', 'ui.back', 'Back'),
  ('en', 'ui.next', 'Next'),
  ('en', 'ui.previous', 'Previous'),
  ('en', 'ui.share', 'Share'),
  ('en', 'ui.copy', 'Copy'),
  ('en', 'ui.copied', 'Copied!'),
  ('en', 'ui.view', 'View'),
  ('en', 'ui.edit', 'Edit'),
  ('en', 'ui.delete', 'Delete'),
  ('en', 'ui.search', 'Search'),
  ('en', 'ui.filter', 'Filter'),
  ('en', 'ui.sort', 'Sort'),
  ('en', 'ui.more', 'More'),
  ('en', 'ui.less', 'Less'),
  ('en', 'ui.all', 'All'),
  ('en', 'ui.none', 'None'),
  ('en', 'ui.other', 'Other'),
  ('en', 'ui.required', 'Required'),
  ('en', 'ui.optional', 'Optional'),

  -- Portuguese translations
  ('pt-BR', 'ui.loading', 'Carregando...'),
  ('pt-BR', 'ui.error', 'Erro'),
  ('pt-BR', 'ui.retry', 'Tentar novamente'),
  ('pt-BR', 'ui.close', 'Fechar'),
  ('pt-BR', 'ui.save', 'Salvar'),
  ('pt-BR', 'ui.cancel', 'Cancelar'),
  ('pt-BR', 'ui.confirm', 'Confirmar'),
  ('pt-BR', 'ui.back', 'Voltar'),
  ('pt-BR', 'ui.next', 'Próximo'),
  ('pt-BR', 'ui.previous', 'Anterior'),
  ('pt-BR', 'ui.share', 'Compartilhar'),
  ('pt-BR', 'ui.copy', 'Copiar'),
  ('pt-BR', 'ui.copied', 'Copiado!'),
  ('pt-BR', 'ui.view', 'Visualizar'),
  ('pt-BR', 'ui.edit', 'Editar'),
  ('pt-BR', 'ui.delete', 'Excluir'),
  ('pt-BR', 'ui.search', 'Pesquisar'),
  ('pt-BR', 'ui.filter', 'Filtrar'),
  ('pt-BR', 'ui.sort', 'Ordenar'),
  ('pt-BR', 'ui.more', 'Mais'),
  ('pt-BR', 'ui.less', 'Menos'),
  ('pt-BR', 'ui.all', 'Todos'),
  ('pt-BR', 'ui.none', 'Nenhum'),
  ('pt-BR', 'ui.other', 'Outro'),
  ('pt-BR', 'ui.required', 'Obrigatório'),
  ('pt-BR', 'ui.optional', 'Opcional')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value; 