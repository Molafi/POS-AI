import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';

const router = Router();

// POST /api/cart/save-draft - Save cart as draft
router.post('/save-draft', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { items, customerTier, customerId } = req.body;

    // Store draft in settings table with a special key
    const draftData = JSON.stringify({ items, customerTier, customerId, savedAt: new Date().toISOString() });

    await prisma.setting.upsert({
      where: { key: 'cart_draft' },
      create: { key: 'cart_draft', value: draftData, category: 'cart' },
      update: { value: draftData },
    });

    res.json({ success: true, data: { message: 'Draft saved successfully' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save draft';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/cart/draft - Load cart draft
router.get('/draft', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();

    const setting = await prisma.setting.findUnique({
      where: { key: 'cart_draft' },
    });

    if (!setting) {
      res.json({ success: true, data: null });
      return;
    }

    const draftData = JSON.parse(setting.value);
    res.json({ success: true, data: draftData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load draft';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
