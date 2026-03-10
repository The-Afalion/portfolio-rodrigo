-- ==========================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE PARA EL CHESS HUB
-- Copia y pega todo esto en el SQL Editor de tu Dashboard de Supabase y ejecútalo.
-- ==========================================

-- 1. Crear tabla de perfiles extendida
CREATE TABLE IF NOT EXISTS public.chess_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  elo INTEGER DEFAULT 0,
  bots_defeated TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.chess_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acceso
-- Cualquiera puede leer perfiles (para ver leaderboards o perfiles públicos)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.chess_profiles FOR SELECT 
USING ( true );

-- Solo el usuario dueño puede actualizar su propio perfil (sus bots vencidos o su elo)
CREATE POLICY "Users can insert their own profile." 
ON public.chess_profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile." 
ON public.chess_profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Función de Trigger para Autocreación de Perfil al Registrarse (opcional pero recomendada)
-- (Este paso no reemplaza que enviemos el "username" desde Next.js, 
-- pero nos asegura que si Next falla, el registro no queda huérfano en base de datos)
CREATE OR REPLACE FUNCTION public.handle_new_chess_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chess_profiles (id, username, elo, bots_defeated)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'Jugador_' || SUBSTRING(new.id::text FROM 1 FOR 6)), 
    400, 
    '{}'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Vincular la Función al Trigger de Registro de Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_chess_user();
