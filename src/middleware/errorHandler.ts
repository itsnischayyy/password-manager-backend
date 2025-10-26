import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod'; // Import ZodError
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import config from '../config';

const handleZodError = (err: ZodError): AppError => {
  const errors = err.issues.map((el: any) => `${el.path.join('.')}: ${el.message}`).join('. ');
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    // Operational, trusted error: send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    // Corrected logger call:
    logger.error({ err }, 'An unexpected error occurred');
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: AppError;

  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof AppError) {
    error = err;
  } else {
    // If it's not a known error type, create a generic one
    error = new AppError(err.message || 'An internal server error occurred', err.statusCode || 500);
    // Preserve the original stack if it exists
    if (err.stack) {
        error.stack = err.stack;
    }
  }
  
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};