import React from 'react';
import { motion } from 'framer-motion';
import type { Order } from '@shared/types';
import RefundButton from './RefundButton';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onRefund: () => void;
}

const statusColors: Record<string, string> = {
  completed: 'bg-apex-success/10 text-apex-success',
  pending: 'bg-apex-warning/10 text-apex-warning',
  refunded: 'bg-apex-danger/10 text-apex-danger',
  cancelled: 'bg-apex-text-muted/10 text-apex-text-muted',
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onRefund }) => {
  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head><title>Receipt - ${order.orderNumber}</title></head>
        <body style="font-family: monospace; max-width: 280px; margin: 0 auto; padding: 20px;">
          <h2 style="text-align:center;">APEX POS</h2>
          <p style="text-align:center;">${new Date(order.createdAt).toLocaleString()}</p>
          <hr/>
          <p><strong>Order: ${order.orderNumber}</strong></p>
          <hr/>
          ${order.items?.map((item) => `<p>${item.product?.name || 'Item'} x${item.quantity} - $${item.total.toFixed(2)}</p>`).join('') || ''}
          <hr/>
          <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
          <p>Tax: $${order.tax.toFixed(2)}</p>
          ${order.discount > 0 ? `<p>Discount: -$${order.discount.toFixed(2)}</p>` : ''}
          <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
          <p>Payment: ${order.paymentMethod}</p>
          <hr/>
          <p style="text-align:center;">Thank you for your purchase!</p>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-apex-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-apex-text-primary">Order Details</h2>
            <p className="text-xs text-apex-text-secondary mt-0.5">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-apex-elevated flex items-center justify-center text-apex-text-secondary hover:text-apex-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-apex-text-muted">Date</p>
              <p className="text-sm text-apex-text-primary">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-apex-text-muted">Payment</p>
              <p className="text-sm text-apex-text-primary capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-apex-text-muted">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] || ''}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-apex-text-muted">Customer</p>
              <p className="text-sm text-apex-text-primary">{order.customerId || 'Walk-in'}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-apex-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-3 py-2 text-center font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="border-b border-apex-border/50">
                    <td className="px-3 py-2 font-medium">{item.product?.name || 'Unknown'}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-apex-text-secondary">Subtotal</span>
              <span className="font-mono">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-apex-text-secondary">Tax</span>
              <span className="font-mono">${order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-apex-text-secondary">Discount</span>
                <span className="font-mono text-apex-success">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-apex-border pt-2">
              <span>Total</span>
              <span className="font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-apex-border flex items-center gap-3">
          <button
            onClick={handlePrintReceipt}
            className="px-4 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm font-medium text-apex-text-secondary hover:text-apex-text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
          {order.status === 'completed' && (
            <RefundButton order={order} onRefundComplete={onRefund} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailModal;
