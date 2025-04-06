export default () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  mockUserCount: 10,
  push: {
    batchSize: 1000,
    retryAttempts: 3,
    retryDelay: 5000,
  },
});
