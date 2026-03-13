import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreate() {
  try {
    const testName = 'Test Unit ' + Date.now();
    console.log('Trying to create unit:', testName);
    
    // Ensure KGS exists
    // Ensure KGS exists in library
    await prisma.systemUomLibrary.upsert({
      where: { id: 1 }, 
      update: {},
      create: { 
        uom_code: 'KGS', 
        full_name_of_measurement: 'KILOGRAMS',
        unit_name: 'KILOGRAM'
      }
    });

    const result = await prisma.unitMaster.create({
      data: {
        unit_name: testName,
        gst_uom: 'KGS',
        full_name_of_measurement: 'KILOGRAMS',
        user_id: 1 // Placeholder: Ensure this user exists
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
