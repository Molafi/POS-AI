import React from 'react';
import type { Order } from '@shared/types';

interface RecentTransactionsProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  completed: 'bg-apex-success/10 text-apex-success',
  pending: 'bg-apex-warning/10 text-apex-warning',
  refunded: 'bg-apex-danger/10 text-apex-danger',
  cancelled: 'bg-apex-text-muted/10 text-apex-text-muted',
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ orders }) => {
  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-apex-text-secondary border-b border-apex-border">
              <th className="text-left pb-3 font-medium">Order #</th>
              <th className="text-left pb-3 font-medium">Time</th>
              <th className="text-left pb-3 font-medium">Payment</th>
              <th className="text-right pb-3 font-medium">Total</th>
              <th className="text-center pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((order) => (
              <tr key={order.id} className="border-b border-apex-border/50 hover:bg-apex-elevated/50 transition-colors">
                <td className="py-2.5 font-mono text-xs">{order.orderNumber}</td>
                <td className="py-2.5 text-apex-text-secondary text-xs">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2.5 capitalize text-apex-text-secondary text-xs">{order.paymentMethod}</td>
                <td className="py-2.5 text-right font-mono">${order.total.toFixed(2)}</td>
                <td className="py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-apex-text-muted">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
