-- Create translations table
CREATE TABLE IF NOT EXISTS public.translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(10) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (language, key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can read translations" 
ON public.translations
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for anon users
CREATE POLICY "Anonymous users can read translations" 
ON public.translations
FOR SELECT 
USING (auth.role() = 'anon');

-- Create policy for service role
CREATE POLICY "Service role can manage translations" 
ON public.translations
USING (auth.role() = 'service_role');

-- Add language column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
END $$;

-- Insert some sample translations
INSERT INTO public.translations (language, key, value)
VALUES 
-- English translations
('en', 'common.home', 'Home'),
('en', 'common.favorites', 'Favorites'),
('en', 'common.submit', 'Submit'),
('en', 'common.profile', 'Profile'),
('en', 'common.editProfile', 'Edit Profile'),
('en', 'common.signOut', 'Sign Out'),
('en', 'common.signIn', 'Sign In'),
('en', 'common.search', 'Search resources...'),

-- Portuguese translations
('pt', 'common.home', 'Início'),
('pt', 'common.favorites', 'Favoritos'),
('pt', 'common.submit', 'Enviar'),
('pt', 'common.profile', 'Perfil'),
('pt', 'common.editProfile', 'Editar Perfil'),
('pt', 'common.signOut', 'Sair'),
('pt', 'common.signIn', 'Entrar'),
('pt', 'common.search', 'Buscar recursos...')

ON CONFLICT (language, key) 
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(); 