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
    const uqcMappings = [
        { code: "BAG", name: "BAGS" },
        { code: "BAL", name: "BALE" },
        { code: "BDL", name: "BUNDLES" },
        { code: "BKL", name: "BUCKELS" },
        { code: "BOU", name: "BILLION OF UNITS" },
        { code: "BOX", name: "BOX" },
        { code: "BTL", name: "BOTTLES" },
        { code: "BUN", name: "BUNCHES" },
        { code: "CAN", name: "CANS" },
        { code: "CBM", name: "CUBIC METERS" },
        { code: "CCM", name: "CUBIC CENTIMETERS" },
        { code: "CMS", name: "CENTIMETERS" },
        { code: "CTN", name: "CARTONS" },
        { code: "DOZ", name: "DOZENS" },
        { code: "DRM", name: "DRUMS" },
        { code: "GGR", name: "GREAT GROSS" },
        { code: "GMS", name: "GRAMMES" },
        { code: "GRS", name: "GROSS" },
        { code: "GYD", name: "GROSS YARDS" },
        { code: "KGS", name: "KILOGRAMS" },
        { code: "KLR", name: "KILOLITRE" },
        { code: "KME", name: "KILOMETRE" },
        { code: "MLT", name: "MILLILITRE" },
        { code: "MTR", name: "METERS" },
        { code: "MTS", name: "METRIC TON" },
        { code: "NOS", name: "NUMBERS" },
        { code: "PAC", name: "PACKS" },
        { code: "PCS", name: "PIECES" },
        { code: "PRS", name: "PAIRS" },
        { code: "QTL", name: "QUINTAL" },
        { code: "ROL", name: "ROLLS" },
        { code: "SET", name: "SETS" },
        { code: "SQF", name: "SQUARE FEET" },
        { code: "SQM", name: "SQUARE METERS" },
        { code: "SQY", name: "SQUARE YARDS" },
        { code: "TBS", name: "TABLETS" },
        { code: "TGM", name: "TEN GROSS" },
        { code: "THD", name: "THOUSANDS" },
        { code: "TON", name: "TONNES" },
        { code: "TUB", name: "TUBES" },
        { code: "UGS", name: "US GALLONS" },
        { code: "UNT", name: "UNITS" },
        { code: "YDS", name: "YARDS" },
        { code: "OTH", name: "OTHERS" }
    ];

    for (const item of uqcMappings) {
        await prisma.gstUqcMaster.upsert({
            where: { uqcCode: item.code },
            update: { quantity: item.name },
            create: { uqcCode: item.code, quantity: item.name }
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
