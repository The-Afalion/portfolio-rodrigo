import { PrismaClient } from '@prisma/client';

const createPrismaClient = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createMissingPrismaClient() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error('FATAL: DATABASE_URL no está configurada en el entorno del servidor.');
      },
    }
  ) as PrismaClient;
}

const prisma =
  globalThis.prismaGlobal ??
  (process.env.DATABASE_URL ? createPrismaClient() : createMissingPrismaClient());

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
