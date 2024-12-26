import express from 'express';
import mongoose from 'mongoose';
import movieRoutes from './routes/movieRoutes';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

/**
 * Express application instance
 * @constant app
 */
const app = express();

/**
 * MongoDB connection
 * @description Connects to MongoDB instance using either certificate or username/password
 */
if (!process.env.MONGODB_URI && !process.env.MONGODB_CERT_URI) {
  throw new Error('MONGODB_URI or MONGODB_CERT_URI must be defined in the environment variables');
}

const useCertAuth = process.env.MONGODB_CERT_AUTH === '1';
const MONGODB_URI = useCertAuth ? process.env.MONGODB_CERT_URI : process.env.MONGODB_AUTH_URI;

if (!MONGODB_URI) {
  throw new Error('The selected MongoDB URI is not defined in the environment variables');
}

const mongooseOptions = useCertAuth
  ? {
      tls: true,
      tlsCertificateKeyFile: process.env.MONGODB_CERT_PATH,
      tlsInsecure: true, // Use with caution, only for debugging
    }
  : {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
    };

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware for parsing JSON bodies
app.use(express.json());

// Movie routes
app.use('/', movieRoutes);

export default app; 