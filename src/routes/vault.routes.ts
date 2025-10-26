import { Router } from 'express';
import * as vaultController from '@/controllers/vault.controller';
import { isAuthenticated } from '@/middleware/auth.middleware';
import { validateRequest } from '@/middleware/validateRequest';
import { createVaultItemSchema, updateVaultItemSchema } from '@/validators/vault.validators';
import { objectIdParamSchema } from '@/validators/common.validators';

const router = Router();

// All vault routes require authentication
router.use(isAuthenticated);

router.route('/')
  .get(vaultController.getAllVaultItems)
  .post(validateRequest({ body: createVaultItemSchema }), vaultController.createVaultItem);

router.route('/:id')
  .all(validateRequest({ params: objectIdParamSchema }))
  .get(vaultController.getVaultItem)
  .put(validateRequest({ body: updateVaultItemSchema }), vaultController.updateVaultItem)
  .delete(vaultController.deleteVaultItem);

export default router;