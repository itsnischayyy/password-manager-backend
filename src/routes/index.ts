import { Router } from 'express';
import authRoutes from './auth.routes';
import vaultRoutes from './vault.routes';
import auditRoutes from './audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vault', vaultRoutes);
router.use('/audit', auditRoutes);

export default router;