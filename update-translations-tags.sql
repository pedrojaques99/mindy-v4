-- Add new translations for tags and filter sections
INSERT INTO translations (language, key, value)
VALUES
  -- English translations for tags
  ('en', 'tags.design', 'design'),
  ('en', 'tags.typography', 'typography'),
  ('en', 'tags.ai', 'ai'),
  ('en', 'tags.3d', '3d'),
  ('en', 'tags.mockups', 'mockups'),
  ('en', 'tags.icons', 'icons'),
  ('en', 'tags.templates', 'templates'),
  ('en', 'tags.resources', 'resources'),
  ('en', 'tags.tools', 'tools'),
  
  -- Portuguese translations for tags
  ('pt-BR', 'tags.design', 'design'),
  ('pt-BR', 'tags.typography', 'tipografia'),
  ('pt-BR', 'tags.ai', 'ia'),
  ('pt-BR', 'tags.3d', '3d'),
  ('pt-BR', 'tags.mockups', 'mockups'),
  ('pt-BR', 'tags.icons', 'ícones'),
  ('pt-BR', 'tags.templates', 'templates'),
  ('pt-BR', 'tags.resources', 'recursos'),
  ('pt-BR', 'tags.tools', 'ferramentas'),
  
  -- English translations for filter sections
  ('en', 'home.tags.noTags', 'No tags found'),
  ('en', 'home.filters.filterByTags', 'Filter by tags'),
  ('en', 'home.filters.selected', 'selected'),
  ('en', 'home.filters.clear', 'Clear'),
  ('en', 'home.filters.noTags', 'No tags available'),
  ('en', 'home.filters.selectedFilters', 'Selected filters'),
  
  -- Portuguese translations for filter sections
  ('pt-BR', 'home.tags.noTags', 'Nenhuma tag encontrada'),
  ('pt-BR', 'home.filters.filterByTags', 'Filtrar por tags'),
  ('pt-BR', 'home.filters.selected', 'selecionados'),
  ('pt-BR', 'home.filters.clear', 'Limpar'),
  ('pt-BR', 'home.filters.noTags', 'Nenhuma tag disponível'),
  ('pt-BR', 'home.filters.selectedFilters', 'Filtros selecionados')
ON CONFLICT (language, key) DO UPDATE
SET value = EXCLUDED.value; 