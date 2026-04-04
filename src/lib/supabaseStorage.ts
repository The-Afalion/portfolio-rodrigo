import { createClient } from '@supabase/supabase-js';
import { getSupabaseBrowserEnv } from '@/lib/supabase-env';

export async function uploadMedia(file: File, bucket: string = 'blog-media') {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    throw new Error('Faltan las variables públicas de Supabase para subir archivos.');
  }

  const supabase = createClient(env.url, env.key);
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
