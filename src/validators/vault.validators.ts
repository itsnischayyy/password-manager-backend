import { z } from 'zod';

export const createVaultItemSchema = z.object({
  encryptedBlob: z.string().base64(),
  iv: z.string().base64(),
  tag: z.string().base64(),
  meta: z.record(z.string(), z.any()).optional(), // Corrected usage
});

export const updateVaultItemSchema = z.object({
  encryptedBlob: z.string().base64().optional(),
  iv: z.string().base64().optional(),
  tag: z.string().base64().optional(),
  meta: z.record(z.string(), z.any()).optional(), // Corrected usage
}).refine(data => Object.keys(data).length > 0, {
  message: 'Update body cannot be empty'
});