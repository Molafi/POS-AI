import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Food', 'Drink', 'Dessert', 'Retail', 'Combo'];

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-white'
                : 'text-apex-text-muted hover:text-apex-text-secondary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-apex-accent/20 border border-apex-accent/40"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
};

export { CATEGORIES };
export default CategoryTabs;
