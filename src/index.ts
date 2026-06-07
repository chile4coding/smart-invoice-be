import 'dotenv/config';
import createApp from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';

const start = (): void => {
  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

const shutdown = async (): Promise<void> => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

try {
  start();
} catch (err: unknown) {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
}
