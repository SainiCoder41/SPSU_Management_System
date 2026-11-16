import { Router } from 'express';
import {
  getMentorMentees,
  getWardenResidents,
  getHodOverview,
  getParentStudent,
} from '../controllers/rolePortalController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

export const mentorRouter = Router();
mentorRouter.use(authenticate, authorizeRoles('MENTOR', 'ADMIN'));
mentorRouter.get('/mentees', getMentorMentees);

export const wardenRouter = Router();
wardenRouter.use(authenticate, authorizeRoles('WARDEN', 'ADMIN'));
wardenRouter.get('/residents', getWardenResidents);

export const hodRouter = Router();
hodRouter.use(authenticate, authorizeRoles('HOD', 'ADMIN'));
hodRouter.get('/overview', getHodOverview);

export const parentRouter = Router();
parentRouter.use(authenticate, authorizeRoles('PARENT', 'ADMIN'));
parentRouter.get('/student', getParentStudent);
