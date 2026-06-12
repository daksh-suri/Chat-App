import dotenv from 'dotenv';

dotenv.config();

// Support comma-separated origins, including wildcard Vercel-style hosts.
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,https://*.vercel.app';

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

  return env.CORS_ORIGIN.some((allowedOrigin) => {
    if (allowedOrigin === '*') return true;

    if (allowedOrigin.startsWith('*.')) {
      return requestOrigin.endsWith(allowedOrigin.slice(1));
    }

    return allowedOrigin === requestOrigin;
  });
}

export default env;
