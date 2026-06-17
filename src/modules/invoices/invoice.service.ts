import prisma from '../../config/database';
import { generateUniqueReceiptId } from '../../utils/invoiceNumber';

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SAVED = 'SAVED',
  SENT = 'SENT',
}

export type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string
};

export type InvoiceInput = {
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  clientPhone?: string;
  issueDate: string;
  dueDate: string;
  taxRate?: number;
  discount?: number;
  currency?: string;
  notes?: string;
  lineItems: LineItemInput[];
  clientId?: string;
  clientGender?: string;
  amountPaid?:number
  receiptID?:string
};

export type CreateInvoiceInput = InvoiceInput & { createdById: string };

const computeFinancials = (items: LineItemInput[], taxRate: number, discount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const grandTotal = subtotal + taxAmount - discount;
  return { subtotal, taxAmount, grandTotal };
};

const buildLineItemsCreate = (items: LineItemInput[]) =>
  items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
    unit:item?.unit ||""
  }));

export const createInvoice = async (input: CreateInvoiceInput) => {
  const invoiceNumber = await generateUniqueReceiptId();
  
  const { subtotal,  grandTotal } = computeFinancials(input.lineItems, 0, 0);

  return prisma.invoice.create({
    data: {
      clientId: input.clientId,
      clientGender: input.clientGender,
      invoiceNumber: input?.receiptID || invoiceNumber,
      clientName: input.clientName,
      clientEmail: "",
      clientAddress: "",
      clientPhone: "",
      issueDate: new Date(input.issueDate),
      dueDate: new Date(),
      discount:0,
      subtotal,
      taxAmount:0,
      grandTotal,
      currency: input.currency ?? 'NGN',
      notes: "",
      createdById: input.createdById,
      lineItems: { create: buildLineItemsCreate(input.lineItems) },
      amountPaid: grandTotal
    },
    include: { lineItems: true , createdBy:true},

  });
};

type ListInvoicesParams = {
  search?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  role: string;
  userId: string;
};

export let listInvoices = async ({
  search,
  status,
  startDate,
  endDate,
  page,
  limit,
  sortBy = 'createdAt',
  order = 'desc',
  role,
  userId,
}: ListInvoicesParams) => {
  const skip = (page - 1) * limit;
if(!search && role === "SUPER_ADMIN"){
  search   =""
}
  


  const where: Record<string, unknown> = {
    ...(status && { status }),
    ...(startDate || endDate
      ? {
          issueDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { clientName: { contains: search, mode: 'insensitive' } },
            { clientEmail: { contains: search, mode: 'insensitive' } },
            { clientId: { contains: search, mode: 'insensitive' } },
          ],
        }
      :   {}),
    ...(role === 'SUPER_ADMIN' ? {} : { createdById: userId }),
  };

  const orderBy: Record<string, string> = { [sortBy]: order };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({ where, skip, take: limit, orderBy, include: { lineItems: true,  createdBy:true, } }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getInvoiceById = (id: string) =>
  prisma.invoice.findUnique({ where: { id }, include: { lineItems: true } });

export const updateInvoice = async (id: string, input: InvoiceInput) => {
   const invoiceNumber = await generateUniqueReceiptId();

  const { subtotal, grandTotal } = computeFinancials(input.lineItems, 0, 0);


  return prisma.$transaction(async (tx: Tx) => {
   const y= await tx.lineItem.deleteMany({ where: { invoiceId: id } });
    return tx.invoice.update({
      where: { id },
      data: {
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientAddress: "",
        clientPhone: "",
        issueDate: new Date(input.issueDate),
        dueDate: new Date(),
        taxRate:0,
        discount:0,
        subtotal,
        taxAmount:0,
        grandTotal,
        currency: input.currency ?? 'NGN',
        notes: "",
        lineItems: { create: buildLineItemsCreate(input.lineItems) },
        clientId: input.clientId,
        clientGender: input.clientGender,
        amountPaid: grandTotal,
        ...(input?.receiptID ? {invoiceNumber: input.receiptID } : { invoiceNumber})
      },
      include: { lineItems: true, createdBy:true },
    });
  });
};

export const updateStatus = (id: string, status: InvoiceStatus) =>
  prisma.invoice.update({ where: { id }, data: { status }, include: { lineItems: true } });

export const deleteInvoice = (id: string) => prisma.invoice.delete({ where: { id } });
