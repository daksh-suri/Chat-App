import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 4444,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'chatapp-secret',
  DATABASE_URL: process.env.DATABASE_URL || ''
};

export default env;
