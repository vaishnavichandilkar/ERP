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

    // 2. Seed System Admin
    const adminUsername = 'admin';
    const existingAdmin = await prisma.user.findUnique({
        where: { username: adminUsername }
    });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'System Admin',
                username: adminUsername,
                passwordHash: passwordHash,
                role: 'SUPER_ADMIN',
                status: 'ACTIVE', // NEW: Set status to ACTIVE
                isActive: true,
                isOtpVerified: true,
                isProfileCompleted: true,
                isApprovedBySuperAdmin: true,
            }
        });
        console.log('Default Admin user created (admin/admin123).');
    } else {
        await prisma.user.update({
            where: { username: adminUsername },
            data: {
                role: 'SUPER_ADMIN',
                status: 'ACTIVE', // NEW: Update status to ACTIVE
                isOtpVerified: true,
                isProfileCompleted: true,
                isApprovedBySuperAdmin: true,
            }
        });
        console.log('Admin user updated to SUPER_ADMIN.');
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
