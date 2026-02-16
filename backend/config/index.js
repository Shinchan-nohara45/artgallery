// backend/config/index.js

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  EMAIL_SERVICE_HOST: process.env.EMAIL_SERVICE_HOST,
  EMAIL_SERVICE_PORT: process.env.EMAIL_SERVICE_PORT,
  EMAIL_SERVICE_USER: process.env.EMAIL_SERVICE_USER,
  EMAIL_SERVICE_PASS: process.env.EMAIL_SERVICE_PASS,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  NODE_ENV: process.env.NODE_ENV
};

export default config;