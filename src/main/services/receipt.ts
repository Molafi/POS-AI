import PDFDocument from 'pdfkit';
import { getPrisma } from '../database';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface ReceiptData {
  orderNumber: string;
  date: Date;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  changeDue?: number;
  cashierName: string;
  businessName?: string;
  businessAddress?: string;
  thankYouMessage?: string;
}

export interface ReceiptOptions {
  format?: 'standard' | 'thermal';
  width?: number;
}

async function getBusinessSettings(): Promise<{
  businessName: string;
  businessAddress: string;
  thankYouMessage: string;
  taxRate: number;
}> {
  try {
    const prisma = getPrisma();
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['business_name', 'business_address', 'thank_you_message', 'tax_rate'],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return {
      businessName: settingsMap['business_name'] || 'APEX POS',
      businessAddress: settingsMap['business_address'] || '',
      thankYouMessage: settingsMap['thank_you_message'] || 'Thank you for your purchase!',
      taxRate: parseFloat(settingsMap['tax_rate'] || '16'),
    };
  } catch {
    return {
      businessName: 'APEX POS',
      businessAddress: '',
      thankYouMessage: 'Thank you for your purchase!',
      taxRate: 16,
    };
  }
}

export async function generateReceipt(
  data: ReceiptData,
  options: ReceiptOptions = {}
): Promise<Buffer> {
  const { format = 'standard' } = options;
  const isThermal = format === 'thermal';
  const pageWidth = isThermal ? 226 : 612; // 80mm = ~226pt, standard = letter
  const pageHeight = isThermal ? 800 : 792;
  const margin = isThermal ? 10 : 50;
  const contentWidth = pageWidth - margin * 2;

  const businessSettings = await getBusinessSettings();
  const businessName = data.businessName || businessSettings.businessName;
  const businessAddress = data.businessAddress || businessSettings.businessAddress;
  const thankYouMessage = data.thankYouMessage || businessSettings.thankYouMessage;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: isThermal ? [pageWidth, pageHeight] : 'LETTER',
      margins: { top: margin, bottom: margin, left: margin, right: margin },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    const fontSize = isThermal ? 8 : 12;
    const headerSize = isThermal ? 12 : 18;
    const smallSize = isThermal ? 7 : 10;

    // Header - Business name
    doc
      .fontSize(headerSize)
      .font('Helvetica-Bold')
      .text(businessName, { align: 'center' });

    if (businessAddress) {
      doc.fontSize(smallSize).font('Helvetica').text(businessAddress, { align: 'center' });
    }

    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(margin, doc.y)
      .lineTo(pageWidth - margin, doc.y)
      .stroke();
    doc.moveDown(0.3);

    // Order info
    doc.fontSize(fontSize).font('Helvetica');
    doc.text(`Order: ${data.orderNumber}`);
    doc.text(`Date: ${data.date.toLocaleDateString()} ${data.date.toLocaleTimeString()}`);
    doc.text(`Cashier: ${data.cashierName}`);
    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(margin, doc.y)
      .lineTo(pageWidth - margin, doc.y)
      .stroke();
    doc.moveDown(0.3);

    // Items header
    doc.fontSize(smallSize).font('Helvetica-Bold');
    const colItem = margin;
    const colQty = margin + contentWidth * 0.5;
    const colPrice = margin + contentWidth * 0.7;
    const colTotal = margin + contentWidth * 0.85;

    doc.text('Item', colItem, doc.y, { continued: false });
    const headerY = doc.y - doc.currentLineHeight();
    doc.text('Qty', colQty, headerY, { continued: false });
    doc.text('Price', colPrice, headerY, { continued: false });
    doc.text('Total', colTotal, headerY, { continued: false });
    doc.moveDown(0.3);

    // Items
    doc.fontSize(fontSize).font('Helvetica');
    for (const item of data.items) {
      const itemY = doc.y;
      const itemName =
        item.name.length > (isThermal ? 15 : 30)
          ? item.name.substring(0, isThermal ? 15 : 30) + '...'
          : item.name;

      doc.text(itemName, colItem, itemY);
      doc.text(String(item.quantity), colQty, itemY);
      doc.text(`$${item.unitPrice.toFixed(2)}`, colPrice, itemY);
      doc.text(`$${item.total.toFixed(2)}`, colTotal, itemY);

      if (item.discount > 0) {
        doc.fontSize(smallSize).text(`  Discount: -$${item.discount.toFixed(2)}`, colItem);
        doc.fontSize(fontSize);
      }
    }

    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(margin, doc.y)
      .lineTo(pageWidth - margin, doc.y)
      .stroke();
    doc.moveDown(0.3);

    // Totals
    doc.fontSize(fontSize).font('Helvetica');
    doc.text(`Subtotal: $${data.subtotal.toFixed(2)}`, { align: 'right' });

    if (data.discount > 0) {
      doc.text(`Discount: -$${data.discount.toFixed(2)}`, { align: 'right' });
    }

    doc.text(`Tax (${data.taxRate}%): $${data.tax.toFixed(2)}`, { align: 'right' });

    doc.moveDown(0.2);
    doc.fontSize(headerSize).font('Helvetica-Bold');
    doc.text(`TOTAL: $${data.total.toFixed(2)}`, { align: 'right' });

    doc.moveDown(0.5);

    // Payment info
    doc.fontSize(fontSize).font('Helvetica');
    doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`);

    if (data.amountPaid !== undefined) {
      doc.text(`Amount Paid: $${data.amountPaid.toFixed(2)}`);
    }

    if (data.changeDue !== undefined && data.changeDue > 0) {
      doc.text(`Change Due: $${data.changeDue.toFixed(2)}`);
    }

    doc.moveDown(1);

    // Divider
    doc
      .moveTo(margin, doc.y)
      .lineTo(pageWidth - margin, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Thank you message
    doc.fontSize(smallSize).font('Helvetica').text(thankYouMessage, { align: 'center' });

    doc.end();
  });
}
