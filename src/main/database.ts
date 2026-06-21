import { PrismaClient } from '@prisma/client';
import path from 'path';
import { app } from 'electron';

let prisma: PrismaClient | null = null;

export function getDbPath(): string {
  const userDataPath = app.isPackaged
    ? app.getPath('userData')
    : path.join(process.cwd(), 'data');
  return path.join(userDataPath, 'apex-pos.db');
}

export async function initDatabase(): Promise<PrismaClient> {
  if (prisma) return prisma;

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${getDbPath()}`,
      },
    },
  });

  await prisma.$connect();
  console.log('Database connected successfully');
  return prisma;
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return prisma;
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
