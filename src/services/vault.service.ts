import { VaultItem, IVaultItem } from '@/models/VaultItem.model';
import { AppError } from '@/utils/AppError';
import { CreateVaultItemPayload, UpdateVaultItemPayload } from '@/types';
import { Types } from 'mongoose';
import { createAuditLog } from './audit.service';

export const findAllVaultItems = async (userId: string | Types.ObjectId): Promise<IVaultItem[]> => {
  return VaultItem.find({ user: userId });
};

export const createVaultItem = async (userId: string | Types.ObjectId, payload: CreateVaultItemPayload): Promise<IVaultItem> => {
  const newItem = await VaultItem.create({
    user: userId,
    ...payload,
  });
  await createAuditLog({ user: userId, action: 'VAULT_ITEM_CREATE', outcome: 'success', details: { itemId: newItem.id } });
  return newItem;
};

export const findVaultItemById = async (userId: string | Types.ObjectId, itemId: string): Promise<IVaultItem> => {
  const item = await VaultItem.findOne({ _id: itemId, user: userId });
  if (!item) {
    throw new AppError('Vault item not found', 404);
  }
  return item;
};

export const updateVaultItem = async (userId: string | Types.ObjectId, itemId: string, payload: UpdateVaultItemPayload): Promise<IVaultItem> => {
  const item = await VaultItem.findOneAndUpdate(
    { _id: itemId, user: userId },
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!item) {
    throw new AppError('Vault item not found', 404);
  }
  await createAuditLog({ user: userId, action: 'VAULT_ITEM_UPDATE', outcome: 'success', details: { itemId: item.id } });
  return item;
};

export const deleteVaultItem = async (userId: string | Types.ObjectId, itemId: string): Promise<void> => {
  const result = await VaultItem.deleteOne({ _id: itemId, user: userId });

  if (result.deletedCount === 0) {
    throw new AppError('Vault item not found', 404);
  }
  await createAuditLog({ user: userId, action: 'VAULT_ITEM_DELETE', outcome: 'success', details: { itemId } });
};