import React from 'react';
import { motion } from 'framer-motion';
import type { CustomerTierType } from '@renderer/hooks/useCart';

interface CustomerTierSelectorProps {
  selected: CustomerTierType;
  onSelect: (tier: CustomerTierType) => void;
}

const tiers: { id: CustomerTierType; label: string; discount: string; icon: string }[] = [
  { id: 'new', label: 'New', discount: '0%', icon: '\uD83D\uDC64' },
  { id: 'regular', label: 'Regular', discount: '5%', icon: '\u2B50' },
  { id: 'vip', label: 'VIP', discount: '10%', icon: '\uD83D\uDC8E' },
];

const CustomerTierSelector: React.FC<CustomerTierSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center gap-1.5">
      {tiers.map((tier) => {
        const isActive = selected === tier.id;
        return (
          <button
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive ? 'text-white' : 'text-apex-text-muted hover:text-apex-text-secondary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="tier-pill"
                className="absolute inset-0 rounded-full bg-apex-accent/20 border border-apex-accent/40"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <span>{tier.icon}</span>
              <span>{tier.label}</span>
              {tier.discount !== '0%' && (
                <span className="text-apex-success text-[10px]">-{tier.discount}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CustomerTierSelector;
