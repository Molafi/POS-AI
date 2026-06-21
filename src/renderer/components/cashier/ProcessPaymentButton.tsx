import React from 'react';

interface ProcessPaymentButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

const ProcessPaymentButton: React.FC<ProcessPaymentButtonProps> = ({ disabled, loading, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3.5 rounded-lg font-heading font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
        disabled || loading
          ? 'bg-apex-accent/20 text-apex-accent/40 cursor-not-allowed'
          : 'bg-apex-accent text-white hover:bg-apex-accent-hover shadow-lg shadow-apex-accent/20 active:scale-[0.98]'
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{'\uD83D\uDCB3'}</span>
          <span>PROCESS PAYMENT</span>
        </>
      )}
    </button>
  );
};

export default ProcessPaymentButton;
