import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    phone_number: 'alice@prisma.io',
    password: '123456',
  },
  {
    name: 'Nilu',
    phone_number: 'nilu@prisma.io',
    password: '123456',
  },
  {
    name: 'Mahmoud',
    phone_number: 'mahmoud@prisma.io',
    password: '123456',
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.user_id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
