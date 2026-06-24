import React, { useState } from 'react';
import type { Order } from '@shared/types';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  completed: 'bg-apex-success/10 text-apex-success',
  pending: 'bg-apex-warning/10 text-apex-warning',
  refunded: 'bg-apex-danger/10 text-apex-danger',
  cancelled: 'bg-apex-text-muted/10 text-apex-text-muted',
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onSelectOrder }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filtered = orders.filter((order) => {
    if (dateFilter) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDate !== dateFilter) return false;
    }
    if (methodFilter && order.paymentMethod !== methodFilter) return false;
    if (statusFilter && order.status !== statusFilter) return false;
    if (minAmount && order.total < parseFloat(minAmount)) return false;
    if (maxAmount && order.total > parseFloat(maxAmount)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-apex-surface border border-apex-border rounded-xl">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        >
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="number"
          placeholder="Min $"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="w-24 px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
        <input
          type="number"
          placeholder="Max $"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="w-24 px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
        {(dateFilter || methodFilter || statusFilter || minAmount || maxAmount) && (
          <button
            onClick={() => {
              setDateFilter('');
              setMethodFilter('');
              setStatusFilter('');
              setMinAmount('');
              setMaxAmount('');
            }}
            className="px-3 py-1.5 text-sm text-apex-text-muted hover:text-apex-text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Order List */}
      <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-3 text-left font-medium">Order #</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
              <th className="px-4 py-3 text-right font-medium">Tax</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="border-b border-apex-border/50 hover:bg-apex-elevated/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-2.5 text-apex-text-secondary text-xs">
                  {new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2.5 capitalize text-apex-text-secondary">{order.paymentMethod}</td>
                <td className="px-4 py-2.5 text-right font-mono">${order.subtotal.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-apex-text-secondary">${order.tax.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono font-medium">${order.total.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-apex-text-muted">
                  No orders match the filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
