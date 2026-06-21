import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findFirst();
  const n = await prisma.nGO.findFirst();
  console.log('User:', u?.email, 'NGO:', n?.email);
}
main().finally(() => prisma.$disconnect());
