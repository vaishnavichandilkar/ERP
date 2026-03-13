import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const uqcs = await prisma.gstUqcMaster.findMany();
  console.log('GST UQCs in DB:', JSON.stringify(uqcs, null, 2));
  
  const units = await prisma.unitMaster.findMany();
  console.log('Units in DB:', JSON.stringify(units, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
