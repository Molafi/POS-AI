import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface SoundSettingsProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ settings, onSave }) => {
  const [enabled, setEnabled] = useState(settings.sound_enabled !== 'false');

  const handleToggle = async () => {
    const newVal = !enabled;
    setEnabled(newVal);
    await api.put('/settings', { settings: { sound_enabled: String(newVal) } });
    onSave();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Sound Effects</h3>
      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-10 h-5 rounded-full transition-colors relative ${enabled ? 'bg-apex-accent' : 'bg-apex-elevated'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${enabled ? 'left-[22px]' : 'left-[2px]'}`} />
        </button>
        <span className="text-sm text-apex-text-secondary">
          {enabled ? 'Register sounds enabled' : 'Register sounds disabled'}
        </span>
      </label>
    </div>
  );
};

export default SoundSettings;
