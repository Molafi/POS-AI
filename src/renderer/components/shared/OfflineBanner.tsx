import React from 'react';

interface OfflineBannerProps {
  isOnline: boolean;
  isServerReachable: boolean;
  isDegraded: boolean;
  isCashOnly: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isServerReachable,
  isDegraded,
  isCashOnly,
}) => {
  if (!isDegraded) return null;

  let message = '';
  let severity: 'warning' | 'error' = 'warning';

  if (!isOnline) {
    message = 'No internet connection. AI features and card payments are unavailable.';
    severity = 'error';
  } else if (!isServerReachable) {
    message = 'Cannot reach local server. Please restart the application.';
    severity = 'error';
  } else if (isCashOnly) {
    message = 'Card payments unavailable. Cash-only mode active.';
    severity = 'warning';
  } else {
    message = 'Some features may be limited due to connectivity issues.';
    severity = 'warning';
  }

  const bgColor = severity === 'error' ? 'bg-red-900/90' : 'bg-yellow-900/90';
  const borderColor = severity === 'error' ? 'border-red-500' : 'border-yellow-500';
  const iconColor = severity === 'error' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div
      className={`${bgColor} ${borderColor} border-b px-4 py-2 flex items-center gap-3`}
      role="alert"
    >
      <div className={`${iconColor} flex-shrink-0`}>
        {severity === 'error' ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <span className="text-white text-sm font-medium">{message}</span>
    </div>
  );
};
