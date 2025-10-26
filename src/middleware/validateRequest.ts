import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import mongoSanitize from 'express-mongo-sanitize';

interface RequestValidators {
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
}

// Function to safely clear and merge properties for read-only Express objects
const safeMerge = (target: any, source: any) => {
  // Clear existing properties on the target
  for (const key in target) {
    delete target[key];
  }
  // Assign new properties from the source
  Object.assign(target, source);
};

export const validateRequest = (validators: RequestValidators) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        const parsedParams = await validators.params.parseAsync(req.params);
        safeMerge(
          req.params, 
          mongoSanitize.sanitize(parsedParams as Record<string, unknown>)
        );
      }
      
      if (validators.body) {
        const parsedBody = await validators.body.parseAsync(req.body);
        req.body = mongoSanitize.sanitize(
          parsedBody as Record<string, unknown> | unknown[]
        );
      }
      
      if (validators.query) {
        const parsedQuery = await validators.query.parseAsync(req.query);
        safeMerge(
          req.query, 
          mongoSanitize.sanitize(parsedQuery as Record<string, unknown>)
        );
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(error);
      }
    }
  };