
import { PrismaClient } from '@prisma/client';

console.log('🔧 Initializing Prisma Client...');
console.log('🔧 DATABASE_URL exists:', !!process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma connection failed:', error);
  });

export default prisma;
