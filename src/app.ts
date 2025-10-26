import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import * as swaggerUi from 'swagger-ui-express'; // Corrected import
import * as YAML from 'yamljs';
import * as path from 'path';
import { connectDB } from './config/db';
import config from './config';
import { httpLogger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import apiRoutes from './routes';

// Connect to Database
connectDB();

const app = express();

// --- Security Middleware ---
app.set('trust proxy', 1); // Trust first proxy

// Set security HTTP headers with a strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", config.corsOrigin],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // Disallow embedding in iframes
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing, limit payload size
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize user-supplied data to prevent MongoDB Operator Injection
// Sanitize user-supplied data to prevent MongoDB Operator Injection
// app.use(
//   mongoSanitize({
//     replaceWith: '_',
//     onSanitize: ({ req, key }) => {
//       console.warn(`Sanitized key: ${key}`);
//     },
//   })
// );

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Apply global rate limiting
app.use(rateLimiter);

// HTTP request logging
app.use(httpLogger);

// --- API Routes ---
const swaggerDocument = YAML.load(path.join(__dirname, '../OPENAPI.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/v1', apiRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;