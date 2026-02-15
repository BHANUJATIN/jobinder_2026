const IORedis = require('ioredis');
const env = require('./env');

const redis = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

module.exports = redis;
