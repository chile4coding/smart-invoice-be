import { Request, Response, NextFunction } from 'express';
import * as invoiceService from './invoice.service';
import type { InvoiceInput, CreateInvoiceInput } from './invoice.service';
import { InvoiceStatus } from './invoice.service';
import { renderInvoiceHtml, generateInvoicePDF } from './invoice.pdf.service';
import { sendSuccess, sendCreated, sendNoContent, sendError } from '../../utils/apiResponse';

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await invoiceService.createInvoice({
      ...(req.body as InvoiceInput),
      createdById: req.user!.sub,
    } as CreateInvoiceInput);
    sendCreated(res, invoice, 'Invoice created successfully');
  } catch (err) {
    next(err);
  }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 10));
    const result = await invoiceService.listInvoices({
      search: (req.query['search'] as string) || undefined,
      status: (req.query['status'] as InvoiceStatus) || undefined,
      startDate: (req.query['startDate'] as string) || undefined,
      endDate: (req.query['endDate'] as string) || undefined,
      sortBy: (req.query['sortBy'] as string) || undefined,
      order: (req.query['order'] as 'asc' | 'desc') || undefined,
      page,
      limit,
      role: req.user!.role,
      userId: req.user!.sub,
    });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params['id']);
    if (!invoice) {
      sendError(res, 404, 'NOT_FOUND', 'Invoice not found');
      return;
    }
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params['id'], req.body as InvoiceInput);
    sendSuccess(res, invoice, 'Invoice updated successfully');
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body as { status: InvoiceStatus };
    const invoice = await invoiceService.updateStatus(req.params['id'], status);
    sendSuccess(res, invoice, 'Invoice status updated');
  } catch (err) {
    next(err);
  }
};

export const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await invoiceService.deleteInvoice(req.params['id']);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

export const previewInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params['id']);
    if (!invoice) {
      sendError(res, 404, 'NOT_FOUND', 'Invoice not found');
      return;
    }
    const html = await renderInvoiceHtml(invoice);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
};

export const downloadPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params['id']);
    if (!invoice) {
      sendError(res, 404, 'NOT_FOUND', 'Invoice not found');
      return;
    }
    const pdf = await generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};
