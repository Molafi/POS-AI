import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface ReceiptCustomizationProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const ReceiptCustomization: React.FC<ReceiptCustomizationProps> = ({ settings, onSave }) => {
  const [header, setHeader] = useState(settings.receipt_header || '');
  const [footer, setFooter] = useState(settings.receipt_footer || 'Thank you for your purchase!');
  const [showTax, setShowTax] = useState(settings.receipt_show_tax !== 'false');
  const [showDiscount, setShowDiscount] = useState(settings.receipt_show_discount !== 'false');
  const [showCashier, setShowCashier] = useState(settings.receipt_show_cashier !== 'false');
  const [showDate, setShowDate] = useState(settings.receipt_show_date !== 'false');

  const handleSave = async () => {
    await api.put('/settings', {
      settings: {
        receipt_header: header,
        receipt_footer: footer,
        receipt_show_tax: String(showTax),
        receipt_show_discount: String(showDiscount),
        receipt_show_cashier: String(showCashier),
        receipt_show_date: String(showDate),
      },
    });
    onSave();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Receipt Customization</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium">Header Message</label>
          <input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Welcome to our store!"
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium">Footer Message</label>
          <input
            type="text"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-apex-text-secondary font-medium">Show/Hide Fields</p>
        {[
          { label: 'Tax Breakdown', value: showTax, set: setShowTax },
          { label: 'Discount', value: showDiscount, set: setShowDiscount },
          { label: 'Cashier Name', value: showCashier, set: setShowCashier },
          { label: 'Date/Time', value: showDate, set: setShowDate },
        ].map((field) => (
          <label key={field.label} className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => field.set(!field.value)}
              className={`w-9 h-5 rounded-full transition-colors relative ${field.value ? 'bg-apex-accent' : 'bg-apex-elevated'}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${field.value ? 'left-[18px]' : 'left-[3px]'}`}
              />
            </button>
            <span className="text-sm text-apex-text-secondary">{field.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
      >
        Save Receipt Settings
      </button>
    </div>
  );
};

export default ReceiptCustomization;
