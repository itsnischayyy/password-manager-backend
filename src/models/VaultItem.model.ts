import { Schema, model, Document, Types } from 'mongoose';

export interface IVaultItem extends Document {
  user: Types.ObjectId;
  encryptedBlob: string;
  iv: string;
  tag: string;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    encryptedBlob: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) { // Use `any` to satisfy the strict delete rule
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const VaultItem = model<IVaultItem>('VaultItem', VaultItemSchema);