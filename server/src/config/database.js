
const PrismaPg = require("@prisma/adapter-pg").PrismaPg;
const PrismaClient = require("../../prisma/generated/client").PrismaClient;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
module.exports = prisma;