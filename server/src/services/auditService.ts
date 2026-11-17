import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';

export interface AuditLogParams {
  actor: mongoose.Types.ObjectId | string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  comment?: string;
  ipAddress?: string;
}

export class AuditService {
  static async log(params: AuditLogParams) {
    try {
      const actorId = typeof params.actor === 'string' ? new mongoose.Types.ObjectId(params.actor) : params.actor;
      return await AuditLog.create({
        actor: actorId,
        actorRole: params.actorRole,
        actorEmail: params.actorEmail || '',
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || '',
        previousState: params.previousState || null,
        newState: params.newState || null,
        comment: params.comment || '',
        ipAddress: params.ipAddress || '',
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
      return null;
    }
  }

  static async getLogs(query: { resourceType?: string; resourceId?: string; action?: string; limit?: number }) {
    const filter: any = {};
    if (query.resourceType) filter.resourceType = query.resourceType;
    if (query.resourceId) filter.resourceId = query.resourceId;
    if (query.action) filter.action = query.action;

    return await AuditLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(query.limit || 50)
      .lean();
  }
}
