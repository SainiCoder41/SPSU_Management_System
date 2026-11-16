import { Router } from 'express';
import {
  getPermissionTypes,
  createPermissionType,
  submitPermission,
  getMyPermissions,
  getWardenPermissionQueue,
  getParentPermissionQueue,
  reviewWardenPermission,
  signOffParentPermission,
  cancelPermission,
  getPermissionById,
} from '../controllers/permissionController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  createPermissionSchema,
  reviewPermissionSchema,
} from '../validators/permissionValidators.js';

const router = Router();

router.use(authenticate);

// Types
router.get('/types', getPermissionTypes);
router.post('/types', authorizeRoles('ADMIN'), createPermissionType);

// Student
router.post('/', authorizeRoles('STUDENT'), validateRequest(createPermissionSchema), submitPermission);
router.get('/my', authorizeRoles('STUDENT'), getMyPermissions);
router.post('/:id/cancel', cancelPermission);

// Warden Queue & Review
router.get('/warden-queue', authorizeRoles('WARDEN', 'ADMIN'), getWardenPermissionQueue);
router.post('/:id/warden-review', authorizeRoles('WARDEN', 'ADMIN'), validateRequest(reviewPermissionSchema), reviewWardenPermission);

// Parent Queue & Sign-Off
router.get('/parent-queue', authorizeRoles('PARENT', 'ADMIN'), getParentPermissionQueue);
router.post('/:id/parent-signoff', authorizeRoles('PARENT', 'ADMIN'), validateRequest(reviewPermissionSchema), signOffParentPermission);

// Details
router.get('/:id', getPermissionById);

export default router;
