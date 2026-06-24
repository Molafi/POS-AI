import React from 'react';

interface HourlyHeatmapProps {
  data: { hour: number; revenue: number }[];
}

const HourlyHeatmap: React.FC<HourlyHeatmapProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const getColor = (revenue: number) => {
    const intensity = revenue / maxRevenue;
    if (intensity >= 0.75) return 'bg-amber-500/80';
    if (intensity >= 0.5) return 'bg-amber-500/50';
    if (intensity >= 0.25) return 'bg-blue-500/50';
    if (intensity > 0) return 'bg-blue-500/25';
    return 'bg-apex-elevated';
  };

  // Fill in all 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return { hour: i, revenue: found?.revenue || 0 };
  });

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">Hourly Sales Heatmap</h3>
      <div className="grid grid-cols-12 gap-1.5">
        {hours.map((h) => (
          <div
            key={h.hour}
            className={`aspect-square rounded-md ${getColor(h.revenue)} flex items-center justify-center transition-colors`}
            title={`${h.hour}:00 - $${h.revenue.toFixed(2)}`}
          >
            <span className="text-[9px] font-mono text-apex-text-secondary">{h.hour}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 justify-end">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/25" />
          <span className="text-[10px] text-apex-text-muted">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/50" />
          <span className="text-[10px] text-apex-text-muted">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/50" />
          <span className="text-[10px] text-apex-text-muted">High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/80" />
          <span className="text-[10px] text-apex-text-muted">Peak</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyHeatmap;
