import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// --- Cliente de Prisma ---
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// --- Cliente de Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creamos un único cliente de Supabase para usar en el lado del servidor
export const supabase = createClient(supabaseUrl, supabaseKey);

export default prisma;
