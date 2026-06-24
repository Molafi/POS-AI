import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@shared/types';
import { api } from '../../../lib/api';

interface ProductTableProps {
  products: Product[];
  onRefresh: () => void;
  onAddProduct: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onRefresh, onAddProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const startEdit = (id: string, field: string, currentValue: number) => {
    setEditingCell({ id, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      setEditingCell(null);
      return;
    }

    await api.put(`/products/${id}`, { [field]: numValue });
    setEditingCell(null);
    onRefresh();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await api.put(`/products/${id}`, { isActive: !currentStatus });
    onRefresh();
  };

  const bulkDelete = async () => {
    for (const id of selectedIds) {
      await api.delete(`/products/${id}`);
    }
    setSelectedIds(new Set());
    onRefresh();
  };

  const getMarginColor = (price: number, cost: number) => {
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    if (margin >= 40) return 'text-apex-success';
    if (margin >= 20) return 'text-apex-warning';
    return 'text-apex-danger';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apex-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary placeholder-apex-text-muted focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={bulkDelete}
              className="px-3 py-2 bg-apex-danger/10 text-apex-danger border border-apex-danger/30 rounded-lg text-sm font-medium hover:bg-apex-danger/20 transition-colors"
            >
              Delete ({selectedIds.size})
            </motion.button>
          )}
          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            AI Add Product
          </button>
        </div>
      </div>

      <div className="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-apex-border"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Image</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Cost</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Margin</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
                return (
                  <tr key={product.id} className="border-b border-apex-border/50 hover:bg-apex-elevated/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-apex-border"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="w-8 h-8 rounded-md bg-apex-elevated overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-apex-text-muted text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{product.name}</td>
                    <td className="px-4 py-2.5 text-apex-text-secondary">{product.category}</td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {editingCell?.id === product.id && editingCell?.field === 'cost' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-20 px-1 py-0.5 bg-apex-elevated border border-apex-accent rounded text-right text-sm outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(product.id, 'cost', product.cost)}
                          className="cursor-pointer hover:text-apex-accent transition-colors"
                        >
                          ${product.cost.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {editingCell?.id === product.id && editingCell?.field === 'price' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-20 px-1 py-0.5 bg-apex-elevated border border-apex-accent rounded text-right text-sm outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(product.id, 'price', product.price)}
                          className="cursor-pointer hover:text-apex-accent transition-colors"
                        >
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono ${getMarginColor(product.price, product.cost)}`}>
                      {margin.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {editingCell?.id === product.id && editingCell?.field === 'stock' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-16 px-1 py-0.5 bg-apex-elevated border border-apex-accent rounded text-right text-sm outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(product.id, 'stock', product.stock)}
                          className={`cursor-pointer hover:text-apex-accent transition-colors ${product.stock <= product.minStock ? 'text-apex-danger' : ''}`}
                        >
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleStatus(product.id, product.isActive)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          product.isActive
                            ? 'bg-apex-success/10 text-apex-success'
                            : 'bg-apex-text-muted/10 text-apex-text-muted'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-apex-text-muted">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
