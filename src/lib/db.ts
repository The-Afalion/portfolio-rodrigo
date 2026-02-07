import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// --- Cliente de Prisma (Conservado por si se usa en otras partes) ---
declare global {
  var prisma: PrismaClient | undefined;
}
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
export default prisma;


// --- Clientes de Supabase ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validaciones robustas
if (!supabaseUrl) {
  throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_URL no está configurada.');
}
if (!supabaseAnonKey) {
  throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada.');
}
if (!supabaseServiceKey) {
  // Este es el error que está ocurriendo ahora.
  throw new Error('FATAL: SUPABASE_SERVICE_KEY no está configurada en el entorno del servidor.');
}


// Cliente PÚBLICO para usar en el NAVEGADOR (si es necesario)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de SERVIDOR con privilegios. Si llegamos aquí, las claves existen.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
