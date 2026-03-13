import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const subGroups = await prisma.accountSubGroup.findMany();
  console.log(JSON.stringify(subGroups, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
