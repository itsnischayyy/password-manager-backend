import { Response, NextFunction } from 'express';
import * as auditService from '@/services/audit.service';
import { AuthenticatedRequest } from '@/types';

const asyncHandler = (fn: Function) => (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const result = await auditService.getLogs({ page, limit });
  res.status(200).json(result);
});