import { body, query } from 'express-validator';

const lineItemRules = [
  body('lineItems').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('lineItems.*.description')
    .trim()
    .notEmpty()
    .withMessage('Line item description is required'),
  body('lineItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('lineItems.*.unitPrice')
    .isInt({ min: 0 })
    .withMessage('Unit price must be a non-negative integer (in minor units)'),
];

export const createInvoiceSchema = [
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('issueDate').isISO8601().withMessage('Valid issue date (ISO 8601) is required'),

  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('notes').optional().isString(),
  ...lineItemRules,
];

export const updateInvoiceSchema = createInvoiceSchema;

export const updateStatusSchema = [
  body('status')
    .isIn(['DRAFT', 'SAVED', 'SENT'])
    .withMessage('Status must be DRAFT, SAVED, or SENT'),
];

export const listInvoicesQuerySchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['DRAFT', 'SAVED', 'SENT']).withMessage('Invalid status'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'issueDate', 'dueDate', 'grandTotal'])
    .withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];
