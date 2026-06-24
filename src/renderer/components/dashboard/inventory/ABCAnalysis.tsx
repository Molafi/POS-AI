import React from 'react';
import { performABCAnalysis } from '../../../utils/algorithms';
import type { ABCItem } from '@shared/types';

interface ABCAnalysisProps {
  products: { productId: string; name: string; revenue: number }[];
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-apex-success/10', text: 'text-apex-success', label: 'Top 80% Revenue' },
  B: { bg: 'bg-apex-warning/10', text: 'text-apex-warning', label: '80-95% Revenue' },
  C: { bg: 'bg-apex-text-muted/10', text: 'text-apex-text-muted', label: '95-100% Revenue' },
};

const ABCAnalysis: React.FC<ABCAnalysisProps> = ({ products }) => {
  const abcItems = performABCAnalysis(products);

  const grouped = {
    A: abcItems.filter((i) => i.category === 'A'),
    B: abcItems.filter((i) => i.category === 'B'),
    C: abcItems.filter((i) => i.category === 'C'),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {(['A', 'B', 'C'] as const).map((cat) => {
          const config = categoryColors[cat];
          return (
            <div key={cat} className={`${config.bg} border border-apex-border rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl font-heading font-bold ${config.text}`}>
                  {cat}
                </span>
                <span className="text-xs text-apex-text-muted">{config.label}</span>
              </div>
              <p className="text-lg font-mono font-semibold text-apex-text-primary">
                {grouped[cat].length} <span className="text-sm text-apex-text-secondary">items</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">% of Total</th>
              <th className="px-4 py-3 text-right font-medium">Cumulative %</th>
              <th className="px-4 py-3 text-center font-medium">Class</th>
            </tr>
          </thead>
          <tbody>
            {abcItems.slice(0, 20).map((item) => {
              const config = categoryColors[item.category];
              return (
                <tr key={item.productId} className="border-b border-apex-border/50 hover:bg-apex-elevated/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">${item.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{item.percentage.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right font-mono">{item.cumulativePercentage.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
                      {item.category}
                    </span>
                  </td>
                </tr>
              );
            })}
            {abcItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-apex-text-muted">
                  No data available for ABC analysis
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ABCAnalysis;
