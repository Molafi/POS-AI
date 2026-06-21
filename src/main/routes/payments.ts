import { Router, Request, Response } from 'express';
import { createPaymentIntent, confirmPayment, cancelPayment, isStripeConfigured } from '../services/stripe';
import { validateBody } from '../middleware/validation';
import { paymentProcessSchema, cashPaymentSchema, splitPaymentSchema } from '../middleware/validation';
import { getPrisma } from '../database';

const router = Router();

// POST /api/payments/process - Process a card payment via Stripe
router.post('/process', validateBody(paymentProcessSchema), async (req: Request, res: Response) => {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({
        success: false,
        error: 'Card payments are not configured. Please set up Stripe in settings.',
      });
      return;
    }

    const { amount, currency, orderId, metadata } = req.body;

    const paymentIntent = await createPaymentIntent(amount, currency, {
      orderId,
      ...metadata,
    });

    res.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment processing failed';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/payments/confirm - Confirm a payment intent
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({ success: false, error: 'Payment intent ID is required' });
      return;
    }

    const result = await confirmPayment(paymentIntentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment confirmation failed';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/payments/cash - Record a cash payment
router.post('/cash', validateBody(cashPaymentSchema), async (req: Request, res: Response) => {
  try {
    const { orderId, amount, amountPaid, changeDue } = req.body;
    const prisma = getPrisma();

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Update order payment method
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: 'cash' },
    });

    res.json({
      success: true,
      data: {
        orderId,
        method: 'cash',
        amount,
        amountPaid,
        changeDue,
        status: 'completed',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cash payment recording failed';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/payments/split - Handle split payments
router.post('/split', validateBody(splitPaymentSchema), async (req: Request, res: Response) => {
  try {
    const { orderId, totalAmount, payments } = req.body;
    const prisma = getPrisma();

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Verify total matches
    const paymentTotal = payments.reduce(
      (sum: number, p: { amount: number }) => sum + p.amount,
      0
    );
    if (Math.abs(paymentTotal - totalAmount) > 0.01) {
      res.status(400).json({
        success: false,
        error: 'Payment amounts do not match the total',
      });
      return;
    }

    // Process card payments if any
    const results: Array<{ method: string; amount: number; paymentIntentId?: string; status: string }> = [];
    const completedIntents: string[] = [];

    try {
      for (const payment of payments) {
        if (payment.method === 'card') {
          if (!isStripeConfigured()) {
            // Cancel any previously created intents before returning error
            for (const intentId of completedIntents) {
              try {
                await cancelPayment(intentId);
              } catch {
                // Best effort cancellation
              }
            }
            res.status(503).json({
              success: false,
              error: 'Card payments are not configured.',
            });
            return;
          }

          const intent = await createPaymentIntent(payment.amount, 'usd', { orderId });
          completedIntents.push(intent.id);
          results.push({
            method: 'card',
            amount: payment.amount,
            paymentIntentId: intent.id,
            status: intent.status,
          });
        } else {
          results.push({
            method: payment.method,
            amount: payment.amount,
            status: 'completed',
          });
        }
      }
    } catch (error) {
      // If any payment fails, cancel all previously created payment intents
      for (const intentId of completedIntents) {
        try {
          await cancelPayment(intentId);
        } catch {
          // Best effort cancellation
        }
      }
      const message = error instanceof Error ? error.message : 'Split payment failed';
      res.status(500).json({ success: false, error: message });
      return;
    }

    // Update order payment method
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: 'split' },
    });

    res.json({
      success: true,
      data: {
        orderId,
        totalAmount,
        payments: results,
        status: 'completed',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Split payment failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
