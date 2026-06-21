import React from 'react';
import type { Product } from '@shared/types';

interface StockLevelsProps {
  products: Product[];
}

const StockLevels: React.FC<StockLevelsProps> = ({ products }) => {
  const maxStock = Math.max(...products.map((p) => p.stock), 1);

  const getStockColor = (product: Product) => {
    if (product.stock <= 0) return 'bg-apex-danger';
    if (product.stock <= product.minStock) return 'bg-apex-warning';
    return 'bg-apex-success';
  };

  const sorted = [...products].sort((a, b) => a.stock - b.stock);

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-apex-border">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Stock Levels</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-apex-elevated/90 backdrop-blur-sm">
            <tr className="text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-2.5 text-left font-medium">Product</th>
              <th className="px-4 py-2.5 text-center font-medium">Stock</th>
              <th className="px-4 py-2.5 text-center font-medium">Min</th>
              <th className="px-4 py-2.5 text-left font-medium w-48">Level</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((product) => (
              <tr key={product.id} className="border-b border-apex-border/50 hover:bg-apex-elevated/30 transition-colors">
                <td className="px-4 py-2 font-medium">{product.name}</td>
                <td className="px-4 py-2 text-center font-mono">{product.stock}</td>
                <td className="px-4 py-2 text-center font-mono text-apex-text-secondary">{product.minStock}</td>
                <td className="px-4 py-2">
                  <div className="w-full h-3 bg-apex-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getStockColor(product)}`}
                      style={{ width: `${Math.min((product.stock / maxStock) * 100, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-apex-text-muted">No products</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLevels;
