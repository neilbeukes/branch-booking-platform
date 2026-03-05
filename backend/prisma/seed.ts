import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.branch.upsert({
    where: { branchCode: 'CPT001' },
    update: {},
    create: {
      name: 'Cape Town Central',
      address: '123 Adderley Street, Cape Town',
      branchCode: 'CPT001',
      openTime: '09:00',
      closeTime: '17:00',
    },
  });
  await prisma.branch.upsert({
    where: { branchCode: 'JHB001' },
    update: {},
    create: {
      name: 'Johannesburg Sandton',
      address: '45 Nelson Mandela Square, Sandton',
      branchCode: 'JHB001',
      openTime: '08:30',
      closeTime: '16:30',
    },
  });
  await prisma.branch.upsert({
    where: { branchCode: 'DBN001' },
    update: {},
    create: {
      name: 'Durban Umhlanga',
      address: '10 Lighthouse Road, Umhlanga',
      branchCode: 'DBN001',
      openTime: '09:00',
      closeTime: '17:00',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
