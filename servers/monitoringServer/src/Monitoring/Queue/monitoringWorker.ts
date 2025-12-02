import { Worker } from 'bullmq';
import { redisConnection } from './redis';
import { processSlaAndAlerts, prisma } from '../Workers/slaWorker';

export const monitoringWorker = new Worker(
  'monitoring',
  async job => {
    const { serviceId } = job.data;
    const service = await prisma.service.findUnique(
    {
      where: { id: serviceId },
      select: { name: true },
    });
    await processSlaAndAlerts(serviceId);
    return { serviceName: service?.name ?? serviceId };
  },
  { connection: redisConnection, concurrency: 5 }
);

monitoringWorker.on('completed', (job, result) =>
{
  console.log(`Job ${job.id} concluído para serviço ${result?.serviceName}`);
});

monitoringWorker.on('failed', (job, err) =>
{
  console.error(`Job ${job?.id} falhou para serviço ${job?.data?.serviceId}:`, err?.message);
});
