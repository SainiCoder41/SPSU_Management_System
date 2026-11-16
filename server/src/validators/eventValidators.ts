import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Event title is required'),
  description: z.string().min(10, 'Event description must be at least 10 characters'),
  category: z.enum(['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'General']).default('General'),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  venue: z.string().min(2, 'Venue is required'),
  capacity: z.number().int().min(1).default(100),
  targetAudience: z
    .object({
      roles: z.array(z.string()).optional(),
      departments: z.array(z.string()).optional(),
      semesters: z.array(z.number()).optional(),
    })
    .optional(),
  isRegistrationOpen: z.boolean().default(true),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['Draft', 'Published', 'Cancelled', 'Archived']).optional(),
});
