import { Response, NextFunction } from 'express';
import * as vaultService from '@/services/vault.service';
import { AuthenticatedRequest } from '@/types';

const asyncHandler = (fn: Function) => (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getAllVaultItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const items = await vaultService.findAllVaultItems(req.user!.id);
  res.status(200).json(items);
});

export const createVaultItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const newItem = await vaultService.createVaultItem(req.user!.id, req.body);
  res.status(201).json(newItem);
});

export const getVaultItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await vaultService.findVaultItemById(req.user!.id, req.params.id);
  res.status(200).json(item);
});

export const updateVaultItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedItem = await vaultService.updateVaultItem(req.user!.id, req.params.id, req.body);
  res.status(200).json(updatedItem);
});

export const deleteVaultItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await vaultService.deleteVaultItem(req.user!.id, req.params.id);
  res.status(204).send();
});