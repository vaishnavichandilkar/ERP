import { PrismaClient } from '@prisma/client';
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
    const adminPhone = '1111111111';
    const existingAdmin = await prisma.user.findUnique({
        where: { phone: adminPhone }
    });

    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                first_name: 'System',
                last_name: 'Admin',
                phone: adminPhone,
                email: 'admin@weighpro.com',
                role: 'superadmin',
                isApproved: true,
                approvalStatus: 'APPROVED',
                isFirstApprovalLogin: false,
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
                approvalStatus: 'APPROVED',
                isFirstApprovalLogin: false,
                onboarded_at: new Date(),
            }
        });
        console.log('Admin user updated to superadmin.');
    }

    // 3. Seed Pincodes
    const pincodes = [
        { pincode: "411001", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411002", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411003", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411004", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411005", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411006", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411007", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411008", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411009", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411010", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411011", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411012", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411013", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411014", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411015", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411016", state: "Maharashtra", district: "Pune", isActive: true },
        { pincode: "411017", state: "Maharashtra", district: "Pune", isActive: false },
        { pincode: "411018", state: "Maharashtra", district: "Pune", isActive: true },
    ];

    for (const p of pincodes) {
        await prisma.pincode.upsert({
            where: { pincode: p.pincode },
            update: { state: p.state, district: p.district, isActive: p.isActive },
            create: p,
        });
    }
    console.log('Pincodes seeded.');

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
