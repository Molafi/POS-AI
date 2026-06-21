import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface BusinessInfoProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const BusinessInfo: React.FC<BusinessInfoProps> = ({ settings, onSave }) => {
  const [name, setName] = useState(settings.business_name || '');
  const [address, setAddress] = useState(settings.business_address || '');
  const [currency, setCurrency] = useState(settings.business_currency || 'USD');
  const [logo, setLogo] = useState(settings.business_logo || '');

  const handleSave = async () => {
    await api.put('/settings', {
      settings: {
        business_name: name,
        business_address: address,
        business_currency: currency,
        business_logo: logo,
      },
    });
    onSave();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Business Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium">Business Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="APEX Store"
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (E)</option>
            <option value="GBP">GBP (L)</option>
            <option value="JPY">JPY (Y)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Logo URL</label>
          <input
            type="text"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
};

export default BusinessInfo;
