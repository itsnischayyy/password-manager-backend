import { AuditLog, IAuditLog, AuditAction, AuditOutcome } from '@/models/AuditLog.model';
import { Types } from 'mongoose';

interface CreateAuditLogPayload {
    user?: string | Types.ObjectId;
    action: AuditAction;
    outcome: AuditOutcome;
    actorIp?: string;
    userAgent?: string;
    details?: Record<string, any>;
}

export const createAuditLog = async (payload: CreateAuditLogPayload): Promise<IAuditLog> => {
    return AuditLog.create({
        user: payload.user,
        action: payload.action,
        outcome: payload.outcome,
        actorIp: payload.actorIp || 'unknown',
        userAgent: payload.userAgent,
        details: payload.details,
    });
};

interface GetLogsOptions {
    page: number;
    limit: number;
}

export const getLogs = async (options: GetLogsOptions) => {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'email displayName'); // Populate user info but select only non-sensitive fields
    
    const total = await AuditLog.countDocuments();

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};