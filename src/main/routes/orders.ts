import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { getPrisma } from '../database';
import { getIO } from '../server';

const router = Router();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// POST /api/orders - Create a new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { items, subtotal, tax, discount, total, paymentMethod, customerId, cashierId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Order must contain at least one item' });
      return;
    }

    // Generate order number using timestamp + random to avoid race conditions
    const orderNumber = generateOrderNumber();

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'completed',
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          customerId: customerId || null,
          cashierId: cashierId || 'system',
          items: {
            create: items.map((item: { productId: string; quantity: number; unitPrice: number; discount: number; total: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total,
            })),
          },
        },
        include: { items: true },
      });

      // Deduct stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update co-occurrence matrix
      const productIds = items.map((item: { productId: string }) => item.productId);
      for (let i = 0; i < productIds.length; i++) {
        for (let j = i + 1; j < productIds.length; j++) {
          const [productAId, productBId] = [productIds[i], productIds[j]].sort();
          await tx.coOccurrence.upsert({
            where: {
              productAId_productBId: { productAId, productBId },
            },
            create: { productAId, productBId, count: 1 },
            update: { count: { increment: 1 } },
          });
        }
      }

      return newOrder;
    });

    // Emit socket event
    const io = getIO();
    if (io) {
      io.emit('order:created', order);
      // Emit stock updates
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          io.emit('stock:updated', { productId: product.id, stock: product.stock });
        }
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/orders - List orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { status, limit } = req.query;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status as string;
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string, 10) : 50,
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
