import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">7-Day Revenue</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val: string) => {
                const d = new Date(val);
                return d.toLocaleDateString('en-US', { weekday: 'short' });
              }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val: number) => `$${val.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151D2E',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              labelFormatter={(val: string) => new Date(val).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4F8EF7"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
