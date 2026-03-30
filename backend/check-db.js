const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.accountMaster.count();
  console.log("Account Master Count:", count);
  const data = await prisma.accountMaster.findMany();
  console.log("Data:", data);
}
main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
