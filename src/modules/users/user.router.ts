import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createUserSchema, updateProfileSchema, changePasswordSchema, changeRoleSchema, dashboardStatsSchema } from './user.validator';
import * as userController from './user.controller';

const router = Router();

// Dashboard stats — accessible to any authenticated user
router.post('/dashboard-stats', authenticate, validateRequest(dashboardStatsSchema), userController.upsertDashboardStats);
router.get('/dashboard-stats', authenticate, userController.getDashboardStats);

router.use(authenticate);

router.patch('/:id/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.patch('/:id/password', validateRequest(changePasswordSchema), userController.changePassword);
// All routes below require SUPER_ADMIN
router.use(authorize('SUPER_ADMIN'));

router.post('/', validateRequest(createUserSchema), userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', validateRequest(changeRoleSchema), userController.changeRole);
router.delete('/:id', userController.deactivateUser);

export default router;
