import { Router, Request, Response } from 'express';
import { getPrisma } from '../database';

const router = Router();

// GET /api/reports/sales - Sales report by date range
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { startDate, endDate, groupBy } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ['completed', 'refunded'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day/week/month
    const grouped: Record<string, { date: string; revenue: number; orders: number; items: number }> = {};

    for (const order of orders) {
      let key: string;
      const d = new Date(order.createdAt);

      if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = d.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, revenue: 0, orders: 0, items: 0 };
      }
      grouped[key].revenue += order.total;
      grouped[key].orders += 1;
    }

    const data = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate sales report';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/reports/profit - Profit report
router.get('/profit', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ['completed', 'refunded'] },
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const dailyProfit: Record<string, { date: string; revenue: number; cost: number; grossProfit: number; netProfit: number; margin: number }> = {};

    for (const order of orders) {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyProfit[date]) {
        dailyProfit[date] = { date, revenue: 0, cost: 0, grossProfit: 0, netProfit: 0, margin: 0 };
      }

      dailyProfit[date].revenue += order.total;
      for (const item of order.items) {
        dailyProfit[date].cost += (item.product?.cost || 0) * item.quantity;
      }
    }

    // Calculate profit metrics
    for (const day of Object.values(dailyProfit)) {
      day.grossProfit = day.revenue - day.cost;
      day.netProfit = day.grossProfit - (day.revenue * 0.05); // 5% operating expenses estimate
      day.margin = day.revenue > 0 ? (day.grossProfit / day.revenue) * 100 : 0;
    }

    const data = Object.values(dailyProfit).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate profit report';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/reports/products - Product performance report
router.get('/products', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: { product: true },
    });

    const productMap: Record<string, { productId: string; name: string; unitsSold: number; revenue: number; cost: number; profit: number }> = {};

    for (const item of orderItems) {
      const pid = item.productId;
      if (!productMap[pid]) {
        productMap[pid] = {
          productId: pid,
          name: item.product?.name || 'Unknown',
          unitsSold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      productMap[pid].unitsSold += item.quantity;
      productMap[pid].revenue += item.total;
      productMap[pid].cost += (item.product?.cost || 0) * item.quantity;
    }

    for (const product of Object.values(productMap)) {
      product.profit = product.revenue - product.cost;
    }

    const data = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate product report';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/reports/payments - Payment methods breakdown
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ['completed', 'refunded'] },
      },
    });

    const breakdown: Record<string, { method: string; count: number; total: number; percentage: number }> = {};

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    for (const order of orders) {
      const method = order.paymentMethod;
      if (!breakdown[method]) {
        breakdown[method] = { method, count: 0, total: 0, percentage: 0 };
      }
      breakdown[method].count += 1;
      breakdown[method].total += order.total;
    }

    for (const entry of Object.values(breakdown)) {
      entry.percentage = totalRevenue > 0 ? (entry.total / totalRevenue) * 100 : 0;
    }

    const data = Object.values(breakdown).sort((a, b) => b.total - a.total);
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate payment report';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/reports/pdf - Generate PDF report
router.post('/pdf', async (req: Request, res: Response) => {
  try {
    const { title, data, type } = req.body;

    // Dynamic import of pdfkit
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'report'}.pdf"`);
      res.send(pdfBuffer);
    });

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(title || 'APEX POS Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Content based on type
    if (type === 'sales' && Array.isArray(data)) {
      doc.fontSize(14).font('Helvetica-Bold').text('Sales Report');
      doc.moveDown();

      for (const row of data) {
        doc.fontSize(10).font('Helvetica').text(
          `${row.date}: Revenue $${row.revenue?.toFixed(2) || '0.00'} | Orders: ${row.orders || 0}`
        );
      }
    } else if (type === 'profit' && Array.isArray(data)) {
      doc.fontSize(14).font('Helvetica-Bold').text('Profit Report');
      doc.moveDown();

      for (const row of data) {
        doc.fontSize(10).font('Helvetica').text(
          `${row.date}: Revenue $${row.revenue?.toFixed(2)} | Profit $${row.grossProfit?.toFixed(2)} | Margin ${row.margin?.toFixed(1)}%`
        );
      }
    } else if (type === 'products' && Array.isArray(data)) {
      doc.fontSize(14).font('Helvetica-Bold').text('Product Performance');
      doc.moveDown();

      for (const row of data) {
        doc.fontSize(10).font('Helvetica').text(
          `${row.name}: ${row.unitsSold} units | Revenue $${row.revenue?.toFixed(2)} | Profit $${row.profit?.toFixed(2)}`
        );
      }
    } else {
      doc.fontSize(12).font('Helvetica').text(JSON.stringify(data, null, 2));
    }

    doc.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate PDF';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
