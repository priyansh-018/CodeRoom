import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verify database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL database');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
  });

export { prisma };
