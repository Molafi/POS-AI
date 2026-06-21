import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '@shared/types';
import { api } from '../../../lib/api';

interface RefundButtonProps {
  order: Order;
  onRefundComplete: () => void;
}

const RefundButton: React.FC<RefundButtonProps> = ({ order, onRefundComplete }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    const amount = refundType === 'full' ? order.total : parseFloat(partialAmount);

    if (!amount || amount <= 0 || amount > order.total) {
      setLoading(false);
      return;
    }

    const response = await api.post('/refunds', {
      orderId: order.id,
      amount,
      reason: reason || 'Customer request',
      type: refundType,
      items: refundType === 'full' ? null : null,
    });

    if (response.success) {
      setShowDialog(false);
      onRefundComplete();
    }
    setLoading(false);
  };

  const handleVoid = async () => {
    setLoading(true);
    const response = await api.post('/refunds/void', {
      orderId: order.id,
      reason: reason || 'Voided by manager',
    });

    if (response.success) {
      setShowDialog(false);
      onRefundComplete();
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 bg-apex-danger/10 text-apex-danger border border-apex-danger/30 rounded-lg text-sm font-medium hover:bg-apex-danger/20 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Refund
      </button>

      <AnimatePresence>
        {showDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-md p-6 space-y-4"
            >
              <h3 className="text-lg font-heading font-semibold text-apex-text-primary">Process Refund</h3>
              <p className="text-sm text-apex-text-secondary">Order: {order.orderNumber} (${order.total.toFixed(2)})</p>

              {/* Refund Type */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRefundType('full')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    refundType === 'full'
                      ? 'bg-apex-accent text-white'
                      : 'bg-apex-elevated text-apex-text-secondary hover:text-apex-text-primary'
                  }`}
                >
                  Full Refund
                </button>
                <button
                  onClick={() => setRefundType('partial')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    refundType === 'partial'
                      ? 'bg-apex-accent text-white'
                      : 'bg-apex-elevated text-apex-text-secondary hover:text-apex-text-primary'
                  }`}
                >
                  Partial Refund
                </button>
              </div>

              {refundType === 'partial' && (
                <div>
                  <label className="text-xs text-apex-text-secondary font-medium">Refund Amount</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apex-text-muted text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      max={order.total}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder={order.total.toFixed(2)}
                      className="w-full pl-7 pr-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-xs text-apex-text-secondary font-medium">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for refund..."
                  rows={2}
                  className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-secondary hover:text-apex-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoid}
                  disabled={loading}
                  className="py-2 px-4 bg-apex-warning/10 text-apex-warning border border-apex-warning/30 rounded-lg text-sm font-medium hover:bg-apex-warning/20 transition-colors disabled:opacity-50"
                >
                  Void
                </button>
                <button
                  onClick={handleRefund}
                  disabled={loading}
                  className="flex-1 py-2 bg-apex-danger text-white rounded-lg text-sm font-medium hover:bg-apex-danger/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Refund'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RefundButton;
