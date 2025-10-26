import { Schema, model, Document, Types } from 'mongoose';

export type AuditAction = 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'TOKEN_REFRESH' | 'VAULT_ITEM_CREATE' | 'VAULT_ITEM_UPDATE' | 'VAULT_ITEM_DELETE' | '2FA_ENABLE' | '2FA_DISABLE';
export type AuditOutcome = 'success' | 'failure';

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  action: AuditAction;
  outcome: AuditOutcome;
  actorIp: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, enum: ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'TOKEN_REFRESH', 'VAULT_ITEM_CREATE', 'VAULT_ITEM_UPDATE', 'VAULT_ITEM_DELETE', '2FA_ENABLE', '2FA_DISABLE'] },
    outcome: { type: String, required: true, enum: ['success', 'failure'] },
    actorIp: { type: String, required: true },
    userAgent: { type: String },
    // PII should be redacted before being stored here.
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);