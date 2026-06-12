import dotenv from 'dotenv';

dotenv.config();

const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,https://chat-app-1k5r-qs6c68w3y-18dakshsuri-8802s-projects.vercel.app';

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/$/, '');
}

const env = {
  PORT: process.env.PORT || 4444,
  CORS_ORIGIN: rawOrigins.split(',').map(normalizeOrigin).filter(Boolean),
  JWT_SECRET: process.env.JWT_SECRET || 'chatapp-secret',
  DATABASE_URL: process.env.DATABASE_URL || '',
};

export function isAllowedOrigin(origin) {
  const requestOrigin = normalizeOrigin(origin);
  if (!requestOrigin) return true;

  return env.CORS_ORIGIN.includes(requestOrigin);
}

export default env;
