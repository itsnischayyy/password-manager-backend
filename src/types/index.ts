import { Request } from 'express';
import { z } from 'zod';
import { registerSchema, loginSchema } from '@/validators/auth.validators';
import { createVaultItemSchema, updateVaultItemSchema } from '@/validators/vault.validators';
import { IUser } from '@/models/User.model';

// Zod-inferred types
export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type CreateVaultItemPayload = z.infer<typeof createVaultItemSchema>;
export type UpdateVaultItemPayload = z.infer<typeof updateVaultItemSchema>;

// Custom types
export interface Argon2Params {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

export interface WrappedKey {
  cipher: string;
  iv: string;
  tag: string;
}

export interface UserPublicProfile {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface SessionInfo {
  id: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  isCurrent: boolean;
}