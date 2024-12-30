import express from 'express'
import mongoose from 'mongoose'
import movieRoutes from './routes/movieRoutes'
import dotenv from 'dotenv'
import redis from './config/redis'
import swaggerUi from 'swagger-ui-express'
import specs from './config/swagger'

// Load environment variables from .env file
dotenv.config()

/**
 * Express application instance
 * @constant app
 */
const app = express()

/**
 * MongoDB connection
 * @description Connects to MongoDB instance using either certificate or username/password
 */
if (!process.env.MONGODB_URI && !process.env.MONGODB_CERT_URI) {
  throw new Error('MONGODB_URI or MONGODB_CERT_URI must be defined in the environment variables')
}

const useCertAuth = process.env.MONGODB_CERT_AUTH === '1'
const MONGODB_URI = useCertAuth ? process.env.MONGODB_CERT_URI : process.env.MONGODB_AUTH_URI

if (!MONGODB_URI) {
  throw new Error('The selected MongoDB URI is not defined in the environment variables')
}

const mongooseOptions = useCertAuth
  ? {
      tls: true,
      tlsCertificateKeyFile: process.env.MONGODB_CERT_PATH,
      tlsInsecure: true // Use with caution, only for debugging
    }
  : {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD
    }

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Middleware for parsing JSON bodies
app.use(express.json())

// Movie routes
app.use('/', movieRoutes)

// Add Swagger UI route before your other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

if (require.main === module) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

redis.on('connect', () => {
  console.log('Connected to Redis')
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

export default app
