import { z } from 'zod';

export const publishNoticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  priority: z.enum(['Normal', 'Important', 'Urgent']).default('Normal'),
  isPinned: z.boolean().default(false),
  targetAudience: z
    .object({
      roles: z.array(z.string()).optional(),
      departments: z.array(z.string()).optional(),
      hostels: z.array(z.string()).optional(),
      semesters: z.array(z.number()).optional(),
    })
    .optional(),
  attachmentUrl: z.string().optional(),
  expiryDate: z.string().optional(),
});
