import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validateRequest';
import { registerSchema, loginSchema, enable2FASchema, verify2FASchema } from '@/validators/auth.validators';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { isAuthenticated } from '@/middleware/auth.middleware';

const router = Router();

// Apply stricter rate limiting to auth routes
router.use(authRateLimiter);

router.post('/register', validateRequest({ body: registerSchema }), authController.register);
router.post('/login', validateRequest({ body: loginSchema }), authController.login);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/sessions', isAuthenticated, authController.getSessions);
router.delete('/sessions/:id', isAuthenticated, authController.revokeSession);
router.post('/sessions/revoke-all', isAuthenticated, authController.revokeAllSessions);

// Two-Factor Authentication Routes
router.post('/2fa/generate', isAuthenticated, authController.generate2FA);
router.post('/2fa/enable', isAuthenticated, validateRequest({ body: enable2FASchema }), authController.enable2FA);
router.post('/2fa/verify', validateRequest({ body: verify2FASchema }), authController.verify2FA); // Used during login
router.post('/2fa/disable', isAuthenticated, authController.disable2FA);


export default router;