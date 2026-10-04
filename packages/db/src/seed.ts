import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding initial institutions, schemes, and reference registries...');

  // 1. Seed Institutions
  const institutions = [
    {
      code: 'INST-BLR-001',
      name: 'Bangalore Institute of Technology',
      district: 'Bengaluru Urban',
      active: true,
    },
    {
      code: 'INST-MYS-002',
      name: 'Mysore National College of Engineering',
      district: 'Mysuru',
      active: true,
    },
    {
      code: 'INST-MNG-003',
      name: 'Mangalore Government Polytechnic',
      district: 'Dakshina Kannada',
      active: true,
    },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { code: inst.code },
      update: {},
      create: inst,
    });
  }

  // 2. Seed Reference IFSC Codes
  const ifscData = [
    { ifsc: 'SBIN0001234', bank: 'State Bank of India', branch: 'Vidhana Soudha' },
    { ifsc: 'CNRB0000567', bank: 'Canara Bank', branch: 'Jayanagar' },
    { ifsc: 'HDFC0000001', bank: 'HDFC Bank', branch: 'Koramangala' },
  ];

  for (const item of ifscData) {
    await prisma.referenceIfsc.upsert({
      where: { ifsc: item.ifsc },
      update: {},
      create: item,
    });
  }

  // 3. Seed Reference Government Scheme
  const postMatricScheme = await prisma.scheme.upsert({
    where: { slug: 'post-matric-sc-st' },
    update: {},
    create: {
      slug: 'post-matric-sc-st',
      name: 'Post-Matric Scholarship for SC/ST/OBC Students',
    },
  });

  await prisma.schemeVersion.upsert({
    where: {
      schemeId_version: {
        schemeId: postMatricScheme.id,
        version: 1,
      },
    },
    update: {},
    create: {
      schemeId: postMatricScheme.id,
      version: 1,
      config: {
        minPercentage: 60.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST', 'OBC'],
        maxDocAgeMonths: 12,
        submissionDeadline: '2026-12-31T23:59:59.000Z',
        requiredDocs: ['MARKSHEET', 'INCOME_CERT', 'PASSBOOK'],
      },
      publishedAt: new Date(),
    },
  });

  // 4. Seed Fake Nadakacheri Registry Records
  const registryRecords = [
    {
      regNumber: 'RD001234567890',
      certType: 'INCOME',
      holderName: 'Sumanth Kumar',
      value: { income: 180000 },
      issuedOn: new Date('2026-05-10T00:00:00.000Z'),
      status: 'ISSUED',
    },
    {
      regNumber: 'RD009876543210',
      certType: 'CASTE',
      holderName: 'Sumanth Kumar',
      value: { category: 'SC' },
      issuedOn: new Date('2025-01-15T00:00:00.000Z'),
      status: 'ISSUED',
    },
  ];

  for (const rec of registryRecords) {
    await prisma.registryRecord.upsert({
      where: { regNumber: rec.regNumber },
      update: {},
      create: rec,
    });
  }

  console.log('Database seeding successfully finished.');
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  seedDatabase()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
