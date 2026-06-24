import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onStartChange, onEndChange }) => {
  const presets = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    onStartChange(start.toISOString().split('T')[0]);
    onEndChange(end.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-xs text-apex-text-muted">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-apex-text-muted">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
        />
      </div>
      <div className="flex gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => applyPreset(preset.days)}
            className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-xs text-apex-text-secondary hover:text-apex-text-primary hover:border-apex-accent/50 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangePicker;
