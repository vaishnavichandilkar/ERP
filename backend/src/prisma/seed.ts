import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Seed Modules
    const modules = ['Dashboard', 'Users', 'Facilities', 'Products', 'Inventory', 'Billing', 'Reports', 'Access', 'Settings'];

    for (const name of modules) {
        await prisma.module.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('Modules seeded.');

    // 2. Seed System Admin (Superadmin)
    const adminPhone = 'admin_phone'; // Since username is gone, using phone as identifier
    const existingAdmin = await prisma.user.findUnique({
        where: { phone: adminPhone }
    });

    const passwordHash = await bcrypt.hash('admin123', 10);

    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                first_name: 'System',
                last_name: 'Admin',
                phone: adminPhone,
                email: 'admin@weighpro.com',
                password: passwordHash,
                role: 'superadmin',
                isApproved: true,
                onboarded_at: new Date(),
            }
        });
        console.log('Default Superadmin user created.');
    } else {
        await prisma.user.update({
            where: { phone: adminPhone },
            data: {
                role: 'superadmin',
                isApproved: true,
                onboarded_at: new Date(),
            }
        });
        console.log('Admin user updated to superadmin.');
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
