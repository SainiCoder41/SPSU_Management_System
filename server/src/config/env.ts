import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spsu_cms',
  JWT_SECRET: process.env.JWT_SECRET || 'spsu_cms_super_secret_jwt_key_2026_v1_0',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
