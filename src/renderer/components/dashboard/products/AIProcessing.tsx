import React from 'react';
import { motion } from 'framer-motion';

interface AIProcessingProps {
  status: 'analyzing' | 'complete' | 'error';
  errorMessage?: string;
}

const AIProcessing: React.FC<AIProcessingProps> = ({ status, errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {status === 'analyzing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Orbit ring animation */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-apex-accent/30 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border border-apex-accent/20 animate-[spin_5s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-apex-accent/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-apex-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            {/* Orbiting dot */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-apex-accent"
              style={{ top: '50%', left: '50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-apex-accent"
                style={{ transform: 'translateX(55px) translateY(-6px)' }}
              />
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-lg font-heading font-semibold text-apex-text-primary">AI is analyzing...</p>
            <p className="text-sm text-apex-text-secondary mt-1">Identifying product details from the image</p>
          </div>

          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-apex-accent"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {status === 'complete' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-apex-success/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-apex-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-heading font-semibold text-apex-text-primary">Analysis Complete</p>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-apex-danger/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-apex-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-heading font-semibold text-apex-text-primary">Analysis Failed</p>
          <p className="text-sm text-apex-text-secondary">{errorMessage || 'Please try again'}</p>
        </motion.div>
      )}
    </div>
  );
};

export default AIProcessing;
