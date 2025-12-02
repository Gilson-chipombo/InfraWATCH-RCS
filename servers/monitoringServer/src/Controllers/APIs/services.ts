import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllServices()
{
  return prisma.service.findMany({
    select: { id: true, name: true, type: true, target: true, }
  });
}
