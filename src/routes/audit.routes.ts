import { Router } from 'express';
import * as auditController from '@/controllers/audit.controller';
import { isAuthenticated, isAdmin } from '@/middleware/auth.middleware';

const router = Router();

// All audit routes require admin privileges
router.use(isAuthenticated, isAdmin);

router.get('/logs', auditController.getAuditLogs);

export default router;