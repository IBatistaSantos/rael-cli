import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

export const seed = async () => {
  const prisma = new PrismaClient();

  const password = await hash('admin', 10);

  await prisma.user.create({
    data: {
      email: 'israel@admin.com',
      password,
      userName: 'IBatistaSantos',
      name: 'Israel',
    },
  });

  console.info('User created');
};

seed();
