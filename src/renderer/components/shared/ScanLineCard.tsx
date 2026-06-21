import React, { useState } from 'react';

interface ScanLineCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ScanLineCard: React.FC<ScanLineCardProps> = ({ children, className = '', onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-apex-border bg-apex-elevated transition-colors duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-apex-accent/40'
      } ${className}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {/* Scan line effect */}
      {isHovered && !disabled && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          aria-hidden="true"
        >
          <div
            className="absolute inset-x-0 h-[2px] animate-card-scan-line"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(79, 142, 247, 0.6), transparent)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ScanLineCard;
