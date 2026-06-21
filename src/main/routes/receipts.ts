import { Router, Request, Response } from 'express';
import { generateReceipt } from '../services/receipt';
import { validateBody } from '../middleware/validation';
import { receiptGenerateSchema } from '../middleware/validation';
import { getPrisma } from '../database';

const router = Router();

// POST /api/receipts/generate - Generate a receipt PDF
router.post('/generate', validateBody(receiptGenerateSchema), async (req: Request, res: Response) => {
  try {
    const { orderId, format } = req.body;
    const prisma = getPrisma();

    // Fetch order with items and cashier
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        cashier: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Get tax rate from settings
    const taxRateSetting = await prisma.setting.findUnique({
      where: { key: 'tax_rate' },
    });
    const taxRate = taxRateSetting ? parseFloat(taxRateSetting.value) : 16;

    // Build receipt data
    const receiptData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      items: order.items.map((item) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      taxRate,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      cashierName: order.cashier?.name || 'System',
    };

    const pdfBuffer = await generateReceipt(receiptData, { format });

    // Return as base64
    const base64 = pdfBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        orderId,
        format,
        pdf: base64,
        mimeType: 'application/pdf',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate receipt';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
