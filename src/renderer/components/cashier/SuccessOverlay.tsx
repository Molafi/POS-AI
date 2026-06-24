import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessOverlayProps {
  visible: boolean;
  orderNumber: string;
  total: number;
  changeDue: number;
  onPrintReceipt: () => void;
  onNewSale: () => void;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  visible,
  orderNumber,
  total,
  changeDue,
  onPrintReceipt,
  onNewSale,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-apex-elevated border border-apex-border rounded-2xl p-8 w-[360px] text-center shadow-2xl"
          >
            {/* Animated checkmark SVG */}
            <div className="flex justify-center mb-6">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                className="text-apex-success"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-[drawCircle_0.4s_ease-in-out_forwards]"
                  style={{
                    strokeDasharray: 226,
                    strokeDashoffset: 226,
                    animation: 'drawCircle 0.4s ease-in-out forwards',
                  }}
                />
                <path
                  d="M24 40 L35 51 L56 30"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 50,
                    strokeDashoffset: 50,
                    animation: 'drawCheck 0.3s ease-in-out 0.3s forwards',
                  }}
                />
              </svg>
            </div>

            <h2 className="text-xl font-heading font-bold text-apex-text-primary mb-1">
              Payment Successful!
            </h2>
            <p className="text-sm text-apex-text-muted mb-6">Transaction completed</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-apex-text-muted">Order #</span>
                <span className="font-mono text-apex-text-primary">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apex-text-muted">Total</span>
                <span className="font-mono font-semibold text-apex-accent">${total.toFixed(2)}</span>
              </div>
              {changeDue > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-apex-text-muted">Change</span>
                  <span className="font-mono font-semibold text-apex-success">${changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onPrintReceipt}
                className="flex-1 py-2.5 rounded-lg border border-apex-border text-sm font-medium text-apex-text-secondary hover:bg-apex-surface transition-colors"
              >
                {'\uD83D\uDDA8\uFE0F'} Print Receipt
              </button>
              <button
                onClick={onNewSale}
                className="flex-1 py-2.5 rounded-lg bg-apex-accent text-white text-sm font-medium hover:bg-apex-accent-hover transition-colors"
              >
                New Sale
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;
