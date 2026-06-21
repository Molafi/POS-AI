import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';

const router = Router();

// GET /api/products - List products with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { category, search, active } = req.query;

    const where: Record<string, unknown> = {};

    if (category && category !== 'All') {
      where.category = category as string;
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    } else {
      where.isActive = true;
    }

    if (search) {
      where.name = { contains: search as string };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
