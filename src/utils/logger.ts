import pino from 'pino';
import pinoHttp from 'pino-http';
import config from '@/config';

const transport = config.nodeEnv === 'development' ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname',
  },
} : undefined;

export const logger = pino({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  transport,
});

export const httpLogger = pinoHttp({
  logger,
  // Redact sensitive headers
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '**REDACTED**',
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent'
    }
    return 'info'
  },
});