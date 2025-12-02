import { redisConnection } from "../Monitoring/Queue/redis";
import IORedis from "ioredis";

if (!redisConnection.url) {
	throw new Error("Redis connection URL is not defined");
}
export const redis = new IORedis(redisConnection.url);
