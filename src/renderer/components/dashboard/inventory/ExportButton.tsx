import React from 'react';
import type { Product } from '@shared/types';

interface ExportButtonProps {
  products: Product[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ products }) => {
  const handleExport = () => {
    const headers = ['Name', 'SKU', 'Category', 'Cost', 'Price', 'Stock', 'Min Stock', 'Status'];
    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.cost.toFixed(2),
      p.price.toFixed(2),
      String(p.stock),
      String(p.minStock),
      p.isActive ? 'Active' : 'Inactive',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm font-medium text-apex-text-secondary hover:text-apex-text-primary hover:border-apex-accent transition-all flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export CSV
    </button>
  );
};

export default ExportButton;
