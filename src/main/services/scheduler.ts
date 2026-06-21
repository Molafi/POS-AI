import cron from 'node-cron';
import { getPrisma } from '../database';

let scheduledTasks: cron.ScheduledTask[] = [];

async function calculateDailySummary(): Promise<void> {
  try {
    const prisma = getPrisma();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = today.toISOString().split('T')[0];

    // Get all completed orders for today
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Determine top category by revenue
    const categoryRevenue: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const category = item.product?.category || 'Other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.total;
      }
    }

    const topCategory =
      Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Get refunds for today
    const refunds = await prisma.refund.findMany({
      where: {
        status: 'approved',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const refundCount = refunds.length;

    // Upsert daily summary
    await prisma.dailySummary.upsert({
      where: { date: dateString },
      create: {
        date: dateString,
        totalRevenue,
        totalOrders,
        totalItems,
        avgOrderValue,
        topCategory,
        totalRefunds,
        refundCount,
      },
      update: {
        totalRevenue,
        totalOrders,
        totalItems,
        avgOrderValue,
        topCategory,
        totalRefunds,
        refundCount,
      },
    });

    console.log(`Daily summary calculated for ${dateString}: Revenue=$${totalRevenue.toFixed(2)}, Orders=${totalOrders}`);
  } catch (error) {
    console.error('Failed to calculate daily summary:', error);
  }
}

export function startScheduler(): void {
  // Run daily summary at midnight
  const dailySummaryTask = cron.schedule('0 0 * * *', () => {
    console.log('Running daily summary calculation...');
    calculateDailySummary();
  });

  scheduledTasks.push(dailySummaryTask);
  console.log('Scheduler started: daily summary at midnight');
}

export function stopScheduler(): void {
  for (const task of scheduledTasks) {
    task.stop();
  }
  scheduledTasks = [];
  console.log('Scheduler stopped');
}

export { calculateDailySummary };
