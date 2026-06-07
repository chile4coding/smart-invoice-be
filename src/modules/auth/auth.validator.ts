import { body } from 'express-validator';

export const loginSchema = [
  body('email').notEmpty().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
