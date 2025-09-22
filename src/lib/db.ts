import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var cachedPrisma: PrismaClient;
}

// Use global variable in development to prevent hot-reload issues
export const db = 
  global.cachedPrisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.cachedPrisma = db;
} 