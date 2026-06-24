import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

interface StatData {
  todayRevenue: number;
  yesterdayRevenue: number;
  ordersCount: number;
  avgOrderValue: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

interface StatCardsProps {
  data: StatData;
}

const StatCards: React.FC<StatCardsProps> = ({ data }) => {
  const revenueChange = data.yesterdayRevenue > 0
    ? ((data.todayRevenue - data.yesterdayRevenue) / data.yesterdayRevenue) * 100
    : 0;

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return 'text-apex-success';
    if (margin >= 20) return 'text-apex-warning';
    return 'text-apex-danger';
  };

  const cards = [
    {
      label: 'Today Revenue',
      value: data.todayRevenue,
      prefix: '$',
      decimals: 2,
      change: revenueChange,
      changeLabel: 'vs yesterday',
    },
    {
      label: 'Orders Count',
      value: data.ordersCount,
      prefix: '',
      decimals: 0,
    },
    {
      label: 'Avg Order Value',
      value: data.avgOrderValue,
      prefix: '$',
      decimals: 2,
    },
    {
      label: 'Gross Profit',
      value: data.grossProfit,
      prefix: '$',
      decimals: 2,
    },
    {
      label: 'Net Profit',
      value: data.netProfit,
      prefix: '$',
      decimals: 2,
    },
    {
      label: 'Profit Margin',
      value: data.profitMargin,
      suffix: '%',
      decimals: 1,
      colorClass: getMarginColor(data.profitMargin),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-apex-surface border border-apex-border rounded-xl p-4"
        >
          <p className="text-xs text-apex-text-secondary mb-2 font-medium">{card.label}</p>
          <p className={`text-xl font-mono font-bold ${card.colorClass || 'text-apex-text-primary'}`}>
            {card.prefix}
            <CountUp end={card.value} decimals={card.decimals} duration={1.5} separator="," />
            {card.suffix || ''}
          </p>
          {card.change !== undefined && (
            <p className={`text-xs mt-1 ${card.change >= 0 ? 'text-apex-success' : 'text-apex-danger'}`}>
              {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)}% {card.changeLabel}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StatCards;
