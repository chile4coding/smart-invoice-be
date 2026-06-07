import prisma from '../config/database';

export function generateInvoiceNumber(): string {
  const now = new Date();

  const YY = String(now.getFullYear()).slice(-2);           // "26"
  const MM = String(now.getMonth() + 1).padStart(2, "0");  // "06"
  const DD = String(now.getDate()).padStart(2, "0");        // "02"
  const HH = String(now.getHours()).padStart(2, "0");       // "14"
  const mm = String(now.getMinutes()).padStart(2, "0");     // "21"
  const ss = String(now.getSeconds()).padStart(2, "0");     // "33"

  const random3 = String(Math.floor(Math.random() * 900) + 100); // 100–999

  return `${YY}${MM}${DD}${HH}${mm}${ss}${random3}`;
}

export async function generateUniqueReceiptId(): Promise<string> {
  let receiptId: string;
  let exists: boolean;

  do {
    receiptId = generateInvoiceNumber();
    const existing = await prisma.invoice.findFirst({
      where: { invoiceNumber: receiptId },
      select: { id: true }, // only fetch the id, no need for full record
    });
    exists = !!existing;
  } while (exists);

  return receiptId;
}