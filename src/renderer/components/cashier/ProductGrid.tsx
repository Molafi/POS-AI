import React, { useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import type { Product } from '@shared/types';
import ScanLineCard from '@renderer/components/shared/ScanLineCard';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  onProductClick: (product: Product) => void;
  width: number;
  height: number;
}

const COLUMN_COUNT = 3;
const ROW_HEIGHT = 160;
const COLUMN_WIDTH_RATIO = 1 / COLUMN_COUNT;
const GAP = 8;

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Find the substring match first
  const index = lowerText.indexOf(lowerQuery);
  if (index !== -1) {
    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-apex-accent/30 text-apex-text-primary rounded px-0.5">{text.slice(index, index + query.length)}</mark>
        {text.slice(index + query.length)}
      </>
    );
  }

  // Character-level fuzzy highlighting
  const result: React.ReactNode[] = [];
  let queryIndex = 0;
  for (let i = 0; i < text.length; i++) {
    if (queryIndex < lowerQuery.length && lowerText[i] === lowerQuery[queryIndex]) {
      result.push(
        <mark key={i} className="bg-apex-accent/30 text-apex-text-primary rounded px-0.5">
          {text[i]}
        </mark>
      );
      queryIndex++;
    } else {
      result.push(text[i]);
    }
  }
  return <>{result}</>;
}

function getStockBadge(stock: number): React.ReactNode {
  if (stock === 0) {
    return (
      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/30">
        OUT
      </span>
    );
  }
  if (stock < 5) {
    return (
      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
        LOW
      </span>
    );
  }
  return null;
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

const ProductGrid: React.FC<ProductGridProps> = ({ products, searchQuery, onProductClick, width, height }) => {
  const columnWidth = Math.floor((width - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT);
  const rowCount = Math.ceil(products.length / COLUMN_COUNT);

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * COLUMN_COUNT + columnIndex;
      if (index >= products.length) return null;
      const product = products[index];
      const isOutOfStock = product.stock === 0;

      return (
        <div style={{ ...style, padding: GAP / 2 }}>
          <ScanLineCard
            onClick={() => onProductClick(product)}
            disabled={isOutOfStock}
            className="h-full flex flex-col p-3"
          >
            {getStockBadge(product.stock)}
            <div className="text-2xl mb-2">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover" />
              ) : (
                getCategoryEmoji(product.category)
              )}
            </div>
            <p className="text-sm font-medium text-apex-text-primary line-clamp-2 flex-1">
              {highlightMatch(product.name, searchQuery)}
            </p>
            <p className="text-base font-mono font-semibold text-apex-accent mt-1">
              ${product.price.toFixed(2)}
            </p>
          </ScanLineCard>
        </div>
      );
    },
    [products, searchQuery, onProductClick]
  );

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-apex-text-muted">
        <div className="text-center">
          <p className="text-4xl mb-2">{'\uD83D\uDD0D'}</p>
          <p className="text-sm">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <Grid
      columnCount={COLUMN_COUNT}
      columnWidth={columnWidth + GAP}
      height={height}
      rowCount={rowCount}
      rowHeight={ROW_HEIGHT}
      width={width}
      className="scrollbar-thin"
    >
      {Cell}
    </Grid>
  );
};

export default ProductGrid;
