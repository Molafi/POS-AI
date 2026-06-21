import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface ThemeToggleProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ settings, onSave }) => {
  const [theme, setTheme] = useState(settings.theme || 'dark');

  const handleToggle = async (newTheme: string) => {
    setTheme(newTheme);
    await api.put('/settings', { settings: { theme: newTheme } });
    onSave();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Theme</h3>
      <div className="flex gap-3">
        <button
          onClick={() => handleToggle('dark')}
          className={`flex-1 p-4 rounded-xl border transition-all ${
            theme === 'dark'
              ? 'border-apex-accent bg-apex-accent/10'
              : 'border-apex-border hover:border-apex-accent/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#070B14] border border-apex-border mx-auto mb-2" />
          <p className="text-xs text-apex-text-secondary text-center">Dark</p>
        </button>
        <button
          onClick={() => handleToggle('light')}
          className={`flex-1 p-4 rounded-xl border transition-all ${
            theme === 'light'
              ? 'border-apex-accent bg-apex-accent/10'
              : 'border-apex-border hover:border-apex-accent/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 mx-auto mb-2" />
          <p className="text-xs text-apex-text-secondary text-center">Light</p>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
