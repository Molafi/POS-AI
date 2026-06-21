import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PinLock from '../components/dashboard/PinLock';
import Sidebar from '../components/dashboard/Sidebar';
import type { DashboardTab } from '../components/dashboard/Sidebar';
import StatCards from '../components/dashboard/overview/StatCards';
import RevenueChart from '../components/dashboard/overview/RevenueChart';
import TopProducts from '../components/dashboard/overview/TopProducts';
import HourlyHeatmap from '../components/dashboard/overview/HourlyHeatmap';
import RecentTransactions from '../components/dashboard/overview/RecentTransactions';
import ProductTable from '../components/dashboard/products/ProductTable';
import AddProductWizard from '../components/dashboard/products/AddProductWizard';
import ABCAnalysis from '../components/dashboard/inventory/ABCAnalysis';
import StockLevels from '../components/dashboard/inventory/StockLevels';
import LowStockAlerts from '../components/dashboard/inventory/LowStockAlerts';
import RestockSuggestions from '../components/dashboard/inventory/RestockSuggestions';
import ExportButton from '../components/dashboard/inventory/ExportButton';
import OrderHistory from '../components/dashboard/orders/OrderHistory';
import OrderDetailModal from '../components/dashboard/orders/OrderDetailModal';
import DateRangePicker from '../components/dashboard/reports/DateRangePicker';
import SalesReport from '../components/dashboard/reports/SalesReport';
import ProfitReport from '../components/dashboard/reports/ProfitReport';
import ProductPerformance from '../components/dashboard/reports/ProductPerformance';
import PaymentBreakdown from '../components/dashboard/reports/PaymentBreakdown';
import AISummaryCard from '../components/dashboard/reports/AISummaryCard';
import ExportReport from '../components/dashboard/reports/ExportReport';
import BusinessInfo from '../components/dashboard/settings/BusinessInfo';
import TaxSettings from '../components/dashboard/settings/TaxSettings';
import PinManagement from '../components/dashboard/settings/PinManagement';
import ReceiptCustomization from '../components/dashboard/settings/ReceiptCustomization';
import UserManagement from '../components/dashboard/settings/UserManagement';
import APIKeys from '../components/dashboard/settings/APIKeys';
import ThemeToggle from '../components/dashboard/settings/ThemeToggle';
import SoundSettings from '../components/dashboard/settings/SoundSettings';
import BackupSettings from '../components/dashboard/settings/BackupSettings';
import { api } from '../lib/api';
import type { Product, Order } from '@shared/types';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reports state
  const [reportStart, setReportStart] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reportEnd, setReportEnd] = useState(new Date().toISOString().split('T')[0]);
  const [salesData, setSalesData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [profitData, setProfitData] = useState<{ date: string; revenue: number; grossProfit: number; netProfit: number; margin: number }[]>([]);
  const [productPerformance, setProductPerformance] = useState<{ productId: string; name: string; unitsSold: number; revenue: number; cost: number; profit: number }[]>([]);
  const [paymentData, setPaymentData] = useState<{ method: string; count: number; total: number; percentage: number }[]>([]);

  const fetchProducts = useCallback(async () => {
    const response = await api.get<Product[]>('/products?active=all');
    if (response.success && response.data) {
      setProducts(response.data);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const response = await api.get<Order[]>('/orders?limit=100');
    if (response.success && response.data) {
      setOrders(response.data);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    const response = await api.get<Record<string, string>>('/settings');
    if (response.success && response.data) {
      setSettings(response.data);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    const params = `?startDate=${reportStart}&endDate=${reportEnd}`;

    const [salesRes, profitRes, productsRes, paymentsRes] = await Promise.all([
      api.get<{ date: string; revenue: number; orders: number }[]>(`/reports/sales${params}`),
      api.get<{ date: string; revenue: number; grossProfit: number; netProfit: number; margin: number }[]>(`/reports/profit${params}`),
      api.get<{ productId: string; name: string; unitsSold: number; revenue: number; cost: number; profit: number }[]>(`/reports/products${params}`),
      api.get<{ method: string; count: number; total: number; percentage: number }[]>(`/reports/payments${params}`),
    ]);

    if (salesRes.success && salesRes.data) setSalesData(salesRes.data);
    if (profitRes.success && profitRes.data) setProfitData(profitRes.data);
    if (productsRes.success && productsRes.data) setProductPerformance(productsRes.data);
    if (paymentsRes.success && paymentsRes.data) setPaymentData(paymentsRes.data);
  }, [reportStart, reportEnd]);

  useEffect(() => {
    if (unlocked) {
      fetchProducts();
      fetchOrders();
      fetchSettings();
    }
  }, [unlocked, fetchProducts, fetchOrders, fetchSettings]);

  useEffect(() => {
    if (unlocked && activeTab === 'reports') {
      fetchReports();
    }
  }, [unlocked, activeTab, fetchReports]);

  // Overview metrics
  const getOverviewMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const yesterdayOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= yesterday && d < today;
    });

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + o.total, 0);
    const ordersCount = todayOrders.length;
    const avgOrderValue = ordersCount > 0 ? todayRevenue / ordersCount : 0;

    // Estimate cost (60% of revenue as fallback)
    const totalCost = todayRevenue * 0.55;
    const grossProfit = todayRevenue - totalCost;
    const netProfit = grossProfit - (todayRevenue * 0.05);
    const profitMargin = todayRevenue > 0 ? (grossProfit / todayRevenue) * 100 : 0;

    return { todayRevenue, yesterdayRevenue, ordersCount, avgOrderValue, grossProfit, netProfit, profitMargin };
  };

  const getRevenueChartData = () => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const revenue = orders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od >= dayStart && od <= dayEnd;
        })
        .reduce((s, o) => s + o.total, 0);

      days.push({ date: dateStr, revenue });
    }
    return days;
  };

  const getTopProducts = () => {
    const productRevenue: Record<string, { name: string; revenue: number }> = {};
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          const name = item.product?.name || 'Unknown';
          if (!productRevenue[item.productId]) {
            productRevenue[item.productId] = { name, revenue: 0 };
          }
          productRevenue[item.productId].revenue += item.total;
        }
      }
    }
    return Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  const getHourlyData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hourly: { hour: number; revenue: number }[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, revenue: 0 }));
    for (const order of orders) {
      const d = new Date(order.createdAt);
      if (d >= today) {
        hourly[d.getHours()].revenue += order.total;
      }
    }
    return hourly;
  };

  const getABCData = () => {
    const productRevenue: Record<string, { productId: string; name: string; revenue: number }> = {};
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          const name = item.product?.name || 'Unknown';
          if (!productRevenue[item.productId]) {
            productRevenue[item.productId] = { productId: item.productId, name, revenue: 0 };
          }
          productRevenue[item.productId].revenue += item.total;
        }
      }
    }
    return Object.values(productRevenue);
  };

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 p-6 overflow-y-auto h-full">
            <StatCards data={getOverviewMetrics()} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={getRevenueChartData()} />
              <TopProducts data={getTopProducts()} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyHeatmap data={getHourlyData()} />
              <RecentTransactions orders={orders} />
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="p-6 overflow-y-auto h-full">
            <ProductTable
              products={products}
              onRefresh={fetchProducts}
              onAddProduct={() => setShowAddProduct(true)}
            />
            <AnimatePresence>
              {showAddProduct && (
                <AddProductWizard
                  onClose={() => setShowAddProduct(false)}
                  onProductAdded={() => {
                    setShowAddProduct(false);
                    fetchProducts();
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        );

      case 'inventory':
        return (
          <div className="p-6 overflow-y-auto h-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-apex-text-primary">Inventory Management</h2>
              <ExportButton products={products} />
            </div>
            <ABCAnalysis products={getABCData()} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockLevels products={products} />
              <LowStockAlerts products={products} />
            </div>
            <RestockSuggestions products={products} salesData={{}} />
          </div>
        );

      case 'orders':
        return (
          <div className="p-6 overflow-y-auto h-full space-y-4">
            <h2 className="text-lg font-heading font-semibold text-apex-text-primary">Orders & Refunds</h2>
            <OrderHistory
              orders={orders}
              onSelectOrder={(order) => setSelectedOrder(order)}
            />
            <AnimatePresence>
              {selectedOrder && (
                <OrderDetailModal
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onRefund={() => {
                    setSelectedOrder(null);
                    fetchOrders();
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        );

      case 'reports':
        return (
          <div className="p-6 overflow-y-auto h-full space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-heading font-semibold text-apex-text-primary">Reports</h2>
              <ExportReport reportType="sales" data={salesData} title="Sales Report" />
            </div>
            <DateRangePicker
              startDate={reportStart}
              endDate={reportEnd}
              onStartChange={setReportStart}
              onEndChange={setReportEnd}
            />
            <SalesReport data={salesData} />
            <ProfitReport data={profitData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentBreakdown data={paymentData} />
              <AISummaryCard salesData={{ salesData, profitData, productPerformance }} />
            </div>
            <ProductPerformance data={productPerformance} />
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 overflow-y-auto h-full space-y-8">
            <h2 className="text-lg font-heading font-semibold text-apex-text-primary">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <BusinessInfo settings={settings} onSave={fetchSettings} />
                <TaxSettings settings={settings} onSave={fetchSettings} />
                <PinManagement onSave={fetchSettings} />
                <ReceiptCustomization settings={settings} onSave={fetchSettings} />
              </div>
              <div className="space-y-8">
                <UserManagement onSave={fetchSettings} />
                <APIKeys settings={settings} onSave={fetchSettings} />
                <ThemeToggle settings={settings} onSave={fetchSettings} />
                <SoundSettings settings={settings} onSave={fetchSettings} />
                <BackupSettings settings={settings} onSave={fetchSettings} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => navigate('/cashier')}
      />
      <div className="flex-1 bg-apex-base overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
