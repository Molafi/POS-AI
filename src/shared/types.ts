// Product types
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerId: string | null;
  cashierId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  refunds?: Refund[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  createdAt: Date;
  product?: Product;
}

// Refund types
export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  processedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  pin: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Co-occurrence types
export interface CoOccurrence {
  id: string;
  productAId: string;
  productBId: string;
  count: number;
  updatedAt: Date;
}

// Setting types
export interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: Date;
}

// Daily Summary types
export interface DailySummary {
  id: string;
  date: string;
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  avgOrderValue: number;
  topCategory: string | null;
  totalRefunds: number;
  refundCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// UI Types
export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'split';

export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';

export type RefundStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'admin' | 'manager' | 'cashier';

export type CustomerTier = 'standard' | 'silver' | 'gold' | 'platinum';

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface DashboardMetrics {
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  topProducts: Product[];
  revenueByHour: { hour: number; revenue: number }[];
  categoryBreakdown: { category: string; revenue: number; count: number }[];
}

export interface ABCItem {
  productId: string;
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  category: 'A' | 'B' | 'C';
}

export interface EMAResult {
  date: string;
  actual: number;
  ema: number;
}

export interface RecommendedProduct {
  productId: string;
  name: string;
  score: number;
}

export interface SocketEvents {
  'order:created': Order;
  'order:updated': Order;
  'stock:updated': { productId: string; stock: number };
  'notification': { type: string; message: string };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
