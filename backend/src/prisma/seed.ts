import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

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

    // 4. Seed Languages
    const languages = [
        { name: 'English', code: 'en', isActive: true },
        { name: 'Hindi', code: 'hi', isActive: true },
        { name: 'Marathi', code: 'mr', isActive: true },
        { name: 'Kannada', code: 'kn', isActive: true },
    ];

    for (const lang of languages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: { name: lang.name, isActive: lang.isActive },
            create: lang,
        });
    }
    // 5. Seed GST UQC Codes
    const uqcCodes = [
        "BAG", "BAL", "BDL", "BKL", "BOU", "BOX", "BTL", "BUN", "CAN", "CBM", "CCM", "CMS", "CTN", "DOZ", "DRM",
        "GGR", "GMS", "GRS", "GYD", "KGS", "KLR", "KME", "MLT", "MTR", "MTS", "NOS", "PAC", "PCS", "PRS",
        "QTL", "ROL", "SET", "SQF", "SQM", "SQY", "TBS", "TGM", "THD", "TON", "TUB", "UGS", "UNT", "YDS", "OTH"
    ];

    for (const code of uqcCodes) {
        await prisma.gstUqcMaster.upsert({
            where: { uqcCode: code },
            update: {},
            create: { uqcCode: code }
        });
    }
    console.log('GST UQC Codes seeded.');

    // 6. Seed Account Groups
    const accountGroups = [
        "Direct Expense",
        "Indirect Expense",
        "Purchase",
        "Opening Stock",
        "Direct Sale",
        "Indirect Sale",
        "Sale",
        "Closing Stock"
    ];

    for (const groupName of accountGroups) {
        await prisma.accountGroup.upsert({
            where: { group_name: groupName },
            update: {},
            create: { group_name: groupName }
        });
    }
    console.log('Account Groups seeded.');

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
