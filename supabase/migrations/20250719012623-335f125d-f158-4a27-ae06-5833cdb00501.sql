
-- Create profiles table to store user profile data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('admin', 'coordenador', 'usuario')),
  group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  power_bi_url TEXT,
  form_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'sistema' CHECK (category IN ('sistema', 'treinamento', 'manutencao', 'mercado', 'atualizacoes', 'eventos')),
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('link', 'file')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create simulation_variables table
CREATE TABLE public.simulation_variables (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  step_value NUMERIC NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Add foreign key constraint for group_id in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_group_id 
FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_variables ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role (prevents infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (public.get_current_user_role() = 'admin');

-- RLS Policies for groups table
CREATE POLICY "All authenticated users can view groups" 
  ON public.groups FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Admins can manage groups" 
  ON public.groups FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- RLS Policies for news table
CREATE POLICY "All authenticated users can view news" 
  ON public.news FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Admins can manage news" 
  ON public.news FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- RLS Policies for materials table
CREATE POLICY "All authenticated users can view materials" 
  ON public.materials FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Admins can manage materials" 
  ON public.materials FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- RLS Policies for simulation_variables table
CREATE POLICY "All authenticated users can view simulation variables" 
  ON public.simulation_variables FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Admins can manage simulation variables" 
  ON public.simulation_variables FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 
    NEW.email,
    'usuario'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.simulation_variables
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some initial data
INSERT INTO public.groups (name, power_bi_url, form_url) VALUES
('Grupo Padrão', 'https://app.powerbi.com/exemplo1', 'https://forms.office.com/exemplo1'),
('Grupo Especial', 'https://app.powerbi.com/exemplo2', 'https://forms.office.com/exemplo2');

INSERT INTO public.materials (title, description, type, url) VALUES
('Manual do Usuário', 'Guia completo para utilização do sistema', 'file', 'https://exemplo.com/manual.pdf'),
('Treinamento Online', 'Curso completo de capacitação', 'link', 'https://exemplo.com/treinamento'),
('FAQ - Perguntas Frequentes', 'Respostas para as dúvidas mais comuns', 'link', 'https://exemplo.com/faq');

INSERT INTO public.simulation_variables (name, value, min_value, max_value, step_value, description) VALUES
('Taxa de Juros (%)', 5.5, 0, 20, 0.1, 'Taxa de juros anual para simulações'),
('Prazo (meses)', 12, 1, 360, 1, 'Prazo em meses para financiamento'),
('Valor Principal', 100000, 1000, 10000000, 1000, 'Valor principal do investimento');
