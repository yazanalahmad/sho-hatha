import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0d0a06',
        'bg-surface': '#1a1208',
        'bg-card': '#221a0f',
        gold: '#f5c842',
        'gold-muted': '#a88530',
        team1: '#e8445a',
        team2: '#3d9be9',
        correct: '#2dd887',
        wrong: '#ff4757',
        ivory: '#f5e6c8',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        score: ['Oswald', 'sans-serif'],
        'ar-display': ['"Reem Kufi Ink"', 'sans-serif'],
        'ar-body': ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'pulse-fast': 'pulse-fast 0.5s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
} satisfies Config;
