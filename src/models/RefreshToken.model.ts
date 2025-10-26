import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  ip?: string;
  userAgent?: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // SECURITY: Store a hash of the refresh token, not the token itself.
    // This prevents session hijacking if the database is compromised.
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);