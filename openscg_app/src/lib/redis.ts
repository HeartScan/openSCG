import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const useRedis = process.env.NO_REDIS !== 'true';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redis: Redis | any;

if (useRedis) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('error', (err: Error) => {
    console.warn('Redis Error:', err.message);
  });
} else {
  // Simple Mock Redis for development without Redis instance
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    expire: async () => 1,
    publish: async () => 0,
    subscribe: async () => {},
    on: () => {},
    // Add other methods as needed
  };
}

export default redis;
