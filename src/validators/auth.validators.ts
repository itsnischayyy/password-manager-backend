import { z } from 'zod';

// New schema for PBKDF2 parameters
const pbkdf2ParamsSchema = z.object({
  iterations: z.number().int().positive(),
  algorithm: z.string().refine(val => val.toUpperCase().startsWith('SHA-'), {
    message: "Algorithm must be a SHA variant"
  }),
});

const wrappedKeySchema = z.object({
  cipher: z.string().base64(),
  iv: z.string().base64(),
  tag: z.string().base64(),
});

// Updated register schema to use PBKDF2 fields
export const registerSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(50).optional(),
  pbkdf2Hash: z.string(), // This is the full hash string from the client
  pbkdf2Salt: z.string().base64(),
  pbkdf2Params: pbkdf2ParamsSchema,
  saltForKEK: z.string().base64(),
  wrappedVK: wrappedKeySchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// ... (2FA schemas remain the same)
export const enable2FASchema = z.object({
    token: z.string().length(6, "Token must be 6 digits"),
    secretToken: z.string(), // The temporary JWT holding the secret
    encryptedSecret: z.string(), // Encrypted TOTP secret
    iv: z.string().base64(),
    tag: z.string().base64(),
  });
  
  export const verify2FASchema = z.object({
      token: z.string().length(6, "Token must be 6 digits"),
      tempToken: z.string(), // The temp JWT from the initial login step
  });