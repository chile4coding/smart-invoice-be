import { body } from 'express-validator';

export const createUserSchema = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').notEmpty().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role').isIn(['ADMIN', 'USER']).withMessage('Role must be ADMIN or USER'),
];

export const updateProfileSchema = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

export const changePasswordSchema = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

export const changeRoleSchema = [
  body('role')
    .isIn(['ADMIN', 'USER', 'SUPER_ADMIN'])
    .withMessage('Role must be ADMIN, USER, or SUPER_ADMIN'),
];

const statsFields = [
  'totalAttendance',
  'newRegistration',
  'followUp',
  'totalPatients',
  'today',
  'thisWeek',
  'thisMonth',
  'totalPayments',
] as const;

export const dashboardStatsSchema = statsFields.map((field) =>
  body(field).notEmpty().withMessage(`${field} is required`).isString().withMessage(`${field} must be a string`)
);
