import { Schema, model, Document } from 'mongoose';
import { WrappedKey } from '@/types';

// New interface for PBKDF2 parameters
export interface PBKDF2Params {
  iterations: number;
  algorithm: string; // e.g., 'SHA-512'
}

export interface IUser extends Document {
  email: string;
  displayName?: string;
  auth: {
    // Replaced Argon2 fields with PBKDF2
    pbkdf2Hash: string;
    pbkdf2Salt: string;
    pbkdf2Params: PBKDF2Params;
  };
  keys: {
    saltForKEK: string;
    wrappedVK: WrappedKey;
  };
  twoFactor: {
    enabled: boolean;
    encryptedSecret?: string;
    iv?: string;
    tag?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    auth: {
      // Updated schema to match the new crypto
      pbkdf2Hash: { type: String, required: true, select: false },
      pbkdf2Salt: { type: String, required: true, select: false },
      pbkdf2Params: {
        iterations: { type: Number, required: true },
        algorithm: { type: String, required: true },
      },
    },
    keys: {
      saltForKEK: { type: String, required: true },
      wrappedVK: {
        cipher: { type: String, required: true },
        iv: { type: String, required: true },
        tag: { type: String, required: true },
      },
    },
    twoFactor: {
      enabled: { type: Boolean, default: false },
      encryptedSecret: { type: String },
      iv: { type: String },
      tag: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.auth; // Never expose auth block
      },
    },
  }
);

UserSchema.index({ email: 1 });

export const User = model<IUser>('User', UserSchema);