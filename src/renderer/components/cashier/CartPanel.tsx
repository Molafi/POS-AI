import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '@shared/types';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemoveItem: (productId: string) => void;
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    Food: '\uD83C\uDF54',
    Drink: '\uD83E\uDD64',
    Dessert: '\uD83C\uDF70',
    Retail: '\uD83D\uDED2',
    Combo: '\uD83C\uDF7D\uFE0F',
  };
  return emojiMap[category] || '\uD83D\uDCE6';
}

const CartPanel: React.FC<CartPanelProps> = ({ items, onUpdateQty, onUpdateDiscount, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-apex-text-muted">
        <div className="text-center">
          <p className="text-4xl mb-2">{'\uD83D\uDED2'}</p>
          <p className="text-sm">Cart is empty</p>
          <p className="text-xs mt-1">Add products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.product.id}
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
            className="bg-apex-elevated rounded-lg border border-apex-border p-3"
          >
            <div className="flex items-start gap-3">
              {/* Product thumbnail */}
              <div className="w-9 h-9 flex items-center justify-center rounded bg-apex-surface text-lg flex-shrink-0">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full rounded object-cover" />
                ) : (
                  getCategoryEmoji(item.product.category)
                )}
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-apex-text-primary truncate">{item.product.name}</p>
                <p className="text-xs text-apex-text-muted mt-0.5">${item.product.price.toFixed(2)} each</p>

                {/* Qty controls and discount */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          onRemoveItem(item.product.id);
                        } else {
                          onUpdateQty(item.product.id, item.quantity - 1);
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-apex-surface border border-apex-border text-xs hover:border-apex-accent/40 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-sm font-mono font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-apex-surface border border-apex-border text-xs hover:border-apex-accent/40 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Discount input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount || ''}
                      onChange={(e) => onUpdateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-12 h-6 px-1.5 text-xs text-center font-mono bg-apex-surface border border-apex-border rounded focus:outline-none focus:border-apex-accent/60"
                    />
                    <span className="text-[10px] text-apex-text-muted">%off</span>
                  </div>
                </div>
              </div>

              {/* Line total + remove */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-apex-text-muted hover:text-red-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-sm font-mono font-semibold text-apex-text-primary">
                  ${((item.product.price * item.quantity * (1 - item.discount / 100))).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CartPanel;
