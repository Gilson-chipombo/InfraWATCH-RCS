import { PrismaClient } from '@prisma/client';
import { enqueueServiceCheck } from './jobQueue';

const prisma = new PrismaClient();

export async function startQueueScheduler()
{
  console.log('Agendador de monitoramento iniciado...');
  await enqueueAll();

  setInterval(enqueueAll, 60 * 1000);
}

async function enqueueAll()
{
  const services = await prisma.service.findMany({ select: { id: true } });
  await Promise.all(services.map(s => enqueueServiceCheck(s.id)));
}
