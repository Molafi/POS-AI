import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopProductsProps {
  data: { name: string; revenue: number }[];
}

const TopProducts: React.FC<TopProductsProps> = ({ data }) => {
  const colors = ['#4F8EF7', '#6BA1FF', '#34D399', '#FBBF24', '#F87171'];

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <h3 className="text-sm font-heading font-semibold text-apex-text-primary mb-4">Top 5 Products</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <XAxis
              type="number"
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val: number) => `$${val}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151D2E',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                color: '#F1F5F9',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopProducts;
