import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesReportProps {
  data: { date: string; revenue: number; orders: number }[];
}

const SalesReport: React.FC<SalesReportProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const groupedData = React.useMemo(() => {
    if (groupBy === 'day') return data;

    const grouped: Record<string, { date: string; revenue: number; orders: number }> = {};

    for (const item of data) {
      let key: string;
      const d = new Date(item.date);
      if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (!grouped[key]) grouped[key] = { date: key, revenue: 0, orders: 0 };
      grouped[key].revenue += item.revenue;
      grouped[key].orders += item.orders;
    }

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, groupBy]);

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Sales Overview</h3>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                groupBy === g ? 'bg-apex-accent text-white' : 'bg-apex-elevated text-apex-text-secondary hover:text-apex-text-primary'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={groupedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(val: string) => {
                const d = new Date(val);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(val: number) => `$${val.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151D2E',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              formatter={(value: number, name: string) => [
                name === 'revenue' ? `$${value.toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders',
              ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#4F8EF7" strokeWidth={2} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesReport;
