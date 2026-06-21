import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: 'Invalid path parameters',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

// Common Zod schemas for reuse
export const paymentProcessSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('usd'),
  orderId: z.string().min(1, 'Order ID is required'),
  metadata: z.record(z.string()).optional(),
});

export const cashPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  amountPaid: z.number().positive('Amount paid must be positive'),
  changeDue: z.number().min(0).default(0),
});

export const splitPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  payments: z.array(
    z.object({
      method: z.enum(['cash', 'card', 'mobile']),
      amount: z.number().positive('Payment amount must be positive'),
    })
  ).min(2, 'Split payment requires at least 2 payment methods'),
});

export const receiptGenerateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  format: z.enum(['standard', 'thermal']).default('standard'),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  cost: z.number().min(0).default(0),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(5),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const orderCreateSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      discount: z.number().min(0).default(0),
      total: z.number().positive(),
    })
  ).min(1, 'Order must contain at least one item'),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'split']),
  customerId: z.string().nullable().optional(),
  cashierId: z.string().min(1),
});
