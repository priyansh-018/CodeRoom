"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
let prisma;
try {
    exports.prisma = prisma = new client_1.PrismaClient();
}
catch (err) {
    console.warn('⚠️ Could not initialize Prisma Client with database. Running in offline/in-memory mode.', err);
    exports.prisma = prisma = new client_1.PrismaClient();
}
