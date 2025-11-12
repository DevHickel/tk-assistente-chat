-- Criar tabela de relatórios de bugs
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem criar seus próprios relatórios
CREATE POLICY "Users can create bug reports"
ON public.bug_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem ver seus próprios relatórios
CREATE POLICY "Users can view their own bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Admins podem ver todos os relatórios
CREATE POLICY "Admins can view all bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política: Admins podem atualizar status dos relatórios
CREATE POLICY "Admins can update bug reports"
ON public.bug_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Criar tabela de configurações do app
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#3B82F6',
  font_family TEXT DEFAULT 'Inter' CHECK (font_family IN ('Inter', 'Roboto', 'Open Sans')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Inserir configuração padrão
INSERT INTO public.app_settings (logo_url, primary_color, font_family)
VALUES ('', '#3B82F6', 'Inter')
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler as configurações
CREATE POLICY "Everyone can read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Política: Apenas admins podem atualizar configurações
CREATE POLICY "Admins can update app settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Criar bucket para screenshots de bugs
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-reports', 'bug-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuários podem fazer upload de seus próprios screenshots
CREATE POLICY "Users can upload bug report screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bug-reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuários podem ver seus próprios screenshots
CREATE POLICY "Users can view their own bug report screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bug-reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Admins podem ver todos os screenshots
CREATE POLICY "Admins can view all bug report screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bug-reports' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);