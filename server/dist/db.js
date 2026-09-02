"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Verify database connection on startup
prisma.$connect()
    .then(() => {
    console.log('✅ Connected to Neon PostgreSQL database');
})
    .catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
});
