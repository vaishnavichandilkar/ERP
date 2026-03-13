import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreate() {
  try {
    const testName = 'Test Unit ' + Date.now();
    console.log('Trying to create unit:', testName);
    
    // Ensure KGS exists
    await prisma.gstUqcMaster.upsert({
      where: { uqcCode: 'KGS' },
      update: {},
      create: { uqcCode: 'KGS', quantity: 'KILOGRAMS' }
    });

    const result = await prisma.unitMaster.create({
      data: {
        unitName: testName,
        gstUom: 'KGS',
        description: 'Test description'
      }
    });
    console.log('Successfully created unit:', result);
    
    const allUnits = await prisma.unitMaster.findMany();
    console.log('Total units now:', allUnits.length);
  } catch (err) {
    console.error('Error during creation:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
