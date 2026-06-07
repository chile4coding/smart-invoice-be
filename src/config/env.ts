import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const env = {
  port: parseInt(requireEnv('PORT', '3133'), 10),
  nodeEnv: requireEnv('NODE_ENV', 'development'),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: requireEnv('JWT_EXPIRES_IN', '7d'),
  bcryptSaltRounds: parseInt(requireEnv('BCRYPT_SALT_ROUNDS', '12'), 10),
} as const;
