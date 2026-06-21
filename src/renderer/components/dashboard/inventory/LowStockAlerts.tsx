import React from 'react';
import type { Product } from '@shared/types';

interface LowStockAlertsProps {
  products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const lowStock = products.filter((p) => p.stock <= p.minStock && p.isActive);

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-apex-border flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">Low Stock Alerts</h3>
        {lowStock.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-apex-danger/10 text-apex-danger text-xs font-medium">
            {lowStock.length} items
          </span>
        )}
      </div>
      <div className="divide-y divide-apex-border/50 max-h-[300px] overflow-y-auto scrollbar-thin">
        {lowStock.map((product) => (
          <div key={product.id} className="px-4 py-3 flex items-center justify-between hover:bg-apex-elevated/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${product.stock <= 0 ? 'bg-apex-danger' : 'bg-apex-warning'}`} />
              <div>
                <p className="text-sm font-medium text-apex-text-primary">{product.name}</p>
                <p className="text-xs text-apex-text-muted">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono font-medium ${product.stock <= 0 ? 'text-apex-danger' : 'text-apex-warning'}`}>
                {product.stock} left
              </p>
              <p className="text-xs text-apex-text-muted">min: {product.minStock}</p>
            </div>
          </div>
        ))}
        {lowStock.length === 0 && (
          <div className="py-8 text-center text-apex-text-muted text-sm">
            All products are well stocked
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;
