import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';
import { validateBody } from '../middleware/validation';
import { productUpdateSchema } from '../middleware/validation';

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

// POST /api/products - Create a product
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { name, sku, barcode, category, price, cost, stock, minStock, imageUrl, isActive } = req.body;

    if (!name || !category) {
      res.status(400).json({ success: false, error: 'Name and category are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
        barcode: barcode || null,
        category,
        price: price || 0,
        cost: cost || 0,
        stock: stock || 0,
        minStock: minStock || 5,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', validateBody(productUpdateSchema), async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, data: { message: 'Product deactivated' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
