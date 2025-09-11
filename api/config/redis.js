const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || '';
const options = redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {};
const redis = new Redis(redisUrl, options);

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error', err));

module.exports = redis;
