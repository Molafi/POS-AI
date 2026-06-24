import React, { useState } from 'react';
import { api } from '../../../lib/api';

interface BackupSettingsProps {
  settings: Record<string, string>;
  onSave: () => void;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ settings, onSave }) => {
  const [autoBackup, setAutoBackup] = useState(settings.backup_auto === 'true');
  const [backupPath, setBackupPath] = useState(settings.backup_path || '');

  const handleToggle = async () => {
    const newVal = !autoBackup;
    setAutoBackup(newVal);
    await api.put('/settings', { settings: { backup_auto: String(newVal) } });
    onSave();
  };

  const handlePathSave = async () => {
    await api.put('/settings', { settings: { backup_path: backupPath } });
    onSave();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Backup</h3>

      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-10 h-5 rounded-full transition-colors relative ${autoBackup ? 'bg-apex-accent' : 'bg-apex-elevated'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${autoBackup ? 'left-[22px]' : 'left-[2px]'}`} />
        </button>
        <span className="text-sm text-apex-text-secondary">
          Auto-backup {autoBackup ? 'enabled' : 'disabled'}
        </span>
      </label>

      {autoBackup && (
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Backup Folder Path</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder="C:\Backups\ApexPOS"
              className="flex-1 px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none font-mono"
            />
            <button
              onClick={handlePathSave}
              className="px-3 py-2 bg-apex-accent text-white rounded-lg text-xs font-medium hover:bg-apex-accent-hover transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupSettings;
