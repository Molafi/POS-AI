import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const sampleProducts = [
  // Food (4 items)
  { name: 'Classic Burger', sku: 'FOOD-001', category: 'Food', price: 8.99, cost: 3.50, stock: 50, minStock: 10 },
  { name: 'Caesar Salad', sku: 'FOOD-002', category: 'Food', price: 7.49, cost: 2.80, stock: 40, minStock: 8 },
  { name: 'Grilled Chicken Wrap', sku: 'FOOD-003', category: 'Food', price: 9.99, cost: 4.00, stock: 35, minStock: 10 },
  { name: 'Margherita Pizza', sku: 'FOOD-004', category: 'Food', price: 12.99, cost: 4.50, stock: 30, minStock: 8 },

  // Drink (4 items)
  { name: 'Iced Latte', sku: 'DRK-001', category: 'Drink', price: 4.99, cost: 1.20, stock: 100, minStock: 20 },
  { name: 'Fresh Orange Juice', sku: 'DRK-002', category: 'Drink', price: 3.99, cost: 1.50, stock: 80, minStock: 15 },
  { name: 'Sparkling Water', sku: 'DRK-003', category: 'Drink', price: 2.49, cost: 0.60, stock: 120, minStock: 25 },
  { name: 'Green Smoothie', sku: 'DRK-004', category: 'Drink', price: 5.99, cost: 2.00, stock: 60, minStock: 12 },

  // Dessert (3 items)
  { name: 'Chocolate Brownie', sku: 'DST-001', category: 'Dessert', price: 4.49, cost: 1.30, stock: 45, minStock: 10 },
  { name: 'Vanilla Ice Cream', sku: 'DST-002', category: 'Dessert', price: 3.99, cost: 1.00, stock: 50, minStock: 10 },
  { name: 'Apple Pie Slice', sku: 'DST-003', category: 'Dessert', price: 5.49, cost: 1.80, stock: 30, minStock: 8 },

  // Retail (3 items)
  { name: 'Reusable Water Bottle', sku: 'RTL-001', category: 'Retail', price: 14.99, cost: 6.00, stock: 25, minStock: 5 },
  { name: 'Tote Bag', sku: 'RTL-002', category: 'Retail', price: 9.99, cost: 3.50, stock: 40, minStock: 8 },
  { name: 'Gift Card $25', sku: 'RTL-003', category: 'Retail', price: 25.00, cost: 25.00, stock: 100, minStock: 20 },

  // Combo (2 items)
  { name: 'Burger + Fries + Drink Combo', sku: 'CMB-001', category: 'Combo', price: 13.99, cost: 5.50, stock: 30, minStock: 10 },
  { name: 'Breakfast Special', sku: 'CMB-002', category: 'Combo', price: 10.99, cost: 4.00, stock: 25, minStock: 8 },

  // Electronics (2 items)
  { name: 'USB-C Charging Cable', sku: 'ELC-001', category: 'Electronics', price: 12.99, cost: 4.00, stock: 50, minStock: 10 },
  { name: 'Wireless Earbuds', sku: 'ELC-002', category: 'Electronics', price: 29.99, cost: 12.00, stock: 20, minStock: 5 },

  // Clothing (1 item)
  { name: 'Branded T-Shirt', sku: 'CLT-001', category: 'Clothing', price: 19.99, cost: 7.00, stock: 30, minStock: 5 },

  // Other (1 item)
  { name: 'Loyalty Card Holder', sku: 'OTH-001', category: 'Other', price: 2.99, cost: 0.50, stock: 75, minStock: 15 },
];

async function main() {
  console.log('Seeding database...');

  // Create products
  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }
  console.log(`Created ${sampleProducts.length} products`);

  // Create default manager user
  const hashedPin = await bcrypt.hash('1234', SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash('manager123', SALT_ROUNDS);

  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {
      name: 'Manager',
      pin: hashedPin,
      role: 'manager',
      password: hashedPassword,
    },
    create: {
      username: 'manager',
      password: hashedPassword,
      name: 'Manager',
      role: 'manager',
      pin: hashedPin,
      isActive: true,
    },
  });
  console.log('Created default manager user (PIN: 1234)');

  // Create default settings
  const defaultSettings = [
    { key: 'tax_rate', value: '16', category: 'general' },
    { key: 'business_name', value: 'APEX POS', category: 'general' },
    { key: 'currency', value: 'USD', category: 'general' },
    { key: 'business_address', value: '', category: 'general' },
    { key: 'thank_you_message', value: 'Thank you for your purchase!', category: 'general' },
    { key: 'receipt_format', value: 'standard', category: 'receipt' },
    { key: 'auto_backup', value: 'true', category: 'system' },
    { key: 'backup_interval', value: 'daily', category: 'system' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category },
      create: setting,
    });
  }
  console.log(`Created ${defaultSettings.length} default settings`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
