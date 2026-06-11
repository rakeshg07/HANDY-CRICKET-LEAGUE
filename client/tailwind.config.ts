import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stadium: {
          dark: '#0a0f0d',
          darker: '#050807',
          green: '#22c55e',
          'green-glow': '#4ade80',
          accent: '#10b981',
          glass: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(34, 197, 94, 0.2)',
        },
      },
      backgroundImage: {
        'stadium-gradient': 'radial-gradient(ellipse at center, #0f1a14 0%, #050807 70%)',
        'pitch-gradient': 'linear-gradient(180deg, #1a2e1f 0%, #0d1a10 100%)',
      },
      boxShadow: {
        neon: '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
        'neon-sm': '0 0 10px rgba(34, 197, 94, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flip': 'flip 0.6s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
