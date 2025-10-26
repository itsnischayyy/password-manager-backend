import mongoose from 'mongoose';
import config from './index';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB Connected...');
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};