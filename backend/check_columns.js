
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'account_master'`;
  console.log(result);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
