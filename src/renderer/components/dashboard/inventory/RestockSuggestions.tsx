import React from 'react';
import type { Product } from '@shared/types';
import { calculateEMA } from '../../../utils/algorithms';

interface RestockSuggestionsProps {
  products: Product[];
  salesData: Record<string, { date: string; amount: number }[]>;
}

const RestockSuggestions: React.FC<RestockSuggestionsProps> = ({ products, salesData }) => {
  const suggestions = products
    .filter((p) => p.isActive)
    .map((product) => {
      const productSales = salesData[product.id] || [];
      const emaResults = calculateEMA(productSales, 0.3);
      const lastEma = emaResults.length > 0 ? emaResults[emaResults.length - 1].ema : 0;
      const prevEma = emaResults.length > 1 ? emaResults[emaResults.length - 2].ema : lastEma;

      // Daily sales velocity (units per day estimated from revenue / price)
      const dailyVelocity = product.price > 0 ? lastEma / product.price : 0;
      // Lead time in days (assume 7 days if not configured)
      const leadTime = 7;
      const reorderPoint = Math.ceil(dailyVelocity * leadTime);
      const suggestedQty = Math.max(reorderPoint * 2 - product.stock, 0);

      const trend = lastEma > prevEma ? 'up' : lastEma < prevEma ? 'down' : 'stable';

      return {
        product,
        dailyVelocity,
        reorderPoint,
        suggestedQty,
        trend,
        ema: lastEma,
      };
    })
    .filter((s) => s.suggestedQty > 0 || s.product.stock <= s.product.minStock)
    .sort((a, b) => b.suggestedQty - a.suggestedQty)
    .slice(0, 15);

  const getTrendBadge = (trend: string) => {
    if (trend === 'up') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-apex-success/10 text-apex-success flex items-center gap-0.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Trending Up
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-apex-danger/10 text-apex-danger flex items-center gap-0.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          Trending Down
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-apex-text-muted/10 text-apex-text-muted">
        Stable
      </span>
    );
  };

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-apex-border">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Restock Suggestions</h3>
        <p className="text-xs text-apex-text-muted mt-0.5">Based on sales velocity x lead time (7 days)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-2.5 text-left font-medium">Product</th>
              <th className="px-4 py-2.5 text-right font-medium">Current</th>
              <th className="px-4 py-2.5 text-right font-medium">Reorder Pt</th>
              <th className="px-4 py-2.5 text-right font-medium">Suggested Qty</th>
              <th className="px-4 py-2.5 text-center font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.product.id} className="border-b border-apex-border/50 hover:bg-apex-elevated/30 transition-colors">
                <td className="px-4 py-2.5 font-medium">{s.product.name}</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.product.stock}</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.reorderPoint}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-apex-accent">{s.suggestedQty}</td>
                <td className="px-4 py-2.5 text-center">{getTrendBadge(s.trend)}</td>
              </tr>
            ))}
            {suggestions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-apex-text-muted">
                  No restock suggestions at this time
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestockSuggestions;
