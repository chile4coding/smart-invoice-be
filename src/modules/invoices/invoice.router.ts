import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateStatusSchema,
  listInvoicesQuerySchema,
} from './invoice.validator';
import * as invoiceController from './invoice.controller';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validateRequest(createInvoiceSchema),
  invoiceController.createInvoice
);

router.get('/', validateRequest(listInvoicesQuerySchema), invoiceController.listInvoices);

router.get('/:id', invoiceController.getInvoice);

router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validateRequest(updateInvoiceSchema),
  invoiceController.updateInvoice
);

router.patch(
  '/:id/status',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validateRequest(updateStatusSchema),
  invoiceController.updateStatus
);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), invoiceController.deleteInvoice);

router.get('/:id/preview', authorize('SUPER_ADMIN', 'ADMIN'), invoiceController.previewInvoice);

router.get('/:id/pdf', authorize('SUPER_ADMIN', 'ADMIN'), invoiceController.downloadPdf);

export default router;
