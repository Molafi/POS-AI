import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface PinManagementProps {
  onSave: () => void;
}

const PinManagement: React.FC<PinManagementProps> = ({ onSave }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = async () => {
    setError('');
    setSuccess('');

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    const response = await api.post<{ message: string }>('/settings/change-pin', {
      currentPin,
      newPin,
    });

    if (response.success) {
      setSuccess('PIN changed successfully');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      onSave();
    } else {
      setError(response.error || 'Failed to change PIN');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Manager PIN</h3>

      <div className="space-y-3 max-w-xs">
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Current PIN</label>
          <input
            type="password"
            maxLength={4}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">New PIN</label>
          <input
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Confirm New PIN</label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-apex-danger">{error}</p>}
      {success && <p className="text-xs text-apex-success">{success}</p>}

      <button
        onClick={handleChange}
        className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
      >
        Change PIN
      </button>
    </div>
  );
};

export default PinManagement;
