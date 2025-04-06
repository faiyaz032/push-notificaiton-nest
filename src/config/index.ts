export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  mockUserCount: 10,
  push: {
    batchSize: 1000,
    retryAttempts: 3,
    retryDelay: 5000,
  },
});
