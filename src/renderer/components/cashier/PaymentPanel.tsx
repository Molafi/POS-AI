import React, { useState, useEffect } from 'react';
import ProcessPaymentButton from './ProcessPaymentButton';

type PaymentMethodType = 'cash' | 'card' | 'wallet';

interface PaymentPanelProps {
  total: number;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onProcessPayment: (paymentData: PaymentData) => void;
  processing: boolean;
}

export interface PaymentData {
  method: PaymentMethodType | 'split';
  customerName: string;
  cashTendered?: number;
  changeDue?: number;
  splitMethods?: { method: PaymentMethodType; amount: number }[];
}

const paymentMethods: { id: PaymentMethodType; label: string; icon: string }[] = [
  { id: 'cash', label: 'Cash', icon: '\uD83D\uDCB5' },
  { id: 'card', label: 'Card', icon: '\uD83D\uDCB3' },
  { id: 'wallet', label: 'Wallet', icon: '\uD83D\uDCF1' },
];

const PaymentPanel: React.FC<PaymentPanelProps> = ({
  total,
  customerName,
  onCustomerNameChange,
  onProcessPayment,
  processing,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cash');
  const [isSplit, setIsSplit] = useState(false);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [splitMethod1, setSplitMethod1] = useState<PaymentMethodType>('cash');
  const [splitMethod2, setSplitMethod2] = useState<PaymentMethodType>('card');
  const [splitAmount1, setSplitAmount1] = useState<string>('');
  const [splitAmount2, setSplitAmount2] = useState<string>('');

  // Auto-calculate split amount 2
  useEffect(() => {
    if (isSplit && splitAmount1) {
      const remaining = total - parseFloat(splitAmount1);
      if (remaining >= 0) {
        setSplitAmount2(remaining.toFixed(2));
      }
    }
  }, [splitAmount1, total, isSplit]);

  const changeDue = selectedMethod === 'cash' && cashTendered
    ? Math.max(0, parseFloat(cashTendered) - total)
    : 0;

  const isValid = (): boolean => {
    if (total <= 0) return false;

    if (isSplit) {
      const amount1 = parseFloat(splitAmount1) || 0;
      const amount2 = parseFloat(splitAmount2) || 0;
      const sum = amount1 + amount2;
      return Math.abs(sum - total) < 0.01;
    }

    if (selectedMethod === 'cash') {
      const tendered = parseFloat(cashTendered) || 0;
      return tendered >= total;
    }

    return true;
  };

  const handleProcess = () => {
    if (!isValid()) return;

    if (isSplit) {
      onProcessPayment({
        method: 'split',
        customerName,
        splitMethods: [
          { method: splitMethod1, amount: parseFloat(splitAmount1) || 0 },
          { method: splitMethod2, amount: parseFloat(splitAmount2) || 0 },
        ],
      });
    } else {
      const tendered = parseFloat(cashTendered) || 0;
      onProcessPayment({
        method: selectedMethod,
        customerName,
        cashTendered: selectedMethod === 'cash' ? tendered : undefined,
        changeDue: selectedMethod === 'cash' ? changeDue : undefined,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">Payment</h3>

      {/* Customer name */}
      <div className="mb-4">
        <label className="text-xs text-apex-text-muted block mb-1">Customer Name (optional)</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Walk-in customer"
          className="w-full h-9 px-3 bg-apex-surface border border-apex-border rounded-lg text-sm text-apex-text-primary placeholder:text-apex-text-muted focus:outline-none focus:border-apex-accent/60 transition-colors"
        />
      </div>

      {/* Payment method selection */}
      <div className="mb-4">
        <label className="text-xs text-apex-text-muted block mb-2">Payment Method</label>
        <div className="grid grid-cols-3 gap-1.5">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedMethod(method.id);
                setIsSplit(false);
              }}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                selectedMethod === method.id && !isSplit
                  ? 'border-apex-accent bg-apex-accent/10 text-apex-accent'
                  : 'border-apex-border text-apex-text-muted hover:border-apex-accent/30'
              }`}
            >
              <span className="text-base">{method.icon}</span>
              <span>{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Split payment toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSplit}
            onChange={(e) => setIsSplit(e.target.checked)}
            className="w-4 h-4 rounded border-apex-border bg-apex-surface text-apex-accent focus:ring-apex-accent/50"
          />
          <span className="text-xs text-apex-text-secondary">Split Payment</span>
        </label>
      </div>

      {/* Split payment inputs */}
      {isSplit && (
        <div className="mb-4 space-y-2 p-3 rounded-lg bg-apex-surface border border-apex-border">
          <div className="flex items-center gap-2">
            <select
              value={splitMethod1}
              onChange={(e) => setSplitMethod1(e.target.value as PaymentMethodType)}
              className="flex-1 h-8 px-2 text-xs bg-apex-elevated border border-apex-border rounded text-apex-text-primary focus:outline-none focus:border-apex-accent/60"
            >
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={splitAmount1}
              onChange={(e) => setSplitAmount1(e.target.value)}
              placeholder="0.00"
              className="w-24 h-8 px-2 text-xs text-right font-mono bg-apex-elevated border border-apex-border rounded text-apex-text-primary focus:outline-none focus:border-apex-accent/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={splitMethod2}
              onChange={(e) => setSplitMethod2(e.target.value as PaymentMethodType)}
              className="flex-1 h-8 px-2 text-xs bg-apex-elevated border border-apex-border rounded text-apex-text-primary focus:outline-none focus:border-apex-accent/60"
            >
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={splitAmount2}
              onChange={(e) => setSplitAmount2(e.target.value)}
              placeholder="0.00"
              readOnly
              className="w-24 h-8 px-2 text-xs text-right font-mono bg-apex-elevated border border-apex-border rounded text-apex-text-muted focus:outline-none"
            />
          </div>
          {splitAmount1 && Math.abs((parseFloat(splitAmount1) || 0) + (parseFloat(splitAmount2) || 0) - total) > 0.01 && (
            <p className="text-[10px] text-red-400">Amounts must sum to ${total.toFixed(2)}</p>
          )}
        </div>
      )}

      {/* Cash tendered */}
      {!isSplit && selectedMethod === 'cash' && (
        <div className="mb-4">
          <label className="text-xs text-apex-text-muted block mb-1">Cash Tendered</label>
          <input
            type="number"
            value={cashTendered}
            onChange={(e) => setCashTendered(e.target.value)}
            placeholder={`Min $${total.toFixed(2)}`}
            className="w-full h-9 px-3 font-mono bg-apex-surface border border-apex-border rounded-lg text-sm text-apex-text-primary placeholder:text-apex-text-muted focus:outline-none focus:border-apex-accent/60 transition-colors"
          />
          {cashTendered && parseFloat(cashTendered) >= total && (
            <div className="flex justify-between items-center mt-2 p-2 rounded bg-apex-success/10 border border-apex-success/20">
              <span className="text-xs text-apex-text-muted">Change Due</span>
              <span className="font-mono font-semibold text-apex-success text-sm">
                ${changeDue.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Process button */}
      <ProcessPaymentButton
        disabled={!isValid()}
        loading={processing}
        onClick={handleProcess}
      />
    </div>
  );
};

export default PaymentPanel;
