import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

interface PinLockProps {
  onUnlock: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (fullPin: string) => {
    setLoading(true);
    try {
      const response = await api.post<{ valid: boolean }>('/settings/verify-pin', { pin: fullPin });
      if (response.success && response.data?.valid) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex items-center justify-center bg-apex-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-apex-surface border border-apex-border rounded-2xl p-10 flex flex-col items-center gap-6 w-[380px]"
      >
        <div className="w-16 h-16 rounded-full bg-apex-accent/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-apex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-apex-text-primary">Manager Access</h2>
          <p className="text-sm text-apex-text-secondary mt-1">Enter your 4-digit PIN to continue</p>
        </div>

        <div className="flex gap-3">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="w-14 h-14 text-center text-2xl font-mono bg-apex-elevated border border-apex-border rounded-xl focus:border-apex-accent focus:ring-1 focus:ring-apex-accent outline-none text-apex-text-primary transition-all"
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-apex-danger text-sm"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-2 text-apex-text-secondary text-sm">
            <div className="w-4 h-4 border-2 border-apex-accent border-t-transparent rounded-full animate-spin" />
            Verifying...
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PinLock;
