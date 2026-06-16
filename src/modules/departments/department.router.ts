import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import * as departmentController from './department.controller';

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', departmentController.listDepartments);
router.get('/:identifier/fees', departmentController.listDepartmentFees);

export default router;
