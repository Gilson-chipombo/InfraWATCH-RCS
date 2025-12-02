import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const monitoringQueue = new Queue('monitoring', { connection: redisConnection });

export async function enqueueServiceCheck(serviceId: string) {
  await monitoringQueue.add(
    'check',
    { serviceId },
    {
      removeOnComplete: 1000,
      removeOnFail: 500,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    }
  );
}
