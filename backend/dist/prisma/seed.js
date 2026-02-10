"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const modules = ['Dashboard', 'Users', 'Facilities', 'Products', 'Inventory', 'Billing', 'Reports', 'Access', 'Settings'];
    for (const name of modules) {
        await prisma.module.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('Modules seeded.');
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
                isActive: true,
                isOtpVerified: true,
                isProfileCompleted: true,
                isApprovedBySuperAdmin: true,
            }
        });
        console.log('Default Admin user created (admin/admin123).');
    }
    else {
        await prisma.user.update({
            where: { username: adminUsername },
            data: {
                role: 'SUPER_ADMIN',
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
//# sourceMappingURL=seed.js.map