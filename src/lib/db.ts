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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Cliente PÚBLICO para usar en el NAVEGADOR (si es necesario)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de SERVIDOR con privilegios para usar en Server Actions y API Routes
// Este cliente puede saltarse las políticas de RLS (Row Level Security)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
