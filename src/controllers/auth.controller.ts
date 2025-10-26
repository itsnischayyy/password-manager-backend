import { Request, Response, NextFunction } from 'express';
import * as authService from '@/services/auth.service';
import config from '@/config';
import { AppError } from '@/utils/AppError';
import { AuthenticatedRequest } from '@/types';

// Wrapper to handle async functions and pass errors to the error handler
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const userProfile = await authService.registerUser(req.body);
  res.status(201).json(userProfile);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user, saltForKEK, wrappedVK, twoFactorRequired } = await authService.loginUser(email, password, req.ip, req.headers['user-agent']);

  if (twoFactorRequired) {
    // 2FA is enabled but code not provided yet.
    // Send a temporary token that authorizes the user to call the /2fa/verify endpoint.
    const tempToken = authService.generate2FATempToken(user.id);
    return res.status(200).json({ twoFactorRequired: true, tempToken });
  }

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({ accessToken, user, saltForKEK, wrappedVK });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new AppError('Refresh token not found', 401);
  }
  const { accessToken, newRefreshToken } = await authService.refreshAccessToken(oldRefreshToken, req.ip, req.headers['user-agent']);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(204).send();
});

export const getSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const currentToken = req.cookies.refreshToken;
  const sessions = await authService.getUserSessions(req.user!.id, currentToken);
  res.status(200).json(sessions);
});

export const revokeSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await authService.revokeUserSession(req.user!.id, req.params.id);
  res.status(204).send();
});

export const revokeAllSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await authService.revokeAllUserSessions(req.user!.id, req.cookies.refreshToken);
  res.status(204).send();
});

// --- 2FA Controllers ---

export const generate2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { secret, otpAuthUrl } = authService.generate2FASecret();
  // We temporarily store the un-encrypted secret to verify it during the 'enable' step.
  // This could be stored in a short-lived Redis cache for better security.
  // For simplicity here, we'll create a short-lived JWT.
  const temp2FASecretToken = authService.generate2FASecretToken(req.user!.id, secret);
  res.json({ otpAuthUrl, secretToken: temp2FASecretToken });
});

export const enable2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, secretToken } = req.body;
  await authService.enable2FAForUser(req.user!.id, secretToken, token, req.body.encryptedSecret, req.body.iv, req.body.tag);
  res.status(200).json({ message: '2FA enabled successfully.' });
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
    const { token, tempToken } = req.body;
    const { accessToken, refreshToken, user, saltForKEK, wrappedVK } = await authService.verify2FAForLogin(tempToken, token, req.ip, req.headers['user-agent']);
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken, user, saltForKEK, wrappedVK });
});

export const disable2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await authService.disable2FAForUser(req.user!.id);
  res.status(200).json({ message: '2FA disabled successfully.' });
});