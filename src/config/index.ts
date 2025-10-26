import 'dotenv/config';

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/password_manager_dev',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10', 10),
  },
};

// Validate that essential secrets are loaded
if (!config.accessTokenSecret || !config.refreshTokenSecret) {
  console.error("FATAL ERROR: JWT secrets are not defined in environment variables.");
  process.exit(1);
}


export default config;