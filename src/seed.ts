import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  const email = process.env['SUPER_ADMIN_USERNAME'];
  const password = process.env['SUPER_ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('Super Admin seeded successfully');
};

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
