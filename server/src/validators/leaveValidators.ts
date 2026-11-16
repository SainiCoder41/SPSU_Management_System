import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
  emergencyContact: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const reviewLeaveRequestSchema = z.object({
  action: z.enum(['Approved', 'Rejected', 'Returned']),
  comments: z.string().min(2, 'Comments are required for reviewing a leave request'),
});

export const leaveTypeConfigSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  applicableRole: z.enum(['STUDENT', 'STAFF', 'ALL']).default('ALL'),
  defaultQuota: z.number().int().min(1).default(15),
  requiresAttachment: z.boolean().default(false),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});
