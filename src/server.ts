import 'dotenv/config';
import app from './app';
import config from './config';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

process.on('unhandledRejection', (err: Error) => {
  // Corrected logger calls
  logger.error({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated.');
  });
});