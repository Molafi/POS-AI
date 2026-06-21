import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/renderer/**/*.{html,tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        'apex-base': 'var(--bg-base)',
        'apex-surface': 'var(--bg-surface)',
        'apex-elevated': 'var(--bg-elevated)',
        'apex-accent': 'var(--accent)',
        'apex-accent-hover': 'var(--accent-hover)',
        'apex-success': 'var(--success)',
        'apex-warning': 'var(--warning)',
        'apex-danger': 'var(--danger)',
        'apex-text-primary': 'var(--text-primary)',
        'apex-text-secondary': 'var(--text-secondary)',
        'apex-text-muted': 'var(--text-muted)',
        'apex-border': 'var(--border-color)',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'scan-line': 'scanLine 4s linear infinite',
        'card-scan-line': 'cardScanLine 0.6s linear infinite',
        orbit: 'orbit 20s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        cardScanLine: {
          '0%': { top: '-2px' },
          '100%': { top: '100%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
