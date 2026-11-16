import { z } from 'zod';

export const submitComplaintSchema = z.object({
  category: z.enum(['Academic', 'Hostel', 'Infrastructure', 'Ragging / Harassment', 'Canteen', 'General']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  isAnonymous: z.boolean().optional(),
  attachmentUrl: z.string().optional(),
  assignedDepartment: z.string().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'Escalated', 'Resolved', 'Closed']),
  resolutionNote: z.string().optional(),
  comment: z.string().optional(),
});

export const addComplaintNoteSchema = z.object({
  text: z.string().min(2, 'Note text must be at least 2 characters'),
  isInternal: z.boolean().optional(),
});
