import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'; // Corrected import
import config from '@/config';
import { AppError } from '@/utils/AppError';
import { User } from '@/models/User.model';
import { AuthenticatedRequest } from '@/types';

export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.accessTokenSecret) as { id: string };
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid token.', 401));
  }
};

// Example admin middleware
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In a real app, the user model would have a 'role' field.
  // if (req.user && req.user.role === 'admin') {
  //   next();
  // } else {
  //   return next(new AppError('You do not have permission to perform this action.', 403));
  // }
  // For this example, we'll just deny access as there's no role system yet.
   return next(new AppError('Admin access is required.', 403));
};