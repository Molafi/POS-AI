import React, { useState, useEffect } from 'react';
import type { Product, CartItem } from '@shared/types';
import { getCoOccurrenceRecommendations } from '@renderer/utils/algorithms';
import { api } from '@renderer/lib/api';

interface CoOccurrenceRecord {
  productAId: string;
  productBId: string;
  count: number;
}

interface AIRecommendationsProps {
  cartItems: CartItem[];
  allProducts: Product[];
  onAddProduct: (product: Product) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ cartItems, allProducts, onAddProduct }) => {
  const [coOccurrenceData, setCoOccurrenceData] = useState<CoOccurrenceRecord[]>([]);
  const [pulseActive, setPulseActive] = useState(false);

  // Fetch co-occurrence data
  useEffect(() => {
    const fetchCoOccurrence = async () => {
      const response = await api.get<CoOccurrenceRecord[]>('/products/co-occurrences');
      if (response.success && response.data) {
        setCoOccurrenceData(response.data);
      }
    };
    fetchCoOccurrence();
  }, []);

  // Pulsing glow every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (cartItems.length === 0) return null;

  const cartProductIds = new Set(cartItems.map((item) => item.product.id));
  const productNames = new Map(allProducts.map((p) => [p.id, p.name]));

  const recommendations = getCoOccurrenceRecommendations(
    coOccurrenceData,
    cartProductIds,
    productNames,
    3
  );

  // If no co-occurrence data, show random suggestions from same categories
  const displayRecommendations = recommendations.length > 0
    ? recommendations
    : allProducts
        .filter((p) => !cartProductIds.has(p.id) && p.stock > 0)
        .slice(0, 3)
        .map((p) => ({ productId: p.id, name: p.name, score: 0 }));

  if (displayRecommendations.length === 0) return null;

  return (
    <div className={`mt-3 p-2.5 rounded-lg border transition-all duration-300 ${
      pulseActive
        ? 'border-apex-accent/60 shadow-[0_0_12px_rgba(79,142,247,0.3)]'
        : 'border-apex-border'
    } bg-apex-surface/50`}>
      <p className="text-[10px] uppercase tracking-wider text-apex-text-muted mb-2 font-medium">
        {'\u2728'} Customers also add
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {displayRecommendations.map((rec) => {
          const product = allProducts.find((p) => p.id === rec.productId);
          return (
            <button
              key={rec.productId}
              onClick={() => product && onAddProduct(product)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apex-accent/10 border border-apex-accent/20 text-xs text-apex-accent hover:bg-apex-accent/20 hover:border-apex-accent/40 transition-colors"
            >
              <span className="truncate max-w-[100px]">{rec.name}</span>
              {rec.score > 0 && (
                <span className="text-[9px] text-apex-text-muted">+{rec.score}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;
