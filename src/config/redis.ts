import Redis from 'ioredis'
import dotenv from 'dotenv'
// Load environment variables from .env file
dotenv.config()

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  connectTimeout: 60000,
  retryStrategy: times => Math.min(times * 50, 2000)
})

export default redis
