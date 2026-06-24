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
        throw new Error('La zona de contenidos no está disponible ahora mismo.');
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
