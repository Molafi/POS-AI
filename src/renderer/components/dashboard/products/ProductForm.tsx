import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  cost: number;
  price: number;
  taxRate: number;
  stock: number;
  minStock: number;
  unit: string;
  barcode: string;
  sku: string;
  tags: string[];
  isActive: boolean;
  imageUrl: string;
}

interface ProductFormProps {
  initialData: Partial<ProductFormData>;
  aiSuggested: boolean;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

const categories = [
  'Food & Beverage',
  'Electronics',
  'Clothing',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Outdoors',
  'Toys & Games',
  'Books & Stationery',
  'Automotive',
  'Other',
];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, aiSuggested, onSave, onCancel }) => {
  const [form, setForm] = useState<ProductFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    category: initialData.category || 'Other',
    cost: initialData.cost || 0,
    price: initialData.price || 0,
    taxRate: initialData.taxRate || 10,
    stock: initialData.stock || 0,
    minStock: initialData.minStock || 5,
    unit: initialData.unit || 'piece',
    barcode: initialData.barcode || '',
    sku: initialData.sku || '',
    tags: initialData.tags || [],
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    imageUrl: initialData.imageUrl || '',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!form.sku) {
      const generated = `SKU-${Date.now().toString(36).toUpperCase()}`;
      setForm((prev) => ({ ...prev, sku: generated }));
    }
  }, []);

  const margin = form.price > 0 ? ((form.price - form.cost) / form.price) * 100 : 0;

  const getMarginColor = () => {
    if (margin >= 40) return 'text-apex-success';
    if (margin >= 20) return 'text-apex-warning';
    return 'text-apex-danger';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.price <= form.cost) newErrors.price = 'Price must be greater than cost';
    if (!form.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-apex-accent/10 text-apex-accent rounded">
      {children}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Name {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
          {errors.name && <p className="text-xs text-apex-danger mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Description {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Category {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-apex-danger mt-1">{errors.category}</p>}
        </div>

        {/* Unit */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Unit</label>
          <select
            value={form.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
          >
            <option value="piece">Piece</option>
            <option value="kg">Kilogram</option>
            <option value="liter">Liter</option>
            <option value="pack">Pack</option>
            <option value="box">Box</option>
          </select>
        </div>

        {/* Cost Price */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Cost Price {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apex-text-muted text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-7 pr-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
            />
          </div>
        </div>

        {/* Selling Price */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Selling Price {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apex-text-muted text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-7 pr-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
            />
          </div>
          {errors.price && <p className="text-xs text-apex-danger mt-1">{errors.price}</p>}
        </div>

        {/* Profit Margin Display */}
        <div className="md:col-span-2 bg-apex-elevated/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-apex-text-secondary">Profit Margin</span>
          <span className={`text-lg font-mono font-bold ${getMarginColor()}`}>
            {margin.toFixed(1)}%
          </span>
        </div>

        {/* Tax Rate */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Tax Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.taxRate}
            onChange={(e) => setForm((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Stock Quantity</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        {/* Min Stock */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Low Stock Threshold</label>
          <input
            type="number"
            value={form.minStock}
            onChange={(e) => setForm((p) => ({ ...p, minStock: parseInt(e.target.value) || 0 }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        {/* Barcode/SKU */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">Barcode</label>
          <input
            type="text"
            value={form.barcode}
            onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="text-xs text-apex-text-secondary font-medium">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none"
          />
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="text-xs text-apex-text-secondary font-medium flex items-center">
            Tags {aiSuggested && <Badge>AI suggested</Badge>}
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-primary focus:border-apex-accent outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-apex-accent/10 text-apex-accent rounded-lg text-sm hover:bg-apex-accent/20 transition-colors"
            >
              Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-apex-elevated border border-apex-border rounded text-xs text-apex-text-secondary flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-apex-text-muted hover:text-apex-danger">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-apex-text-secondary font-medium">Active</label>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-apex-success' : 'bg-apex-elevated'}`}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-white absolute top-0.5"
              animate={{ left: form.isActive ? 22 : 2 }}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-apex-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-apex-elevated border border-apex-border rounded-lg text-sm text-apex-text-secondary hover:text-apex-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
        >
          Save Product
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
