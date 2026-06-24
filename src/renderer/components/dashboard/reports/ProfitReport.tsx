import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProfitReportProps {
  data: { date: string; revenue: number; grossProfit: number; netProfit: number; margin: number }[];
}

const ProfitReport: React.FC<ProfitReportProps> = ({ data }) => {
  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Profit Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend wrapperStyle={{ color: '#94A3B8' }} />
            <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#34D399" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#4F8EF7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitReport;
