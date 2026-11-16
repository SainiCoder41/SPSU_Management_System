import { z } from 'zod';

export const createPermissionSchema = z.object({
  permissionTypeId: z.string().min(1, 'Permission type is required'),
  startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  destination: z.string().min(2, 'Destination is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  emergencyContact: z.string().min(5, 'Emergency contact phone number is required'),
});

export const reviewPermissionSchema = z.object({
  action: z.enum(['Approved', 'Rejected']),
  comments: z.string().min(2, 'Review comments are required'),
});
