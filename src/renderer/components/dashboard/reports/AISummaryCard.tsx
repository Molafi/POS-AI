import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';

interface AISummaryCardProps {
  salesData: unknown;
}

const AISummaryCard: React.FC<AISummaryCardProps> = ({ salesData }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    setError('');

    const response = await api.post<{ summary: string }>('/ai/summary', {
      salesData,
      period: '30-day',
    });

    if (response.success && response.data) {
      setSummary(response.data.summary);
    } else {
      setError(response.error || 'Failed to generate summary');
    }
    setLoading(false);
  };

  return (
    <div className="bg-apex-surface border border-apex-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary flex items-center gap-2">
          <svg className="w-4 h-4 text-apex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Business Insights
        </h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-1.5 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>Generate Summary</>
          )}
        </button>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-apex-elevated/50 border border-apex-accent/20 rounded-lg"
        >
          <p className="text-sm text-apex-text-primary leading-relaxed whitespace-pre-line">{summary}</p>
        </motion.div>
      )}

      {error && (
        <div className="p-3 bg-apex-danger/10 border border-apex-danger/30 rounded-lg">
          <p className="text-sm text-apex-danger">{error}</p>
        </div>
      )}

      {!summary && !error && !loading && (
        <div className="py-6 text-center text-apex-text-muted text-sm">
          Click "Generate Summary" to get AI-powered insights from the last 30 days of data
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
