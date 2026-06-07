import ejs from 'ejs';
import path from 'path';
import puppeteer from 'puppeteer';
type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  invoiceId: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string | null;
  clientPhone: string | null;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxRate: number | { toFixed: (d: number) => string };
  taxAmount: number;
  discount: number;
  grandTotal: number;
  currency: string;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
};

type InvoiceWithLineItems = Invoice & { lineItems: LineItem[] };

const formatCurrency = (minorUnits: number, currency: string): string => {
  const major = minorUnits / 100;
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
};

const buildTemplateData = (invoice: InvoiceWithLineItems) => ({
  ...invoice,
  subtotalFormatted: formatCurrency(invoice.subtotal, invoice.currency),
  taxAmountFormatted: formatCurrency(invoice.taxAmount, invoice.currency),
  grandTotalFormatted: formatCurrency(invoice.grandTotal, invoice.currency),
  taxRateFormatted: `${Number(invoice.taxRate).toFixed(2)}%`,
  discountFormatted: formatCurrency(invoice.discount, invoice.currency),
  lineItems: invoice.lineItems.map((item) => ({
    ...item,
    unitPriceFormatted: formatCurrency(item.unitPrice, invoice.currency),
    totalFormatted: formatCurrency(item.total, invoice.currency),
  })),
});

export const renderInvoiceHtml = (invoice: InvoiceWithLineItems): Promise<string> => {
  const templatePath = path.join(__dirname, '../../templates/invoice.ejs');
  return ejs.renderFile(templatePath, buildTemplateData(invoice));
};

export const generateInvoicePDF = async (invoice: InvoiceWithLineItems): Promise<Buffer> => {
  const html = await renderInvoiceHtml(invoice);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return Buffer.from(pdf);
};
