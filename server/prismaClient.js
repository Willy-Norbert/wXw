
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Add connection pool configuration
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20&connect_timeout=60',
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const client = globalForPrisma.prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await client.$disconnect();
});

export default client;
