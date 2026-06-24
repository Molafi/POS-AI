import React from 'react';
import CountUp from 'react-countup';

interface CartTotalsProps {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

const CartTotals: React.FC<CartTotalsProps> = ({ subtotal, discountAmount, taxAmount, total }) => {
  return (
    <div className="border-t border-apex-border pt-3 mt-3 space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-apex-text-muted">Subtotal</span>
        <span className="font-mono text-apex-text-secondary">
          $<CountUp end={subtotal} decimals={2} duration={0.4} preserveValue />
        </span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-apex-text-muted">Discount</span>
          <span className="font-mono text-red-400">
            -$<CountUp end={discountAmount} decimals={2} duration={0.4} preserveValue />
          </span>
        </div>
      )}
      <div className="flex justify-between items-center text-sm">
        <span className="text-apex-text-muted">Tax (16%)</span>
        <span className="font-mono text-apex-text-secondary">
          $<CountUp end={taxAmount} decimals={2} duration={0.4} preserveValue />
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-apex-border">
        <span className="text-base font-heading font-semibold text-apex-text-primary">NET TOTAL</span>
        <span className="text-xl font-mono font-bold text-apex-accent">
          $<CountUp end={total} decimals={2} duration={0.5} preserveValue />
        </span>
      </div>
    </div>
  );
};

export default CartTotals;
