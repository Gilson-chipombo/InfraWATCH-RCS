import { RedisOptions } from 'bullmq';

export const redisConnection: RedisOptions = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6380',
};
