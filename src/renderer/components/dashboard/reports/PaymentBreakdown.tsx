import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PaymentData {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

interface PaymentBreakdownProps {
  data: PaymentData[];
}

const COLORS = ['#4F8EF7', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ data }) => {
  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">Payment Methods</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="total"
              nameKey="method"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#151D2E',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend
              wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }}
              formatter={(value: string) => <span className="text-apex-text-secondary capitalize">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.method} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm capitalize text-apex-text-secondary">{item.method}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono">${item.total.toFixed(2)}</span>
              <span className="text-xs text-apex-text-muted">{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentBreakdown;
