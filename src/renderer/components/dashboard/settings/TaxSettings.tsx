import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface TaxSettingsProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const TaxSettings: React.FC<TaxSettingsProps> = ({ settings, onSave }) => {
  const [globalRate, setGlobalRate] = useState(settings.tax_global_rate || '10');
  const [categoryRates, setCategoryRates] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(settings.tax_category_rates || '{}');
    } catch {
      return {};
    }
  });

  const categories = ['Food & Beverage', 'Electronics', 'Clothing', 'Health & Beauty', 'Home & Garden', 'Other'];

  const handleSave = async () => {
    await api.put('/settings', {
      settings: {
        tax_global_rate: globalRate,
        tax_category_rates: JSON.stringify(categoryRates),
      },
    });
    onSave();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Tax Settings</h3>

      <div>
        <label className="text-xs text-apex-text-secondary font-medium">Global Tax Rate (%)</label>
        <input
          type="number"
          step="0.1"
          value={globalRate}
          onChange={(e) => setGlobalRate(e.target.value)}
          className="mt-1 w-32 px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
      </div>

      <div>
        <label className="text-xs text-apex-text-secondary font-medium mb-2 block">Per-Category Overrides</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs text-apex-text-secondary min-w-[120px]">{cat}</span>
              <input
                type="number"
                step="0.1"
                placeholder={globalRate}
                value={categoryRates[cat] || ''}
                onChange={(e) => setCategoryRates((prev) => ({ ...prev, [cat]: e.target.value }))}
                className="w-20 px-2 py-1.5 bg-apex-elevated border border-apex-border rounded text-sm text-apex-text-primary focus:border-apex-accent outline-none"
              />
              <span className="text-xs text-apex-text-muted">%</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
      >
        Save Tax Settings
      </button>
    </div>
  );
};

export default TaxSettings;
