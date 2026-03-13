const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB fix...');
  try {
    // 1. Create the enum type if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "MasterStatus" AS ENUM ('ACTIVE', 'INACTIVE');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Ensure MasterStatus enum exists.');

    // 2. Alter account_groups status column
    console.log('Altering account_groups...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "account_groups" ALTER COLUMN "status" DROP DEFAULT;`);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "account_groups" 
      ALTER COLUMN "status" TYPE "MasterStatus" 
      USING (CASE WHEN "status"::text = 'true' THEN 'ACTIVE'::"MasterStatus" ELSE 'INACTIVE'::"MasterStatus" END);
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "account_groups" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"MasterStatus";`);
    console.log('Converted account_groups.status.');

    // 3. Alter account_sub_groups status column
    console.log('Altering account_sub_groups...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "account_sub_groups" ALTER COLUMN "status" DROP DEFAULT;`);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "account_sub_groups" 
      ALTER COLUMN "status" TYPE "MasterStatus" 
      USING (CASE WHEN "status"::text = 'true' THEN 'ACTIVE'::"MasterStatus" ELSE 'INACTIVE'::"MasterStatus" END);
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "account_sub_groups" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"MasterStatus";`);
    console.log('Converted account_sub_groups.status.');

    console.log('DB fix completed successfully.');
  } catch (error) {
    console.error('Error during DB fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
