import dotenv from 'dotenv';

dotenv.config();

// Support comma-separated origins: e.g. "https://chat-app-1k5r.vercel.app,http://localhost:5173"
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';

const env = {
  PORT: process.env.PORT || 4444,
  CORS_ORIGIN: rawOrigins.split(',').map(o => o.trim()),
  JWT_SECRET: process.env.JWT_SECRET || 'chatapp-secret',
  DATABASE_URL: process.env.DATABASE_URL || '',
};

export default env;
