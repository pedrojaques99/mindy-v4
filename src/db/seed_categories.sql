-- Seed data for categories table
INSERT INTO categories (name, slug, description, icon, color, order_index, is_active)
VALUES
  ('Design', 'design', 'Design resources, tools, and inspiration for creative professionals', 'palette', '#FF5A5F', 1, true),
  ('Development', 'development', 'Development tools, libraries, and resources for programmers', 'code', '#3498DB', 2, true),
  ('Marketing', 'marketing', 'Marketing tools and resources for growth and promotion', 'bullhorn', '#27AE60', 3, true),
  ('Productivity', 'productivity', 'Tools and resources to boost your productivity and workflow', 'clock', '#F39C12', 4, true),
  ('Learning', 'learning', 'Educational resources, courses, and tutorials', 'book', '#9B59B6', 5, true),
  ('AI Tools', 'ai-tools', 'Artificial intelligence tools and resources', 'robot', '#1ABC9C', 6, true),
  ('Assets', 'assets', 'Digital assets, stock photos, icons, and more', 'images', '#E74C3C', 7, true),
  ('Tools', 'tools', 'Useful tools for various purposes', 'tools', '#34495E', 8, true)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Seed some popular tags
INSERT INTO tags (name, slug, description, is_featured)
VALUES
  ('Design', 'design', 'Design resources and tools', true),
  ('Development', 'development', 'Development resources and tools', true),
  ('UI/UX', 'ui-ux', 'User interface and user experience design', true),
  ('JavaScript', 'javascript', 'JavaScript programming language', true),
  ('React', 'react', 'React JavaScript library', true),
  ('CSS', 'css', 'Cascading Style Sheets', true),
  ('HTML', 'html', 'HyperText Markup Language', true),
  ('AI', 'ai', 'Artificial Intelligence', true),
  ('Free', 'free', 'Free resources', true),
  ('Productivity', 'productivity', 'Productivity tools and resources', true),
  ('Typography', 'typography', 'Typography resources and tools', false),
  ('Icons', 'icons', 'Icon resources and tools', false),
  ('Mockups', 'mockups', 'Mockup resources and tools', false),
  ('Templates', 'templates', 'Template resources', false),
  ('Figma', 'figma', 'Figma design tool', false),
  ('Photoshop', 'photoshop', 'Adobe Photoshop', false),
  ('Illustrator', 'illustrator', 'Adobe Illustrator', false),
  ('3D', '3d', '3D design and modeling', false),
  ('Animation', 'animation', 'Animation resources and tools', false),
  ('Color', 'color', 'Color resources and tools', false)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW(); 