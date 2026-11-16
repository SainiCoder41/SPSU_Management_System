import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  rsvpEvent,
  withdrawRsvp,
  exportParticipants,
} from '../controllers/eventController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/eventValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getEvents);
router.post('/', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'MENTOR'), validateRequest(createEventSchema), createEvent);
router.get('/:id', getEventById);
router.put('/:id', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'MENTOR'), validateRequest(updateEventSchema), updateEvent);
router.post('/:id/rsvp', rsvpEvent);
router.post('/:id/withdraw', withdrawRsvp);
router.get('/:id/export', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'MENTOR'), exportParticipants);

export default router;
