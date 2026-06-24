import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';
import { getIO } from '../server';

const router = Router();

// POST /api/refunds - Process a refund
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { orderId, amount, reason, items, processedBy, type } = req.body;

    if (!orderId || !amount || !reason) {
      res.status(400).json({ success: false, error: 'orderId, amount, and reason are required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, refunds: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status === 'refunded' || order.status === 'cancelled') {
      res.status(400).json({ success: false, error: 'Order has already been refunded or cancelled' });
      return;
    }

    const existingRefundTotal = order.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (existingRefundTotal + amount > order.total) {
      res.status(400).json({ success: false, error: 'Refund amount exceeds order total' });
      return;
    }

    const refund = await prisma.$transaction(async (tx) => {
      // Create the refund record
      const newRefund = await tx.refund.create({
        data: {
          orderId,
          amount,
          reason,
          status: 'approved',
          processedBy: processedBy || null,
        },
      });

      // Restore stock for refunded items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      } else if (type === 'full') {
        // Full refund - restore all items
        for (const orderItem of order.items) {
          await tx.product.update({
            where: { id: orderItem.productId },
            data: { stock: { increment: orderItem.quantity } },
          });
        }
      }

      // Update order status
      const totalRefunded = existingRefundTotal + amount;
      const newStatus = totalRefunded >= order.total ? 'refunded' : 'completed';
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      return newRefund;
    });

    const io = getIO();
    if (io) {
      io.emit('order:updated', { ...order, status: 'refunded' });
    }

    res.json({ success: true, data: refund });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process refund';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/refunds/void - Void an order (before close of day)
router.post('/void', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { orderId, reason, processedBy } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, error: 'orderId is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Check if order is from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate.getTime() !== today.getTime()) {
      res.status(400).json({ success: false, error: 'Can only void orders from today' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Create refund record
      await tx.refund.create({
        data: {
          orderId,
          amount: order.total,
          reason: reason || 'Voided',
          status: 'approved',
          processedBy: processedBy || null,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
      });
    });

    const io = getIO();
    if (io) {
      io.emit('order:updated', { ...order, status: 'cancelled' });
    }

    res.json({ success: true, data: { message: 'Order voided successfully' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to void order';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
