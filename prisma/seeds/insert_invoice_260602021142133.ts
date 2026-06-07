import { PrismaClient, InvoiceStatus } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Replace this with the actual UUID of an existing admin user in your `users` table.
const CREATED_BY_ID = 'REPLACE_WITH_ADMIN_USER_UUID';

const main = async (): Promise<void> => {
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: '260602021142133',
      status: InvoiceStatus.SAVED,
      clientName: 'PATRICK ISAIAH EFFIONG',
      clientEmail: 'patient.131474@rusth.ng',
      clientAddress: 'Rivers State University Teaching Hospital',
      issueDate: new Date('2026-06-02T14:11:53Z'),
      dueDate: new Date('2026-06-02T14:11:53Z'),
      currency: 'NGN',
      subtotal: 2230000,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      grandTotal: 2230000,
      notes: 'Cashier: godspowerr pepple | Source: MedixTrak — xtrak.cinfores.net | Patient ID: 131474',
      createdById: CREATED_BY_ID,
      lineItems: {
        create: [
          { description: 'CONSULTATION FEE - A&E', quantity: 1, unitPrice: 200000, total: 200000 },
          { description: 'BED FEE - A&E', quantity: 1, unitPrice: 1000000, total: 1000000 },
          { description: 'PCV - A&E', quantity: 1, unitPrice: 100000, total: 100000 },
          { description: 'URINALYSIS - A&E', quantity: 1, unitPrice: 200000, total: 200000 },
          { description: 'C-SPINE COLLAR (SOFT/PHIL/COMP) - A&E', quantity: 1, unitPrice: 550000, total: 550000 },
          { description: 'RANDOM BLOOD SUGAR - ACCUCHECK', quantity: 1, unitPrice: 150000, total: 150000 },
          { description: 'EHR FEE (PORTAL CHARGE)', quantity: 1, unitPrice: 30000, total: 30000 },
        ],
      },
    },
    include: { lineItems: true },
  });

  console.log(`Invoice ${invoice.invoiceNumber} seeded successfully (id: ${invoice.id})`);
};

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
