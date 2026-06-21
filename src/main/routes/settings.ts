import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/settings - Get all settings or by category
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { category } = req.query;

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category as string;
    }

    const settings = await prisma.setting.findMany({ where });
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    res.json({ success: true, data: settingsMap });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/settings - Update settings (key-value pairs)
router.put('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      res.status(400).json({ success: false, error: 'Settings object is required' });
      return;
    }

    const entries = Object.entries(settings) as [string, string][];
    for (const [key, value] of entries) {
      const category = key.split('_')[0] || 'general';
      await prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value), category },
        update: { value: String(value) },
      });
    }

    res.json({ success: true, data: { message: 'Settings updated' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/settings/verify-pin - Verify manager PIN
router.post('/verify-pin', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { pin } = req.body;

    if (!pin) {
      res.status(400).json({ success: false, error: 'PIN is required' });
      return;
    }

    const pinSetting = await prisma.setting.findUnique({
      where: { key: 'manager_pin' },
    });

    if (!pinSetting) {
      // Default PIN is 1234 if not set
      const isValid = pin === '1234';
      res.json({ success: true, data: { valid: isValid } });
      return;
    }

    const isValid = await bcrypt.compare(pin, pinSetting.value);
    res.json({ success: true, data: { valid: isValid } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PIN verification failed';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/settings/change-pin - Change manager PIN
router.post('/change-pin', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { currentPin, newPin } = req.body;

    if (!newPin || newPin.length !== 4) {
      res.status(400).json({ success: false, error: 'New PIN must be 4 digits' });
      return;
    }

    // Verify current PIN
    const pinSetting = await prisma.setting.findUnique({
      where: { key: 'manager_pin' },
    });

    if (pinSetting) {
      const isValid = await bcrypt.compare(currentPin, pinSetting.value);
      if (!isValid) {
        res.status(403).json({ success: false, error: 'Current PIN is incorrect' });
        return;
      }
    } else {
      if (currentPin !== '1234') {
        res.status(403).json({ success: false, error: 'Current PIN is incorrect' });
        return;
      }
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    await prisma.setting.upsert({
      where: { key: 'manager_pin' },
      create: { key: 'manager_pin', value: hashedPin, category: 'security' },
      update: { value: hashedPin },
    });

    res.json({ success: true, data: { message: 'PIN changed successfully' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change PIN';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/settings/users - Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/settings/users - Create a user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { username, name, role, pin } = req.body;

    if (!username || !name) {
      res.status(400).json({ success: false, error: 'Username and name are required' });
      return;
    }

    const hashedPassword = await bcrypt.hash(pin || '0000', 10);
    const hashedPin = pin ? await bcrypt.hash(pin, 10) : null;

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role || 'cashier',
        pin: hashedPin,
      },
      select: { id: true, username: true, name: true, role: true, isActive: true },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/settings/users/:id - Delete a user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, data: { message: 'User deactivated' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
