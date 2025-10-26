import { z } from 'zod';
import { Types } from 'mongoose';

export const objectIdParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  }),
});