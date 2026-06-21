import React from 'react';

interface ProductPerformanceData {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
}

interface ProductPerformanceProps {
  data: ProductPerformanceData[];
}

const ProductPerformance: React.FC<ProductPerformanceProps> = ({ data }) => {
  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-apex-border">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Product Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-2.5 text-left font-medium">Product</th>
              <th className="px-4 py-2.5 text-right font-medium">Units Sold</th>
              <th className="px-4 py-2.5 text-right font-medium">Revenue</th>
              <th className="px-4 py-2.5 text-right font-medium">Cost</th>
              <th className="px-4 py-2.5 text-right font-medium">Profit</th>
              <th className="px-4 py-2.5 text-right font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const margin = item.revenue > 0 ? ((item.profit) / item.revenue) * 100 : 0;
              const marginColor = margin >= 40 ? 'text-apex-success' : margin >= 20 ? 'text-apex-warning' : 'text-apex-danger';
              return (
                <tr key={item.productId} className="border-b border-apex-border/50 hover:bg-apex-elevated/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{item.unitsSold}</td>
                  <td className="px-4 py-2.5 text-right font-mono">${item.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-apex-text-secondary">${item.cost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-apex-success">${item.profit.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${marginColor}`}>{margin.toFixed(1)}%</td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-apex-text-muted">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPerformance;
